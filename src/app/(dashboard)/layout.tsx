// @ts-nocheck
import styles from '@/styles/page.module.css';

export default function DashboardLayout({ children }) {
  return (
    <>
      <div className={styles.container}>{children}</div>
    </>
  );
}
