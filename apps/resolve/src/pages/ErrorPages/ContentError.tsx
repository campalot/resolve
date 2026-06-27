import Button, { ButtonType } from "../../components/Buttons/Button";
import styles from "./ErrorPage.module.scss";

export const ContentError = ({ resetErrorBoundary }: { resetErrorBoundary: () => void}) => {
  return (
    <div className={styles.errorScreen}>
      <span className={styles.errorIconContent}>⚠️</span>

      <h2 className={styles.errorTitle}>Unable to load content</h2>

      <p className={styles.errorText}>
        Something went wrong while fetching this data.
      </p>

      <Button
        buttonType={ButtonType.Primary}
        onClick={resetErrorBoundary}
      >
        Try Again
      </Button>
    </div>
  );
};
