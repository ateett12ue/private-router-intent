import {
    AdapterIdParamsResponse,
    CreateAdapterDefaultParams,
    CreateAdapterDefaultParamsResponse
} from "../../models/Adapters";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse
} from "../../models/Protocols";
export interface IProtocol
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>;
}
