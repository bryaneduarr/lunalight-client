"use client";

import { Lightbulb, Sparkles } from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Example prompts to inspire users.
 */
const PROMPT_EXAMPLES = [
  "A minimalist, modern store with clean lines and lots of white space. Focus on showcasing products with large, high-quality images and simple typography.",
  "A warm, inviting boutique feel with earth tones and handcrafted aesthetics. Include testimonials and a story section about the brand.",
  "A bold, energetic store with dynamic layouts and vibrant accent colors. Perfect for a fitness or sports brand.",
  "An elegant, luxury store with dark backgrounds, gold accents, and sophisticated typography. Emphasis on premium feel.",
  "A playful, colorful store with rounded corners and fun illustrations. Great for kids' products or creative brands.",
];

/**
 * Character limit for the vision prompt.
 */
const MAX_PROMPT_LENGTH = 2000;
const MIN_PROMPT_LENGTH = 20;

/**
 * VisionPromptStep collects the main AI prompt describing the desired store.
 */
export function VisionPromptStep() {
  const { data, updateData, currentStepValidation } = useWizard();
  const { prompt } = data.visionPrompt;
  const { errors } = currentStepValidation;

  // Handles prompt textarea change.
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateData("visionPrompt", { prompt: e.target.value });
  };

  // Handles example prompt click - appends to current prompt.
  const handleExampleClick = (example: string) => {
    const newPrompt = prompt ? `${prompt}\n\n${example}` : example;
    updateData("visionPrompt", {
      prompt: newPrompt.slice(0, MAX_PROMPT_LENGTH),
    });
  };

  const charCount = prompt.length;
  const isNearLimit = charCount > MAX_PROMPT_LENGTH * 0.9;
  const hasError = Boolean(errors.prompt);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Sparkles className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">Describe Your Vision</CardTitle>
            <CardDescription>
              Tell the AI exactly how you want your store to look and feel.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {/* Main prompt input. */}
        <div className="space-y-3">
          <Label
            htmlFor="vision-prompt"
            className="flex items-center gap-2 font-medium text-sm"
          >
            Your Vision
            <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="vision-prompt"
            placeholder="Describe how you want your store to look and feel. Be specific about colors, layout, style, and any features you'd like..."
            value={prompt}
            onChange={handlePromptChange}
            maxLength={MAX_PROMPT_LENGTH}
            rows={8}
            className={cn(
              "min-h-[200px] resize-y",
              hasError &&
                "border-destructive focus-visible:ring-destructive/20",
            )}
            aria-describedby="prompt-hint prompt-error"
            aria-invalid={hasError}
          />
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {hasError && (
                <p
                  id="prompt-error"
                  className="text-destructive text-sm"
                  role="alert"
                >
                  {errors.prompt}
                </p>
              )}
              <p id="prompt-hint" className="text-muted-foreground text-sm">
                Minimum {MIN_PROMPT_LENGTH} characters. Be as detailed as
                possible for better results.
              </p>
            </div>
            <span
              className={cn(
                "shrink-0 text-sm",
                isNearLimit ? "text-destructive" : "text-muted-foreground",
              )}
            >
              {charCount}/{MAX_PROMPT_LENGTH}
            </span>
          </div>
        </div>

        {/* Example prompts section. */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Label className="font-medium text-muted-foreground text-sm">
              Need inspiration? Try these examples:
            </Label>
          </div>
          <div className="grid gap-2">
            {PROMPT_EXAMPLES.map((example) => (
              <Button
                key={example.slice(0, 50)}
                type="button"
                variant="outline"
                onClick={() => handleExampleClick(example)}
                className="h-auto justify-start whitespace-normal px-3 py-2 text-left text-sm"
              >
                <span className="line-clamp-2">{example}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Tips card. */}
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <p className="mb-2 font-medium text-sm">Tips for a great prompt:</p>
            <ul className="space-y-1 text-muted-foreground text-sm">
              <li>
                • Mention specific styles: minimalist, bold, elegant, playful
              </li>
              <li>
                • Describe the layout: grid, featured products, hero sections
              </li>
              <li>• Include mood: professional, friendly, luxurious, casual</li>
              <li>
                • Reference any design inspiration: similar brands or websites
              </li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
