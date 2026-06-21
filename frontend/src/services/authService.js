const API = "http://localhost:3000/api";

export const login = async (form) => {
  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(form)
  });

  const data = await res.json();

  if (!res.ok) {
    return { error: data.error };
  }

  return data;
};