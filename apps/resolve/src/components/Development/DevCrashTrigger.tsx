import type { ErrorType } from "../../store/useAppStore";

export function DevCrashTrigger({
  target,
  currentTarget,
}: {
  target: ErrorType | null;
  currentTarget: ErrorType | null;
}) {
  if (target && target === currentTarget) {
    throw new Error(`⚠️ DEV TRIGGERED ${currentTarget.toUpperCase()} CRASH`);
  }
  return null;
};
