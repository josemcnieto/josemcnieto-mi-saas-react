//componente principal: App
//1.Importamos la hoja de estilos App.css
import './App.css';
//2. Importamos las dos grandes mitades de nuestra pantalla
import sidebar from './Sidebar';
importchatArea from './ChatArea';
function App(){
  return(
    //contenedor principal que usa flexbox(definido en el App.css)
    //para poner las cosas lado a lado
    <div className='app-container'>
      {/*Inyectamos la mitad izquierda a la pantalla*/}
      <sidebar />
      {/* Inyectamos la mitad derecha de la pantalla*/}
      <ChatArea />
      
    </div>
  )
}

export default App

