import React, { useState, useEffect } from "react";

const Chat = () => {
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState("light"); // Estado para manejar el tema (light o dark)

  // Cambiar entre modo claro y oscuro
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // Aplicar el tema según la preferencia del usuario en el sistema (si no se ha elegido manualmente)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDarkScheme ? "dark" : "light");
    }
  }, []);

  // Guardar el tema en el localStorage para persistencia
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.body.className = theme; // Cambiar la clase en el body
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInput.trim() === "") return; // No enviar mensaje vacío

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: userInput },
    ]);
    setUserInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SECRET_KEY}`, // Usar variable de entorno para la clave de API
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [...messages, { role: "user", content: userInput }],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from OpenAI");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: assistantMessage },
      ]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        backgroundColor: theme === "dark" ? "#333" : "#fff",
        color: theme === "dark" ? "#fff" : "#333",
      }}
    >
      <h1>Chat with GPT-4</h1>
      <button
        onClick={toggleTheme}
        style={{
          padding: "10px 20px",
          border: "none",
          backgroundColor: theme === "dark" ? "#bbb" : "#444",
          color: theme === "dark" ? "#333" : "#fff",
          borderRadius: "4px",
          cursor: "pointer",
          marginBottom: "20px",
        }}
      >
        Toggle {theme === "dark" ? "Light" : "Dark"} Mode
      </button>
      <div
        style={{
          height: "300px",
          overflowY: "scroll",
          marginBottom: "20px",
          border: "1px solid #ddd",
          padding: "10px",
          borderRadius: "8px",
          backgroundColor: theme === "dark" ? "#444" : "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <strong>{msg.role === "user" ? "You" : "Assistant"}:</strong>
            <p>{msg.content}</p>
          </div>
        ))}
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type your message..."
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            backgroundColor: theme === "dark" ? "#555" : "#fff",
            color: theme === "dark" ? "#fff" : "#333",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            border: "none",
            backgroundColor: theme === "dark" ? "#4CAF50" : "#2196F3",
            color: "white",
            borderRadius: "4px",
            marginTop: "10px",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
