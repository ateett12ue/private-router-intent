import * as express from "express";
import { controller } from "../controllers/Protocol";
import { validator } from "../validators";

const router = express.Router();

router.post("/protocol/add-protocol", controller.AddProtocol);
router.post("/protocol/get-protocol-details", controller.GetProtocolDetails);
/**
 * @swagger
 * components:
 *   schemas:
 *     TokenData:
 *       type: object
 *       required:
 *         - chainId
 *         - address
 *         - name
 *         - decimals
 *       properties:
 *         chainId:
 *           type: string
 *           description: Token Chain Id
 *         address:
 *           type: string
 *           description: TokenAddress
 *         name:
 *           type: string
 *           description: TokenName
 *         symbol:
 *           type: string
 *           description: TokenSymbol(optional)
 *         decimals:
 *           type: number
 *           description: TokenDecimals
 *       example:
 *         chainId: "17000"
 *         address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
 *         name: "ETH"
 *         symbol: "ETH"
 *         decimals: 18
 *
 *     ProtocolIdParam:
 *       type: object
 *       required:
 *         - protocolId
 *         - chainId
 *         - action
 *         - poolId
 *       properties:
 *         protocolId:
 *           type: string
 *           description: Protocol Id
 *         chainId:
 *           type: number
 *           description: Protocol Deployed Chain
 *         action:
 *           type: string
 *           description: Protocol Action
 *         poolId:
 *           type: string
 *           description: Protocol Pool Id
 *         data:
 *           type: any
 *           description: Additional data for the protocol (optional)
 *     QuoteParams:
 *       type: object
 *       properties:
 *         SourceTokens:
 *           type: array
 *           required: true
 *           description: The source tokens send by user (Array Of TokenData)
 *         DestinationTokens:
 *           type: array
 *           required: false
 *           description: The destination tokens needed for protocol (Array Of TokenData)
 *         Amount:
 *           type: array
 *           description: Array of amounts as per Source Tokens in String
 *           required: true
 *         SourceChainId:
 *           type: number
 *           description: SourceChain Id
 *           required: true
 *         ReceiverAddress:
 *           type: string
 *           description: User Address at destination
 *           required: true
 *         SenderAddress:
 *           type: string
 *           description: The address initiating the swap ( Optional (same as receiverAddress))
 *           required: false
 *         SlippageTolerance:
 *           type: number
 *           description: The slippage tolerance percentage (Optional)
 *         Protocol:
 *           type: array
 *           description: Array Of Protocol Data (Array Of ProtocolIdParam)
 *           required: true
 */

/**
 * @swagger
 * tags:
 *   name: Quote API
 *   title: Quote API
 *   description: Get quotes from a protocol.
 * /router-intent/protocol/get-protocol-quotes:
 *   post:
 *     summary: Get quotes from a protocol.
 *     tags: [Quote API]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuoteParams'
 *           examples:
 *            "Arbitrum (ETH) to Ethereum (STONE)":
 *              value:
 *                ReceiverAddress: "0xcdACa3635f4B1C969af7C53988D4c8576698ba7C"
 *                SourceTokens: [{"chainId": "42161", "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "symbol": "ETH", "decimals": 18}]
 *                Amount: ["10000000000000000000"]
 *                SourceChainId: 42161
 *                Protocol: [{ "protocolId": "stakestone", "chainId": "1", "action": "stake", "poolId": "stakestone-stone-1", "data": {}}]
 *            "Manta (ETH) to Manta (STONE) via Express Stake":
 *              value:
 *                ReceiverAddress: "0xcdACa3635f4B1C969af7C53988D4c8576698ba7C"
 *                SourceTokens: [{"chainId": "169", "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", "symbol": "ETH", "decimals": 18}]
 *                Amount: ["100000000000000000"]
 *                SourceChainId: 169
 *                Protocol: [{ "protocolId": "stakestone", "chainId": "1", "action": "express-stake", "poolId": "stakestone-stone-1", "data": {"bridgeChain": "169", "bridgePoolId": "stakestone-stone"}}]
 *            "Ethereum (USDC) to Manta (STONE)":
 *              value:
 *                ReceiverAddress: "0xcdACa3635f4B1C969af7C53988D4c8576698ba7C"
 *                SourceTokens: [{"chainId": "1", "address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", "symbol": "USDC", "decimals": 6}]
 *                Amount: ["15000000"]
 *                SourceChainId: 1
 *                Protocol: [{ "protocolId": "stakestone", "chainId": "1", "action": "stake", "poolId": "stakestone-stone-1", "data": {"bridgeChain": "169", "bridgePoolId": "stakestone-stone"}}]
 *            "Optimism (USDC) to Manta (STONE) via Express Stake":
 *              value:
 *                ReceiverAddress: "0xcdACa3635f4B1C969af7C53988D4c8576698ba7C"
 *                SourceTokens: [{"chainId": "10", "address": "0x0b2c639c533813f4aa9d7837caf62653d097ff85", "symbol": "USDC", "decimals": 6}]
 *                Amount: ["15000000"]
 *                SourceChainId: 10
 *                Protocol: [{ "protocolId": "stakestone", "chainId": "1", "action": "express-stake", "poolId": "stakestone-stone-1", "data": {"bridgeChain": "169", "bridgePoolId": "stakestone-stone"}}]
 *     responses:
 *       200:
 *         description: Successful operation
 *       400:
 *         description: Invalid request
 */
router.post(
    "/protocol/get-protocol-quotes",
    validator.GetProtocolBodyValidator,
    controller.GetProtocolQuote
);

export const protocol = router;
