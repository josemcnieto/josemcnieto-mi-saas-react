import { useState, useRef, useEffect } from "react";
import Mensaje from "./Mensaje";

function ChatArea() {
  const [textoInput, setTextoInput] = useState("");
  const [listaMensajes, setListaMensajes] = useState([
    {
      rol: "ia",
      texto: "Soy el Egiptólogo real del Valle de los Reyes. ¿Qué misterio de las arenas deseas que descifremos hoy?",
    },
  ]);
  
  // 🎤 Estados para la funcionalidad de voz
  const [escuchando, setEscuchando] = useState(false);
  const [soportaVoz, setSoportaVoz] = useState(true);
  const [vozActivada, setVozActivada] = useState(true); // 🆕 Control de voz de salida
  const reconocimientoRef = useRef(null);
  const sintesisRef = useRef(null);

  // 🆕 Función para hablar (respuesta por voz)
  const hablar = (texto) => {
    if (!vozActivada) return;
    
    // Detener cualquier voz en curso
    if (sintesisRef.current) {
      window.speechSynthesis.cancel();
    }
    
    // Crear nueva utterance
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "es-ES";
    utterance.rate = 0.9; // Velocidad ligeramente más lenta (voz de egiptólogo)
    utterance.pitch = 1.1; // Tono un poco más grave
    utterance.volume = 1;
    
    // Seleccionar voz española si está disponible
    const setSpanishVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(voice => 
        voice.lang.includes('es-') || voice.lang.includes('Spanish')
      );
      if (spanishVoice) utterance.voice = spanishVoice;
    };
    
    setSpanishVoice();
    window.speechSynthesis.speak(utterance);
    sintesisRef.current = utterance;
  };

  // ⚙️ Inicializar reconocimiento de voz al cargar el componente
  useEffect(() => {
    // Verificar si el navegador soporta reconocimiento de voz
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setSoportaVoz(false);
      console.warn("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    // Crear instancia del reconocimiento
    reconocimientoRef.current = new SpeechRecognition();
    reconocimientoRef.current.continuous = false;
    reconocimientoRef.current.interimResults = false;
    reconocimientoRef.current.lang = "es-ES";

    // Manejar resultados
    reconocimientoRef.current.onresult = (event) => {
      const transcripcion = event.results[0][0].transcript;
      setTextoInput(transcripcion);
      setEscuchando(false);
      
      // Enviar automáticamente después de 500ms
      setTimeout(() => {
        if (transcripcion.trim()) {
          const form = document.querySelector('.chat-form');
          if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      }, 500);
    };

    // Manejar errores
    reconocimientoRef.current.onerror = (event) => {
      console.error("Error en reconocimiento de voz:", event.error);
      setEscuchando(false);
      
      let mensajeError = "";
      switch(event.error) {
        case "not-allowed":
          mensajeError = "🔇 Por favor, permite el acceso al micrófono para usar voz";
          break;
        case "no-speech":
          mensajeError = "🎙️ No te escuché, ¿podrías repetir?";
          break;
        default:
          mensajeError = "❓ Error al capturar voz";
      }
      
      if (mensajeError) {
        const errorMsg = { 
          rol: "ia", 
          texto: `¡Por Ra! ${mensajeError}`
        };
        setListaMensajes(prev => [...prev, errorMsg]);
        hablar(errorMsg.texto); // 🆕 Hablar el error
      }
    };

    // Limpiar al desmontar
    return () => {
      if (reconocimientoRef.current) {
        reconocimientoRef.current.abort();
      }
      window.speechSynthesis.cancel(); // 🆕 Cancelar cualquier voz al desmontar
    };
  }, []);

  // 🆕 Efecto para hablar automáticamente cuando llegue respuesta de la IA
  useEffect(() => {
    const ultimoMensaje = listaMensajes[listaMensajes.length - 1];
    if (ultimoMensaje && ultimoMensaje.rol === "ia" && vozActivada) {
      // Evitar hablar el mensaje de "Descifrando papiros..."
      if (!ultimoMensaje.texto.includes("Descifrando papiros") && 
          !ultimoMensaje.texto.includes("❌") &&
          !ultimoMensaje.texto.includes("Por Ra!")) {
        hablar(ultimoMensaje.texto);
      }
    }
  }, [listaMensajes, vozActivada]);

  // 🎤 Función para iniciar/parar reconocimiento de voz
  const toggleVoz = () => {
    if (!soportaVoz) {
      const errorMsg = "⚠️ Tu navegador no soporta reconocimiento de voz. Prueba con Chrome, Edge o Safari.";
      setListaMensajes(prev => [...prev, { rol: "ia", texto: errorMsg }]);
      hablar(errorMsg);
      return;
    }

    if (escuchando) {
      reconocimientoRef.current?.abort();
      setEscuchando(false);
    } else {
      try {
        reconocimientoRef.current?.start();
        setEscuchando(true);
      } catch (error) {
        console.error("Error al iniciar voz:", error);
        setEscuchando(false);
      }
    }
  };

  // 🆕 Alternar voz de salida
  const toggleVozSalida = () => {
    setVozActivada(!vozActivada);
    if (!vozActivada) {
      hablar("Voz del Egiptólogo activada. Ahora podrás escuchar mis respuestas.");
    } else {
      window.speechSynthesis.cancel();
    }
  };

  // ⚙️ ZONA DE LÓGICA (GROQ API)
  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    if (textoInput.trim() === "") return;

    const promptUsuario = textoInput;
    const mensajeUsuario = { rol: "usuario", texto: promptUsuario };

    setListaMensajes([
      ...listaMensajes,
      mensajeUsuario,
      { rol: "ia", texto: "📜 Descifrando papiros a la velocidad de la luz..." },
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
      const errorMsg = `❌ La maldición del faraón ha bloqueado la red: ${error.message}`;
      setListaMensajes((listaActual) => {
        const listaSinPensando = listaActual.slice(0, -1);
        return [
          ...listaSinPensando,
          { rol: "ia", texto: errorMsg },
        ];
      });
      hablar(errorMsg); // 🆕 Hablar el error
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
            placeholder={escuchando ? "🎙️ Escuchando..." : "Pregúntale al egiptólogo..."}
            autoComplete="off"
            value={textoInput}
            onChange={(evento) => setTextoInput(evento.target.value)}
            className={escuchando ? "escuchando-activo" : ""}
          />
          
          {/* 🎤 Botón de entrada de voz */}
          <button 
            type="button" 
            className={`boton-voz ${escuchando ? 'activo' : ''}`}
            onClick={toggleVoz}
            title={escuchando ? "Detener grabación" : "Habla con el Egiptólogo"}
          >
            🎙️
          </button>
          
          {/* 🆕 Botón para activar/desactivar voz de salida */}
          <button 
            type="button" 
            className={`boton-voz-salida ${vozActivada ? 'activo' : ''}`}
            onClick={toggleVozSalida}
            title={vozActivada ? "Silenciar Egiptólogo" : "Escuchar al Egiptólogo"}
          >
            {vozActivada ? "🔊" : "🔇"}
          </button>
          
          <button type="submit">Enviar</button>
        </form>
      </footer>
    </main>
  );
}

export default ChatArea;
