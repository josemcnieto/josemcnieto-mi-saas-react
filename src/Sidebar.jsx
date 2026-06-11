function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo-area">
        <h2>Egipto IA</h2>
      </div>
      <nav className="menu-lateral">
        <button>+ Nueva Excavación</button>
        <div className="historial">
          <p>Cámaras descubiertas...</p>
          <ul>
            <li>Valle de los Reyes</li>
            <li>Jeroglíficos de Saqqara</li>
          </ul>                                                    
         </div>
      </nav>

      <div className="perfil">
        <span>Explorador</span>
      </div>
    </aside>
  );
} 

export default Sidebar;
