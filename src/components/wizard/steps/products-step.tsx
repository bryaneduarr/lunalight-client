"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Package,
  Plus,
  Trash2,
  RefreshCw,
  ShoppingBag,
  GripVertical,
  Check,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { useShopifyProducts } from "@/hooks/use-shopify-products";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ProductInfo } from "@/types/wizard.types";
import type { ProductImportInfo } from "@/types/shopify.types";

/**
 * Generates a unique ID for products.
 */
function generateProductId(): string {
  return `product_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Default empty product for new entries.
 */
function createEmptyProduct(): ProductInfo {
  return {
    id: generateProductId(),
    name: "",
    description: "",
    price: "",
    imageUrl: "",
  };
}

/**
 * Converts a Shopify product to our ProductInfo format.
 */
function shopifyProductToProductInfo(product: ProductImportInfo): ProductInfo {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    shopifyProductId: product.shopifyProductId,
  };
}

/**
 * ProductsStep allows users to add products manually or import from Shopify.
 */
export function ProductsStep() {
  const { data, updateData } = useWizard();
  const { sourceType, manualProducts, importedProducts } = data.products;
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<string | undefined>(undefined);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(
    () => new Set(importedProducts.map((p) => p.id)),
  );

  // Fetch Shopify products when in import mode.
  const {
    products: shopifyProducts,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    pagination,
  } = useShopifyProducts({
    params: {
      limit: 12,
      pageInfo,
      status: "active",
    },
    enabled: sourceType === "import",
  });

  // Sync selected products with imported products when selection changes.
  useEffect(() => {
    if (sourceType === "import") {
      const newImportedProducts = shopifyProducts
        .filter((p) => selectedProductIds.has(p.id))
        .map(shopifyProductToProductInfo);

      // Only update if the selection has actually changed.
      const currentIds = new Set(importedProducts.map((p) => p.id));
      const hasChanges =
        newImportedProducts.length !== importedProducts.length ||
        newImportedProducts.some((p) => !currentIds.has(p.id));

      if (hasChanges) {
        updateData("products", {
          importedProducts: newImportedProducts,
          hasImportedProducts: newImportedProducts.length > 0,
        });
      }
    }
  }, [
    selectedProductIds,
    shopifyProducts,
    sourceType,
    importedProducts,
    updateData,
  ]);

  // Handles source type change.
  const handleSourceTypeChange = (type: "import" | "manual") => {
    updateData("products", { sourceType: type });
  };

  // Adds a new empty product.
  const handleAddProduct = () => {
    const newProduct = createEmptyProduct();
    updateData("products", {
      manualProducts: [...manualProducts, newProduct],
    });
    setEditingProduct(newProduct.id);
  };

  // Updates a specific product.
  const handleUpdateProduct = (
    productId: string,
    updates: Partial<ProductInfo>,
  ) => {
    updateData("products", {
      manualProducts: manualProducts.map((p) =>
        p.id === productId ? { ...p, ...updates } : p,
      ),
    });
  };

  // Removes a product.
  const handleRemoveProduct = (productId: string) => {
    updateData("products", {
      manualProducts: manualProducts.filter((p) => p.id !== productId),
    });
    if (editingProduct === productId) {
      setEditingProduct(null);
    }
  };

  // Toggles product selection.
  const handleToggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  // Selects all products on current page.
  const handleSelectAll = () => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      for (const product of shopifyProducts) {
        newSet.add(product.id);
      }
      return newSet;
    });
  };

  // Deselects all products on current page.
  const handleDeselectAll = () => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      for (const product of shopifyProducts) {
        newSet.delete(product.id);
      }
      return newSet;
    });
  };

  // Navigate to previous page.
  const handlePreviousPage = () => {
    if (pagination?.previousPageInfo) {
      setPageInfo(pagination.previousPageInfo);
    }
  };

  // Navigate to next page.
  const handleNextPage = () => {
    if (pagination?.nextPageInfo) {
      setPageInfo(pagination.nextPageInfo);
    }
  };

  const allOnPageSelected = shopifyProducts.every((p) =>
    selectedProductIds.has(p.id),
  );

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Package className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">Products</CardTitle>
            <CardDescription>
              Add products to showcase in your store. You can skip this step.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {/* Source type selection. */}
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSourceTypeChange("import")}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "hover:border-primary/50 hover:bg-muted/50",
              sourceType === "import"
                ? "border-primary bg-primary/5"
                : "border-muted",
            )}
            aria-pressed={sourceType === "import"}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <ShoppingBag className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Import from Shopify</p>
              <p className="text-muted-foreground text-sm">
                Fetch your existing products
              </p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => handleSourceTypeChange("manual")}
            className={cn(
              "flex items-center gap-3 rounded-lg border-2 p-4 text-left transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "hover:border-primary/50 hover:bg-muted/50",
              sourceType === "manual"
                ? "border-primary bg-primary/5"
                : "border-muted",
            )}
            aria-pressed={sourceType === "manual"}
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Plus className="size-5 text-primary" aria-hidden="true" />
            </div>
            <div>
              <p className="font-medium">Add Manually</p>
              <p className="text-muted-foreground text-sm">
                Enter product details yourself
              </p>
            </div>
          </button>
        </div>

        {/* Import from Shopify section. */}
        {sourceType === "import" && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              {/* Header with refresh and selection controls. */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">Select Products to Import</h3>
                  {selectedProductIds.size > 0 && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary text-xs">
                      {selectedProductIds.size} selected
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {shopifyProducts.length > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={
                        allOnPageSelected ? handleDeselectAll : handleSelectAll
                      }
                    >
                      {allOnPageSelected ? "Deselect All" : "Select All"}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="gap-1"
                  >
                    <RefreshCw
                      className={cn("size-3", isFetching && "animate-spin")}
                      aria-hidden="true"
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Loading state. */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2
                    className="mb-4 size-8 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-muted-foreground text-sm">
                    Loading products from Shopify...
                  </p>
                </div>
              )}

              {/* Error state. */}
              {isError && (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle
                    className="mb-4 size-8 text-destructive"
                    aria-hidden="true"
                  />
                  <p className="mb-2 font-medium text-destructive">
                    Failed to load products
                  </p>
                  <p className="mb-4 text-center text-muted-foreground text-sm">
                    {error?.message ??
                      "An error occurred while fetching products."}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => refetch()}
                    className="gap-2"
                  >
                    <RefreshCw className="size-4" aria-hidden="true" />
                    Try Again
                  </Button>
                </div>
              )}

              {/* Empty state. */}
              {!isLoading && !isError && shopifyProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag
                    className="mb-4 size-8 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="mb-2 font-medium">No products found</p>
                  <p className="text-center text-muted-foreground text-sm">
                    Your Shopify store doesn&apos;t have any active products
                    yet.
                  </p>
                </div>
              )}

              {/* Products grid. */}
              {!isLoading && !isError && shopifyProducts.length > 0 && (
                <>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {shopifyProducts.map((product) => (
                      <ShopifyProductCard
                        key={product.id}
                        product={product}
                        isSelected={selectedProductIds.has(product.id)}
                        onToggle={() =>
                          handleToggleProductSelection(product.id)
                        }
                      />
                    ))}
                  </div>

                  {/* Pagination controls. */}
                  {(pagination?.hasPreviousPage || pagination?.hasNextPage) && (
                    <div className="mt-4 flex items-center justify-between border-t pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePreviousPage}
                        disabled={!pagination?.hasPreviousPage || isFetching}
                        className="gap-1"
                      >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Previous
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!pagination?.hasNextPage || isFetching}
                        className="gap-1"
                      >
                        Next
                        <ChevronRight className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}

        {/* Manual products list. */}
        {sourceType === "manual" && (
          <div className="space-y-4">
            {/* Products list. */}
            {manualProducts.length > 0 && (
              <div className="space-y-3">
                {manualProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                    isEditing={editingProduct === product.id}
                    onEdit={() => setEditingProduct(product.id)}
                    onUpdate={(updates) =>
                      handleUpdateProduct(product.id, updates)
                    }
                    onRemove={() => handleRemoveProduct(product.id)}
                    onClose={() => setEditingProduct(null)}
                  />
                ))}
              </div>
            )}

            {/* Add product button. */}
            <Button
              type="button"
              variant="outline"
              onClick={handleAddProduct}
              className="w-full gap-2 border-dashed"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add Product
            </Button>

            {/* Empty state message. */}
            {manualProducts.length === 0 && (
              <p className="text-center text-muted-foreground text-sm">
                No products added yet. Products are optional for theme
                generation.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Props for ShopifyProductCard component.
 */
interface ShopifyProductCardProps {
  product: ProductImportInfo;
  isSelected: boolean;
  onToggle: () => void;
}

/**
 * ShopifyProductCard displays a selectable Shopify product.
 */
function ShopifyProductCard({
  product,
  isSelected,
  onToggle,
}: ShopifyProductCardProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "group relative flex flex-col rounded-lg border bg-background p-3 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary ring-1 ring-primary"
          : "border-muted hover:border-primary/50",
      )}
    >
      {/* Selection indicator. */}
      <div
        className={cn(
          "absolute top-2 right-2 flex size-5 items-center justify-center rounded-full border-2 transition-all",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30 group-hover:border-primary/50",
        )}
      >
        {isSelected && (
          <Check className="size-3" aria-hidden="true" strokeWidth={3} />
        )}
      </div>

      {/* Product image. */}
      <div className="relative mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <Package
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
        )}
      </div>

      {/* Product info. */}
      <p className="line-clamp-1 pr-6 font-medium text-sm">{product.name}</p>
      <p className="text-muted-foreground text-sm">{product.price}</p>
    </button>
  );
}

/**
 * Props for ProductCard component.
 */
interface ProductCardProps {
  product: ProductInfo;
  index: number;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (updates: Partial<ProductInfo>) => void;
  onRemove: () => void;
  onClose: () => void;
}

/**
 * ProductCard displays a single product with edit capabilities.
 */
function ProductCard({
  product,
  index,
  isEditing,
  onEdit,
  onUpdate,
  onRemove,
  onClose,
}: ProductCardProps) {
  if (isEditing) {
    return (
      <Card className="border-primary">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <p className="font-medium">Product {index + 1}</p>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sr-only">Remove product</span>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`product-name-${product.id}`} className="text-sm">
                Product Name
              </Label>
              <Input
                id={`product-name-${product.id}`}
                value={product.name}
                onChange={(e) => onUpdate({ name: e.target.value })}
                placeholder="Product name"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor={`product-price-${product.id}`}
                className="text-sm"
              >
                Price
              </Label>
              <Input
                id={`product-price-${product.id}`}
                value={product.price}
                onChange={(e) => onUpdate({ price: e.target.value })}
                placeholder="$0.00"
                maxLength={20}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label
              htmlFor={`product-description-${product.id}`}
              className="text-sm"
            >
              Description
            </Label>
            <Textarea
              id={`product-description-${product.id}`}
              value={product.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Product description..."
              rows={2}
              maxLength={500}
              className="resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`product-image-${product.id}`} className="text-sm">
              Image URL (optional)
            </Label>
            <Input
              id={`product-image-${product.id}`}
              value={product.imageUrl}
              onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>
          <Button type="button" onClick={onClose} className="w-full">
            Done
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border bg-background p-3 text-left transition-all",
        "hover:border-primary/50 hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <GripVertical
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      />
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
        <Package className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {product.name || `Product ${index + 1}`}
        </p>
        <p className="truncate text-muted-foreground text-sm">
          {product.price || "No price set"}
        </p>
      </div>
    </button>
  );
}
