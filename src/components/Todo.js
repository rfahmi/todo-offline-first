import React, { useState, useEffect } from "react";
import PouchDB from "pouchdb";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");
  const [isSync, setIsSync] = useState(false);

  const localDB = new PouchDB("todos");
  const remoteDB = new PouchDB(process.env.REACT_APP_DB_REMOTE + "/todos");

  const fetchTodos = async () => {
    try {
      const result = await localDB.allDocs({
        include_docs: true,
        sort: [{ _id: "desc" }],
      });
      setTodos(result.rows.map((row) => row.doc));
    } catch (err) {
      console.log("Fetch error:", err);
    }
  };

  const syncTodos = () => {
    localDB
      .sync(remoteDB, {
        live: true,
        retry: true,
      })
      .on("change", (info) => {
        fetchTodos();
        setIsSync(false);
        console.log("Sync change", info);
      })
      .on("paused", (info) => {
        setIsSync(false);
        console.log("Sync paused", info);
      })
      .on("active", (info) => {
        setIsSync(true);
        console.log("Sync active", info);
      })
      .on("denied", (err) => {
        setIsSync(false);
        console.error("Sync denied", err);
      })
      .on("complete", (info) => {
        console.log("Sync complete", info);
        setIsSync(false);
      })
      .on("error", (err) => {
        setIsSync(false);
        console.error("Sync error", err);
      });
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  useEffect(() => {
    syncTodos();
  }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (input.trim()) {
      const newTodo = {
        _id: new Date().toISOString(),
        title: input.trim(),
        completed: false,
      };
      try {
        await localDB.put(newTodo);
        setInput("");
        setTodos([newTodo, ...todos]);
      } catch (err) {
        console.error("Add error:", err);
      }
    }
  };

  const toggleComplete = async (id) => {
    const todo = todos.find((todo) => todo._id === id);
    if (todo) {
      todo.completed = !todo.completed;
      try {
        await localDB.put(todo);
        setTodos(todos.map((t) => (t._id === id ? todo : t)));
      } catch (err) {
        console.error("Toggle error:", err);
      }
    }
  };

  const deleteTodo = async (id) => {
    const todo = todos.find((todo) => todo._id === id);
    if (todo) {
      try {
        await localDB.remove(todo);
        setTodos(todos.filter((t) => t._id !== id));
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const styles = {
    todoApp: {
      width: "300px",
      margin: "0 auto",
      textAlign: "center",
      fontFamily: "Arial, sans-serif",
    },
    title: {
      fontSize: "24px",
      margin: "20px 0",
    },
    form: {
      display: "flex",
      marginBottom: "20px",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    input: {
      width: "80%",
      padding: "10px",
      margin: "10px 0",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    btn: {
      padding: "10px 20px",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    btnHover: {
      backgroundColor: "#218838",
    },
    list: {
      listStyleType: "none",
      padding: "0",
    },
    listItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px",
      borderBottom: "1px solid #ccc",
    },
    listItemTitle: {
      cursor: "pointer",
    },
    deleteBtn: {
      padding: "5px 10px",
      backgroundColor: "#dc3545",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
    deleteBtnHover: {
      backgroundColor: "#c82333",
    },
    loadingBar: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        backgroundColor: 'green',
        color: '#fff'
    }
  };

  return (
    <div style={styles.todoApp}>
      {isSync && (
        <div style={styles.loadingBar}>Sedang melakukan sinkronisasi..</div>
      )}
      <h1 style={styles.title}>Todo App</h1>
      <form onSubmit={addTodo} style={styles.form}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a new todo"
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>
          Add
        </button>
      </form>
      <ul style={styles.list}>
        {todos.map((todo) => (
          <li key={todo._id} style={styles.listItem}>
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
                color: todo.completed ? "#aaa" : "#000",
              }}
              onClick={() => toggleComplete(todo._id)}
              style={styles.listItemTitle}
            >
              {todo.title}
            </span>
            <button
              onClick={() => deleteTodo(todo._id)}
              style={styles.deleteBtn}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Todo;
