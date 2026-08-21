import type { Identity } from "./identity";
import type { InteractionActivity } from "./activity";
import type { Interaction } from "./interaction";

export type PageInfo = {
  hasMore: boolean;
  total: number;
};

export type ActivitiesPageInfo = {
  hasMore: boolean;
  total: number;
  comments: number;
};

export type IdentitiesConnection = {
  results: Identity[];
  pageInfo: PageInfo;
};

export type InteractionsConnection = {
  results: Interaction[];
  pageInfo: PageInfo;
};

export type ActivitiesConnection = {
  results: InteractionActivity[];
  pageInfo: ActivitiesPageInfo;
};

export type SearchConnection = {
  results: Array<Interaction | Identity>;
  pageInfo: PageInfo;
};

