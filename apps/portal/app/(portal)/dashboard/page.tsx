"use client";

import type { HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import type { InteractionType } from "@resolve/types";
import { useDashboardInteractions } from "@/hooks/useDashboardInteractions";
import { useCurrentUser } from "@/contexts/CurrentUser/CurrentUserContext";
import IconContract from "@/assets/icon-contracts.svg";
import IconProposal from "@/assets/icon-request-business-opportunity.svg";
import IconPolicy from "@/assets/icon-policies.svg";
import IconVendor from "@/assets/icon-tasks.svg";
import styles from "./page.module.scss";
import { MenuCard } from "./components/MenuCard";
import { InteractionsList } from "./components/InteractionsList";

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
  const { dashboardInteractions } = useDashboardInteractions({
    page: 1,
    pageSize: 20,
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

        {/* ACTIVE REQUESTS */}
        <InteractionsList
          dashboardInteractions={dashboardInteractions}
          title="Your Active Interactions"
          allowedStatuses={["DRAFT", "IN_REVIEW"]}
          isCards={true}
        />

        {/* RESOLVED REQUESTS */}
        <InteractionsList
          dashboardInteractions={dashboardInteractions}
          title="Resolved Interactions"
          allowedStatuses={["APPROVED", "REJECTED"]}
        />
      </main>
    </div>
  );
}
