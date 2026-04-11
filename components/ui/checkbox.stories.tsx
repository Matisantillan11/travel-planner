import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta: Meta<typeof Checkbox> = {
  title: "UI/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    checked: {
      control: "select",
      options: [true, false, "indeterminate"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { id: "checkbox-default" },
};

export const Checked: Story = {
  args: { checked: true, id: "checkbox-checked" },
};

export const Indeterminate: Story = {
  args: { checked: "indeterminate", id: "checkbox-indeterminate" },
};

export const Disabled: Story = {
  args: { disabled: true, id: "checkbox-disabled" },
};

export const DisabledChecked: Story = {
  args: { disabled: true, checked: true, id: "checkbox-disabled-checked" },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};
