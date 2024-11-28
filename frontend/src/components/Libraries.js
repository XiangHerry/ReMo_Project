import React, { useState } from "react";
import axios from "axios";

function Libraries() {
  const [libraries, setLibraries] = useState([]); // 搜索结果
  const [searchQuery, setSearchQuery] = useState(""); // 搜索关键词
  const [showResults, setShowResults] = useState(false); // 控制是否显示搜索结果
  const [newLibrary, setNewLibrary] = useState({
    title: "",
    material_type: "",
    total_copies: "",
    copies_available: "",
    copies_checked_out: "",
    copies_lost: "",
  }); // 新增记录的数据
  const [editingLibraryId, setEditingLibraryId] = useState(null); // 当前正在编辑的图书馆ID
  const [editedLibrary, setEditedLibrary] = useState({
    title: "",
    material_type: "",
    total_copies: "",
    copies_available: "",
    copies_checked_out: "",
    copies_lost: "",
  }); // 编辑中的图书馆数据
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

  // 搜索函数
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      alert("Please enter a valid search query!");
      return;
    }
    axios
      .get(`${API_BASE_URL}/libraries`, { params: { name: searchQuery } })
      .then((response) => {
        console.log("Fetched libraries:", response.data); // 添加日志
        setLibraries(response.data); // 更新搜索结果
        setShowResults(true); // 显示搜索结果
      })
      .catch((error) => console.error("Error fetching libraries:", error));
  };

  // 添加新图书馆函数
  const addLibrary = () => {
    const { title, material_type, total_copies, copies_available, copies_checked_out, copies_lost } = newLibrary;
    if (!title || !material_type || !total_copies || !copies_available || !copies_checked_out || !copies_lost) {
      alert("Please fill in all fields before adding a library!");
      return;
    }
    axios
      .post(`${API_BASE_URL}/libraries`, {
        title,
        material_type,
        inventory: {
          total_copies: parseInt(total_copies),
          copies_available: parseInt(copies_available),
          copies_checked_out: parseInt(copies_checked_out),
          copies_lost: parseInt(copies_lost),
        },
      })
      .then(() => {
        alert("Library added successfully!");
        setNewLibrary({
          title: "",
          material_type: "",
          total_copies: "",
          copies_available: "",
          copies_checked_out: "",
          copies_lost: "",
        }); // 清空表单
        setShowResults(false); // 隐藏搜索结果
        handleSearch(); // 重新搜索以显示新增图书馆
      })
      .catch((error) => console.error("Error adding library:", error));
  };

  // 删除图书馆函数
  const deleteLibrary = (id) => {
    console.log("Deleting library with ID:", id); // 添加日志
    if (window.confirm("Are you sure you want to delete this library?")) {
      axios
        .delete(`${API_BASE_URL}/libraries/${id}`)
        .then(() => {
          alert("Library deleted successfully!");
          setLibraries(libraries.filter((library) => library._id !== id)); // 更新本地图书馆列表
        })
        .catch((error) => {
          console.error("Error deleting library:", error);
          alert("Failed to delete the library."); // 添加错误提示
        });
    }
  };

  // 启动编辑模式
  const startEditing = (library) => {
    console.log("Starting to edit library:", library); // 添加日志
    setEditingLibraryId(library._id);
    setEditedLibrary({
      title: library.title,
      material_type: library.material_type,
      total_copies: library.inventory.total_copies,
      copies_available: library.inventory.copies_available,
      copies_checked_out: library.inventory.copies_checked_out,
      copies_lost: library.inventory.copies_lost,
    });
  };

  // 取消编辑
  const cancelEditing = () => {
    setEditingLibraryId(null);
    setEditedLibrary({
      title: "",
      material_type: "",
      total_copies: "",
      copies_available: "",
      copies_checked_out: "",
      copies_lost: "",
    });
  };

  // 提交编辑
  const submitEdit = (id) => {
    console.log("Updating library with ID:", id); // 添加日志
    const { title, material_type, total_copies, copies_available, copies_checked_out, copies_lost } = editedLibrary;
    if (!title || !material_type || !total_copies || !copies_available || !copies_checked_out || !copies_lost) {
      alert("Please fill in all fields before updating the library!");
      return;
    }
    axios
      .put(`${API_BASE_URL}/libraries/${id}`, {
        title,
        material_type,
        inventory: {
          total_copies: parseInt(total_copies),
          copies_available: parseInt(copies_available),
          copies_checked_out: parseInt(copies_checked_out),
          copies_lost: parseInt(copies_lost),
        },
      })
      .then(() => {
        alert("Library updated successfully!");
        setLibraries(
          libraries.map((library) =>
            library._id === id
              ? {
                  ...library,
                  title: editedLibrary.title,
                  material_type: editedLibrary.material_type,
                  inventory: {
                    total_copies: parseInt(editedLibrary.total_copies),
                    copies_available: parseInt(editedLibrary.copies_available),
                    copies_checked_out: parseInt(editedLibrary.copies_checked_out),
                    copies_lost: parseInt(editedLibrary.copies_lost),
                  },
                }
              : library
          )
        );
        cancelEditing();
      })
      .catch((error) => {
        console.error("Error updating library:", error);
        alert("Failed to update the library."); // 添加错误提示
      });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Libraries Management</h2>

      {/* 搜索功能 */}
      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by library title"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)} // 更新搜索关键词
          style={styles.input}
        />
        <button onClick={handleSearch} style={styles.button}>
          Search
        </button>
      </div>

      {/* 显示搜索结果 */}
      {showResults && libraries.length > 0 ? (
        <ul style={styles.list}>
          {libraries.map((library) => (
            <li key={library._id} style={styles.listItem}>
              {editingLibraryId === library._id ? (
                <div>
                  <input
                    type="text"
                    value={editedLibrary.title}
                    onChange={(e) =>
                      setEditedLibrary({ ...editedLibrary, title: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Library Title"
                  />
                  <input
                    type="text"
                    value={editedLibrary.material_type}
                    onChange={(e) =>
                      setEditedLibrary({ ...editedLibrary, material_type: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Material Type"
                  />
                  <input
                    type="number"
                    value={editedLibrary.total_copies}
                    onChange={(e) =>
                      setEditedLibrary({ ...editedLibrary, total_copies: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Total Copies"
                  />
                  <input
                    type="number"
                    value={editedLibrary.copies_available}
                    onChange={(e) =>
                      setEditedLibrary({ ...editedLibrary, copies_available: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Copies Available"
                  />
                  <input
                    type="number"
                    value={editedLibrary.copies_checked_out}
                    onChange={(e) =>
                      setEditedLibrary({ ...editedLibrary, copies_checked_out: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Copies Checked Out"
                  />
                  <input
                    type="number"
                    value={editedLibrary.copies_lost}
                    onChange={(e) =>
                      setEditedLibrary({ ...editedLibrary, copies_lost: e.target.value })
                    }
                    style={styles.input}
                    placeholder="Copies Lost"
                  />
                  <button
                    onClick={() => submitEdit(library._id)}
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
                  <strong>Library Title:</strong> {library.title || "Not Specified"} <br />
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
                  <button
                    onClick={() => startEditing(library)}
                    style={{ ...styles.button, marginRight: "10px" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteLibrary(library._id)}
                    style={styles.button}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : showResults && libraries.length === 0 ? (
        <p style={styles.noResult}>No libraries found for your search.</p>
      ) : null}

      {/* 添加新记录功能 */}
      <h3 style={styles.subtitle}>Add a New Library</h3>
      <div style={styles.formContainer}>
        <input
          type="text"
          placeholder="Library Title"
          value={newLibrary.title}
          onChange={(e) => setNewLibrary({ ...newLibrary, title: e.target.value })}
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Material Type"
          value={newLibrary.material_type}
          onChange={(e) => setNewLibrary({ ...newLibrary, material_type: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Total Copies"
          value={newLibrary.total_copies}
          onChange={(e) => setNewLibrary({ ...newLibrary, total_copies: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Copies Available"
          value={newLibrary.copies_available}
          onChange={(e) => setNewLibrary({ ...newLibrary, copies_available: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Copies Checked Out"
          value={newLibrary.copies_checked_out}
          onChange={(e) => setNewLibrary({ ...newLibrary, copies_checked_out: e.target.value })}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Copies Lost"
          value={newLibrary.copies_lost}
          onChange={(e) => setNewLibrary({ ...newLibrary, copies_lost: e.target.value })}
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
