import React from 'react';
import Todo from './components/Todo';
import './App.css';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';

function App() {
  return (
    <div className="App">
      <NetworkStatusIndicator />
      <Todo />
    </div>
  );
}

export default App;
