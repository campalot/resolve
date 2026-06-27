import { useNavigate, useParams } from "react-router-dom";
import Button, { ButtonType } from "../../components/Buttons/Button";
import styles from "./ErrorPage.module.scss";

export const AppError = ({ resetErrorBoundary }: { resetErrorBoundary: () => void}) => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const handleBack = () => {
    if (workspaceId) {
      navigate(`/w/${workspaceId}/dashboard`);
    } else {
      navigate("/");
    }
    resetErrorBoundary();
  };

  return (
    <div className={styles.errorScreen}>
      <span className={styles.errorIcon}>🚫</span>

      <h2 className={styles.errorTitle}>Something went wrong</h2>

      <p className={styles.errorText}>
        The app encountered an unexpected problem. Please try reloading the page
        to continue.
      </p>
      <div className={styles.ctaRow}>
        <Button buttonType={ButtonType.Primary} onClick={resetErrorBoundary}>
          Reload Page
        </Button>
        <Button buttonType={ButtonType.Secondary} onClick={handleBack}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};
