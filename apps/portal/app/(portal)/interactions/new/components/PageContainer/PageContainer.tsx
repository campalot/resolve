"use client";

import React from "react";
import styles from "./PageContainer.module.css";
import BackLink from "@/components/BackLink/BackLink";

type PageContainerProps = {
  children: React.ReactNode;
};

export default function PageContainer({ children }: PageContainerProps) {
  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <BackLink href="/dashboard" label="Back to dashboard" />
        {children}
      </div>
    </div>
  );
}
