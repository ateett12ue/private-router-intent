import { Response, Request, NextFunction } from "express";
import { Response as _Response, Error } from "../Response/Response";
import ResponseCode from "../Response/ResponseCode";
import _ResponseCode from "../Response/Controller.ResponseCodes";
import { service } from "../../service/adapterService/AdapterService";
import { AdapterDetails, ProtocolDetails } from "../../service/models/DbModels";
import { ProtocolParamsResponse } from "../../service/models/Protocols";
import { CalldataGasParmas } from "../../service/models/Adapters";
import { logger } from "../../config/logger";
import { formatException } from "../../utils";
class AdaptersController
{
    public async AddAdapter(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: AdapterDetails = {
                id: req.body.AdapterId,
                name: req.body.Name,
                icon: req.body.Icon ?? "",
                category: req.body.Category,
                protocolId: req.body.ProtocolId,
                chains: req.body.Chains,
                deployedChains: req.body.DeployedChains ?? [],
                tags: req.body.Tags ?? [req.body.Category],
                action: req.body.Action,
                protocolAppLink: req.body.ProtocolAppLink,
                description: req.body.Description,
                stars: req.body.Stars ?? 0,
                applications: req.body.Applications ?? [],
                downloads: req.body.Downloads ?? 0,
                starredBy: req.body.StarredBy ?? [],
                pipelines: req.body.Pipelines ?? [],
                contractRepoLink: req.body.ContractRepoLink,
                backendRepoLink: req.body.BackendRepoLink,
                primaryAuthor: req.body.PrimaryAuthor,
                documentationLink: req.body.DocumentationLink,
                active: req.body.Active ?? true
            };
            const result = await service.AddAdapter(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = { result };
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Adding Adapter (AddAdapter)" + " " + formatException(ex),
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

    public async GetAdapterDetails(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const adapterId = req.body.AdapterId;
            const result = await service.GetAdapterDetails(adapterId);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Getting Adapter Details (GetAdapterDetails)" +
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

    public async ComposeAdapterCalldata(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: ProtocolParamsResponse = req.body;
            if (!data.clientAddress)
            {
                throw "Client Address Missing";
            }
            const result = await service.ComposeAdapterCalldata(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Composing call data (ComposeAdapterCalldata)" +
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

    public async GetCalldataGas(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const data: CalldataGasParmas = req.body;
            const result = await service.CalldataGasFunction(data);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Calculating Gas (GetCalldataGas)" + " " + formatException(ex),
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

    public async UpdateAdapterChainAddress(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const adapterId = req.body.AdapterId;
            const adapterChainData = req.body.AdapterChainData;
            const result = await service.UpdateAdapterChainAddress(adapterId, adapterChainData);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = { result };
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while Updating Adapter (UpdateAdapterChainAddress)" +
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

    public async GetInternalContractAddress(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const result = await service.GetInternalAdapterAddress();
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error(
                "Error Occured while getting contract Address (GetInternalContractAddress)" +
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

    public async GetAllAdapters(req: Request, res: Response)
    {
        const response = new _Response();
        try
        {
            const filter = req.body;
            const result = await service.GetAllAdapter(filter);
            response.Code = ResponseCode.Success.Code;
            response.PayLoad = result;
            res.send(response);
        }
        catch (ex)
        {
            logger.error("Error Occured while getting AllAdapter" + " " + formatException(ex), req);

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
export const controller = new AdaptersController();
