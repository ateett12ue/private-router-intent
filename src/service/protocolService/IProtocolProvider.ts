import { AdapterDetails } from "../models/DbModels";
import { AdapterIdParamsResponse } from "../models/Adapters";
export interface IProtocolProvider
{
    GetProtocol(adapterId: string): any;
}
