import React, { useState } from "react";
import axios from "axios";

function Books() {
  const [books, setBooks] = useState([]); // 搜索结果
  const [searchQuery, setSearchQuery] = useState(""); // 搜索关键词
  const [showResults, setShowResults] = useState(false); // 控制是否显示搜索结果
  const [newBook, setNewBook] = useState({
    title: "",
    isbn: "",
    authors: "",
  });
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  // 搜索函数
  const handleSearch = () => {
    if (!searchQuery) {
      alert("Please enter a search query!");
      return;
    }
    axios
      .get(`${API_BASE_URL}/books`, { params: { title: searchQuery } })
      .then((response) => {
        setBooks(response.data); // 更新搜索结果
        setShowResults(true); // 显示搜索结果
      })
      .catch((error) => console.error("Error fetching books:", error));
  };

  // 添加新书函数
  const addBook = () => {
    if (!newBook.title || !newBook.isbn || !newBook.authors) {
      alert("Please fill in all fields before adding a book!");
      return;
    }
    axios
      .post(`${API_BASE_URL}/books`, {
        title: newBook.title,
        isbn: newBook.isbn.split(",").map((isbn) => isbn.trim()),
        authors: newBook.authors.split(",").map((author) => author.trim()),
      })
      .then(() => {
        alert("Book added successfully!");
        setNewBook({ title: "", isbn: "", authors: "" }); // 清空表单
        setShowResults(false); // 隐藏搜索结果
      })
      .catch((error) => console.error("Error adding book:", error));
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Books Management</h2>

      {/* 搜索功能 */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
      </div>

      {/* 显示搜索结果 */}
      {showResults && books.length > 0 ? (
        <ul style={styles.bookList}>
          {books.map((book, index) => (
            <li key={index} style={styles.bookItem}>
              <strong>Title:</strong> {book.title} <br />
              <strong>ISBN:</strong> {book.isbn.join(", ")} <br />
              <strong>Authors:</strong> {book.authors.join(", ")} <br />
            </li>
          ))}
        </ul>
      ) : showResults && books.length === 0 ? (
        <p style={styles.noResult}>No books found for your search.</p>
      ) : null}

      {/* 添加新书功能 */}
      <h3 style={styles.subtitle}>Add New Book</h3>
      <div style={styles.addBookContainer}>
        <input
          type="text"
          placeholder="Title"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="ISBN (comma separated)"
          value={newBook.isbn}
          onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Authors (comma separated)"
          value={newBook.authors}
          onChange={(e) => setNewBook({ ...newBook, authors: e.target.value })}
          style={styles.input}
        />
        <button onClick={addBook} style={styles.button}>
          Add Book
        </button>
      </div>
    </div>
  );
}

// 样式优化
const styles = {
  container: {
    maxWidth: "800px",
    margin: "0 auto",
    fontFamily: "'Arial', sans-serif",
    padding: "20px",
    backgroundColor: "#f7f9fc",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  },
  title: {
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  },
  searchContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    gap: "10px",
  },
  input: {
    flex: 1,
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    textAlign: "center",
  },
  bookList: {
    listStyleType: "none",
    padding: "0",
    marginBottom: "20px",
  },
  bookItem: {
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "10px",
    borderRadius: "4px",
    border: "1px solid #e0e0e0",
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
  addBookContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
};

export default Books;
