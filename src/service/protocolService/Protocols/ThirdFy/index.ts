import ProtocolBase from "../ProtocolBase";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsForAmm,
    CreateAdapterDefaultParamsForAmmV4,
    AdapterIdParamsResponse,
    AdapterQuotationResponse
} from "../../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse,
    InstancePoolDataV3,
    InstancePoolData
} from "../../../models/Protocols";
import { THIRDFY_SWAP_ADAPTER_ID, ASSET_BRIDGE_ADAPTER_ID } from "../../../../constant/constants";
import { service as adapterService } from "../../../adapterService/AdapterService";
import { service as PoolService } from "../../../poolDataService/PoolDataService";
import { TokenData } from "../../../models/CommonModels";
import {
    sortTokens,
    getContract,
    divideAmountToTokens,
    getTokenReverseValue,
    getTokensInBytes32,
    getTokenDecimal,
    getReserveToken,
    isTokenNativeOrWrapped
} from "../../../../utils";
import { ThirdFyPoolFactory, KimV2PoolFactory } from "../../../../constant/contractMapping";
import { ThirdFyPoolFactoryAbi } from "../../../../abis/ThirdFyPoolFactory";
import { ThirdFyPoolAbi } from "../../../../abis/ThirdFyPool";
import ThirdFyPoolAdapter from "../../../adapterService/Adapters/amm/thirdFy/third_fy_deposit";
import { WrappedNativeMapping, NativTokenMapping } from "../../../../constant/contractMapping";
interface KimGlobalParams
{
    price: string; // The square root of the current price in Q64.96 format
    tick: number; // The current tick (price(tick) <= current price)
    lastFee: number; // The last fee in hundredths of a bip, i.e. 1e-6 (so 100 is 0.01%)
    pluginConfig: number; // The current plugin config as a bitmap
    communityFee: number; // The community fee represented as a percent of all collected fee in thousandths (1e-3) (so 100 is 10%)
    unlocked: boolean;
}
class ThirdFyProtocol extends ProtocolBase
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const protocolActions = data.action;
                let currentChain = data.sourceChain;
                let currentToken = data.srcToken;
                let currentAmount: string | number = data.amount;

                let isCrossChain = false;

                const adapterParamsQueue: Array<AdapterIdParamsResponse> = [];
                const adapterQuoteQueue: Array<AdapterQuotationResponse> = [];

                const quotationType: string = "BatchTransaction";
                let time = 0;

                const wNative = WrappedNativeMapping[Number(data.destinationChain)];
                const native = NativTokenMapping[Number(data.destinationChain)];

                let tokenA = data.destToken[0];
                let tokenB = data.destToken[1];

                let PARTNER_ID = 102;
                let pTokenA =
                    tokenA.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenA;
                let pTokenB =
                    tokenB.address.toLowerCase() == native.address.toLowerCase() ? wNative : tokenB;
                if (protocolActions == "deposit")
                {
                    PARTNER_ID = 102;
                    const protocolData = data.protocolData;

                    if (tokenA.address == tokenB.address || tokenA.chainId !== tokenB.chainId)
                    {
                        throw "Destination Tokens not defined correctly";
                    }
                    const ammAdapterId = `${data.protocolId}_deposit`;
                    [pTokenA, pTokenB] = await sortTokens(pTokenA, pTokenB);
                    [tokenA, tokenB] = await sortTokens(tokenA, tokenB);
                    const instancePoolParams = {
                        tokenA: pTokenA,
                        tokenB: pTokenB,
                        destChainId: data.destinationChain
                    };
                    const destReserveAsset = await getReserveToken(
                        [pTokenA, pTokenB],
                        data.destinationChain
                    );
                    if (String(data.sourceChain) !== String(data.destinationChain))
                    {
                        isCrossChain = true;
                        const bridgeParams: CreateAdapterDefaultParams = {
                            adapterId: ASSET_BRIDGE_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: currentAmount,
                            srcToken: data.srcToken,
                            destToken: destReserveAsset,
                            refundAddress: data.refundAddress,
                            partnerId: PARTNER_ID
                        };
                        const brideAdapter = await adapterService.SelectAdapter(
                            ASSET_BRIDGE_ADAPTER_ID
                        );
                        const bridgeQuote = await brideAdapter.GetQuote(bridgeParams);
                        currentAmount = bridgeQuote.quotation.amountReceived;
                        currentChain = bridgeQuote.currentChain;
                        currentToken = bridgeQuote.currentToken;
                        adapterParamsQueue.push(bridgeQuote.adapterData);
                        adapterQuoteQueue.push(bridgeQuote.quotation);
                        time += bridgeQuote.quotation.estimatedTime;
                    }
                    const instancePoolData: InstancePoolDataV3 = await this.getInstancePoolData(
                        instancePoolParams.tokenA,
                        instancePoolParams.tokenB,
                        instancePoolParams.destChainId
                    );
                    instancePoolData.upperTick = protocolData.upperTick;
                    instancePoolData.lowerTick = protocolData.lowerTick;
                    const [tokenAAmountCal, tokenBAmountCal] = await divideAmountToTokens(
                        instancePoolData.reserveA,
                        instancePoolData.reserveB,
                        String(currentAmount),
                        pTokenA,
                        pTokenB,
                        currentToken
                    );

                    let [tokenAAmountMinReceived, tokenBAmountMinReceived] = [
                        tokenAAmountCal,
                        tokenBAmountCal
                    ];

                    const swapAdapter = await adapterService.SelectAdapter(THIRDFY_SWAP_ADAPTER_ID);

                    if (pTokenA.address.toLowerCase() != currentToken.address.toLowerCase())
                    {
                        const swapParamsTokenA: CreateAdapterDefaultParams = {
                            adapterId: THIRDFY_SWAP_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: String(tokenAAmountCal),
                            srcToken: currentToken,
                            destToken: tokenA,
                            refundAddress: data.refundAddress,
                            partnerId: PARTNER_ID,
                            protocolData: {
                                slippageTolerance: 3
                            }
                        };
                        const swapQuoteTokenA = await swapAdapter.GetQuote(swapParamsTokenA);
                        adapterParamsQueue.push(swapQuoteTokenA.adapterData);
                        adapterQuoteQueue.push(swapQuoteTokenA.quotation);
                        time += swapQuoteTokenA.quotation.estimatedTime;
                        tokenAAmountMinReceived = String(swapQuoteTokenA.quotation.amountReceived);
                    }
                    if (pTokenB.address.toLowerCase() != currentToken.address.toLowerCase())
                    {
                        const swapParamsTokenB: CreateAdapterDefaultParams = {
                            adapterId: THIRDFY_SWAP_ADAPTER_ID,
                            sourceChain: currentChain,
                            destinationChain: data.destinationChain,
                            amount: String(tokenBAmountCal),
                            srcToken: currentToken,
                            destToken: tokenB,
                            refundAddress: data.refundAddress,
                            partnerId: PARTNER_ID,
                            protocolData: {
                                slippageTolerance: 3
                            }
                        };

                        const swapQuoteTokenB = await swapAdapter.GetQuote(swapParamsTokenB);
                        adapterParamsQueue.push(swapQuoteTokenB.adapterData);
                        adapterQuoteQueue.push(swapQuoteTokenB.quotation);
                        currentChain = swapQuoteTokenB.currentChain;
                        currentToken = swapQuoteTokenB.currentToken;
                        time += swapQuoteTokenB.quotation.estimatedTime;

                        tokenBAmountMinReceived = String(swapQuoteTokenB.quotation.amountReceived);
                    }

                    if (
                        !isCrossChain &&
                        data.srcToken.address.toLowerCase() == native.address.toLowerCase()
                    )
                    {
                        if (tokenA.address.toLowerCase() == wNative.address.toLowerCase())
                        {
                            tokenA = native;
                        }

                        if (tokenB.address.toLowerCase() == wNative.address.toLowerCase())
                        {
                            tokenB = native;
                        }
                    }

                    const ammParams: CreateAdapterDefaultParamsForAmmV4 = {
                        adapterId: ammAdapterId,
                        chain: data.destinationChain,
                        tokenAAmountCal: String(tokenAAmountCal),
                        tokenBAmountCal: String(tokenBAmountCal),
                        tokenAAmount: String(tokenAAmountMinReceived),
                        tokenBAmount: String(tokenBAmountMinReceived),
                        pool: instancePoolData.poolAddress,
                        tokenA: !isCrossChain ? tokenA : pTokenA,
                        tokenB: !isCrossChain ? tokenB : pTokenB,
                        refundAddress: data.refundAddress,
                        reservePoolData: instancePoolData,
                        partnerId: PARTNER_ID
                    };

                    const ammAdapter = new ThirdFyPoolAdapter();
                    const ammQuote = await ammAdapter.GetQuoteForAmm(ammParams);
                    adapterParamsQueue.push(ammQuote.adapterData);
                    adapterQuoteQueue.push(ammQuote.quotation);
                    currentChain = ammQuote.currentChain;
                    currentToken = ammQuote.currentToken;

                    time += ammQuote?.quotation?.estimatedTime ?? 0;
                }

                const response: CreateProtocolDefaultParamsResponse = {
                    quotationType: quotationType,
                    currentChain: currentChain,
                    currentToken: currentToken,
                    currentAmount: currentAmount,
                    isCrossChain: isCrossChain,
                    quotationData: adapterQuoteQueue,
                    adapterData: adapterParamsQueue,
                    estimatedTime: time,
                    partnerId: PARTNER_ID
                };
                resolve(response);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    private getInstancePoolData(
        tokenA: TokenData,
        tokenB: TokenData,
        destChainId: number
    ): Promise<InstancePoolDataV3>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const poolFactoryAddress = ThirdFyPoolFactory[destChainId];
                const poolFactoryContract = await getContract(
                    ThirdFyPoolFactoryAbi,
                    poolFactoryAddress,
                    destChainId
                );
                const getPoolAddress = await poolFactoryContract.poolByPair(
                    tokenA.address,
                    tokenB.address
                );

                const poolContract = await getContract(ThirdFyPoolAbi, getPoolAddress, destChainId);

                const code = await poolContract.getDeployedCode();

                if (code === "0x" || !code)
                {
                    const error = {
                        title: "Pool Does Not Exist",
                        message: "Pool for this pair doesn't exist"
                    };
                    reject(error);
                }
                const globalVariable: KimGlobalParams = await poolContract.globalState();
                const reserve = await poolContract.getReserves();
                const response: InstancePoolDataV3 = {
                    tokenA: tokenA,
                    tokenB: tokenB,
                    chainId: destChainId,
                    poolAddress: getPoolAddress,
                    poolFactory: poolFactoryAddress,
                    reserveA: String(reserve[0]),
                    reserveB: String(reserve[1]),
                    fee: Number(globalVariable.lastFee),
                    tick: Number(globalVariable.tick),
                    lowerTick: "",
                    upperTick: ""
                };
                resolve(response);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}

export default ThirdFyProtocol;
