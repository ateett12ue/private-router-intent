import { IHelperService } from "./IHelperService";
import { IMongoDataStore } from "../../datastore/adapter/mongostore/IMongoDataStore";
import { IDataStore } from "../../datastore/adapter/mysqlstore/IDataStore";
import { ContractData, HelperContractData } from "../models/DbModels";
import { ChainDetails } from "../models/CommonModels";
import { IntentBatchTransactionContract } from "../../constant/contractMapping";
import { MainnetConfigs, TestnetConfigs } from "../../constant/ChainIdsEnum";
export class HelperServiceImpl implements IHelperService
{
    _mongoDataStore: IMongoDataStore;
    _dataStore: IDataStore;

    constructor(mongoDataStore: IMongoDataStore, dataStore: IDataStore)
    {
        this._mongoDataStore = mongoDataStore;
        this._dataStore = dataStore;
    }

    GetHelperContract(helperId: string): Promise<HelperContractData>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const result = await this._mongoDataStore.GetHelperContractData(helperId);
                resolve(result);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetHelperContractAddress(helperId: string, chainId: string): Promise<string>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const result = await this._mongoDataStore.GetHelperContractData(helperId);
                const contractAdd = result.chainData[chainId];
                resolve(contractAdd);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    UpdateContractAddress(
        helperId: string,
        helperChainData: Array<ContractData>
    ): Promise<boolean>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const helperDetails = await this.GetHelperContract(helperId);
                if (helperChainData.length < 1)
                {
                    throw "nothing to update";
                }
                for (let i = 0, len = helperChainData.length; i < len; i++)
                {
                    const chainId = helperChainData[i].chainId;
                    helperDetails.chainData[chainId] = helperChainData[i];
                }
                const updateContract = await this._mongoDataStore.UpdateHelperContractData(
                    helperDetails
                );
                resolve(updateContract);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }

    GetAllChainsSupported(): Promise<ChainDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const batchChainDeployed = IntentBatchTransactionContract;
                const deployedChains = Object.keys(batchChainDeployed);
                const mainnetChains = [];
                const testnetChains = [];
                for (let i = 0, len = deployedChains.length; i < len; i++)
                {
                    if (MainnetConfigs.includes(Number(deployedChains[i])))
                    {
                        mainnetChains.push(deployedChains[i]);
                    }
                    else if (TestnetConfigs.includes(Number(deployedChains[i])))
                    {
                        testnetChains.push(deployedChains[i]);
                    }
                }
                const result = {
                    mainnetChains,
                    testnetChains
                };
                resolve(result);
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}
