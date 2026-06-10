//componente : Mensaje
//1. definimos el componente como una funcion tradicional de javascript
//la palabra 'props' (propiedades ) es un objeto que contine datos que le enviamos desde afuera
function Mensaje(props){
    //2. logica javascript antes del html
    //preguntabamos : ¿El rol que me han pasado por props es "usuario?"
    //si es si (?) , guardamos la clase "msg-usuario"(verde)
    //si es no(:), guardamos "msg-ia" (gris)
    const claseCSS = props.rol === "usuario" ? "msg-usuario" : "msg-ia"; 
    //hacemos lo mismo para el titulo que aparecera en negrita
    const nombreCaja = props.rol === "usuario" ? "USUARIO" : "IA MASTER";

    //3- la zona de renderizado (el return)
    //todo lo que vaya dentro del return es lo que React pintara en la pantalla(JSX)
    return(
        //immportante: en HTML normal usariamos 'class' , pero en React es OBLIGATORIO
        //usar 'className'
        //las llaves {clseCSS} le dicen a React: "Oye, esto no es un texto normal"
        //es una variable JS"
        <div className={claseCSS}>
            {/*inyectamos la variable nombreCaja en negrita*/}
            <b>{nombreCaja}</b>
            <br ></br>
            {/*inyectamos el texto del mensaje que nos han pasado en props*/}
            {props.texto}
        </div>
    )
}

    //4. exportar la pieza
    //si no ponemos esta linea los demas archivos no pordrian ver esta pieza de lego
    export default Mensaje;