import * as express from "express";
import { controller as poolDataController } from "../controllers/Pool";
import { validator } from "../validators";

const router = express.Router();

router.post("/data/add-pool", poolDataController.AddPool);
router.post("/data/get-pool", poolDataController.GetPool);
router.post("/data/get-pools", poolDataController.GetPools);
router.post("/data/update-pools", poolDataController.UpdatePoolDatas);
// router.post("/data/charts", controller.GetCharts);

export const pool = router;
