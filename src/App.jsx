import './App.css';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';

function App() {
  return (
    // Contenedor principal que usa flexbox para poner las dos columnas lado a lado
    <div className='app-container'>
      {/* Inyectamos la mitad izquierda (Menú de excavación) */}
      <Sidebar />
      
      {/* Inyectamos la mitad derecha (Zona del oráculo/chat) */}
      <ChatArea />
    </div>
  );
}

export default App;
