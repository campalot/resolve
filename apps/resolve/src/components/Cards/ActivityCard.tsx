import styles from "./ActivityCard.module.scss";
import type { InteractionActivityType } from "../../types/schema";
import { toCamelCase } from "../../helpers";

type ActivityCardProps = {
  icon: React.ReactNode;
  type: InteractionActivityType
  status?: string;
  title: string;
  timestamp: string;
  interactionId: string;
  interactionTitle: string;
  onClick: () => void;
  children: React.ReactNode;
};

export function ActivityCard({
  icon,
  type,
  status,
  title,
  timestamp,
  interactionId,
  interactionTitle,
  onClick,
  children,
}: ActivityCardProps) {
  const baseClass = styles.card;
  const modifierClass = styles[`${toCamelCase(type.toLowerCase())}`];
  const statusClass = status ? styles[`${status?.toLowerCase()}`] : "";
  const formattedTimestamp = new Date(timestamp).toLocaleString();
  return (
    <article
      role="article"
      tabIndex={0}
      className={`${baseClass} ${modifierClass} ${statusClass}`}
      onKeyDown={(e) => {
        if (e.key === "Enter") onClick();
      }}
      aria-labelledby={`${interactionTitle}-title`}
      aria-describedby={`activity-meta-${interactionId}`}
      data-testid="dashboard-activity"
    >
      <span className={styles.icon} aria-hidden>
        {icon}
      </span>
      <section className={styles.main}>
        <header className={styles.header}>
          <div>
            <h3 id={`${interactionTitle}-title`} className={styles.title}>
              {title}
            </h3>
          </div>
        </header>
        <div className={styles.timestamp}>
          <time className={styles.timestamp} dateTime={formattedTimestamp}>
            {formattedTimestamp}
          </time>
        </div>
        <div className={styles.body}>
          <span className={styles.interactionTitle} onClick={onClick}>
            {interactionTitle}
          </span>
          <span className={styles.interactionId}>{interactionId}</span>
          <div className={styles.eventText}>{children}</div>
        </div>
      </section>
    </article>
  );
}
