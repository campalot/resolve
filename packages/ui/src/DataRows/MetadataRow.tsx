import React from "react";
import styles from "./MetadataRow.module.scss";
import { Box } from "@mui/material";

type MetadataRowProps = {
  label: string;
  children: React.ReactNode;
};

const MetadataRow: React.FC<MetadataRowProps> = ({ label, children }) => {
  return (
    <Box className={styles.metadataRow}>
      <label>{label}</label>
      {children}
    </Box>
  );
};

export default MetadataRow;
