import React from 'react';
import ReactDOM from 'react-dom';
import { StateInspector } from 'reinspect';
import { Reset } from 'styled-reset';

import { Root } from './components/root';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <Reset />
    <StateInspector name="global">
      <Root />
    </StateInspector>
  </React.StrictMode>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
