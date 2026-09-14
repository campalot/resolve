"use client"; 

import styles from "./page.module.css";
import React, {
  useEffect,
  useMemo,
  use,
} from "react";
import {
  useRouter,
  redirect,
} from "next/navigation";
import BackLink from "@/components/BackLink/BackLink";
import { useInteraction } from "@/hooks/useInteraction";
import { InteractionActivity } from "./InteractionActivity";
import { InteractionOverview } from "./InteractionOverview";
import { InteractionSidebar } from "./InteractionSidebar";
import type { InteractionParty } from "@resolve/types";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import detailStyles from "./InteractionDetail.module.scss";
import { InteractionDetailSkeleton } from "./InteractionDetailSkeleton";
import { IdentifierBadge } from "@resolve/ui";

const TABS = [
  { label: "Overview", path: "overview" },
  { label: "Activity", path: "activity" },
];


interface PageProps {
  params: Promise<{ interactionId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default function InteractionDetail({ params, searchParams }: PageProps) {
  const { interactionId } = use(params);
  const { tab: tabId } = use(searchParams);
  const router = useRouter();

  const { interaction, loading, error, hasId } = useInteraction(
    interactionId || "",
    { enabled: true },
  );

  const TAB_PATHS = useMemo(() => new Set(TABS.map((tab) => tab.path)),[]);

  // Default tab redirect
  useEffect(() => {
    if (!tabId || !TAB_PATHS.has(tabId)) {
      router.replace(`${interactionId}?tab=${TABS[0].path}`);
    }
  }, [tabId, router, interactionId, TAB_PATHS]);

  // Guard rails
  if (loading) {
    return <InteractionDetailSkeleton />;
  }

  if ((!loading && !interaction) || !hasId) {
    return <div>Invalid interaction</div>;
  }

  // The buttons are now "Server-Driven"
  const allowedActions = interaction.permittedActions ?? [];
  const primaryparty = interaction.parties.find(
    (party: InteractionParty) =>
      party.role === "Seller" || party.role === "Partner",
  );

  const handleAction = (action: string) => {
    console.log("action handler clicked=", action);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    redirect(`${interactionId}?tab=${newValue}`);
  };


  if (loading) {
    return <div>Loading interaction…</div>;
  }

  if (error || !interaction) {
    return <div>Failed to load interaction</div>;
  }

  return (
    <div className={styles.page}>
      <Box className={`${detailStyles.interactionDetail} ${styles.main}`}>
        <BackLink href="/dashboard" label="Back to dashboard" />
        <Box className={detailStyles.interactionDetailHeader}>
          <Box>
            <Typography
              variant="h4"
              className={detailStyles.interactionDetailTitle}
            >
              {interaction.title}
            </Typography>
            <Typography className={detailStyles.interactionDetailSubtitle}>
              <IdentifierBadge text={interaction.id} /> ·{" "}
              {primaryparty?.identity?.name ?? "No Partner Found"}
            </Typography>
          </Box>
        </Box>

        <Box className={detailStyles.interactionDetailBody}>
          <Box className={detailStyles.interactionDetailMain}>
            {tabId && TAB_PATHS.has(tabId) && (
              <Tabs
                value={tabId}
                onChange={handleChange}
                role="navigation"
                aria-label="Interaction navigation tabs"
                className={detailStyles.tabs}
              >
                {TABS.map((tab) => (
                  <Tab key={tab.label} value={tab.path} label={tab.label} />
                ))}
              </Tabs>
            )}
            <Box className={detailStyles.interactionDetailContent}>
              {tabId === "overview" && (
                <InteractionOverview interaction={interaction} />
              )}

              {tabId === "activity" && (
                <InteractionActivity interactionId={interactionId || ""} />
              )}
            </Box>
          </Box>

          <Box className={detailStyles.interactionDetailSidebar}>
            <InteractionSidebar
              interaction={interaction}
              handleAction={handleAction}
              allowedActions={allowedActions}
            />
          </Box>
        </Box>
      </Box>
    </div>
  );
};
