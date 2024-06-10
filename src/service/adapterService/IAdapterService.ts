import { IAdapter } from "./Adapters/IAdapter";
import { AdapterDetails, ProtocolDetails } from "../models/DbModels";
import {
    AdapterIdParamsResponse,
    CalldataResponse,
    ComposeCalldataResponse,
    CalldataGasParmas,
    AdapterChainData,
    AllAdapterDetails,
    AdapterFilter
} from "../models/Adapters";
import { ProtocolParamsResponse } from "../models/Protocols";
export interface IAdapterService
{
    GetAdapterDetails(adapterId: string): Promise<AdapterDetails>;
    AddAdapter(data: AdapterDetails): Promise<boolean>;
    SelectAdapter(adapterName: string): Promise<IAdapter>;
    ComposeAdapterCalldata(data: ProtocolParamsResponse): Promise<ComposeCalldataResponse>;
    ComposerFunction(data: AdapterIdParamsResponse, appId: string): Promise<CalldataResponse>;
    CalldataGasFunction(data: CalldataGasParmas): Promise<String>;
    UpdateAdapterChainAddress(
        adapterId: string,
        adapterChainData: Array<AdapterChainData>
    ): Promise<Boolean>;
    GetInternalAdapterAddress(): Promise<any>;
    GetAllAdapter(filter: AdapterFilter): Promise<Array<AllAdapterDetails>>;
}
