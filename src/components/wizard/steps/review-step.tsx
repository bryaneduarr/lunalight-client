"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Building2,
  Palette,
  Sparkles,
  Package,
  Edit2,
  Loader2,
  Wand2,
  Save,
} from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { useGenerateTheme } from "@/hooks/use-generate-theme";
import { useCreateTheme } from "@/hooks/use-create-theme";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemePreview, FileTree } from "@/components/themes/theme-preview";
import { cn } from "@/lib/utils";
import type { GeneratedThemeData } from "@/types/theme-generation.types";
import type { ProductInfo } from "@/types/wizard.types";

/**
 * Maps step IDs to icons.
 */
const STEP_ICONS: Record<string, React.ReactNode> = {
  "brand-info": <Building2 className="size-5" aria-hidden="true" />,
  "color-style": <Palette className="size-5" aria-hidden="true" />,
  "vision-prompt": <Sparkles className="size-5" aria-hidden="true" />,
  products: <Package className="size-5" aria-hidden="true" />,
};

/**
 * ReviewStep displays a summary of all wizard data for user confirmation.
 * After generation, shows a preview of the generated theme.
 */
export function ReviewStep() {
  const router = useRouter();
  const { data, goToStep, validateStep, resetWizard } = useWizard();

  // State for generated theme data.
  const [generatedTheme, setGeneratedTheme] =
    useState<GeneratedThemeData | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | undefined>();

  // Set up theme generation mutation.
  const { mutate: generateTheme, isPending: isGenerating } = useGenerateTheme({
    onSuccess: (themeData) => {
      setGeneratedTheme(themeData);
    },
  });

  // Set up theme creation mutation for saving.
  const { createTheme, isPending: isSaving } = useCreateTheme({
    onSuccess: () => {
      // Reset wizard and redirect to dashboard.
      resetWizard();
      router.push("/dashboard");
    },
  });

  // Check if all required steps are valid.
  const allStepsValid = [0, 1, 2, 3].every(
    (index) => validateStep(index).isValid,
  );

  // Get the products to display based on source type.
  const displayProducts =
    data.products.sourceType === "import"
      ? data.products.importedProducts
      : data.products.manualProducts;

  // Handle generate theme action.
  const handleGenerateTheme = () => {
    if (!allStepsValid || isGenerating) return;

    // Map products to the API format.
    const products = displayProducts.map((product: ProductInfo) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
    }));

    // Generate theme using the AI service.
    generateTheme({
      brandInfo: {
        brandName: data.brandInfo.brandName || "Your Brand",
        brandDescription: data.brandInfo.brandDescription || undefined,
      },
      colorScheme: {
        primaryColor: data.colorStyle.primaryColor,
        secondaryColor: data.colorStyle.secondaryColor,
        accentColor: data.colorStyle.accentColor,
      },
      visionPrompt: data.visionPrompt.prompt,
      products: products.length > 0 ? products : undefined,
      referenceImageUrls:
        data.colorStyle.referenceImages.length > 0
          ? data.colorStyle.referenceImages
          : undefined,
    });
  };

  // Handle saving the generated theme.
  const handleSaveTheme = () => {
    if (!generatedTheme) return;

    createTheme({
      name: generatedTheme.themeName,
      liquidFiles: generatedTheme.liquidFiles,
    });
  };

  // Handle regenerating the theme.
  const handleRegenerate = () => {
    setGeneratedTheme(null);
    handleGenerateTheme();
  };

  // If theme is generated, show the preview view.
  if (generatedTheme) {
    return (
      <div className="space-y-6">
        {/* Header with actions. */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-2xl">
              {generatedTheme.themeName}
            </h2>
            <p className="text-muted-foreground text-sm">
              Generated with {Object.keys(generatedTheme.liquidFiles).length}{" "}
              files
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Regenerating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 size-4" aria-hidden="true" />
                  Regenerate
                </>
              )}
            </Button>
            <Button onClick={handleSaveTheme} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2
                    className="mr-2 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 size-4" aria-hidden="true" />
                  Save Theme
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Preview and file tree layout. */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Main preview. */}
          <div className="h-[600px]">
            <ThemePreview
              liquidFiles={generatedTheme.liquidFiles}
              colorScheme={{
                primaryColor: data.colorStyle.primaryColor,
                secondaryColor: data.colorStyle.secondaryColor,
                accentColor: data.colorStyle.accentColor,
              }}
              brandName={data.brandInfo.brandName || "Your Brand"}
            />
          </div>

          {/* File tree sidebar. */}
          <div className="h-[600px]">
            <FileTree
              liquidFiles={generatedTheme.liquidFiles}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default view: review wizard data and generate button.
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <CheckCircle2 className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">Review & Generate</CardTitle>
            <CardDescription>
              Review your selections before generating your theme.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {/* Validation status. */}
        {allStepsValid ? (
          <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CardContent className="flex items-center gap-3 p-4">
              <CheckCircle2
                className="size-5 text-green-600 dark:text-green-400"
                aria-hidden="true"
              />
              <p className="text-green-800 text-sm dark:text-green-200">
                All steps are complete. You&apos;re ready to generate your
                theme!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
            <CardContent className="flex items-center gap-3 p-4">
              <Sparkles
                className="size-5 text-amber-600 dark:text-amber-400"
                aria-hidden="true"
              />
              <p className="text-amber-800 text-sm dark:text-amber-200">
                Some steps need attention. Please review and complete them.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step summaries. */}
        <div className="space-y-4">
          {/* Brand Information Summary. */}
          <ReviewSection
            icon={STEP_ICONS["brand-info"]}
            title="Brand Information"
            onEdit={() => goToStep(0)}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Brand Name:
                </span>
                <span className="font-medium">
                  {data.brandInfo.brandName || "Your Brand (default)"}
                </span>
              </div>
              {data.brandInfo.brandDescription && (
                <div>
                  <span className="text-muted-foreground text-sm">
                    Description:
                  </span>
                  <p className="mt-1 line-clamp-2 text-sm">
                    {data.brandInfo.brandDescription}
                  </p>
                </div>
              )}
            </div>
          </ReviewSection>

          <Separator />

          {/* Color & Style Summary. */}
          <ReviewSection
            icon={STEP_ICONS["color-style"]}
            title="Color & Style"
            onEdit={() => goToStep(1)}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Palette:</span>
                <Badge variant="secondary">
                  {data.colorStyle.paletteId === "custom"
                    ? "Custom"
                    : data.colorStyle.paletteId === "random"
                      ? "Random"
                      : data.colorStyle.paletteId || "Not selected"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Colors:</span>
                <div className="flex gap-1.5">
                  <div
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: data.colorStyle.primaryColor }}
                    title="Primary"
                  />
                  <div
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: data.colorStyle.secondaryColor }}
                    title="Secondary"
                  />
                  <div
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: data.colorStyle.accentColor }}
                    title="Accent"
                  />
                </div>
              </div>
            </div>
          </ReviewSection>

          <Separator />

          {/* Vision Prompt Summary. */}
          <ReviewSection
            icon={STEP_ICONS["vision-prompt"]}
            title="Vision"
            onEdit={() => goToStep(2)}
            isValid={validateStep(2).isValid}
          >
            {data.visionPrompt.prompt ? (
              <div>
                <p className="line-clamp-4 text-sm">
                  {data.visionPrompt.prompt}
                </p>
                <p className="mt-1 text-muted-foreground text-xs">
                  {data.visionPrompt.prompt.length} characters
                </p>
              </div>
            ) : (
              <p className="text-destructive text-sm">
                No vision prompt provided. This is required.
              </p>
            )}
          </ReviewSection>

          <Separator />

          {/* Products Summary. */}
          <ReviewSection
            icon={STEP_ICONS.products}
            title="Products"
            onEdit={() => goToStep(3)}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Source:</span>
                <Badge variant="secondary">
                  {data.products.sourceType === "import"
                    ? "Shopify Import"
                    : "Manual Entry"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">
                  Products added:
                </span>
                <span className="font-medium">{displayProducts.length}</span>
              </div>
              {displayProducts.length > 0 && (
                <div className="mt-2 space-y-1">
                  {displayProducts.slice(0, 3).map((product) => (
                    <p
                      key={product.id}
                      className="text-muted-foreground text-sm"
                    >
                      • {product.name || "Unnamed product"}
                      {product.price && ` - ${product.price}`}
                    </p>
                  ))}
                  {displayProducts.length > 3 && (
                    <p className="text-muted-foreground text-sm">
                      +{displayProducts.length - 3} more products
                    </p>
                  )}
                </div>
              )}
              {displayProducts.length === 0 && (
                <p className="text-muted-foreground text-sm">
                  No products added (optional).
                </p>
              )}
            </div>
          </ReviewSection>
        </div>

        {/* Generation info. */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="mb-2 font-medium text-sm">What happens next?</p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>• AI will generate a complete Shopify Liquid theme</li>
              <li>• You&apos;ll see a preview of your generated theme</li>
              <li>• Generation typically takes 30-60 seconds</li>
              <li>• You can save the theme or regenerate if needed</li>
            </ul>
          </CardContent>
        </Card>

        {/* Generate button. */}
        <Button
          type="button"
          size="lg"
          onClick={handleGenerateTheme}
          disabled={!allStepsValid || isGenerating}
          className="w-full gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              Generating Theme...
            </>
          ) : (
            <>
              <Wand2 className="size-5" aria-hidden="true" />
              Generate Theme
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Props for ReviewSection component.
 */
interface ReviewSectionProps {
  icon: React.ReactNode;
  title: string;
  onEdit: () => void;
  isValid?: boolean;
  children: React.ReactNode;
}

/**
 * ReviewSection displays a summary section with edit button.
 */
function ReviewSection({
  icon,
  title,
  onEdit,
  isValid = true,
  children,
}: ReviewSectionProps) {
  return (
    <div className="flex gap-4">
      {/* Step icon. */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          isValid
            ? "bg-primary/10 text-primary"
            : "bg-destructive/10 text-destructive",
        )}
      >
        {icon}
      </div>
      {/* Content. */}
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="size-3" aria-hidden="true" />
            Edit
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
