import PouchDB from "pouchdb";
import React, { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1rem",
    marginTop: 32,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
    gap: "1rem",
  },
  inputContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "1rem",
    borderRadius: "4px",
    border: "1px solid #ccc",
  },
  label: {
    fontSize: "1.2rem",
    fontWeight: "bold",
  },
  loadingBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
  },
};

const InputComponent = ({ label, value, setValue }) => {
  return (
    <div style={styles.inputContainer}>
      <label style={styles.label}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={styles.input}
      />
    </div>
  );
};

const Form = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [docId, setDocId] = useState(null);
  
    const [isSync, setIsSync] = useState(false);
  
    const localDB = new PouchDB("form");
    const remoteDB = new PouchDB(process.env.REACT_APP_DB_REMOTE + "/form");
  
    const fetchData = async () => {
      try {
        const result = await localDB.allDocs({
          include_docs: true,
        });
        const data = result.rows.map((row) => row.doc);
        if (data.length > 0) {
          setName(data[0].name);
          setEmail(data[0].email);
          setDocId(data[0]._id);
        }
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

  const syncData = () => {
    localDB
      .sync(remoteDB, {
        live: true,
        retry: true,
      })
      .on("change", (info) => {
        fetchData();
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
    fetchData();
  }, []);

  useEffect(() => {
    syncData();
  }, []);

  const updateData = async (e) => {
    e.preventDefault();
    try {
      if (docId) {
        const doc = await localDB.get(docId);
        doc.name = name;
        doc.email = email;
        await localDB.put(doc);
      } else {
        const newData = {
          _id: new Date().toISOString(),
          name: name,
          email: email,
        };
        await localDB.put(newData);
      }
      console.log("Data updated successfully");
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Data Form</h1>
      <div style={styles.loadingBar}>
        {isSync && <BeatLoader color="#36d7b7" size={8} />}
      </div>
      <form style={styles.form} onSubmit={updateData}>
        <InputComponent label="Name" value={name} setValue={setName} />
        <InputComponent label="Email" value={email} setValue={setEmail} />
        <button
          type="submit"
          style={{
            padding: "0.5rem",
            fontSize: "1rem",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        >
          Update Data
        </button>
      </form>
    </div>
  );
};

export default Form;
