import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { BrowserStorage } from "@resolve/mock-db/browser";
import { configureStorage, initializeMockDb } from "@resolve/mock-db";
import "./styles/base.scss";

dayjs.extend(relativeTime);

async function bootstrap() {
  configureStorage(BrowserStorage);
  await initializeMockDb();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
