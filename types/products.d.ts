interface IProduct {
  id: string;
  name: string;
  description?: string;
  price: string;
  priceAfterDiscount: string;
  sku: string;
  categoryId: string;
  images: string[];
  average_ratings?: number | null;
  createdAt: Date;
  updatedAt: Date;
  status: "AVAILABLE" | "OUT_OF_STOCK" | "DISCONTINUED";
  // Relations (optional, depending on usage)
  // category?: Categories;
  reviews?: Review[];
  // cart_items?: CartItem[];
  // WhishListItem?: WhishListItem[];
  // variants?: Variant[];
}

interface VariantPayload {
  attributes: Record<string, any>;
  image: string;
  stock: number;
  price: number | null;
  sku: string;
}

interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  priceAfterDiscount: number;
  sku: string;
  categoryId: string;
  images: string[];
  variants: VariantPayload[];
}
