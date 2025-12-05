"use client";

import { useState } from "react";
import { Palette, Check, Shuffle } from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ColorPalette } from "@/types/wizard.types";

/**
 * Predefined color palettes for quick selection.
 */
const PREDEFINED_PALETTES: ColorPalette[] = [
  {
    id: "modern-minimal",
    name: "Modern Minimal",
    primary: "#1a1a1a",
    secondary: "#f5f5f5",
    accent: "#2563eb",
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    primary: "#78350f",
    secondary: "#fef3c7",
    accent: "#d97706",
  },
  {
    id: "ocean-breeze",
    name: "Ocean Breeze",
    primary: "#0c4a6e",
    secondary: "#e0f2fe",
    accent: "#0891b2",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "#14532d",
    secondary: "#f0fdf4",
    accent: "#16a34a",
  },
  {
    id: "lavender-dream",
    name: "Lavender Dream",
    primary: "#581c87",
    secondary: "#faf5ff",
    accent: "#a855f7",
  },
  {
    id: "coral-sunset",
    name: "Coral Sunset",
    primary: "#9a3412",
    secondary: "#fff7ed",
    accent: "#f97316",
  },
  {
    id: "rose-gold",
    name: "Rose Gold",
    primary: "#831843",
    secondary: "#fdf2f8",
    accent: "#ec4899",
  },
  {
    id: "slate-professional",
    name: "Slate Professional",
    primary: "#334155",
    secondary: "#f8fafc",
    accent: "#6366f1",
  },
];

/**
 * Generates a random color palette.
 */
function generateRandomPalette(): {
  primary: string;
  secondary: string;
  accent: string;
} {
  const hue = Math.floor(Math.random() * 360);
  return {
    primary: `hsl(${hue}, 50%, 25%)`,
    secondary: `hsl(${hue}, 20%, 96%)`,
    accent: `hsl(${(hue + 30) % 360}, 70%, 50%)`,
  };
}

/**
 * ColorStyleStep allows users to select or customize their store colors.
 */
export function ColorStyleStep() {
  const { data, updateData } = useWizard();
  const { paletteId, primaryColor, secondaryColor, accentColor } =
    data.colorStyle;
  const [showCustom, setShowCustom] = useState(paletteId === "custom");

  // Handles palette selection.
  const handlePaletteSelect = (palette: ColorPalette) => {
    updateData("colorStyle", {
      paletteId: palette.id,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
    });
    setShowCustom(false);
  };

  // Handles custom palette toggle.
  const handleCustomToggle = () => {
    setShowCustom(true);
    updateData("colorStyle", {
      paletteId: "custom",
    });
  };

  // Handles random palette generation.
  const handleRandomize = () => {
    const random = generateRandomPalette();
    updateData("colorStyle", {
      paletteId: "random",
      primaryColor: random.primary,
      secondaryColor: random.secondary,
      accentColor: random.accent,
    });
    setShowCustom(false);
  };

  // Handles individual color input changes.
  const handleColorChange =
    (colorKey: "primaryColor" | "secondaryColor" | "accentColor") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateData("colorStyle", { [colorKey]: e.target.value });
    };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Palette className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">Color & Style</CardTitle>
            <CardDescription>
              Choose a color palette for your store or create your own.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {/* Predefined Palettes Grid. */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Select a Palette</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {PREDEFINED_PALETTES.map((palette) => (
              <button
                key={palette.id}
                type="button"
                onClick={() => handlePaletteSelect(palette)}
                className={cn(
                  "group relative flex flex-col items-start rounded-lg border-2 p-3 transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  "hover:border-primary/50 hover:shadow-sm",
                  paletteId === palette.id
                    ? "border-primary bg-primary/5"
                    : "border-muted",
                )}
                aria-label={`Select ${palette.name} palette`}
                aria-pressed={paletteId === palette.id}
              >
                {/* Color swatches. */}
                <div className="mb-2 flex gap-1.5">
                  <div
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: palette.primary }}
                    aria-hidden="true"
                  />
                  <div
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: palette.secondary }}
                    aria-hidden="true"
                  />
                  <div
                    className="size-6 rounded-full border border-border"
                    style={{ backgroundColor: palette.accent }}
                    aria-hidden="true"
                  />
                </div>
                {/* Palette name. */}
                <span className="font-medium text-sm">{palette.name}</span>
                {/* Selected indicator. */}
                {paletteId === palette.id && (
                  <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary">
                    <Check
                      className="size-3 text-primary-foreground"
                      aria-hidden="true"
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons. */}
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCustomToggle}
            className={cn("gap-2", showCustom && "border-primary bg-primary/5")}
          >
            <Palette className="size-4" aria-hidden="true" />
            Custom Colors
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleRandomize}
            className="gap-2"
          >
            <Shuffle className="size-4" aria-hidden="true" />
            Random Palette
          </Button>
        </div>

        {/* Custom color inputs. */}
        {showCustom && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <p className="font-medium text-sm">Custom Colors</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="primary-color" className="text-sm">
                  Primary
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="primary-color"
                    type="color"
                    value={primaryColor}
                    onChange={handleColorChange("primaryColor")}
                    className="size-10 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={primaryColor}
                    onChange={handleColorChange("primaryColor")}
                    className="flex-1 font-mono text-sm"
                    placeholder="#000000"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary-color" className="text-sm">
                  Secondary
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="secondary-color"
                    type="color"
                    value={secondaryColor}
                    onChange={handleColorChange("secondaryColor")}
                    className="size-10 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={secondaryColor}
                    onChange={handleColorChange("secondaryColor")}
                    className="flex-1 font-mono text-sm"
                    placeholder="#ffffff"
                    maxLength={7}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color" className="text-sm">
                  Accent
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="accent-color"
                    type="color"
                    value={accentColor}
                    onChange={handleColorChange("accentColor")}
                    className="size-10 cursor-pointer p-1"
                  />
                  <Input
                    type="text"
                    value={accentColor}
                    onChange={handleColorChange("accentColor")}
                    className="flex-1 font-mono text-sm"
                    placeholder="#3b82f6"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preview of selected colors. */}
        <div className="space-y-3">
          <Label className="font-medium text-sm">Color Preview</Label>
          <div
            className="flex min-h-24 items-center justify-center rounded-lg p-4"
            style={{ backgroundColor: secondaryColor }}
          >
            <div className="space-y-2 text-center">
              <p className="font-semibold" style={{ color: primaryColor }}>
                Your Brand Name
              </p>
              <Button
                type="button"
                style={{
                  backgroundColor: accentColor,
                  color: secondaryColor,
                }}
                className="pointer-events-none"
              >
                Shop Now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
