import type { Interaction } from "./interaction";
import type { Identity } from "./identity";
import type { PageInfo } from "./connections";

export type SearchResult = Interaction | Identity;

export type SearchResponse = {
  results: SearchResult[];
  pageInfo: PageInfo;
};