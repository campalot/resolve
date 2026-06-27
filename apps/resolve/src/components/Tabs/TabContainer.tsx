import React from "react";
import type { ReactNode } from "react";

type Props = {
  activeTab: string;
  tabs: { id: string; label: string; content: ReactNode }[];
  onTabChange?: (id: string) => void;
}

export const TabContainer: React.FC<Props> = ({
  activeTab,
  tabs,
  onTabChange,
}) => {
  return (
    <div>
      <nav>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange?.(tab.id)}
            style={{ fontWeight: tab.id === activeTab ? "bold" : "normal" }}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div>{tabs.find((t) => t.id === activeTab)?.content}</div>
    </div>
  );
};
