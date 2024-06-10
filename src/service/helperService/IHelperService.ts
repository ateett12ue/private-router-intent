import { ContractData, HelperContractData } from "../models/DbModels";
import { ChainDetails } from "../models/CommonModels";
export interface IHelperService
{
    GetHelperContract(helperId: string): Promise<HelperContractData>;
    GetHelperContractAddress(helperId: string, chainId: string): Promise<string>;
    UpdateContractAddress(helperId: string, helperChainData: Array<ContractData>): Promise<boolean>;
    GetAllChainsSupported(): Promise<ChainDetails>;
}
