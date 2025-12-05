"use client";

import { Building2 } from "lucide-react";
import { useWizard } from "@/components/wizard/wizard-context";
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

/**
 * BrandInfoStep collects brand name and description.
 * Brand name defaults to "Your Brand" if left empty.
 */
export function BrandInfoStep() {
  const { data, updateData } = useWizard();
  const { brandName, brandDescription } = data.brandInfo;

  // Handles brand name input change.
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateData("brandInfo", { brandName: e.target.value });
  };

  // Handles brand description textarea change.
  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    updateData("brandInfo", { brandDescription: e.target.value });
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="px-0">
        <div className="flex items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-6 text-primary" aria-hidden="true" />
          </div>
          <div>
            <CardTitle className="text-xl">Brand Information</CardTitle>
            <CardDescription>
              Tell us about your brand to personalize your store.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 px-0">
        {/* Brand Name Input. */}
        <div className="grid gap-3">
          <Label htmlFor="brand-name" className="font-medium text-sm">
            Brand Name
          </Label>
          <Input
            id="brand-name"
            type="text"
            placeholder="Your Brand"
            value={brandName}
            onChange={handleNameChange}
            maxLength={100}
            className="max-w-md"
            aria-describedby="brand-name-hint"
          />
          <p id="brand-name-hint" className="text-muted-foreground text-sm">
            This will be displayed throughout your store. Defaults to "Your
            Brand" if left empty.
          </p>
        </div>
        {/* Brand Description Textarea. */}
        <div className="grid gap-3">
          <Label htmlFor="brand-description" className="font-medium text-sm">
            Brand Description{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </Label>
          <Textarea
            id="brand-description"
            placeholder="Describe your brand, its values, and what makes it unique..."
            value={brandDescription}
            onChange={handleDescriptionChange}
            maxLength={500}
            rows={4}
            className="max-w-xl resize-none"
            aria-describedby="brand-description-hint"
          />
          <div className="flex items-center justify-between">
            <p
              id="brand-description-hint"
              className="text-muted-foreground text-sm"
            >
              Help the AI understand your brand voice and style.
            </p>
            <span className="text-muted-foreground text-sm">
              {brandDescription.length}/500
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
