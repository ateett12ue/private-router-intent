import * as express from "express";
import { controller } from "../controllers/Transactions";
import { validator } from "../validators";

const router = express.Router();

router.post("/transaction/update", controller.UpdateTransaction);
router.post("/transaction/update-adapter-status", controller.UpdateAapterTransactionStatus);
router.post("/transaction/get-by-address", controller.GetTransactionsByAddress);
router.post("/transaction/get-by-trnx", controller.GetTransactionsByTrnxId);
router.post("/transaction/get-by-hash", controller.GetTransactionsByHash);

export const transaction = router;
