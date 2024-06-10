import { AdapterDetails } from "../../models/DbModels";
import { service } from "../AdapterService";
import { IAdapter } from "./IAdapter";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    AdapterIdParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    NoBatchCalldataResponse,
    CreateAdapterDefaultParamsForAmm,
    CreateAdapterDefaultParamsForAmmV4
} from "../../models/Adapters";

abstract class AmmAdapterBase implements IAdapter
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

    abstract GetQuoteForAmm(
        data: CreateAdapterDefaultParamsForAmm | CreateAdapterDefaultParamsForAmmV4
    ): Promise<CreateAdapterDefaultParamsResponse>;

    abstract GetQuote(
        data: CreateAdapterDefaultParams
    ): Promise<CreateAdapterDefaultParamsResponse>;
    abstract GetAdapterEstimates(
        adapter: AdapterQuotationParams
    ): Promise<AdapterQuotationApiResponse>;
    abstract GetAdapterSteps(adapter: AdapterIdParamsResponse): Promise<any>;
    abstract ComposeCalldata(adapter: AdapterIdParamsResponse): Promise<any>;

    abstract NoBatchComposeCalldata(
        adapter: AdapterIdParamsResponse
    ): Promise<NoBatchCalldataResponse>;
}

export default AmmAdapterBase;
