import React from "react";
import { Box, Typography } from "@mui/material";
import type { Interaction } from "@resolve/types";
import { MetadataRow } from "./common/MetadataRow";
import type { VendorOnboardingData } from "@resolve/types";
import type { PolicyUpdateData } from "@resolve/types";
import type { ContractData } from "@resolve/types";
import type { ProposalData } from "@resolve/types";
import styles from "./Sidebar/SidebarCard.module.scss";
import overViewStyles from "./InteractionOverview.module.scss";

function renderDetails(interaction: Interaction) {
  switch (interaction.type) {
    case "PROPOSAL": {
      const data = interaction.data as ProposalData;
      const effectiveDate = new Date(data.effectiveDate).toLocaleString();
      const expirationDate = new Date(data.expirationDate || "").toLocaleString();
      return (
        <>
          <MetadataRow label="Amount">
            ${data.amount.toLocaleString()} {data.currency}
          </MetadataRow>
          <MetadataRow label="Effective Date">{effectiveDate}</MetadataRow>
          {data.expirationDate && (
            <MetadataRow label="Expiration Date">{expirationDate}</MetadataRow>
          )}
        </>
      );
      break;
    }

    case "CONTRACT": {
      const data = interaction.data as ContractData;
      return (
        <>
          <MetadataRow label="Contract Value">
            ${data.contractValue.toLocaleString()}
          </MetadataRow>
          <MetadataRow label="Term Length">
            {data.termLengthMonths} months
          </MetadataRow>
          <MetadataRow label="Auto Renew">{data.autoRenew === true ? "Yes" : "No"}</MetadataRow>
        </>
      );
      break;
    }

    case "POLICY_UPDATE": {
      const data = interaction.data as PolicyUpdateData;
      const effectiveDate = new Date(data.effectiveDate).toLocaleString();
      return (
        <>
          <MetadataRow label="Policy Area">{data.policyArea}</MetadataRow>
          <MetadataRow label="Effective Date">{effectiveDate}</MetadataRow>
          <MetadataRow label="Impact Level">{data.impactLevel}</MetadataRow>
        </>
      );
      break;
    }

    case "VENDOR_ONBOARDING": {
      const data = interaction.data as VendorOnboardingData;
      return (
        <>
          <MetadataRow label="Vendor Type">{data.vendorType}</MetadataRow>
          <MetadataRow label="Risk Level">{data.riskLevel}</MetadataRow>
          <MetadataRow label="Onboarding Checklist Complete">
            {data.onboardingChecklistComplete === true ? "Yes" : "No"}
          </MetadataRow>
        </>
      );
      break;
    }

    default:
      return;
  }
}


type InteractionOverviewProps = {
  interaction: Interaction;
};

export const InteractionOverview: React.FC<InteractionOverviewProps> = ({
  interaction,
}) => {
  return (
    <Box className={overViewStyles.overviewContainer}>
      <Box className={`${styles.sidebarCard} ${styles.sectionCard}`}>
        <Typography variant="overline" className={styles.sectionLabel}>
          Summary
        </Typography>
        <Typography variant="body2">{interaction.data.summary}</Typography>
      </Box>
      <Box className={`${styles.sidebarCard} ${styles.sectionCard}`}>
        <Typography variant="overline" className={styles.sectionLabel}>
          Details
        </Typography>
        {renderDetails(interaction)}
      </Box>
    </Box>
  );
};
