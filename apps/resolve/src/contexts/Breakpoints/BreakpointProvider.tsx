import React from "react";
import type { ReactNode } from "react";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { BreakpointContext } from "./BreakpointContext";

type BreakpointProviderProps = {
  children: ReactNode;
}

const BreakpointProvider: React.FC<BreakpointProviderProps> = ({
  children,
}) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isPortrait = useMediaQuery("(orientation: portrait)");

  const value = {
    isMobile,
    isTablet,
    isDesktop,
    isPortrait,
  };

  return (
    <BreakpointContext.Provider value={value}>
      {children}
    </BreakpointContext.Provider>
  );
};

export default BreakpointProvider;
