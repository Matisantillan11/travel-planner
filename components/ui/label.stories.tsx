import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  args: { children: "Email address", htmlFor: "email" },
};

export const WithInput: Story = {
  render: () => (
    <div className="grid w-full max-w-sm gap-1.5">
      <Label htmlFor="email">Email</Label>
      <Input id="email" type="email" placeholder="you@example.com" />
    </div>
  ),
};

export const DisabledPeer: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Input id="disabled-input" disabled placeholder="Disabled" className="peer" />
      <Label htmlFor="disabled-input">Disabled label</Label>
    </div>
  ),
};
