  const API_BASE_RAW = import.meta.env.VITE_API_URL;
    
  const API_BASE = API_BASE_RAW && API_BASE_RAW.endsWith('/') 
      ? API_BASE_RAW.slice(0, -1) 
      : API_BASE_RAW;


  export const registerUser = async (userData) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Registration failed");
    return data;
  };

  export const loginUser = async (userData) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    return data;
  };

  export const fetchDashboard = async () => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard");
    return res.text();
  };
