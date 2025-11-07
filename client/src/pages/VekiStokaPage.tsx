import React, { FC } from "react";
import CanvasBoard from "../components/CanvasBoard";

const VekiStokaPage: FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Memory Game</h1>
      <div className="grid grid-cols-4 gap-4">
        <CanvasBoard roomId="pad-1" />
      </div>
    </div>
  );
};

export default VekiStokaPage;
