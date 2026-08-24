import React from "react";
import Link from "next/link";
import { StatusBadgeAdapter } from "@/components/StatusBadgeAdapter";
import { DashboardInteraction } from "@resolve/types";
import listStyles from "./interactions.module.scss";

interface InteractionRowProps {
  interaction: DashboardInteraction;
}

const InteractionRow: React.FC<InteractionRowProps> = ({
  interaction,
}) => {
  return (
    <li className={listStyles.row} data-testid="interaction-row">
      <Link
        href={`/interactions/${interaction.id}`}
        className={listStyles.rowLink}
      >
        <div className={listStyles.main}>
          <div className={listStyles.titleRow}>
            <div className={listStyles.title}>{interaction.title}</div>
            {/*<IdentifierBadge text={interaction.id} size={`small`} />*/}
          </div>
          <div className={listStyles.meta}>
            {interaction.parties
              .map((party) => `${party.role}: ${party.identity?.name}`)
              .filter(Boolean)
              .join("  –  ")}
          </div>
        </div>

        <div className={listStyles.side}>
          <StatusBadgeAdapter status={interaction.status} hideIcon />
          <time className={listStyles.date} dateTime={interaction.updatedAt}>
            {interaction.updatedAt}
          </time>
        </div>
      </Link>
    </li>
  );
};

export { InteractionRow };
