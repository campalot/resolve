import type { Interaction, PageInfo } from "./interaction";
import type { Identity } from "./identity";

export type SearchResult = Interaction | Identity;

export type SearchResponse = {
  results: SearchResult[];
  pageInfo: PageInfo;
};