import React, { useState } from "react";
import { InteractionRow } from "./InteractionRow";
import { InteractionCard } from "./InteractionCard";
import { Interaction, InteractionState, DashboardInteraction } from "@resolve/types";
import { Button } from "@resolve/ui";
import { ButtonType } from "@resolve/ui";
import listStyles from "./Interactions.module.scss";
import styles from "../page.module.scss";

interface InteractionsListProps {
  dashboardInteractions: DashboardInteraction[];
  title: string;
  allowedStatuses: InteractionState[];
  isCards?: boolean;
  maxCount?: number;
}

const InteractionsList: React.FC<InteractionsListProps> = ({
  dashboardInteractions,
  title,
  allowedStatuses,
  isCards = false,
  maxCount = 4,
}) => {
  const filteredInteractions = dashboardInteractions.filter(
    (i: DashboardInteraction) => allowedStatuses.includes(i.status),
  );
  const [count, setCount] = useState<number>(maxCount);
  const hasMore = count < filteredInteractions.length;

  return filteredInteractions.length > 0 ? (
    <div className={styles.dashboardSection}>
      <h2>{title}</h2>
      <div className={styles.listContainer}>
        <ul
          className={`${listStyles.list} ${isCards ? listStyles.cards : ""}`}
          data-testid="interaction-list"
        >
          {filteredInteractions
            .slice(0, count)
            .map((interaction: DashboardInteraction) => {
              return isCards ? (
                <InteractionCard
                  key={interaction.id}
                  interaction={interaction}
                />
              ) : (
                <InteractionRow
                  key={interaction.id}
                  interaction={interaction}
                />
              );
            })}
        </ul>
        {hasMore && (
          <div className={listStyles.more}>
            <Button
              buttonType={ButtonType.Text}
              size="small"
              onClick={() => setCount(count + maxCount)}
            >
              See More
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export { InteractionsList };
