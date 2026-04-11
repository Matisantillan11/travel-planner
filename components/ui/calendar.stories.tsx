"use client";

import type { Meta, StoryObj } from "@storybook/react";
import * as React from "react";

import { Calendar } from "./calendar";

const meta: Meta<typeof Calendar> = {
  title: "UI/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

function CalendarWithState() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  return (
    <div className="space-y-2">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
      <p className="text-sm text-muted-foreground">
        {date ? `Selected: ${date.toLocaleDateString()}` : "No date selected"}
      </p>
    </div>
  );
}

export const Default: Story = {
  render: () => <CalendarWithState />,
};

export const NoSelection: Story = {
  render: () => (
    <Calendar
      mode="single"
      selected={undefined}
      className="rounded-md border"
    />
  ),
};

export const PreselectedDate: Story = {
  render: () => (
    <Calendar
      mode="single"
      selected={new Date(2025, 5, 15)}
      className="rounded-md border"
    />
  ),
};
