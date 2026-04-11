import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./input";

const meta: Meta<typeof Input> = {
  title: "UI/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: { placeholder: "Enter text..." },
};

export const WithValue: Story = {
  args: { defaultValue: "Hello world", placeholder: "Enter text..." },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled input" },
};

export const Error: Story = {
  args: { error: true, placeholder: "Invalid value", defaultValue: "bad input" },
};

export const Password: Story = {
  args: { type: "password", placeholder: "Enter password" },
};
