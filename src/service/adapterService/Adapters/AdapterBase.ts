import { AdapterDetails } from "../../models/DbModels";
import { service } from "../AdapterService";
import { IAdapter } from "./IAdapter";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    AdapterIdParamsResponse,
    AdapterQuotationParams,
    AdapterQuotationApiResponse,
    NoBatchCalldataResponse
} from "../../models/Adapters";
import { IntentBatchTransactionContract } from "../../../constant/contractMapping";
abstract class AdapterBase implements IAdapter
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

export default AdapterBase;
