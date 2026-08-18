"use client";

import { createContext } from "react";

export type ReferenceData = {
  parties: Array<{
    id: string;
    name: string;
    __typename: "Company" | "Individual";
  }>;
  statuses: string[];
  types: string[];
};

export const ReferenceDataContext = createContext<ReferenceData | null>(null);
