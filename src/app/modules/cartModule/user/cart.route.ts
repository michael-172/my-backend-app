import { Router } from "express";
import { CartController } from "./cart.controller";

const router = Router();

router.get("/me", CartController.getAll);
router.post("/add", CartController.addToCart);

export const cartRouter = router;
