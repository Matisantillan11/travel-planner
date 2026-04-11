import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./textarea";

const meta: Meta<typeof Textarea> = {
  title: "UI/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: { placeholder: "Type your message here..." },
};

export const WithValue: Story = {
  args: { defaultValue: "This is some pre-filled content." },
};

export const Disabled: Story = {
  args: { disabled: true, placeholder: "Disabled textarea" },
};
