import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import store from "./store";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import ErrorBoundary from "./errors/ErrorBoundary";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN_KEY,
  integrations: [new BrowserTracing()],
  environment: process.env.REACT_APP_SENTRY_ENV,
  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
  beforeSend: (event, _) => {
    if (_?.originalException?.ignoreSentryRV) {
      return null;
    }
    event["fingerprint"] = [event.event_id];
    return event;
  },
});

const root = ReactDOM.createRoot(document.getElementById("root"));
if (window.location.host.includes("localhost")) {
  root.render(
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <App />
        </Router>
      </ErrorBoundary>
    </Provider>
  );
} else {
  root.render(
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals(console.log);
