import { StatusBadge } from "@resolve/ui";
import { StatusBadgeSize } from "@resolve/ui";
import type { InteractionState } from "@resolve/types";

type StatusBadgeProps = {
  status?: InteractionState;
  hideIcon?: boolean;
  size?: string;
};

export function StatusBadgeAdapter({
  status = "APPROVED",
  hideIcon = true,
  size = StatusBadgeSize.Medium,
}: StatusBadgeProps) {
  return <StatusBadge status={status} hideIcon={hideIcon} size={size} />;
}
