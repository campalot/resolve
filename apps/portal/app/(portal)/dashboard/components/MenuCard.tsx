"use client";

import React from "react";
import "./MenuCard.scss";

interface MenuCardProps {
  displayName: string;
  // menuIcon: InteractionType;
  MenuIcon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  onClick,
  displayName,
  MenuIcon,
}) => {
  return (
    <div className={`menu`} onClick={onClick}>
      <MenuIcon className="dfsd" />
      <div className={`menu__title`}>{displayName}</div>
    </div>
  );
};

export { MenuCard };
