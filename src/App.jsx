import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import AppChat from "./chat/App";
import { ChatProvider } from "./chat/context/ChatContext";

const AppAdmin = lazy(() => import("./admin/App"));
const ContextProvider = lazy(() =>
  import("./admin/components/Context/Context"),
);

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <ChatProvider>
            <AppChat />
          </ChatProvider>
        }
      />
      <Route
        path="/chat"
        element={
          <ChatProvider>
            <AppChat />
          </ChatProvider>
        }
      />
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div>Loading Admin...</div>}>
            <ContextProvider>
              <AppAdmin />
            </ContextProvider>
          </Suspense>
        }
      />
    </Routes>
  );
}

export default App;
