import React, { useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import type { Role } from "../../api/cache";
import styles from "./DevOverlay.module.scss";
import type { DataStrategy } from "../../store/useAppStore";
import IconClose from "../../assets/icon-close.svg?react";

export const DevOverlay: React.FC = () => {
  const {
    activeRole: currentRole,
    setRole,
    dataStrategy,
    setDataStrategy,
    isSyncing,
    latency,
    setLatency,
    forceError,
    setForceError,
  } = useAppStore();

  const [isOpen, setIsOpen] = React.useState(false);
  const [showMiniBar, setShowMiniBar] = React.useState(true);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as Role);
  };

  const handleReset = () => {
    if (window.confirm("Wipe local data and reset to factory defaults?")) {
      localStorage.removeItem("RESOLVE_DEMO_DB");
      window.location.reload(); // Hard reload to re-seed
    }
  };

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(() => {
        setShowMiniBar(false);
      });
    } else {
      const timeout = setTimeout(() => {
        setShowMiniBar(true);
      }, 200); // match panel slide duration

      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <div
      className={`${styles.overlay} ${isOpen ? styles.open : styles.closed}`}
    >
      <button
        type="button"
        aria-label={`Close Dev HUD`}
        aria-controls={`dev-hud`}
        className={styles.close}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IconClose />
      </button>

      <div className={styles.verticalContent}>
        {/* SECTION 1: DATA TRUTH */}
        <section className={styles.group}>
          <h3>Data Strategy</h3>
          <select
            value={dataStrategy}
            onChange={(e) => setDataStrategy(e.target.value as DataStrategy)}
          >
            <option value="APOLLO">Apollo (GraphQL)</option>
            <option value="TANSTACK">TanStack (REST)</option>
          </select>
        </section>

        {/* SECTION 2: PERMISSIONS */}
        <section className={styles.group}>
          <h3>User Role</h3>
          <select
            value={currentRole}
            onChange={handleRoleChange}
          >
            <option value="Admin">Admin (Full Access)</option>
            <option value="Editor">Editor (Edit Only)</option>
            <option value="Viewer">Viewer (Read Only)</option>
          </select>
        </section>

        {/* SECTION 3: NETWORK CONDITIONS */}
        <section className={styles.group}>
          <label>
            Simulated Latency: <strong>{latency}ms</strong>
          </label>
          <input
            type="range"
            min="0"
            max="3000"
            step="100"
            value={latency}
            onChange={(e) => setLatency(Number(e.target.value))}
          />
        </section>

        {/* SECTION 4: TEST ACTIONS */}
        <div className={styles.dangerZone}>
          <div className={styles.forceCrash}>
            <span>Force Crash</span>
            <div className={styles.checkboxRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={forceError === "app"}
                  onChange={(e) =>
                    setForceError(e.target.checked ? `app` : null)
                  }
                />
                <span>App</span>
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={forceError === "content"}
                  onChange={(e) =>
                    setForceError(e.target.checked ? `content` : null)
                  }
                />
                <span>Page content</span>
              </label>
            </div>
          </div>
          <button onClick={handleReset} className={styles.resetBtn}>
            Reset DB
          </button>
        </div>
      </div>

      <div
        className={`${styles.miniStatus} ${!showMiniBar && styles.hidden}`}
        onClick={() => setIsOpen(!isOpen)}
        title="Open Dev HUD"
      >
        <span>{dataStrategy === "APOLLO" ? "GQL" : "REST"}</span>
        <span className={styles.divider}>|</span>
        <span>{currentRole}</span>
        {latency > 0 && (
          <>
            <span className={styles.divider}>|</span>
            <span>{latency}ms</span>
          </>
        )}
        <span className={styles.divider}>|</span>
        <span className={styles.devHudIcon} />
        {isSyncing && (
          <span
            className={`${styles.statusDot} ${isSyncing ? styles.isSyncing : ""}`}
          />
        )}
      </div>
    </div>
  );
};
