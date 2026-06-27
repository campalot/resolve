import { useNavigate, useParams } from "react-router-dom";
import Button, { ButtonType } from "../components/Buttons/Button";
import styles from "./NotFound.module.scss";

export const NotFound = () => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();

  const handleBack = () => {
    if (workspaceId) {
      navigate(`/w/${workspaceId}/dashboard`);
    } else {
      navigate("/");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Page not found
      </h1>

      <p className={styles.description}>
        The requested route{" "}
        <span className={styles.path}>
          ({window.location.pathname})
        </span>{" "}
        does not exist in this demo.
      </p>

      <Button buttonType={ButtonType.Primary} onClick={handleBack}>
        Back to Dashboard
      </Button>
    </div>
  );
};
