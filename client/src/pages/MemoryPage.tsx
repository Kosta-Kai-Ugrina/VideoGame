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
        // mark matched
        setDeck((d) =>
          d.map((c) => (c.value === a.value ? { ...c, isMatched: true } : c))
        );
      } else {
        // flip back after delay
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
    <div className="bg-black text-red-800">
      bla
      <div className="w-[50px] h-[50px] bg-blue-500 text-white">
        booger aids
      </div>
    </div>
  );

  return (
    <div className="grid">
      {deck.map((card) => (
        <div
          key={card.id}
          className={`card ${card.isFlipped ? "flipped" : ""}`}
          onClick={() => onFlip(card)}
        >
          {card.isFlipped || card.isMatched ? (
            <img src={imageMap[card.value]} alt={card.value} />
          ) : (
            <div className="back" />
          )}
        </div>
      ))}
    </div>
  );
};

export default MemoryPage;
