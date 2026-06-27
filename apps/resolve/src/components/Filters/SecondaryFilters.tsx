import type { ReactNode } from "react";

type SecondaryFiltersProps = {
  children: ReactNode;
};

export const SecondaryFilters: React.FC<SecondaryFiltersProps> = ({ children }) => {
  return (
    <div role="region" aria-label="Interaction secondary filters">
      {children}
    </div>
  );
};
