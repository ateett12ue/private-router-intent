import { IProtocolService } from "./IProtocolService";
import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { ProtocolDetails } from "../models/DbModels";
import { protocolProvider } from "./ProtocolProvider";
import { IProtocol } from "./Protocols/IProtocol";
import { AdapterIdParamsResponse, AdapterQuotationResponse } from "../models/Adapters";
import {
    ProtocolParamsResponse,
    CreateProtocolDefaultParams,
    GetProtocolQuote
} from "../models/Protocols";
import { checkForNonIntentType } from "../../utils";
export class ProtocolServiceImpl implements IProtocolService
{
    _mongoDataStore: IMongoDataStore;
    _dataStore: IDataStore;

    constructor(mongoDataStore: IMongoDataStore, dataStore: IDataStore)
    {
        this._mongoDataStore = mongoDataStore;
        this._dataStore = dataStore;
    }

    SelectProtocol(protocolId: string): Promise<IProtocol>
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                const getProtocol = await protocolProvider.GetProtocol(protocolId);
                res(getProtocol);
            }
            catch (e)
            {
                rej(e);
            }
        });
    }

    AddProtocol(data: ProtocolDetails): Promise<boolean>
    {
        return new Promise(async (res, rej) =>
        {
            try
            {
                const addAdapter = await this._mongoDataStore.AddProtocol(data);
                res(addAdapter);
            }
            catch (e)
            {
                rej(e);
            }
        });
    }

    GetProtocolDetails(protocolId: string): Promise<ProtocolDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const details = await this._mongoDataStore.GetProtocolDetails(protocolId);
                resolve(details);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    GetProtocolQuote(data: GetProtocolQuote): Promise<ProtocolParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const appId = data.appId;
                const sourceChain = data.sourceChainId;
                const amounts = data.amount;
                let sourceToken = data.sourceTokens;
                const protocols = data.protocol;
                const protocolLength = protocols.length;

                const slippageTolerance = data.slippageTolerance;
                const protocolResponseQue: Array<AdapterIdParamsResponse> = [];
                const protocolQuoteQue: Array<AdapterQuotationResponse> = [];

                let quotationType: string = "BatchTransaction";
                if (!data.receiverAddress)
                {
                    throw "Receiver Address needed";
                }

                let currentChain = sourceChain;
                let currentSrcToken = sourceToken[0];
                if (currentSrcToken && String(currentSrcToken?.chainId) !== String(sourceChain))
                {
                    const error = {
                        title: "Source Chain Mismatch",
                        message: "SourceToken ChainId Does not Match Source ChainId"
                    };
                    throw error;
                }
                const destToken = data.destinationTokens;
                let currentAmount = amounts[0];
                if (amounts.length !== protocolLength)
                {
                    throw "amounts should be available for all protocols";
                }

                let time = 0;

                for (let i = 0, len = protocolLength; i < len; i++)
                {
                    const protocol = protocols[i];
                    const selectedProtocol = await this.SelectProtocol(protocol.protocolId);
                    const protocolChainId = protocol.chainId;
                    const protocolParam: CreateProtocolDefaultParams = {
                        protocolId: protocol.protocolId,
                        action: protocol.action,
                        sourceChain: currentChain,
                        destinationChain: protocolChainId,
                        amount: currentAmount,
                        srcToken: currentSrcToken,
                        destToken: destToken,
                        poolId: protocol.poolId,
                        refundAddress: data.receiverAddress,
                        protocolData: protocol.data ?? {},
                        slippageTolerance: slippageTolerance
                    };
                    const protocolParamResponse = await selectedProtocol.CreateQuoteAndParams(
                        protocolParam
                    );
                    currentChain = protocolParamResponse.currentChain;
                    currentSrcToken = protocolParamResponse.currentToken;
                    currentAmount = Number(protocolParamResponse.currentAmount);
                    if (i == len - 1)
                    {
                        const non_intent_type = checkForNonIntentType(
                            protocolParamResponse.adapterData[
                                protocolParamResponse.adapterData.length - 1
                            ].adapterType
                        );
                        const lastIndex = non_intent_type
                            ? protocolParamResponse.adapterData.length - 2
                            : protocolParamResponse.adapterData.length - 1;
                        protocolParamResponse.adapterData[
                            lastIndex
                        ].adapterOptions.receiverAddress = data.receiverAddress;
                    }
                    if (i == 0 && sourceToken.length == 0)
                    {
                        sourceToken = [
                            protocolParamResponse.adapterData[0].adapterOptions.srcToken
                        ];
                    }
                    if (protocolParamResponse.quotationType !== "BatchTransaction")
                    {
                        quotationType = protocolParamResponse.quotationType;
                    }
                    protocolResponseQue.push(...protocolParamResponse.adapterData);
                    protocolQuoteQue.push(...protocolParamResponse.quotationData);
                    time = time + protocolParamResponse.estimatedTime;
                }
                const mappedTree = await this.buildMappedTree(protocolResponseQue);
                const response: ProtocolParamsResponse = {
                    appId: appId,
                    quotationType: quotationType,
                    slippageTolerance: slippageTolerance,
                    sourceTokens: sourceToken,
                    amount: amounts,
                    sourceChainId: sourceChain,
                    destinationChainId: Number(currentChain),
                    destinationToken: currentSrcToken,
                    adapters: mappedTree,
                    quote: protocolQuoteQue,
                    clientAddress: data.receiverAddress,
                    senderAddress: data.senderAddress ? data.senderAddress : data.receiverAddress,
                    estimatedTime: time
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    private buildMappedTree(adapters: Array<AdapterIdParamsResponse>)
    {
        let tree = [];
        const q = [...adapters];
        while (q.length)
        {
            const adap = q.pop();
            if (adap.adapterType == "bridge")
            {
                const sT = tree.slice().reverse();
                tree = [];
                adap.adapters = [...adap.adapters, ...sT];
                tree.push(adap);
            }
            else
            {
                tree.push(adap);
            }
        }
        return tree.slice().reverse();
    }
}
