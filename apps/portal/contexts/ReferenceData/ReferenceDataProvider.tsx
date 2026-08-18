"use client";

import { ReferenceDataContext } from "./ReferenceDataContext";
import type { ReactNode } from "react";
import { useReferenceData } from "../../hooks/useReferenceData";

export const ReferenceDataProvider = ({
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
    <ReferenceDataContext.Provider value={value}>
      {children}
    </ReferenceDataContext.Provider>
  );
};
