import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const handleChange = async (e) => {
    const val = e.target.value;
    setQuery(val);
    
    if (!val.trim()) { 
      setResults([]); 
      return; 
    }
    
    try {
      const res = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(val)}`);
      setResults(res.data.slice(0, 8));
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        value={query}
        onChange={handleChange}
        placeholder="Search problems..."
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: "rgba(255, 255, 255, 0.06)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#fff",
          fontSize: 12
        }}
      />

      {results.length > 0 && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 280,
          maxHeight: 400,
          overflowY: "auto",
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 10,
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
          zIndex: 99999
        }}>
          {results.map(r => (
            <div
              key={r.id}
              onClick={() => navigate(`/editor/${r.id}`)}
              style={{
                padding: "8px 12px",
                cursor: "pointer"
              }}
            >
              {r.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;