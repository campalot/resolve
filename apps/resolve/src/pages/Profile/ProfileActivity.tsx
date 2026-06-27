import React from "react";
import type { InteractionActivity } from "../../types/schema";
import { activityRenderers } from "../Dashboard/activityRenderer";

type ProfileActivityProps = {
  activities: InteractionActivity[];
};

export const ProfileActivity: React.FC<ProfileActivityProps> = ({ activities }) => {

  return (
    <section aria-labelledby="activity-heading">
      <h2 id="activity-heading">Activity</h2>
      <ul
        role="feed"
        style={{ display: "grid", paddingInlineStart: "0", gap: "1rem", listStyle: "none" }}
      >
        {activities.map((activity: InteractionActivity) => {
          const CardComponent = activityRenderers[activity.type];
          return (
            <li key={activity.id} role="article">
              <CardComponent activity={activity} />
            </li>
          );
        })}
      </ul>
    </section>
  );
};
