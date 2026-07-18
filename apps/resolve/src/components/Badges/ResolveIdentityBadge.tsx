import React from "react";
import { Link } from "react-router-dom";
import type { Identity } from "@resolve/types";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute } from "../../routes/routes";
import { IdentityBadge as IdentityBadgeUi } from "@resolve/ui";

type Size = "sm" | "md" | "lg";

type IdentityBadgeProps = {
  identity: Pick<Identity, "id" | "name">;
  size?: Size;
  isSquare?: boolean;
  link?: boolean;
};

const IdentityBadge: React.FC<IdentityBadgeProps> = ({
  identity,
  size = "sm",
  isSquare = false,
  link = true,
}) => {
  const workspacePath = useWorkspacePath();
  const profilePath = workspacePath(identityRoute(identity.id));

  return (
    <IdentityBadgeUi
      identity={identity}
      profileUrl={profilePath}
      renderLink={(children, url = profilePath, className) => (
        <Link
          to={url}
          aria-label={`View profile for ${identity.name}`}
          className={className}
        >
          {children}
        </Link>
      )}
      size={size}
      isSquare={isSquare}
      link={link}
    />
  );
};

export default IdentityBadge;
