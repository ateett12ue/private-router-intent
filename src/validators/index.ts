import { NextFunction, Request, Response } from "express";
import { Response as _Response } from "../controllers/Response/Response";
import ResponseCodes from "../controllers/Response/ResponseCode";

class RequestValidator
{
    public async GetAdapterParamsValidator(req: Request, res: Response, next: NextFunction)
    {
        req.checkBody("AdapterId", "AdapterId is required").notEmpty().isNumeric();
        req.checkBody("Amount", "Amount is required").notEmpty().isNumeric();
        req.checkBody("FromTokenAddress", "FromTokenAddress is required").notEmpty().isString();
        req.checkBody("FromTokenChainId", "FromTokenChainId is required").notEmpty().isNumeric();
        req.checkBody("ToTokenAddress", "ToTokenAddress is required").notEmpty().isString();
        req.checkBody("ToTokenChainId", "ToTokenChainId is required").notEmpty().isNumeric();
        req.checkBody("SenderAddress", "SenderAddress is required").notEmpty().isString();
        req.checkBody("ReceiverAddress", "ReceiverAddress is required").notEmpty().isString();
        try
        {
            const result = await req.getValidationResult();
            result.throw();
            next();
        }
        catch (e)
        {
            const response = new _Response();
            response.Code = ResponseCodes.Validation.Code;
            response.Errors = e.array();
            res.status(400).send(response);
        }
    }

    public async AddAdapterValidator(req: Request, res: Response, next: NextFunction)
    {
        req.checkBody("AdapterId", "AdapterId is required").notEmpty().isNumeric();
        req.checkBody("Desc", "Desc is required").notEmpty().isString();
        req.checkBody("Title", "Title is required").notEmpty().isString();
        req.checkBody("ResponseParams", "ResponseParams is required").notEmpty().isArray();
        req.checkBody("ApiParam", "ApiParam is required").isArray();
        req.checkBody("ResponseParamsType", "ResponseParamsType is required").notEmpty().isArray();
        try
        {
            const result = await req.getValidationResult();
            result.throw();
            next();
        }
        catch (e)
        {
            const response = new _Response();
            response.Code = ResponseCodes.Validation.Code;
            response.Errors = e.array();
            res.status(400).send(response);
        }
    }

    public async GetAdapterQuoteValidator(req: Request, res: Response, next: NextFunction)
    {
        req.checkBody("AdapterId", "AdapterId is required").notEmpty().isNumeric();
        req.checkBody("AdapterData", "AdapterData is required").notEmpty();

        try
        {
            const result = await req.getValidationResult();
            result.throw();

            next();
        }
        catch (e)
        {
            const response = new _Response();
            response.Code = ResponseCodes.Validation.Code;
            response.Errors = e.array();
            res.status(400).send(response);
        }
    }

    public async GetPoolDataValidator(req: Request, res: Response, next: NextFunction)
    {
        req.checkBody("AdapterId", "AdapterId is required").notEmpty().isNumeric();
        req.checkBody("Token0", "Token0 is required").notEmpty().isString();
        req.checkBody("Token1", "Token1 is required").notEmpty().isString();
        req.checkBody("ChainId", "ChainId is required").notEmpty().isNumeric();
        req.checkBody("Fee", "Fee is required").notEmpty().isNumeric();

        try
        {
            const result = await req.getValidationResult();
            result.throw();

            next();
        }
        catch (e)
        {
            const response = new _Response();
            response.Code = ResponseCodes.Validation.Code;
            response.Errors = e.array();
            res.status(400).send(response);
        }
    }

    public async GetProtocolBodyValidator(req: Request, res: Response, next: NextFunction)
    {
        req.checkBody("SourceTokens", "SourceTokens is required").notEmpty().isArray();
        req.checkBody("Amount", "Amount is required").notEmpty().isArray();
        req.checkBody("SourceChainId", "SourceChainId is required").notEmpty().isNumeric();
        req.checkBody("ReceiverAddress", "ReceiverAddress is required").notEmpty().isString();
        req.checkBody("Protocol", "Protocol is required").notEmpty();
        try
        {
            const result = await req.getValidationResult();
            result.throw();
            next();
        }
        catch (e)
        {
            const response = new _Response();
            response.Code = ResponseCodes.Validation.Code;
            response.Errors = e.array();
            res.status(400).send(response);
        }
    }
}

export const validator = new RequestValidator();
