/**
 * Shopify product types for the lunalight-client.
 *
 * These types represent the API response structure for fetching
 * Shopify products to import into the wizard.
 */

/**
 * Product import information for display in the wizard.
 */
export interface ProductImportInfo {
  /** Unique identifier in our system. */
  id: string;
  /** Product name/title. */
  name: string;
  /** Product description (plain text). */
  description: string;
  /** Formatted price string (e.g., "$29.99"). */
  price: string;
  /** URL of the product's featured image. */
  imageUrl: string;
  /** Original Shopify product ID. */
  shopifyProductId: number;
}

/**
 * Pagination information for product lists.
 */
export interface ProductPagination {
  /** Whether there are more products after this page. */
  hasNextPage: boolean;
  /** Whether there are products before this page. */
  hasPreviousPage: boolean;
  /** Cursor for fetching the next page. */
  nextPageInfo: string | null;
  /** Cursor for fetching the previous page. */
  previousPageInfo: string | null;
}

/**
 * Successful response from the list products endpoint.
 */
export interface ListProductsResponse {
  /** Indicates the request was successful. */
  success: true;
  /** Response data containing products and pagination. */
  data: {
    /** Array of products. */
    products: ProductImportInfo[];
    /** Pagination information. */
    pagination: ProductPagination;
    /** Total count of products in current response. */
    totalCount: number;
  };
  /** Optional success message. */
  message?: string;
}

/**
 * Error response from the API.
 */
export interface ProductsApiErrorResponse {
  /** Indicates the request failed. */
  success: false;
  /** Error details. */
  error: {
    /** Error type code. */
    type: string;
    /** Human-readable error message. */
    message: string;
    /** Additional error details. */
    details?: Record<string, string[]>;
  };
}

/**
 * Query parameters for listing Shopify products.
 */
export interface ListProductsParams {
  /** Maximum number of products to return (1-250). */
  limit?: number;
  /** Cursor for pagination. */
  pageInfo?: string;
  /** Filter by product status. */
  status?: "active" | "draft" | "archived";
  /** Filter by product type. */
  productType?: string;
  /** Filter by vendor. */
  vendor?: string;
}

/**
 * Union type for API response.
 */
export type ProductsApiResponse =
  | ListProductsResponse
  | ProductsApiErrorResponse;
