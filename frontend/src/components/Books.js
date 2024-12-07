import React, { useState } from "react";
import axios from "axios";

function Books() {
  const [books, setBooks] = useState([]); // search res
  const [searchQuery, setSearchQuery] = useState(""); // search keyword
  const [showResults, setShowResults] = useState(false); // control whether search results are displayed
  const [newBook, setNewBook] = useState({
    title: "",
    isbn: "",
    authors: "",
  });
  const [editingBookId, setEditingBookId] = useState(null); // current bookId 
  const [editedBook, setEditedBook] = useState({
    title: "",
    isbn: "",
    authors: "",
  });
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  // search function
  const handleSearch = () => {
    if (!searchQuery) {
      alert("Please enter a search query!");
      return;
    }
    axios
      .get(`${API_BASE_URL}/books`, { params: { title: searchQuery } })
      .then((response) => {
        console.log("Fetched books:", response.data); // add log
        setBooks(response.data); // update res
        setShowResults(true); // show res
      })
      .catch((error) => console.error("Error fetching books:", error));
  };

  // add new book logic
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
        setNewBook({ title: "", isbn: "", authors: "" }); // empty list
        setShowResults(false); // hide search res
        handleSearch(); // search to show newly added books
      })
      .catch((error) => console.error("Error adding book:", error));
  };

  // delete book logic
  const deleteBook = (id) => {
    console.log("Deleting book with ID:", id); // add log
    if (window.confirm("Are you sure you want to delete this book?")) {
      axios
        .delete(`${API_BASE_URL}/books/${id}`)
        .then(() => {
          alert("Book deleted successfully!");
          setBooks(books.filter((book) => book._id !== id)); //update local book list
        })
        .catch((error) => {
          console.error("Error deleting book:", error);
          alert("Failed to delete the book."); // add false warning
        });
    }
  };

  // initilize editing mode
  const startEditing = (book) => {
    console.log("Starting to edit book:", book); // add log
    setEditingBookId(book._id);
    setEditedBook({
      title: book.title,
      isbn: book.isbn.join(", "),
      authors: book.authors.join(", "),
    });
  };

  // cancel editing
  const cancelEditing = () => {
    setEditingBookId(null);
    setEditedBook({ title: "", isbn: "", authors: "" });
  };

  // submit editing
  const submitEdit = (id) => {
    console.log("Updating book with ID:", id); // add log
    if (!editedBook.title || !editedBook.isbn || !editedBook.authors) {
      alert("Please fill in all fields before updating the book!");
      return;
    }
    axios
      .put(`${API_BASE_URL}/books/${id}`, {
        title: editedBook.title,
        isbn: editedBook.isbn.split(",").map((isbn) => isbn.trim()),
        authors: editedBook.authors.split(",").map((author) => author.trim()),
      })
      .then(() => {
        alert("Book updated successfully!");
        setBooks(
          books.map((book) =>
            book._id === id
              ? {
                  ...book,
                  title: editedBook.title,
                  isbn: editedBook.isbn.split(",").map((isbn) => isbn.trim()),
                  authors: editedBook.authors
                    .split(",")
                    .map((author) => author.trim()),
                }
              : book
          )
        );
        cancelEditing();
      })
      .catch((error) => {
        console.error("Error updating book:", error);
        alert("Failed to update the book."); // add error warning
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Books Management</h2>

      {/* search function */}
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

      {/* show search res */}
      {showResults && books.length > 0 ? (
        <ul style={styles.bookList}>
          {books.map((book) => (
            <li key={book._id} style={styles.bookItem}>
              {editingBookId === book._id ? (
                <div>
                  <input
                    type="text"
                    value={editedBook.title}
                    onChange={(e) =>
                      setEditedBook({ ...editedBook, title: e.target.value })
                    }
                    style={styles.input}
                  />
                  <input
                    type="text"
                    value={editedBook.isbn}
                    onChange={(e) =>
                      setEditedBook({ ...editedBook, isbn: e.target.value })
                    }
                    style={styles.input}
                  />
                  <input
                    type="text"
                    value={editedBook.authors}
                    onChange={(e) =>
                      setEditedBook({ ...editedBook, authors: e.target.value })
                    }
                    style={styles.input}
                  />
                  <button
                    onClick={() => submitEdit(book._id)}
                    style={{ ...styles.button, marginRight: "10px" }}
                  >
                    Save
                  </button>
                  <button onClick={cancelEditing} style={styles.button}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div>
                  <strong>Title:</strong> {book.title} <br />
                  <strong>ISBN:</strong> {book.isbn.join(", ")} <br />
                  <strong>Authors:</strong> {book.authors.join(", ")} <br />
                  <button
                    onClick={() => startEditing(book)}
                    style={{ ...styles.button, marginRight: "10px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBook(book._id)}
                    style={styles.button}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : showResults && books.length === 0 ? (
        <p style={styles.noResult}>No books found for your search.</p>
      ) : null}

      {/* add new book function */}
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

// style optimize
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
