//componete: Sidebar (Menu Lateral)
function Sidebar() {
    //Este componentte no tienedd logica compleja,
    //solo devuelve la estructura visual
    return (
        //Recuerda: Convertimos el <aside class="sidebar">
        //del viejo HTML a className
        <aside className="sidebar">
            <div className="logo-area">
                <h2>IA Master</h2                >
            </div>
            <nav className="menu-lateral">
                <button>+ Nuevo Chat</button>
                <div className="historial">
                    <p>Historial reciente...</p>
                    <ul>
                        <li>¿Como hacer dieta?</li>
                        <li>Receta de pizza</li>
                    </ul>                                          
                 </div>
            </nav>

            <div className="perfil">
                <span>Usuario Pro</span>
            </div>
        </aside>
    )
} 
export default Sidebar;
