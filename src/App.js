import React from "react";
import ReactDOM from "react-dom";

import "./app.css";

const App = () => (
  <div className="container">
    <div>Name: utility-bill-splitter</div>
    <div>Framework: react</div>
    <div>Language: JavaScript</div>
    <div>CSS: Empty CSS</div>
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
