import { IProtocol } from "./Protocols/IProtocol";
import { AdapterDetails, ProtocolDetails } from "../models/DbModels";
import { ProtocolParamsResponse, GetProtocolQuote } from "../models/Protocols";
export interface IProtocolService
{
    GetProtocolDetails(protocolId: string): Promise<ProtocolDetails>;
    AddProtocol(data: ProtocolDetails): Promise<boolean>;
    SelectProtocol(protocolId: string): Promise<IProtocol>;
    GetProtocolQuote(data: GetProtocolQuote): Promise<ProtocolParamsResponse>;
}
