import { Response, Request } from "express";
import { Response as _Response, Error } from "../Response/Response";
import ResponseCode from "../Response/ResponseCode";
import { service } from "../../service/poolDataService/PoolDataService";
import { PoolData } from "../../service/models/DbModels";
import { logger } from "../../config/logger";
import { formatException } from "../../utils";
class PoolDataController
{
    public async AddPool(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: PoolData = {
                active: req.body.active,
                protocolId: req.body.protocolId,
                chain: req.body.chain,
                id: req.body.id,
                metadata: req.body.metadata,
                name: req.body.name,
                risk: req.body.risk,

                data: req.body.data,

                underlyingTokens: req.body.underlyingTokens,
                dataProvider: req.body.dataProvider
            };
            const result = await service.AddPool(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = { result };
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Adding Pool (AddPool)" + " " + formatException(ex),
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

    public async GetPool(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const id = req.body.id;
            const result = await service.GetPool(id);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Getting Pool (GetPool)" + " " + formatException(ex),
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

    public async GetPools(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const filter = req.body.filter;
            const sort = req.body.sort;
            const limit = req.body.limit;
            const offset = req.body.offset;

            const result = await service.GetPools(filter, sort, limit, offset);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Getting Pools (GetPools)" + " " + formatException(ex),
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

    public async UpdatePoolDatas(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const result = await service.UpdatePoolDatas();
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = { result };
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Updating Pool Datas (UpdatePoolDatas)" +
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
export const controller = new PoolDataController();
