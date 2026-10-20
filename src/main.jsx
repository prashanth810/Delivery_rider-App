import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App.jsx";
import "./index.css";
import "./App.css";
import Mystore from "./redux/Store/Mystore.js";

createRoot(document.getElementById("root")).render(
  <Provider store={Mystore}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
