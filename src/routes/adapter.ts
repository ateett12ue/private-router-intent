import * as express from "express";
import { controller } from "../controllers/Adapters";

const router = express.Router();

router.post("/adapter/add-adapter", controller.AddAdapter);
router.post("/adapter/get-adapter-details", controller.GetAdapterDetails);
router.post("/adapter/compose-adapter-calldata", controller.ComposeAdapterCalldata);
router.post("/adapter/get-calldata-gas", controller.GetCalldataGas);
router.post("/adapter/update-adapter-chain-details", controller.UpdateAdapterChainAddress);
router.get("/adapter/get-internal-adapter-address", controller.GetInternalContractAddress);

/**
 * @swagger
 * components:
 *   schemas:
 *     Compose API Response:
 *       type: object
 *       properties:
 *         Code:
 *           type: number
 *           description: Code 0 for SuccessPayload and Code 1 for Error Payload
 *           example: 0
 *         Error:
 *           type: array
 *           description: Array of errors
 *           example: {"Code": 1, "Message": {"title": "","message": ""}}
 *         Payload:
 *           type: object
 *           example: {"trnxId": "", "gasPrice": "", "calldata": "", "to": "", "from": "", "value": "","prioritySteps": [], "gaslimit": ""}
 */

/**
 * @swagger
 * /router-intent/adapter/compose-adapter-calldata:
 *   post:
 *     summary: Compose adapters calldata for Transaction.
 *     tags:
 *       - Compose API
 *     consumes:
 *       - application/json
 *     produces:
 *       - application/json
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           description: Payload from Quote API
 *           schema:
 *             type: object
 *             required: true
 *             description: Payload from Quote API
 *     responses:
 *       200:
 *         description: Successful operation
 *         schema:
 *           type: object
 *           properties:
 *             Code:
 *               type: number
 *               example: 0
 *               description: Code 0 for SuccessPayload and Code 1 for Error Payload
 *             Error:
 *               type: array
 *               example:
 *                  - Code: "1"
 *                    Message:
 *                      - title: ""
 *                        message: ""
 *               description: Array of errors
 *             Payload:
 *               type: object
 *               example:
 *                  - trnxId: ""
 *                    gasPrice: ""
 *                    calldata: ""
 *                    to: ""
 *                    from: ""
 *                    value: ""
 *                    prioritySteps: []
 *                    gaslimit: ""
 *               description: Payload sent for transaction (prioritySteps are the approval steps need before transaction)
 *       400:
 *         description: Invalid request
 */
router.post("/adapter/compose-adapter-calldata", controller.ComposeAdapterCalldata);
router.post("/adapter/get-all-adapter", controller.GetAllAdapters);
export const adapter = router;
