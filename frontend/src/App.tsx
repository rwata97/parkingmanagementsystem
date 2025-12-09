import { useState } from "react";
import { router } from "@/app/RoutesList";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider"; // ⬅️ adjust path

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </>
  );
}

export default App;
