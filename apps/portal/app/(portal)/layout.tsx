import { PortalGate } from "@/components/PortalGate";

export default function PortalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PortalGate>{children}</PortalGate>;
}
