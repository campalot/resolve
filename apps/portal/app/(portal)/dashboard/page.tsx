"use client";

import type { HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Interaction, InteractionType } from "@resolve/types";
import { useInteractions } from "@/hooks/useInteractions";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
import IconContract from "@/assets/icon-contracts.svg";
import IconProposal from "@/assets/icon-request-business-opportunity.svg";
import IconPolicy from "@/assets/icon-policies.svg";
import IconVendor from "@/assets/icon-tasks.svg";
import styles from "./page.module.css";
import listStyles from "./interactions.module.scss";
import { MenuCard } from "./components/MenuCard";
import { StatusBadgeAdapter } from "@/components/StatusBadgeAdapter";

const menuItems = [
  { id: "CONTRACT", label: "Create New Contract" },
  { id: "PROPOSAL", label: "Create New Proposal" },
  { id: "POLICY_UPDATE", label: "Update a Policy" },
  { id: "VENDOR_ONBOARDING", label: "Onboard a Vendor" },
];

export const getMenuIcon = (
  type: InteractionType,
): React.FC<HTMLAttributes<SVGElement>> => {
  switch (type) {
    case "CONTRACT":
      return IconContract;

    case "PROPOSAL":
      return IconProposal;

    case "POLICY_UPDATE":
      return IconPolicy;

    case "VENDOR_ONBOARDING":
      return IconVendor;

    default:
      return IconContract;
  }
};

export default function Home() {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const { interactions } = useInteractions({
    page: 1,
    pageSize: 10,
    filters: {
      identityId: currentUser?.id,
    },
  });
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.dashboardSection}>
          <h2>Common Tasks</h2>
          <div className={styles.menuContainer}>
            {menuItems.map((item) => {
              const MenuIconSvg = getMenuIcon(item.id as InteractionType);
              const path = item.id.toLowerCase().replace(/_/g, "-");
              const onClick = () => router.push(`/interactions/new/${path}`);
              return (
                <MenuCard
                  key={item.label}
                  displayName={item.label}
                  MenuIcon={MenuIconSvg}
                  onClick={onClick}
                />
              );
            })}
          </div>
        </div>

        <div className={styles.dashboardSection}>
          <h2>Your Interactions</h2>
          <div className={styles.listContainer}>
            <ul className={listStyles.list} data-testid="interaction-list">
              {interactions.map((interaction: Interaction) => (
                <li
                  key={interaction.id}
                  className={listStyles.row}
                  data-testid="interaction-row"
                >
                  <Link
                    // href={workspacePath(
                    //   interactionRoute(interaction.id, "overview"),
                    // )}
                    href={`/interactions/${interaction.id}`}
                    className={listStyles.rowLink}
                  >
                    <div className={listStyles.main}>
                      <div className={listStyles.titleRow}>
                        <div className={listStyles.title}>
                          {interaction.title}
                        </div>
                        {/*<IdentifierBadge text={interaction.id} size={`small`} />*/}
                      </div>
                      <div className={listStyles.meta}>
                        {interaction.parties
                          .map(
                            (party) => `${party.role}: ${party.identity?.name}`,
                          )
                          .filter(Boolean)
                          .join("  –  ")}
                      </div>
                    </div>

                    <div className={listStyles.side}>
                      {/*<StatusBadge status={interaction.status} hideIcon />*/}
                      <StatusBadgeAdapter
                        status={interaction.status}
                        hideIcon
                      />
                      <time
                        className={listStyles.date}
                        dateTime={interaction.updatedAt}
                      >
                        {interaction.updatedAt}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
