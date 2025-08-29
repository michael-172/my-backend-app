import * as yup from "yup";

const createProductSchema = {
  schema: {
    body: {
      yupSchema: yup.object({
        name: yup
          .string()
          .required("Product name is required")
          .min(2, "Name must be at least 2 characters")
          .max(255, "Name must be less than 255 characters"),

        price: yup
          .number()
          .typeError("Price must be a valid number")
          .required("Price is required")
          .positive("Price must be greater than 0"),

        priceAfterDiscount: yup
          .number()
          .typeError("Price after discount must be a valid number")
          .nullable()
          .transform((value, originalValue) =>
            String(originalValue).trim() === "" ? null : value
          )
          .max(
            yup.ref("price"),
            "Discounted price must be less than original price"
          ),

        description: yup
          .string()
          .required("Description is required")
          .max(2000, "Description too long"),

        sku: yup
          .string()
          .required("SKU is required")
          .min(3, "SKU must be at least 3 characters")
          .max(50, "SKU must be less than 50 characters"),

        categoryId: yup.string().required("Category is required"),

        images: yup
          .array()
          .of(yup.string())
          .min(1, "At least one image is required")
          .max(4, "At most four images are allowed"),

        average_ratings: yup
          .number()
          .integer("Rating must be an integer")
          .min(0, "Minimum rating is 0")
          .max(5, "Maximum rating is 5")
          .nullable(),

        status: yup
          .string()
          .oneOf(
            ["AVAILABLE", "OUT_OF_STOCK", "DISCONTINUED"],
            "Invalid status"
          )
          .default("AVAILABLE"),

        // relations (optional validation placeholders)
        attributes: yup.array().of(yup.object()).optional(),
        variations: yup.array().of(yup.object()).optional(),
      }),
    },
  },
};

export { createProductSchema };
