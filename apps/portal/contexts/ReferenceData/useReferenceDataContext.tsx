import { useContext } from "react";
import { ReferenceDataContext } from "./ReferenceDataContext";

export const useReferenceDataContext = () => {
  const ctx = useContext(ReferenceDataContext);
  if (!ctx) {
    throw new Error(
      "useInteractionsReferenceData must be used within InteractionsReferenceDataProvider",
    );
  }
  return ctx;
};
