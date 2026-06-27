import { createContext, useContext } from "react";

export type InteractionsReferenceData = {
  parties: Array<{
    id: string;
    name: string;
    __typename: "Company" | "Individual";
  }>;
  statuses: string[];
  types: string[];
};

export const InteractionsReferenceDataContext =
  createContext<InteractionsReferenceData | null>(null);


export const useInteractionsReferenceData = () => {
  const ctx = useContext(InteractionsReferenceDataContext);
  if (!ctx) {
    throw new Error(
      "useInteractionsReferenceData must be used within InteractionsReferenceDataProvider",
    );
  }
  return ctx;
};
