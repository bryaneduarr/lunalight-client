"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

/**
 * Device viewport configurations.
 */
const DEVICE_VIEWPORTS = {
  desktop: { width: "100%", height: "100%", label: "Desktop" },
  tablet: { width: "768px", height: "1024px", label: "Tablet" },
  mobile: { width: "375px", height: "667px", label: "Mobile" },
} as const;

type DeviceType = keyof typeof DEVICE_VIEWPORTS;

/**
 * Props for the ThemePreview component.
 */
interface ThemePreviewProps {
  /** The Liquid files to preview. */
  liquidFiles: Record<string, string>;
  /** The color scheme to apply. */
  colorScheme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  /** Optional brand name for the preview. */
  brandName?: string;
  /** Whether the preview is loading. */
  isLoading?: boolean;
  /** Called when an element is selected. */
  onElementSelect?: (elementId: string, filePath: string) => void;
}

/**
 * Parses Liquid files and generates a simplified HTML preview.
 *
 * This function converts Shopify Liquid templates into static HTML
 * for preview purposes. It handles basic Liquid syntax but is not
 * a full Liquid parser.
 */
function generatePreviewHtml(
  liquidFiles: Record<string, string>,
  colorScheme?: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  },
  brandName?: string,
): string {
  // Get the main layout file.
  const layoutContent = liquidFiles["layout/theme.liquid"] ?? "";
  const indexContent = liquidFiles["templates/index.liquid"] ?? "";

  // Get section files.
  const headerContent = liquidFiles["sections/header.liquid"] ?? "";
  const footerContent = liquidFiles["sections/footer.liquid"] ?? "";
  const heroContent = liquidFiles["sections/hero.liquid"] ?? "";
  const featuredProductsContent =
    liquidFiles["sections/featured-products.liquid"] ?? "";

  // Simple Liquid to HTML converter.
  const processLiquid = (content: string): string => {
    let processed = content;

    // Replace Liquid variables with sample values.
    processed = processed
      // Shop/brand variables.
      .replace(/\{\{\s*shop\.name\s*\}\}/g, brandName ?? "Your Store")
      .replace(/\{\{\s*page_title\s*\}\}/g, brandName ?? "Your Store")
      // Content placeholders.
      .replace(/\{\{\s*content_for_header\s*\}\}/g, "")
      .replace(/\{\{\s*content_for_layout\s*\}\}/g, "{{CONTENT_PLACEHOLDER}}")
      // Section settings (simplified).
      .replace(/\{\{\s*section\.settings\.[\w_]+\s*\}\}/g, "Sample Text")
      .replace(/\{\{\s*block\.settings\.[\w_]+\s*\}\}/g, "Sample Block Text")
      // Remove Liquid control flow tags (simplified).
      .replace(/\{%\s*if\s+[^%]+\s*%\}/g, "")
      .replace(/\{%\s*endif\s*%\}/g, "")
      .replace(/\{%\s*else\s*%\}/g, "")
      .replace(/\{%\s*elsif\s+[^%]+\s*%\}/g, "")
      .replace(/\{%\s*unless\s+[^%]+\s*%\}/g, "")
      .replace(/\{%\s*endunless\s*%\}/g, "")
      // Remove for loops.
      .replace(/\{%\s*for\s+[^%]+\s*%\}/g, "")
      .replace(/\{%\s*endfor\s*%\}/g, "")
      // Remove captures.
      .replace(/\{%\s*capture\s+[^%]+\s*%\}/g, "")
      .replace(/\{%\s*endcapture\s*%\}/g, "")
      // Remove assigns.
      .replace(/\{%\s*assign\s+[^%]+\s*%\}/g, "")
      // Remove comments.
      .replace(/\{%\s*comment\s*%\}[\s\S]*?\{%\s*endcomment\s*%\}/g, "")
      // Remove schema blocks.
      .replace(/\{%\s*schema\s*%\}[\s\S]*?\{%\s*endschema\s*%\}/g, "")
      // Remove stylesheet blocks (we'll handle CSS separately).
      .replace(/\{%\s*stylesheet\s*%\}[\s\S]*?\{%\s*endstylesheet\s*%\}/g, "")
      // Remove javascript blocks.
      .replace(/\{%\s*javascript\s*%\}[\s\S]*?\{%\s*endjavascript\s*%\}/g, "")
      // Replace section includes.
      .replace(/\{%\s*section\s+['"]([^'"]+)['"]\s*%\}/g, (_, name) => {
        return `{{SECTION_${name.toUpperCase().replace(/-/g, "_")}}}`;
      })
      // Replace includes/renders.
      .replace(/\{%\s*(include|render)\s+['"]([^'"]+)['"]\s*[^%]*%\}/g, "")
      // Remove remaining Liquid tags.
      .replace(/\{%[^%]+%\}/g, "")
      // Remove remaining Liquid outputs.
      .replace(/\{\{[^}]+\}\}/g, "");

    return processed;
  };

  // Extract CSS from Liquid files.
  const extractCss = (content: string): string => {
    const cssMatches: string[] = [];

    // Extract {% stylesheet %} blocks.
    const stylesheetRegex =
      /\{%\s*stylesheet\s*%\}([\s\S]*?)\{%\s*endstylesheet\s*%\}/g;
    let stylesheetMatch = stylesheetRegex.exec(content);
    while (stylesheetMatch !== null) {
      cssMatches.push(stylesheetMatch[1]);
      stylesheetMatch = stylesheetRegex.exec(content);
    }

    // Extract inline <style> blocks.
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let styleMatch = styleRegex.exec(content);
    while (styleMatch !== null) {
      cssMatches.push(styleMatch[1]);
      styleMatch = styleRegex.exec(content);
    }

    return cssMatches.join("\n");
  };

  // Process layout and inject content.
  let html = processLiquid(layoutContent);

  // Extract CSS from all files.
  const allCss = Object.values(liquidFiles)
    .map(extractCss)
    .filter(Boolean)
    .join("\n");

  // Process sections.
  const processedHeader = processLiquid(headerContent);
  const processedFooter = processLiquid(footerContent);
  const processedHero = processLiquid(heroContent);
  const processedFeaturedProducts = processLiquid(featuredProductsContent);
  const processedIndex = processLiquid(indexContent);

  // Replace section placeholders.
  html = html
    .replace("{{SECTION_HEADER}}", processedHeader)
    .replace("{{SECTION_FOOTER}}", processedFooter)
    .replace("{{SECTION_HERO}}", processedHero)
    .replace("{{SECTION_FEATURED_PRODUCTS}}", processedFeaturedProducts);

  // Build the main content.
  let mainContent = processedIndex;
  mainContent = mainContent
    .replace("{{SECTION_HEADER}}", processedHeader)
    .replace("{{SECTION_FOOTER}}", processedFooter)
    .replace("{{SECTION_HERO}}", processedHero)
    .replace("{{SECTION_FEATURED_PRODUCTS}}", processedFeaturedProducts);

  // If index doesn't have sections, use the sections directly.
  if (!mainContent.trim() || mainContent === processedIndex) {
    mainContent = `
      ${processedHeader}
      <main>
        ${processedHero}
        ${processedFeaturedProducts}
      </main>
      ${processedFooter}
    `;
  }

  // Replace content placeholder in layout.
  html = html.replace("{{CONTENT_PLACEHOLDER}}", mainContent);

  // If no layout, wrap content in basic HTML.
  if (!layoutContent) {
    html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>${brandName ?? "Your Store"}</title>
      </head>
      <body>
        ${mainContent}
      </body>
      </html>
    `;
  }

  // Inject custom CSS variables for color scheme.
  const colorCss = colorScheme
    ? `
    :root {
      --color-primary: ${colorScheme.primaryColor};
      --color-secondary: ${colorScheme.secondaryColor};
      --color-accent: ${colorScheme.accentColor};
    }
    `
    : "";

  // Inject base styles and extracted CSS into head.
  const baseStyles = `
    <style>
      ${colorCss}
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: #333;
      }
      img {
        max-width: 100%;
        height: auto;
      }
      a {
        color: var(--color-primary, #000);
        text-decoration: none;
      }
      a:hover {
        text-decoration: underline;
      }
      ${allCss}
    </style>
  `;

  // Inject styles before </head>.
  if (html.includes("</head>")) {
    html = html.replace("</head>", `${baseStyles}</head>`);
  } else {
    html = `<head>${baseStyles}</head>${html}`;
  }

  return html;
}

/**
 * ThemePreview component renders a simplified preview of generated Liquid theme files.
 * Supports responsive device previews (desktop, tablet, mobile).
 */
export function ThemePreview({
  liquidFiles,
  colorScheme,
  brandName,
  isLoading = false,
  onElementSelect: _onElementSelect,
}: ThemePreviewProps) {
  const [device, setDevice] = useState<DeviceType>("desktop");
  const [key, setKey] = useState(0);

  // Generate the preview HTML.
  const previewHtml = useMemo(() => {
    if (!liquidFiles || Object.keys(liquidFiles).length === 0) {
      return "";
    }
    return generatePreviewHtml(liquidFiles, colorScheme, brandName);
  }, [liquidFiles, colorScheme, brandName]);

  // Handle refresh.
  const handleRefresh = useCallback(() => {
    setKey((prev) => prev + 1);
  }, []);

  // Get viewport styles.
  const viewportStyles = useMemo(() => {
    const viewport = DEVICE_VIEWPORTS[device];
    return {
      width: viewport.width,
      height: viewport.height,
      maxWidth: "100%",
    };
  }, [device]);

  // Show loading skeleton.
  if (isLoading) {
    return <PreviewSkeleton />;
  }

  // Show empty state.
  if (!previewHtml) {
    return <PreviewEmptyState />;
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-lg">Theme Preview</CardTitle>
          <CardDescription>
            Preview how your theme will look on different devices.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {/* Device selector. */}
          <Tabs
            value={device}
            onValueChange={(v) => setDevice(v as DeviceType)}
          >
            <TabsList className="h-9">
              <TabsTrigger value="desktop" className="gap-1.5 px-3">
                <Monitor className="size-4" aria-hidden="true" />
                <span className="sr-only">Desktop</span>
              </TabsTrigger>
              <TabsTrigger value="tablet" className="gap-1.5 px-3">
                <Tablet className="size-4" aria-hidden="true" />
                <span className="sr-only">Tablet</span>
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-1.5 px-3">
                <Smartphone className="size-4" aria-hidden="true" />
                <span className="sr-only">Mobile</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {/* Refresh button. */}
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="size-4" aria-hidden="true" />
            <span className="sr-only">Refresh preview</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="flex h-full items-center justify-center bg-muted/30 p-4">
          <div
            className={cn(
              "overflow-hidden rounded-lg border bg-background shadow-lg transition-all duration-300",
              device === "desktop" && "h-full w-full",
              device !== "desktop" && "mx-auto",
            )}
            style={device !== "desktop" ? viewportStyles : undefined}
          >
            <iframe
              key={key}
              srcDoc={previewHtml}
              title="Theme Preview"
              className="h-full w-full border-0"
              sandbox="allow-same-origin"
              loading="lazy"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading skeleton for the preview.
 */
function PreviewSkeleton() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 animate-pulse rounded bg-muted" />
          <div className="size-9 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4">
        <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
          <div className="size-16 animate-pulse rounded-full bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-64 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no theme files are available.
 */
function PreviewEmptyState() {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Theme Preview</CardTitle>
        <CardDescription>
          Your generated theme preview will appear here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center text-muted-foreground">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Monitor className="size-8" aria-hidden="true" />
          </div>
          <div>
            <p className="font-medium">No theme generated yet</p>
            <p className="text-sm">
              Complete the wizard to generate your custom theme.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Props for the FileTree component.
 */
interface FileTreeProps {
  /** The Liquid files to display. */
  liquidFiles: Record<string, string>;
  /** Called when a file is selected. */
  onFileSelect?: (filePath: string) => void;
  /** Currently selected file path. */
  selectedFile?: string;
}

/**
 * FileTree component displays the theme file structure.
 */
export function FileTree({
  liquidFiles,
  onFileSelect,
  selectedFile,
}: FileTreeProps) {
  // Build folder structure from flat file paths.
  const fileStructure = useMemo(() => {
    const structure: Record<string, string[]> = {};

    for (const filePath of Object.keys(liquidFiles)) {
      const parts = filePath.split("/");
      const folder = parts.length > 1 ? parts[0] : "root";
      const fileName = parts.length > 1 ? parts.slice(1).join("/") : parts[0];

      if (!structure[folder]) {
        structure[folder] = [];
      }
      structure[folder].push(fileName);
    }

    return structure;
  }, [liquidFiles]);

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(Object.keys(fileStructure)),
  );

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folder)) {
        next.delete(folder);
      } else {
        next.add(folder);
      }
      return next;
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Theme Files</CardTitle>
        <CardDescription className="text-xs">
          {Object.keys(liquidFiles).length} files generated
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px] px-4 pb-4">
          <div className="space-y-1">
            {Object.entries(fileStructure)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([folder, files]) => (
                <div key={folder}>
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder)}
                    className="flex w-full items-center gap-1 rounded px-2 py-1 text-left text-sm hover:bg-muted"
                  >
                    {expandedFolders.has(folder) ? (
                      <ChevronDown
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    ) : (
                      <ChevronRight
                        className="size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-medium">{folder}/</span>
                  </button>
                  {expandedFolders.has(folder) && (
                    <div className="ml-4 space-y-0.5">
                      {files.sort().map((file) => {
                        const fullPath =
                          folder === "root" ? file : `${folder}/${file}`;
                        const isSelected = selectedFile === fullPath;
                        return (
                          <button
                            key={file}
                            type="button"
                            onClick={() => onFileSelect?.(fullPath)}
                            className={cn(
                              "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-muted",
                              isSelected && "bg-muted",
                            )}
                          >
                            <FileCode
                              className="size-3 text-muted-foreground"
                              aria-hidden="true"
                            />
                            <span className="truncate">{file}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
