import * as Yup from "yup";

export const addWhishListItemSchema = {
  schema: {
    body: {
      yupSchema: Yup.object().shape({
        productId: Yup.string().required("Product ID is required"),
      }),
    },
  },
};

export const whishListItemSchema = {
  schema: {
    body: {
      yupSchema: Yup.object().shape({
        whishListItemId: Yup.string().required("Whishlist item ID is required"),
      }),
    },
  },
};
