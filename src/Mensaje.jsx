function Mensaje(props) {
  const claseCSS = props.rol === "usuario" ? "msg-usuario" : "msg-ia"; 
  const nombreCaja = props.rol === "usuario" ? "EXPLORADOR" : "EGIPTÓLOGO";

  return (
    <div className={claseCSS}>
      {/* Si es la IA, le ponemos el estilo de Cartucho Egipcio al nombre */}
      {props.rol === "ia" ? (
        <span className="cartucho-ia"><b>{nombreCaja}</b></span>
      ) : (
        <b>{nombreCaja}</b>
      )}
      <br />
      <p className="texto-mensaje">{props.texto}</p>
    </div>
  );
}

export default Mensaje;
