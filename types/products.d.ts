// Note: The Decimal type from Prisma is often represented as a string or number in TypeScript.
// Using 'number' is common for calculations, but for financial precision, a library like 'decimal.js' might be used.
// For simplicity, we'll use 'number' here.

// Placeholders for related models that were not defined in the schema.
interface Category {
  id: number;
  // ... other category properties
}

interface Review {
  id: number;
  // ... other review properties
}

interface CartItem {
  id: number;
  // ... other cart item properties
}

interface WishListItem {
  id: number;
  // ... other wish list item properties
}

/**
 * Enum for the status of a product.
 */
enum ProductStatus {
  AVAILABLE = "AVAILABLE",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  DISCONTINUED = "DISCONTINUED",
}

/**
 * Represents a single attribute of a product variation.
 * Links a variation to a specific attribute value (e.g., this variation is "Red").
 */
interface VariationAttribute {
  id: number;
  attributeValueId: number;
  attributeValue: AttributeValue;
  productVariationId: number;
  productVariation: ProductVariation;
}

/**
 * Represents a specific variation of a product (e.g., a T-shirt, size M, color Red).
 */
interface ProductVariation {
  id: number;
  sku: string;
  price: number;
  stock: number;
  productId: string;
  product: Product;
  attributes: VariationAttribute[];
  cartItems: CartItem[];
}

/**
 * Represents the specific value for a product attribute (e.g., "Red", "Large").
 */
interface AttributeValue {
  id: number;
  value: string;
  productAttributeId: number;
  productAttribute: ProductAttribute;
  variationAttributes: VariationAttribute[];
}

/**
 * Represents a configurable attribute of a product (e.g., "Color", "Size").
 */
interface ProductAttribute {
  id: number;
  name: string;
  productId: number;
  product: Product;
  values: AttributeValue[];
}

/**
 * Represents the main product entity.
 */
interface IProduct {
  id: number;
  name: string;
  price: number;
  priceAfterDiscount: number | null;
  description: string;
  sku: string;
  categoryId: number;
  images: string[];
  category: Category;
  reviews: Review[];
  average_ratings: number | null;
  cart_items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  WishListItem: WishListItem[];
  status: ProductStatus;
  attributes: ProductAttribute[];
  variations: ProductVariation[];
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

interface UpdateProductPayload {
  name?: string;
  description?: string;
  price?: number;
  priceAfterDiscount?: number;
  sku?: string;
  status?: ProductStatus;
  categoryId?: string;
  images?: string[];
  variants?: VariantPayload[];
}

interface createAttributesPayload {
  productId: number;
  attributesWithValues: AttributeWithValues[];
}

interface AttributeWithValues {
  name: string;
  values: string[];
}

interface CreateVariationPayload {
  sku: string;
  price: number;
  stock: number;
  attributeValueIds: number[];
}

interface createVariationsPayload {
  productId: number;
  variations: CreateVariationPayload[];
}
