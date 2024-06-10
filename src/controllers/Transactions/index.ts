import { Response, Request, NextFunction } from "express";
import { Response as _Response, Error } from "../Response/Response";
import ResponseCode from "../Response/ResponseCode";
import _ResponseCode from "../Response/Controller.ResponseCodes";
import { service } from "../../service/transactionService/TransactionService";
import { logger } from "../../config/logger";
import { formatException } from "../../utils";
import {
    TransactionStatusUpdate,
    TransactionAdapterStatusUpdate
} from "../../service/models/Transaction";
class TransactionsController
{
    public async UpdateTransaction(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: TransactionStatusUpdate = {
                transactionId: req.body.TransactionId,
                transactionStatus: req.body.TransactionStatus,
                gasFee: req.body.GasFeeUsed,
                transactionHash: req.body.TransactionHash,
                adapterStatus: req.body.AdapterStatus
            };
            const result = await service.UpdateTransactionStatus(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while updating transaction" + " " + formatException(ex),
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

    public async UpdateAapterTransactionStatus(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: TransactionAdapterStatusUpdate = {
                transactionId: req.body.TransactionId,
                adapterIndex: req.body.AdapterIndex,
                status: req.body.Status,
                hash: req.body.TrnxHash
            };

            const result = await service.UpdateTransactionAdapterStatus(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while updating transaction" + " " + formatException(ex),
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

    public async GetTransactionsByAddress(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const userAddress = req.body.UserAddress;
            const result = await service.GetTransactionsBySenderAddress(userAddress);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting transactions by address" + " " + formatException(ex),
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

    public async GetTransactionsByTrnxId(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const trnxId = req.body.TrnxId;
            const result = await service.GetTransactionByTransactionId(trnxId);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting transactions by trnx id" + " " + formatException(ex),
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

    public async DeleteTransactions(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const helperId = req.body.HelperId;
            const chainId = req.body.ChainId;
            const result = await service.GetTransactionsBySenderAddress(helperId);
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
                "Error Occured while deleting transactions" + " " + formatException(ex),
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

    public async DeleteTransactionsByDate(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const helperId = req.body.HelperId;
            const chainId = req.body.ChainId;
            const result = await service.GetTransactionsBySenderAddress(helperId);
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
                "Error Occured while deleting transaction" + " " + formatException(ex),
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
    public async GetTransactionsByHash(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const hash = req.body.Hash;
            const result = await service.GetTransactionByHash(hash);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting transaction by hash" + " " + formatException(ex),
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
export const controller = new TransactionsController();
