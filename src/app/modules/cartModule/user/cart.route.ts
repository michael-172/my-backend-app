import { Router } from "express";
import { CartController } from "./cart.controller";

const router = Router();

router.get("/me", CartController.getAll);
router.post("/add", CartController.add);
router.delete("/remove", CartController.remove);
router.patch("/increase", CartController.increase);
router.patch("/decrease", CartController.decrease);

export const cartRouter = router;
