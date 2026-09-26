import { DISCOVERY_TOPICS } from "./coupang-promo";

export type CandidatePriorityFacts = {
  price: number;
  previous_price: number | null;
  previous_price_checked_at: string | null;
  sources: string[];
  is_current: boolean;
};

export function observedPriceDrop(candidate: CandidatePriorityFacts): number {
  if (candidate.previous_price === null || !candidate.previous_price_checked_at) return 0;
  const drop = candidate.previous_price - candidate.price;
  return drop >= 1000 && drop / candidate.previous_price >= 0.1 ? drop : 0;
}

function topicIndex(candidate: CandidatePriorityFacts): number {
  return DISCOVERY_TOPICS.findIndex((topic) =>
    candidate.sources.includes(`search:${topic.keyword}`));
}

export function isPriorityCandidate(candidate: CandidatePriorityFacts): boolean {
  return candidate.is_current &&
    (observedPriceDrop(candidate) > 0 || topicIndex(candidate) >= 0);
}

export function comparePriorityCandidates(
  a: CandidatePriorityFacts,
  b: CandidatePriorityFacts,
): number {
  const aDrop = observedPriceDrop(a);
  const bDrop = observedPriceDrop(b);
  if (Boolean(aDrop) !== Boolean(bDrop)) return aDrop ? -1 : 1;
  if (aDrop !== bDrop) return bDrop - aDrop;
  const aTopic = topicIndex(a);
  const bTopic = topicIndex(b);
  if (aTopic !== bTopic) return aTopic - bTopic;
  return 0;
}
