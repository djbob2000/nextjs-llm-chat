"use client";

import { useState } from "react";
import { Settings2, Save } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelSelector } from "./ModelSelector";
import { TemperatureSlider } from "./TemperatureSlider";
import { AVAILABLE_MODELS, DEFAULT_MODEL } from "@/lib/constants";
import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsPanelProps {
  initialSettings: {
    model: string;
    temperature: number;
    systemPrompt: string | null;
  };
  onSave: (settings: {
    model: string;
    temperature: number;
    systemPrompt: string | null;
  }) => Promise<void>;
  disabled?: boolean;
}

export function SettingsPanel({
  initialSettings,
  onSave,
  disabled,
}: SettingsPanelProps) {
  const [model, setModel] = useState(() => {
    const isValid = AVAILABLE_MODELS.some(
      (m) => m.id === initialSettings.model,
    );
    return isValid ? initialSettings.model : DEFAULT_MODEL;
  });
  const [temperature, setTemperature] = useState(initialSettings.temperature);
  const [systemPrompt, setSystemPrompt] = useState(
    initialSettings.systemPrompt || "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        model,
        temperature,
        systemPrompt: systemPrompt.trim() || null,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" disabled={disabled}>
          <Settings2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chat Settings</SheetTitle>
          <SheetDescription>
            Configure the model and behavior for this conversation.
          </SheetDescription>
        </SheetHeader>

        <div className="grid gap-6 py-6 px-4">
          <ModelSelector
            value={model}
            onChange={setModel}
            disabled={isSaving}
          />

          <TemperatureSlider
            value={temperature}
            onChange={setTemperature}
            disabled={isSaving}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">
              System Prompt
            </label>
            <Textarea
              placeholder="e.g. You are a helpful assistant..."
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              className="h-32 resize-none"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none">Theme</label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4" /> System
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
