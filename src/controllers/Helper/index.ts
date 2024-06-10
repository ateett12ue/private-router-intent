import { Response, Request, NextFunction } from "express";
import { Response as _Response, Error } from "../Response/Response";
import ResponseCode from "../Response/ResponseCode";
import _ResponseCode from "../Response/Controller.ResponseCodes";
import { service } from "../../service/helperService/HelperService";
import { AdapterDetails, ProtocolDetails, HelperContractData } from "../../service/models/DbModels";

import { logger } from "../../config/logger";
import { formatException } from "../../utils";
class HelperController
{
    public async UpdateHelperChainAddress(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const helperId = req.body.HelperId;
            const chainData = req.body.ChainData;
            const result = await service.UpdateContractAddress(helperId, chainData);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = { result };
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Updating Helper Contract (UpdateAdapterChainAddress)" +
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

    public async GetHelperContract(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const helperId = req.body.HelperId;
            const result = await service.GetHelperContract(helperId);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting contract Address (GetHelperContract)" +
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

    public async GetAllChainSupported(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const result = await service.GetAllChainsSupported();
            const responseData = result;
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = responseData;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting all chain supported" + " " + formatException(ex),
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

    public async GetHelperContractAddress(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const helperId = req.body.HelperId;
            const chainId = req.body.ChainId;
            const result = await service.GetHelperContractAddress(helperId, chainId);
            const responseData = {
                chainId: result
            };
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = responseData;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting helper contract Address (GetHelperContractAddress)" +
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
}
export const controller = new HelperController();
