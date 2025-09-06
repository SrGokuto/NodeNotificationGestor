class Notificacion {
    id: number
    mensaje: string
    leida: boolean

    constructor(id: number, mensaje: string) {
        this.id = id
        this.mensaje = mensaje
        this.leida = false
    }

    mostrar() {
        console.log(`[${this.id}] ${this.mensaje} - Leída: ${this.leida}`)
    }

    marcarLeida() {
        this.leida = true
        console.log(`Notificación ${this.id} marcada como leída`)
    }
}

export default Notificacion;