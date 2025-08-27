import { Router } from "express";
import { CartController } from "./cart.controller";
import { addCartItemSchema, cartItemSchema } from "../../../validations/cart";
import { expressYupMiddleware } from "express-yup-middleware";
import * as Yup from "yup";
import customErrorFormatter from "../../../middlewares/validate";

const router = Router();

router.get("/me", CartController.getAll);
router.post(
  "/add",
  expressYupMiddleware({
    schemaValidator: addCartItemSchema,
    errorFormatter: customErrorFormatter,
  }),
  CartController.add
);
router.delete(
  "/remove",
  expressYupMiddleware({
    schemaValidator: cartItemSchema,
    errorFormatter: customErrorFormatter,
    expectedStatusCode: 422, // <-- This is the key change
  }),
  CartController.remove
);
router.patch(
  "/increase",
  expressYupMiddleware({
    schemaValidator: cartItemSchema,
    errorFormatter: customErrorFormatter,
    expectedStatusCode: 422, // <-- This is the key change
  }),
  CartController.increase
);
router.patch(
  "/decrease",
  expressYupMiddleware({
    schemaValidator: cartItemSchema,
    errorFormatter: customErrorFormatter,
    expectedStatusCode: 422, // <-- This is the key change
  }),
  CartController.decrease
);

export const cartRouter = router;
