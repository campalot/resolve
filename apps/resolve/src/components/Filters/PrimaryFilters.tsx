import type { ReactNode } from "react";

type PrimaryFiltersProps = {
  children: ReactNode;
};

export const PrimaryFilters: React.FC<PrimaryFiltersProps> = ({ children }) => {
  
  return (
    <div role="region" aria-label="Interaction primary filters">
      {children}
    </div>
  );
};
