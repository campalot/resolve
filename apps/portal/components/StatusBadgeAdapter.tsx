import { StatusBadge } from "@resolve/ui";
import type { InteractionState } from "@resolve/types";

type StatusBadgeProps = {
  status?: InteractionState;
  hideIcon?: boolean;
};

export function StatusBadgeAdapter({ status = "APPROVED", hideIcon = true }: StatusBadgeProps) {
  return <StatusBadge status={status} hideIcon={hideIcon} />;
}
