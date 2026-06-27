import { Link } from "react-router-dom";
import type { Interaction } from "../../types/schema";
import styles from "./Interactions.module.scss";
import StatusBadge from "../../components/Badges/StatusBadge";
import IdentifierBadge from "../../components/Badges/IdentifierBadge";
import { interactionRoute } from "../../routes/routes";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";

type InteractionsListProps = {
  interactions: Interaction[];
  isProfile?: boolean;
};

export const InteractionsList: React.FC<InteractionsListProps> = ({
  interactions,
  isProfile,
}) => {
  const workspacePath = useWorkspacePath();
  return (
    <ul className={styles.list} data-testid="interaction-list">
      {interactions.map((interaction: Interaction) => (
        <li
          key={interaction.id}
          className={styles.row}
          data-testid="interaction-row"
        >
          <Link
            to={workspacePath(interactionRoute(interaction.id, "overview"))}
            className={styles.rowLink}
          >
            <div className={styles.main}>
              <div className={styles.titleRow}>
                <div className={styles.title}>{interaction.title}</div>
                <IdentifierBadge
                  text={interaction.id}
                  size={`small`}
                />
              </div>
              {!isProfile && (
                <div className={styles.meta}>
                  {interaction.parties
                    .map((party) => `${party.role}: ${party.identity?.name}`)
                    .filter(Boolean)
                    .join("  –  ")}
                </div>
              )}
            </div>

            <div className={styles.side}>
              <StatusBadge status={interaction.status} hideIcon />
              {!isProfile && (
                <time className={styles.date} dateTime={interaction.updatedAt}>
                  {interaction.updatedAt}
                </time>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
};
