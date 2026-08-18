"use client";

import styles from "./SubmissionSuccess.module.css";
import { redirect } from "next/navigation";
import type { InteractionRecord, InteractionType } from "@resolve/types";
import { Button } from "@resolve/ui";
import { ButtonType } from "@resolve/ui";
import BackLink from "@/components/BackLink/BackLink";
import { Box } from "@mui/material";
import { IdentifierBadge } from "@resolve/ui";
import { StatusBadge } from "@resolve/ui";
import { StatusBadgeSize } from "@resolve/ui";

const TYPE_CONFIG: Record<InteractionType, { label: string }> = {
  CONTRACT: { label: "contract proposal" },
  PROPOSAL: { label: "proposal" },
  POLICY_UPDATE: { label: "policy update" },
  VENDOR_ONBOARDING: { label: "vendor onboarding request" },
};

type SubmissionSuccessProps = {
  interaction: InteractionRecord;
};

export default function SubmissionSuccess({ interaction }: SubmissionSuccessProps) {
  const requestNoun = TYPE_CONFIG[interaction.type].label;
  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <BackLink href="/dashboard" label="Back to dashboard" />
        <h2 className={styles.successHeader}>
          Your {requestNoun} has been created.
        </h2>
        <p>
          We&lsquo;ve received your request and will route it to the appropriate
          team.
        </p>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 1 },
            flexDirection: "column",
            mb: 2,
            mt: 3,
            pb: 1,
            pt: 1,
            borderBottom: "1px solid #e3e3e3",
            borderTop: "1px solid #e3e3e3",
          }}
        >
          <div className={styles.title}>{interaction.title}</div>
          <Box
            sx={{
              display: "flex",
              gap: { xs: 3, sm: 2 },
              pb: 1,
            }}
          >
            <IdentifierBadge text={interaction.id} size="small" /> ·{" "}
            <StatusBadge
              status={interaction.status}
              size={StatusBadgeSize.Small}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "flex-start" },
            gap: { xs: 3, sm: 2 },
            mb: 2,
            mt: 6,
            borderBottom: "1px solid #f0f0f0",
          }}
        >
          <Button
            buttonType={ButtonType.Primary}
            onClick={() => redirect(`/interactions/${interaction?.id}`)}
          >
            View Request
          </Button>
          <Button
            buttonType={ButtonType.Secondary}
            onClick={() => redirect(`/dashboard`)}
          >
            Back to Dashboard
          </Button>
        </Box>
      </div>
    </div>
  );
}
