import React from "react";
import ReactDOM from "react-dom";
import Home from './components/Home';

import "./app.css";

const App = () => (
  <div className="container">
    <Home />
  </div>
);

export const mount = (el) => {
  ReactDOM.render(<App />, el);
}

const el = document.getElementById("utility-bill-splitter");

if (process.env.NODE_ENV === 'development') {
  if (el) {
    mount(el);
  }
}
