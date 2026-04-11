import type { Meta, StoryObj } from "@storybook/react";

import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "UI/Progress",
  component: Progress,
  tags: ["autodocs"],
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { value: 60, className: "w-[300px]" },
};

export const Zero: Story = {
  args: { value: 0, className: "w-[300px]" },
};

export const Complete: Story = {
  args: { value: 100, className: "w-[300px]" },
};

export const Clamped: Story = {
  render: () => (
    <div className="space-y-4 w-[300px]">
      <div>
        <p className="text-xs text-muted-foreground mb-1">value=150 (clamped to 100)</p>
        <Progress value={150} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground mb-1">value=-20 (clamped to 0)</p>
        <Progress value={-20} />
      </div>
    </div>
  ),
};
