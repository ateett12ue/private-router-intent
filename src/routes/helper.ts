import * as express from "express";
import { controller } from "../controllers/Helper";

const router = express.Router();

router.post("/helper/update-helper-contract", controller.UpdateHelperChainAddress);
router.post("/helper/get-helper-contract", controller.GetHelperContract);
router.post("/helper/get-helper-contract-address", controller.GetHelperContractAddress);
router.get("/helper/get-all-chains-supported", controller.GetAllChainSupported);
export const helper = router;
