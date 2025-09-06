import { input, select } from "@inquirer/prompts"
import { User } from "./Types/types.js"
import Notificacion from "./Notificaciones/Notificacion"
import NotificacionUsuario from "./Notificaciones/NotificacionUsuario"
import NotificacionAlerta from "./Notificaciones/NotificacionAlerta"
import NotificacionSistema from "./Notificaciones/NotificacionSistema"

console.log("Bienvenido al sistema de notificaciones")

let notificaciones: Notificacion[] = []
let contadorId = 1

async function main() {
    let jugador: User = { username: "" }

    
    while (true) {
        const nombre = await input({ message: "Digite su nombre de usuario:" })
        if (nombre.trim() === "") {
            console.log("Nombre no válido, intente de nuevo")
        } else {
            jugador.username = nombre
            break
        }
    }

    console.clear()
    console.log("Bienvenido " + jugador.username)

    
    while (true) {
        const opcion = await select({
            message: "Elija una opción:",
            choices: [
                { name: "Ver notificaciones", value: "ver" },
                { name: "Crear notificación", value: "crear" },
                { name: "Marcar como leída", value: "leer" },
                { name: "Eliminar notificación", value: "eliminar" },
                { name: "Salir", value: "salir" }
            ]
        })

        if (opcion === "ver") {
            if (notificaciones.length === 0) {
                console.log("No hay notificaciones")
            } else {
                notificaciones.forEach(n => n.mostrar())
            }

        } else if (opcion === "crear") {
            const mensaje = await input({ message: "Escriba la notificación:" })
            const tipo = await select({
                message: "Seleccione el tipo:",
                choices: [
                    { name: "Notificación de Usuario", value: "usuario" },
                    { name: "Notificación de Alerta", value: "alerta" },
                    { name: "Notificación de Sistema", value: "sistema" }
                ]
            })

            let nueva: Notificacion
            if (tipo === "usuario") {
                nueva = new NotificacionUsuario(contadorId++, mensaje)
            } else if (tipo === "alerta") {
                nueva = new NotificacionAlerta(contadorId++, mensaje)
            } else {
                nueva = new NotificacionSistema(contadorId++, mensaje)
            }

            notificaciones.push(nueva)
            nueva.mostrar()
            ;(nueva as any).enviar?.()
            console.log("✅ Notificación creada")

        } else if (opcion === "leer") {
            if (notificaciones.length === 0) {
                console.log("No hay nada para marcar")
                continue
            }
            const idStr = await input({ message: "Digite el ID a marcar como leída:" })
            const id = parseInt(idStr)
            const noti = notificaciones.find(n => n.id === id)
            if (noti) {
                noti.marcarLeida()
            } else {
                console.log("No se encontró esa notificación")
            }

        } else if (opcion === "eliminar") {
            if (notificaciones.length === 0) {
                console.log("No hay nada para eliminar")
                continue
            }
            const idStr = await input({ message: "Escriba el ID a eliminar:" })
            const id = parseInt(idStr)
            notificaciones = notificaciones.filter(n => n.id !== id)
            console.log("Notificación eliminada")

        } else if (opcion === "salir") {
            console.log("Adiós 👋")
            break
        }
    }
}

main()
