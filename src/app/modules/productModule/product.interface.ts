export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  priceAfterDiscount: number;
  sku: string;
  categoryId: string;
  images: string[];
  variants: VariantPayload[];
}

export interface VariantPayload {
  attributes: Record<string, any>;
  image: string;
  stock: number;
  price: number | null;
  sku: string;
}
