import React, { FC, useState } from "react";
import { MemoryCard } from "../model/MemoryCard";
import { createDeck } from "../model/Deck";
import { imageMap } from "../model/images";

const MemoryPage: FC = () => {
  const [deck, setDeck] = useState<MemoryCard[]>(createDeck());
  const [flipped, setFlipped] = useState<MemoryCard[]>([]);

  function onFlip(memoryCard: MemoryCard) {
    if (memoryCard.isFlipped || memoryCard.isMatched) return;

    const newDeck = deck.map((c) =>
      c.id === memoryCard.id ? { ...c, isFlipped: true } : c
    );
    const newFlipped = [...flipped, { ...memoryCard, isFlipped: true }];

    setDeck(newDeck);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [a, b] = newFlipped;
      if (a.value === b.value) {
        setDeck((d) =>
          d.map((c) => (c.value === a.value ? { ...c, isMatched: true } : c))
        );
      } else {
        setTimeout(() => {
          setDeck((d) =>
            d.map((c) => (c.isMatched ? c : { ...c, isFlipped: false }))
          );
        }, 1000);
      }
      setFlipped([]);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Memory Game</h1>
      <div className="grid grid-cols-4 gap-4">
        {deck.map((card) => (
          <button
            key={card.id}
            onClick={() => onFlip(card)}
            className={`w-24 h-32 rounded-xl transition-transform duration-300 transform ${
              card.isFlipped || card.isMatched
                ? "rotate-y-0 bg-white"
                : "rotate-y-180 bg-blue-700"
            } flex items-center justify-center shadow-lg`}
          >
            {card.isFlipped || card.isMatched ? (
              <img
                src={imageMap[card.value]}
                alt={card.value}
                className="w-16 h-16 object-contain"
              />
            ) : (
              <div className="w-16 h-16 bg-blue-800 rounded-lg" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MemoryPage;
