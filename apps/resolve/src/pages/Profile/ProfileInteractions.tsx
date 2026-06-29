import React from "react";
import { InteractionsList } from "../Interactions/InteractionsList";
import type { Interaction } from "@resolve/types";

type ProfileInteractionsProps = {
  interactions: Interaction[];
};

export const ProfileInteractions: React.FC<ProfileInteractionsProps> = ({ interactions }) => {

  return (
    <section aria-labelledby="interactions-heading">
      <h2 id="interactions-heading">Interactions</h2>
      <InteractionsList interactions={interactions} isProfile={true} />
    </section>
  );
};
