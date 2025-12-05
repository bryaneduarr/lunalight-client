"use client";

import { useState } from "react";
import {
  Package,
  Plus,
  Trash2,
  Upload,
  ShoppingBag,
  GripVertical,
} from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
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
 * ProductsStep allows users to add products manually or import from Shopify.
 */
export function ProductsStep() {
  const { data, updateData } = useWizard();
  const { sourceType, manualProducts } = data.products;
  const [editingProduct, setEditingProduct] = useState<string | null>(null);

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

  // Placeholder for Shopify import.
  const handleImportFromShopify = () => {
    // TODO: Implement Shopify products import.
    console.log("Import from Shopify - to be implemented");
  };

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
            <CardContent className="flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag
                className="mb-4 size-12 text-muted-foreground"
                aria-hidden="true"
              />
              <p className="mb-2 font-medium">Import Products from Shopify</p>
              <p className="mb-4 text-muted-foreground text-sm">
                Connect to your Shopify store to import existing products.
              </p>
              <Button
                type="button"
                onClick={handleImportFromShopify}
                className="gap-2"
                disabled
              >
                <Upload className="size-4" aria-hidden="true" />
                Import Products (Coming Soon)
              </Button>
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
