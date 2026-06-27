let started = false;

export async function ensureMsw() {
  const { worker } = await import("./mocks/browser");

  if (!started) {
    await worker.start({
      onUnhandledRequest: "bypass",
    });
    started = true;
  }
}