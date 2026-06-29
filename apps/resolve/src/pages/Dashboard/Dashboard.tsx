import React, { useEffect, useRef } from "react";
import type { InteractionActivity } from "@resolve/types";
import { useInteractionActivities } from "../../hooks/useInteractionActivities";
import { activityRenderers } from "./activityRenderer";
import styles from "./Dashboard.module.scss";
import { DashboardItemSkeleton } from "./DashboardItemSkeleton";
import { DashboardSkeleton } from "./DashboardSkeleton";

export const Dashboard: React.FC = () => {
  const feedRef = useRef<HTMLDivElement>(null);
  const hasIntersectedRef = useRef(false);
  // At the bottom of the list
  const sentinelRef = useRef(null);
  const {
    results,
    loading,
    error,
    hasMore,
    fetchNextPage,
    isFetchingNextPage,
  } = useInteractionActivities({
    filters: {},
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        // If NOT intersecting → reset the gate
        if (!entry.isIntersecting) {
          hasIntersectedRef.current = false;
          return;
        }

        // If already triggered while visible → ignore
        if (hasIntersectedRef.current) return;

        if (!hasMore) return;
        if (isFetchingNextPage || loading) return; // 🔥 don't observe while loading

        // 🔥 lock until it leaves viewport again
        hasIntersectedRef.current = true;

        fetchNextPage();
      },
      {
        // Set the <ul> as the container to watch
        root: feedRef.current,
        threshold: 0,
        // Trigger when the sentinel is 100px away from the bottom of the viewport
        rootMargin: "0px 0px 100px 0px",
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isFetchingNextPage, fetchNextPage, loading]);

  const isInitialLoad = loading && results.length === 0;

  useEffect(() => {
    if (!isFetchingNextPage) {
      // 🔥 lock until it leaves viewport again
      hasIntersectedRef.current = false;
    }
  }, [isFetchingNextPage]);

  if (isInitialLoad) {
    return <DashboardSkeleton />;
  }

  return (
    <div ref={feedRef} className={styles.dashboardFeed}>
      <h1>Activity</h1>
      <ul role="feed" aria-busy={loading} className={styles.dashboardList}>
        {results.map((activity: InteractionActivity) => {
          const CardComponent = activityRenderers[activity.type];
          return (
            <li key={activity.id} role="article">
              <CardComponent activity={activity} />
            </li>
          );
        })}
        {/* 👇 Append skeleton items during fetching */}
        {isFetchingNextPage &&
          hasMore &&
          Array.from({ length: 1 }).map((_, i) => (
            <li key={`skeleton-${i}`} role="article">
              <DashboardItemSkeleton />
            </li>
          ))}
        <li
          ref={sentinelRef}
          aria-hidden="true"
          style={{ height: "1px", listStyle: "none" }}
        />
      </ul>
      <div role="status" aria-live="polite">
        {loading && "Loading more results"}
        {error && "Failed to load results"}
      </div>
      <div aria-live="polite" className="sr-only">
        {loading && "Loading more results"}
        {!loading && !error && "20 more results loaded"}
        {error && "Failed to load results"}
      </div>
    </div>
  );
};
