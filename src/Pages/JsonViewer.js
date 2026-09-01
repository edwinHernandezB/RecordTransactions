import { useEffect, useState } from "react";

export default function JsonViewer() {
  const [json, setJson] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copiar JSON");

  useEffect(() => {
    const data = sessionStorage.getItem("jsonToView");
    setJson(data || "No hay datos para mostrar");
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopyLabel("Copiado");
      setTimeout(() => setCopyLabel("Copiar JSON"), 1200);
    } catch (error) {
      setCopyLabel("No se pudo copiar");
      setTimeout(() => setCopyLabel("Copiar JSON"), 1200);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          marginBottom: "12px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        {copyLabel}
      </button>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          padding: "20px",
          fontSize: "14px",
          background: "#f4f4f4",
          borderRadius: "8px",
          overflowX: "auto",
          margin: 0,
          wordBreak: "break-word",
        }}
      >
        {json}
      </pre>
    </div>
  );
}
