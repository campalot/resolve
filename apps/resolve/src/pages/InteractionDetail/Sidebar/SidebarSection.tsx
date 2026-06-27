import React from "react";
import styles from "../InteractionSidebar.module.scss";
import { Box } from "@mui/material";

type SidebarSectionProps = {
  title: string;
  children: React.ReactNode;
};

export const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <Box className={styles.sidebarSection}>
      <h4>{title}</h4>
        {children}
    </Box>
  );
};
