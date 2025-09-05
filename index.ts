import { input, select, password } from "@inquirer/prompts"
import { User, Notificacion } from "./types/types.ts"
console.log("Bienvenido usuario al sistema de gestión de notificaciones");
while (true) {
    let jugador:User = "";
    while (true) {
        jugador = await input({ message: "Por favor, digite su nombre de usuario:" })
        if (jugador == "") {
            console.log("Nombre de usuario no valido, por favor, intentelo de nuevo")
        }
        else {
            break;
        }
    }
    console.clear();
    console.log("Bienvenido al sistema " + jugador + "!");
    console.log("")
    
}
