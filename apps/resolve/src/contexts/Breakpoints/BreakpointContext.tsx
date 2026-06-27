import React from "react";

export type BreakpointContextProps = {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isPortrait: boolean;
}

export const BreakpointContext = React.createContext(
  {} as BreakpointContextProps,
);