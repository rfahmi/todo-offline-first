import React from "react";
import Todo from "./components/Todo";
import "./App.css";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import NetworkStatusIndicator from "./components/NetworkStatusIndicator";
import Form from "./components/Form";

function App() {
  const navStyle = {
    height: "100vh",
    width: "200px",
    background: "#333",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
  };

  const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    marginBottom: "10px",
  };
  const content = {
    height: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
  };
  return (
    <Router>
      <div className="App">
        <div style={navStyle}>
          <Link to="/" style={linkStyle}>
            Todo
          </Link>
          <Link to="/form" style={linkStyle}>
            Form
          </Link>
          {/* Add more links as needed */}
        </div>
        <div style={content}>
        <NetworkStatusIndicator />
          <Routes>
            <Route path="/" element={<Todo />} />
            <Route path="/form" element={<Form />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
