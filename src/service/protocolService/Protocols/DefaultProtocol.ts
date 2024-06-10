import { ProtocolDetails } from "../../models/DbModels";
import { service } from "../ProtocolService";
import {
    CreateProtocolDefaultParams,
    CreateProtocolDefaultParamsResponse
} from "../../models/Protocols";
import ProtocolBase from "../Protocols/ProtocolBase";
class DefaultProtocol extends ProtocolBase
{
    CreateQuoteAndParams(
        data: CreateProtocolDefaultParams
    ): Promise<CreateProtocolDefaultParamsResponse>
    {
        throw "default protocol";
    }
}

export default DefaultProtocol;
