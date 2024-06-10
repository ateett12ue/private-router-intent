import { AdapterDetails } from "../models/DbModels";
import { AdapterIdParamsResponse } from "../models/Adapters";
export interface IAdapterProvider
{
    GetAdapter(adapterId: string): any;
}
