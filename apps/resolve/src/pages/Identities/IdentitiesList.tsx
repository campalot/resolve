import type { IdentityCardProps } from "../../components/Cards/PersonCard";
import styles from "./Identities.module.scss";
import { PersonCard } from "../../components/Cards/PersonCard";

type IdentitiesListProps = {
  identities: IdentityCardProps[];
  isSorting?: boolean;
};

export const IdentitiesList: React.FC<IdentitiesListProps> = ({
  identities,
  isSorting,
}) => {
  return (
    <ul className={`${styles.list} ${isSorting ? styles.sorting : ""}`}>
      {identities.map((identity: IdentityCardProps) => (
        <PersonCard identity={identity} key={identity.id} />
      ))}
    </ul>
  );
};
