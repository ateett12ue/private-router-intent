import { Response, Request, NextFunction } from "express";
import { Response as _Response, Error } from "../Response/Response";
import ResponseCode from "../Response/ResponseCode";
import _ResponseCode from "../Response/Controller.ResponseCodes";
import { service } from "../../service/protocolService/ProtocolService";
import { AdapterDetails, ProtocolDetails } from "../../service/models/DbModels";
import { GetProtocolQuote } from "../../service/models/Protocols";
import { logger } from "../../config/logger";
import { formatException } from "../../utils";
class ProtocolController
{
    public async AddProtocol(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: ProtocolDetails = {
                id: req.body.ProtocolId,
                protocolName: req.body.ProtocolName,
                description: req.body.Description,
                metaProtocolData: req.body.MetaProtocolData,
                adapters: req.body.Adapters,
                pools: req.body.Pools,
                tvl: req.body.Tvl,
                mcap: req.body.Mcap
            };
            const result = await service.AddProtocol(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = { result };
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Adding Protocol (AddProtocol)" + " " + formatException(ex),
                req
            );

            response.Code = ResponseCode.Failed.Code;
            if (ex)
            {
                response.Errors.push(new Error(ResponseCode.Failed.Code, ex.message ?? ex));
                response.Errors.push(new Error(ResponseCode.Failed.Code, ex));
            }
            else
            {
                response.Errors.push(
                    new Error(ResponseCode.UnKnown.Code, ResponseCode.UnKnown.Message)
                );
            }
            res.status(500).send(response);
        }
    }

    public async GetProtocolDetails(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const protocolId = req.body.ProtocolId;
            const result = await service.GetProtocolDetails(protocolId);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Getting Protocol Details (GetProtocolDetails)" +
                    " " +
                    formatException(ex),
                req
            );

            response.Code = ResponseCode.Failed.Code;
            if (ex)
            {
                response.Errors.push(new Error(ResponseCode.Failed.Code, ex.message ?? ex));
            }
            else
            {
                response.Errors.push(
                    new Error(ResponseCode.UnKnown.Code, ResponseCode.UnKnown.Message)
                );
            }
            res.status(500).send(response);
        }
    }

    public async GetProtocolQuote(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: GetProtocolQuote = {
                appId: req.body?.AppId ?? "0",
                sourceTokens: req.body.SourceTokens ?? [],
                destinationTokens: req.body.DestinationTokens ?? [],
                amount: req.body.Amount,
                sourceChainId: req.body.SourceChainId,
                protocol: req.body.Protocol,
                receiverAddress: req.body.ReceiverAddress,
                senderAddress: req.body.SenderAddress
                    ? req.body.SenderAddress
                    : req.body.ReceiverAddress,
                slippageTolerance: req.body.SlippageTolerance ?? 2
            };

            const result = await service.GetProtocolQuote(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Getting Protocol Quote (GetProtocolQuote)" +
                    " " +
                    formatException(ex),
                req
            );

            response.Code = ResponseCode.Failed.Code;
            if (ex)
            {
                response.Errors.push(new Error(ResponseCode.Failed.Code, ex));
            }
            else
            {
                response.Errors.push(
                    new Error(ResponseCode.UnKnown.Code, ResponseCode.UnKnown.Message)
                );
            }
            res.status(500).send(response);
        }
    }
}
export const controller = new ProtocolController();
