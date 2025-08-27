import * as yup from "yup";

const addCartItemSchema = {
  schema: {
    body: {
      yupSchema: yup.object().shape({
        productId: yup.string().uuid().required(),
        variantId: yup.string().uuid().required(),
        quantity: yup.number().min(1).required(),
      }),
    },
  },
};

const cartItemSchema = {
  schema: {
    body: {
      yupSchema: yup.object().shape({
        cartItemId: yup.string().uuid().required(),
      }),
    },
  },
};

export { addCartItemSchema, cartItemSchema };
