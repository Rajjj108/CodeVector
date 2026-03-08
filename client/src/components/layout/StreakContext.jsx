import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

const StreakContext = createContext({ current: 0, longest: 0, refresh: () => {} });

export const StreakProvider = ({ children }) => {
  const [streak, setStreak] = useState({ current: 0, longest: 0 });

  const fetchStreak = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get((import.meta.env.VITE_API_URL || "http://localhost:5000") + "/api/dashboard/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.streak) {
        setStreak({
          current: res.data.streak.current ?? 0,
          longest: res.data.streak.longest ?? 0,
        });
      }
    } catch { /* non-critical */ }
  }, []);

  useEffect(() => {
    fetchStreak();

    // ✅ Listen for custom event fired after a successful submission
    window.addEventListener("streak:refresh", fetchStreak);
    return () => window.removeEventListener("streak:refresh", fetchStreak);
  }, [fetchStreak]);

  return (
    <StreakContext.Provider value={{ ...streak, refresh: fetchStreak }}>
      {children}
    </StreakContext.Provider>
  );
};

export const useStreak = () => useContext(StreakContext);