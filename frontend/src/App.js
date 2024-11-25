import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Books from "./components/Books";       // 书籍管理组件
import Libraries from "./components/Libraries"; // 库存管理组件
import "./App.css"; // 导入全局样式

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/books" className="nav-link">Books</Link>
            </li>
            <li className="nav-item">
              <Link to="/libraries" className="nav-link">Libraries</Link>
            </li>
          </ul>
        </nav>
        <div className="content">
          <Routes>
            <Route path="/books" element={<Books />} />
            <Route path="/libraries" element={<Libraries />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
