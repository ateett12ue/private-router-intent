import { controller as healthController } from "../controllers/Health";
import * as express from "express";

const router = express.Router();

router.get("/health", healthController.GetHealth);

export const health = router;
