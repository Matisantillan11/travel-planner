import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { useToast } from "@/lib/hooks/use-toast";

import { Button } from "./button";
import { Toaster } from "./toaster";

const meta: Meta = {
  title: "UI/Toast",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

function ToastDemo({
  variant,
  title,
  description,
}: {
  variant?: "default" | "destructive";
  title: string;
  description?: string;
}) {
  const { toast } = useToast();
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => toast({ variant, title, description })}
      >
        Show Toast
      </Button>
      <Toaster />
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ToastDemo title="Saved successfully" description="Your trip has been saved." />
  ),
};

export const Destructive: Story = {
  render: () => (
    <ToastDemo
      variant="destructive"
      title="Error"
      description="Something went wrong. Please try again."
    />
  ),
};

export const TitleOnly: Story = {
  render: () => <ToastDemo title="Trip saved" />,
};
