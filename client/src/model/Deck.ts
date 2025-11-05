import { imageMap } from "./images";
import { MemoryCard } from "./MemoryCard";
import { v4 as uuid } from "uuid";

export function createDeck(): MemoryCard[] {
  const values = Object.keys(imageMap);
  const pairs = values.flatMap((value) => [
    { id: uuid(), value, isFlipped: false, isMatched: false },
    { id: uuid(), value, isFlipped: false, isMatched: false },
  ]);
  return shuffle(pairs);
}

function shuffle<T>(array: T[]): T[] {
  return array
    .map((x) => ({ x, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ x }) => x);
}
