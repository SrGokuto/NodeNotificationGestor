import Notificacion from "./Notificacion"

export class NotificacionAlerta extends Notificacion {
    constructor(id: number, mensaje: string) {
        super(id, mensaje)
    }

    enviar() {
        console.log("⚠️ Notificación de Alerta: " + this.mensaje)
    }
}

export default NotificacionAlerta;
