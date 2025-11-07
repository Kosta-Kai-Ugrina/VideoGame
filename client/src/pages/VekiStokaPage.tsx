import React, { FC } from "react";
import CanvasBoard from "../components/CanvasBoard";

const VekiStokaPage: FC = () => {
  return (
    <div className="min-h-screen min-w-screen bg-gray-900 flex flex-col p-8">
      <CanvasBoard roomId="pad-1" />
    </div>
  );
};

export default VekiStokaPage;
