import { Router } from "express";
import { WhishListController } from "./whishlist.controller";
import {
  addWhishListItemSchema,
  whishListItemSchema,
} from "../../../validations/whishlist";
import { expressYupMiddleware } from "express-yup-middleware";
import customErrorFormatter from "../../../middlewares/validate";

const router = Router();

router.get("/me", WhishListController.getAll);
router.post(
  "/add",
  expressYupMiddleware({
    schemaValidator: addWhishListItemSchema,
    errorFormatter: customErrorFormatter,
  }),
  WhishListController.add
);
router.delete(
  "/remove",
  expressYupMiddleware({
    schemaValidator: whishListItemSchema,
    errorFormatter: customErrorFormatter,
  }),
  WhishListController.remove
);

export const whishListRouter = router;
