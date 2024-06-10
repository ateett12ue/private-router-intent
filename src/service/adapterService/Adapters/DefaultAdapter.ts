import { IAdapter } from "./IAdapter";
import {
    AdapterQuotationApiResponse,
    AdapterQuotationParams,
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse,
    AdapterIdParamsResponse,
    CalldataResponse,
    NoBatchCalldataResponse
} from "../../models/Adapters";
import { AdapterDetails } from "../../models/DbModels";
import { service } from "../AdapterService";

class DefaultAdapter implements IAdapter
{
    GetAdapter(adapterId: string): Promise<AdapterDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const adapterDetails = await service.GetAdapterDetails(adapterId);
                resolve(adapterDetails);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    GetQuote(data: CreateAdapterDefaultParams): Promise<CreateAdapterDefaultParamsResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // resolve();
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    GetAdapterEstimates(adapter: AdapterQuotationParams): Promise<AdapterQuotationApiResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // resolve();
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    GetAdapterSteps(adapter: AdapterIdParamsResponse): Promise<any>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // resolve();
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    ComposeCalldata(adapter: AdapterIdParamsResponse): Promise<CalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                // resolve();
            }
            catch (e)
            {
                reject(e);
            }
        });
    }

    NoBatchComposeCalldata(adapter: AdapterIdParamsResponse): Promise<NoBatchCalldataResponse>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                throw "not implemented";
            }
            catch (ex)
            {
                reject(ex);
            }
        });
    }
}

export default DefaultAdapter;
