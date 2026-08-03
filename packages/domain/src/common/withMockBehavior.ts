import { HttpResponse, delay } from "msw";
import { useAppStore } from "../../../store/useAppStore";

const isTest = import.meta.env.MODE === "test";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResponse = HttpResponse<any>;

export async function withMockBehavior(
  fn: () => AnyResponse | Promise<AnyResponse>
): Promise<AnyResponse> {
  const { latency, forceError } = useAppStore.getState();

  if (!isTest) {
    await delay(latency);
  }

  if (forceError) {
    return HttpResponse.json(
      { message: "Simulated error" },
      { status: 500 }
    );
  }

  return await fn();
}