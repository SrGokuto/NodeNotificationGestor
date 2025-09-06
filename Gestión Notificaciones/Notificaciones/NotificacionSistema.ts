import Notificacion from "./Notificacion"

export class NotificacionSistema extends Notificacion {
    constructor(id: number, mensaje: string) {
        super(id, mensaje)
    }

    enviar() {
        console.log("💻 Notificación del Sistema: " + this.mensaje)
    }
}

export default NotificacionSistema;