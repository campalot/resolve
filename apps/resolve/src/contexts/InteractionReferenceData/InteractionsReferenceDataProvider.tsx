import { InteractionsReferenceDataContext } from "./InteractionsReferenceDataContext";
import type { ReactNode } from "react";
import { useReferenceData } from "../../hooks/useReferenceData";

export const InteractionsReferenceDataProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { parties, statuses, types } = useReferenceData();

  const value = {
    parties,
    statuses,
    types,
  };

  return (
    <InteractionsReferenceDataContext.Provider value={value}>
      {children}
    </InteractionsReferenceDataContext.Provider>
  );
};
