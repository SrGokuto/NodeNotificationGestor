import Notificacion  from "./Notificacion"

export class NotificacionUsuario extends Notificacion {
    constructor(id: number, mensaje: string) {
        super(id, mensaje)
    }

    enviar() {
        console.log("👤 Notificación para Usuario: " + this.mensaje)
    }
}

export default NotificacionUsuario;