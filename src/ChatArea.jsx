import { useState } from "react";
import Mensaje from "./Mensaje";

function ChatArea() {
  // 🧠 ZONA DE MEMORIA (ESTADOS)
  const [textoInput, setTextoInput] = useState("");
  const [listaMensajes, setListaMensajes] = useState([
    {
      rol: "ia",
      texto: "Soy el Egiptólogo real del Valle de los Reyes. ¿Qué misterio de las arenas deseas que descifremos hoy?",
    },
  ]);

  // ⚙️ ZONA DE LÓGICA (ACCIONES - GROQ API)
  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    if (textoInput.trim() === "") return;

    const promptUsuario = textoInput;
    const mensajeUsuario = { rol: "usuario", texto: promptUsuario };

    // Mostramos el mensaje del usuario inmediatamente y el estado de carga
    setListaMensajes([
      ...listaMensajes,
      mensajeUsuario,
      { rol: "ia", texto: "Descifrando papiros a la velocidad de la luz..." },
    ]);
    setTextoInput("");

    try {
      const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
      const URL = "https://api.groq.com/openai/v1/chat/completions";

      const respuesta = await fetch(URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "Eres un experto egiptólogo, especialmente centrado en El Valle de los Reyes. Tus reglas son: 1. Debes responder sobre datos históricos o artísticos del Antiguo Egipto, incluyendo textos y traducciones de jeroglíficos. 2. Si el usuario te pregunta sobre programación, política actual, fitness o cualquier otro tema ajeno, debes responder con cortesía arqueológica: '¡Por las barbas de Osiris! Ese conocimiento no pertenece a las crónicas de las dinastías egipcias. Por favor, viajero, pregúntame mejor sobre pirámides, faraones o dioses del Nilo.'"
            },
            { role: "user", content: promptUsuario },
          ],
          temperature: 0.7,
        }),
      });

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        console.error("Error de Groq:", datos);
        throw new Error(datos.error?.message || "La API de Groq rechazó la conexión");
      }

      const textoIA = datos.choices[0].message.content;
      const mensajeIA = { rol: "ia", texto: textoIA };

      setListaMensajes((listaActual) => {
        const listaSinPensando = listaActual.slice(0, -1);
        return [...listaSinPensando, mensajeIA];
      });
    } catch (error) {
      console.error("Error conectando con Groq:", error);
      setListaMensajes((listaActual) => {
        const listaSinPensando = listaActual.slice(0, -1);
        return [
          ...listaSinPensando,
          { rol: "ia", texto: `❌ La maldición del faraón ha bloqueado la red: ${error.message}` },
        ];
      });
    }
  };

  return (
    <main className="chat-area">
      <section className="mensajes-container" id="caja-mensajes">
        {listaMensajes.map((msg, indice) => (
          <Mensaje key={indice} rol={msg.rol} texto={msg.texto} />
        ))}
      </section>

      <footer className="input-area">
        <form className="chat-form" onSubmit={manejarEnvio}>
          <input
            type="text"
            id="mensaje-input"
            placeholder="Pregúntale al egiptólogo..."
            autoComplete="off"
            value={textoInput}
            onChange={(evento) => setTextoInput(evento.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>
      </footer>
    </main>
  );
}

export default ChatArea;
