import type { Meta, StoryObj } from "@storybook/react";
import StatusBadge from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/Badges/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      // Maps directly to your InteractionState type properties
      control: "select",
      options: ["rejected", "approved", "in_review", "draft"],
      description: "The interaction state determining the badge color and icon",
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Controls the padding and font size scales",
    },
    hideIcon: {
      control: "boolean",
      description: "Hides the mapped SVG icon if checked",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Rejected: Story = {
  args: {
    status: "REJECTED",
    size: "medium",
    hideIcon: false,
  },
};

export const Approved: Story = {
  args: {
    status: "APPROVED",
    size: "medium",
    hideIcon: false,
  },
};

export const Draft: Story = {
  args: {
    status: "DRAFT",
    size: "medium",
    hideIcon: false,
  },
};

export const InReview: Story = {
  args: {
    status: "IN_REVIEW",
    size: "medium",
    hideIcon: false,
  },
};

