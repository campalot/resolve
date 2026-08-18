import Link from "next/link";
import styles from './BackLink.module.scss'; 

export default function BackLink({ href = '/dashboard', label = 'Back to dashboard' }) {

return (
  <Link href={href} className={styles.container} aria-label={label}>
    <span className={styles.arrow} aria-hidden="true">
      ←
    </span>
    <span className={styles.text}>{label}</span>
  </Link>
);
}