import * as yup from "yup";

const addCartItemSchema = {
  schema: {
    body: {
      yupSchema: yup.object().shape({
        productId: yup.string().required(),
        productVariationId: yup.string().required(),
        quantity: yup.number().min(1).required(),
      }),
    },
  },
};

const cartItemSchema = {
  schema: {
    body: {
      yupSchema: yup.object().shape({
        cartItemId: yup.string().required(),
      }),
    },
  },
};

export { addCartItemSchema, cartItemSchema };
