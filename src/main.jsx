import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
// import App from './App.jsx'
import { NextUIProvider } from "@nextui-org/react";
import AppRoutes from "./Routes.jsx";
import { MyContextProvider } from "./context/MyContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MyContextProvider>
      <NextUIProvider>
        <AppRoutes />
      </NextUIProvider>
    </MyContextProvider>
  </StrictMode>
);
