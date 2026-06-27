import { Link } from "react-router-dom";
import type { Identity } from "../../types/schema";
import Avatar from "../Avatars/Avatar";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute } from "../../routes/routes";
import styles from "./PersonCard.module.scss";

export type IdentityCardProps = Identity & {
  stats: {
    total: number;
    active: number;
    awaiting: number;
    lastActivityAt: number;
  };
};

type PersonCardProps = {
  identity: IdentityCardProps;
  onClick?: () => void;
};

export const PersonCard: React.FC<PersonCardProps> = ({ identity }) => {
  const { stats } = identity;
  const workspacePath = useWorkspacePath();
  return (
    <li className={styles.personCard}>
      <Link
        to={workspacePath(identityRoute(identity.id))}
        className={styles.cardLink}
      >
        <div className={styles.personCardHeader}>
          <Avatar identity={identity} size={56} />
          <div>
            <div className={styles.personCardName}>{identity.name}</div>
            <div className={styles.personCardMeta}>{identity.company?.name}</div>
          </div>
        </div>

        <div className={styles.personCardStats}>
          <strong>{stats.total}</strong> interactions
          <span className={styles.dot}>•</span>
          <strong>{stats.awaiting}</strong> awaiting
        </div>
      </Link>
    </li>
  );
}
