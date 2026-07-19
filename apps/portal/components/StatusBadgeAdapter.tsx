import { StatusBadge } from "@resolve/ui";
import type { InteractionState } from "@resolve/types";

export function StatusBadgeAdapter() {
  return <StatusBadge status={`APPROVED` as InteractionState} />;
}
