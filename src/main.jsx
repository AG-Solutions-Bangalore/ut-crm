// import "antd/dist/reset.css";
import { App as AntApp } from "antd";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { store } from "./store/store.js";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* <AppThemeProvider> */}
    <AntApp>

  
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
        </AntApp>
    {/* </AppThemeProvider> */}
  </React.StrictMode>
);
