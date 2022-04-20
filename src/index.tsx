import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import store, { persistor, sagaMiddleware } from "@/redux/store";
import { Provider } from "react-redux";
import rootSaga from "@/redux/root-saga";

import "@/styles/index.scss";
import { PersistGate } from "redux-persist/integration/react";

sagaMiddleware.run(rootSaga);

const AppRoot = (): JSX.Element => {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <React.StrictMode>
            <App />
          </React.StrictMode>
        </PersistGate>
      </Provider>
    </BrowserRouter>
  );
};

ReactDOM.render(<AppRoot />, document.getElementById("root"));
