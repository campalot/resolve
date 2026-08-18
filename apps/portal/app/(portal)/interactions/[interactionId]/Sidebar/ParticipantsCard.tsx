import React from "react";
import { Box, Typography } from "@mui/material";
import styles from "./SidebarCard.module.scss";

type ParticipantsCardProps = {
  participants: Array<{
    role: string;
    names: string[];
  }>;
};

export const ParticipantsCard: React.FC<ParticipantsCardProps> = ({
  participants,
}) => {
  return (
    <Box className={`${styles.sidebarCard} ${styles.sectionCard}`}>
      <Typography variant="overline" className={styles.sectionLabel}>
        Participants
      </Typography>

      {participants.map(({ role, names }) => (
        <Box key={role} className={styles.roleBlock}>
          <Typography
            variant="subtitle2"
            className={styles.role}
            sx={{ lineHeight: 1 }}
          >
            {role}
          </Typography>

          <Box className={styles.nameList}>
            {names.map((name) => (
              <Typography
                key={name}
                variant="body2"
                className={styles.identityChip}
              >
                {name}
              </Typography>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
