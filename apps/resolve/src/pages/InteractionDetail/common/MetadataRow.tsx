import React from "react";
import styles from "../InteractionSidebar.module.scss";
import { Box } from "@mui/material";

type MetadataRowProps = {
  label: string;
  children: React.ReactNode;
};

export const MetadataRow: React.FC<MetadataRowProps> = ({ label, children }) => {
  return (
    <Box className={styles.metadataRow}>
      <label>{label}</label>
      {children}
    </Box>
  );
};
