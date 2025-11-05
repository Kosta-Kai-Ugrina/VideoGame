import { Route, Routes } from "react-router-dom";
import SocketIoTestPage from "./pages/SocketIoTestPage";
import MemoryPage from "./pages/MemoryPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MemoryPage />} />
      <Route path="/socket-io-test" element={<SocketIoTestPage />} />
    </Routes>
  );
}
