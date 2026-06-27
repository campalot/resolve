import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { ensureMsw } from "./api/mswManager";
import "./styles/base.scss";

dayjs.extend(relativeTime);

async function bootstrap() {
  await ensureMsw();

  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
