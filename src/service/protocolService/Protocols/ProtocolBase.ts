import { ProtocolDetails } from "../../models/DbModels";
import { service } from "../ProtocolService";
import {
    CreateAdapterDefaultParamsResponse,
    CreateAdapterDefaultParams,
    AdapterIdParamsResponse
} from "../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse
} from "../../models/Protocols";
import { IProtocol } from "./IProtocol";
abstract class ProtocolBase implements IProtocol
{
    GetProtocol(protocolId: string): Promise<ProtocolDetails>
    {
        return new Promise(async (resolve, reject) =>
        {
            try
            {
                const protocolDetails = await service.GetProtocolDetails(protocolId);
                resolve(protocolDetails);
            }
            catch (e)
            {
                reject(e);
            }
        });
    }
    abstract CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>;
}

export default ProtocolBase;
