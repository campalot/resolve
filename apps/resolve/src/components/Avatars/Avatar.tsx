import React from "react";
import { Link } from "react-router-dom";
import type { Identity } from "@resolve/types";
import { useWorkspacePath } from "../../hooks/useWorkspacePath";
import { identityRoute } from "../../routes/routes";
import { Avatar as AvatarUi } from "@resolve/ui";


type AvatarProps = {
  identity: Pick<Identity, "id" | "name" | "avatarUrl">;
  size?: number;
  isSquare?: boolean;
  decorative?: boolean;
  addLink?: boolean;
};

const Avatar: React.FC<AvatarProps> = ({
  identity,
  size = 40,
  isSquare = false,
  decorative = true,
  addLink = false,
}) => {
  const workspacePath = useWorkspacePath();
  const profileUrl = workspacePath(identityRoute(identity.id));

  return (
    <AvatarUi
      identity={identity}
      profileUrl={profileUrl}
      renderLink={(children, url = profileUrl) => (
        <Link to={url}>{children}</Link>
      )}
      addLink={addLink}
      decorative={decorative}
      size={size}
      isSquare={isSquare}
    />
  );
};

export default Avatar;
