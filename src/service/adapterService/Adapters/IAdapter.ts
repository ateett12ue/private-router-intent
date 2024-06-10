import {
    AdapterIdParamsResponse,
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    CalldataResponse,
    NoBatchCalldataResponse
} from "../../models/Adapters";

export interface IAdapter
{
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>;
    GetAdapterEstimates(adapter: AdapterQuotationParams): Promise<AdapterQuotationApiResponse>;
    GetAdapterSteps(adapter: AdapterIdParamsResponse): Promise<any>;
    ComposeCalldata(adapter: AdapterIdParamsResponse): Promise<CalldataResponse>;
    NoBatchComposeCalldata(adapter: AdapterIdParamsResponse): Promise<NoBatchCalldataResponse>;
}
