import { Route, Routes } from "react-router-dom";
import SocketIoTestPage from "./pages/SocketIoTestPage";
import MemoryPage from "./pages/MemoryPage";
import VekiStokaPage from "./pages/VekiStokaPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VekiStokaPage />} />
      {/* <Route path="/VideoGame" element={<SocketIoTestPage />} /> */}
      {/* <Route path="/socket-io-test" element={<SocketIoTestPage />} /> */}
      {/* <Route path="/veki-stoka" element={<VekiStokaPage />} /> */}
    </Routes>
  );
}
