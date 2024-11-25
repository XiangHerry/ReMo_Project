import React, { useState } from "react";
import axios from "axios";

function Libraries() {
  const [libraries, setLibraries] = useState([]); // 存储搜索结果
  const [searchQuery, setSearchQuery] = useState(""); // 搜索关键词
  const [newLibrary, setNewLibrary] = useState({
    name: "",
    address: "",
    books: "",
  }); // 新增记录的数据
  const [showResults, setShowResults] = useState(false); // 控制搜索结果是否展示

  // 从环境变量获取 API 基础 URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  // 搜索函数
  const searchLibraries = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a valid search query!");
      return;
    }
    axios
      .get(`${API_BASE_URL}/libraries`, { params: { name: searchQuery } })
      .then((response) => {
        setLibraries(response.data); // 更新搜索结果
        setShowResults(true); // 展示搜索结果
      })
      .catch((error) => console.error("Error fetching libraries:", error));
  };

  // 添加新记录函数
  const addLibrary = () => {
    if (!newLibrary.name || !newLibrary.address || !newLibrary.books) {
      alert("Please fill in all fields before adding a library!");
      return;
    }
    axios
      .post(`${API_BASE_URL}/libraries`, {
        name: newLibrary.name,
        address: newLibrary.address,
        books: newLibrary.books.split(",").map((book) => book.trim()), // 将书籍字符串拆分为数组
      })
      .then(() => {
        alert("Library added successfully!");
        setNewLibrary({ name: "", address: "", books: "" }); // 清空表单
        searchLibraries(); // 添加成功后触发搜索以更新列表
      })
      .catch((error) => console.error("Error adding library:", error));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Libraries Management</h2>

      {/* 搜索功能 */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by library name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // 更新搜索关键词
          style={styles.input}
        />
        <button onClick={searchLibraries} style={styles.button}>
          Search
        </button>
      </div>

      {/* 搜索结果 */}
      {showResults && libraries.length > 0 ? (
        <ul style={styles.list}>
          {libraries.map((library, index) => (
            <li key={index} style={styles.listItem}>
              <strong>Library Name:</strong> {library.title || "Not Specified"} <br />
              <strong>Material Type:</strong> {library.material_type || "Unknown"} <br />
              <strong>Inventory:</strong>
              {library.inventory ? (
                <ul>
                  <li>Total Copies: {library.inventory.total_copies || "N/A"}</li>
                  <li>Copies Available: {library.inventory.copies_available || "N/A"}</li>
                  <li>Copies Checked Out: {library.inventory.copies_checked_out || "N/A"}</li>
                  <li>Copies Lost: {library.inventory.copies_lost || "N/A"}</li>
                </ul>
              ) : (
                "No Inventory Data Available"
              )}
            </li>
          ))}
        </ul>
      ) : showResults && libraries.length === 0 ? (
        <p style={styles.noResult}>No libraries found for your search.</p> {/* 搜索为空时的提示 */}
      ) : null}

      {/* 添加新记录功能 */}
      <h3 style={styles.subtitle}>Add a New Library</h3>
      <div style={styles.formContainer}>
        <input
          type="text"
          placeholder="Library Name"
          value={newLibrary.name}
          onChange={(e) => setNewLibrary({ ...newLibrary, name: e.target.value })} // 更新名称
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Address"
          value={newLibrary.address}
          onChange={(e) => setNewLibrary({ ...newLibrary, address: e.target.value })} // 更新地址
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Books (comma separated)"
          value={newLibrary.books}
          onChange={(e) => setNewLibrary({ ...newLibrary, books: e.target.value })} // 更新书籍列表
          style={styles.input}
        />
        <button onClick={addLibrary} style={styles.button}>
          Add Library
        </button>
      </div>
    </div>
  );
}

// 样式
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Arial', sans-serif",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#333",
  },
  searchContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  button: {
    padding: "10px 15px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
  },
  list: {
    listStyleType: "none",
    padding: "0",
  },
  listItem: {
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  },
  noResult: {
    textAlign: "center",
    color: "#888",
  },
  subtitle: {
    color: "#555",
    marginBottom: "10px",
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default Libraries;
