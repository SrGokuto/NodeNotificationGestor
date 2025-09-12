# Informe sobre principios SRP y OCP 

## Análisis de las Clases

En el proyecto se identifican las siguientes clases relacionadas con notificaciones:
- `Notificacion` (base)
- `NotificacionAlerta`
- `NotificacionSistema`
- `NotificacionUsuario`

Cada clase representa un tipo específico de notificación y hereda de la clase base `Notificacion`. Por ejemplo, `NotificacionAlerta` implementa el método `enviar` para mostrar un mensaje de alerta.


### Definicon SRP y OCP
El **Principio de Responsabilidad Única** establece que una clase debe tener una única razón para cambiar, es decir, debe estar enfocada en una sola responsabilidad.
El **Principio de Abierto-Cerrado** indica que las entidades de software deben estar abiertas para extensión pero cerradas para modificación.


# Evaluación Notificacion SRP y OCP

## Single Responsibility

### Diagnóstico: No cumple.
### Justificación: La clase mezcla dos responsabilidades distintas.
  1. Modelo de datos y estado *(id, mensaje, leida, método marcarLeida)*.
  2. Presentación/salida por consola *(mostrar y el console.log dentro de marcarLeida)*.
Esto genera razones de cambio distintas: si cambia la forma de almacenar el estado de la notificación → se modifica esta clase; y si cambia la forma de mostrar la información.

### Riesgo si se mantiene así:
- Alto acoplamiento entre lógica de negocio y presentación.
- Pruebas frágiles porque para validar estado de la notificación también se imprime en consola.
- Dificultad para extender o migrar la lógica de visualización a otro medio.

### Posible Solución

```ts
class Notificacion {
    id: number
    mensaje: string
    leida: boolean

    constructor(id: number, mensaje: string) {
        this.id = id
        this.mensaje = mensaje
        this.leida = false
    }

    marcarLeida() {
        this.leida = true
    }
}

export default Notificacion;
```
  

## Open/Closed

### Diagnóstico: No cumple.
### Justificación: La clase no está pensada para extensión sin modificación.
  1. Usa directamente *console.log*, lo que obliga a modificar el código cada vez que cambie el medio de presentación.
  2. No utiliza interfaces o estrategias de salida que permitan inyectar distintos comportamientos sin tocar la clase.

### Riesgo si se mantiene así:
- Cada cambio en el formato de salida rompe el principio *Open/Closed*.
- Se pierde reutilización: la clase no puede usarse en un contexto distinto sin modificar su código base.

### Posible Solución

```ts
import Notificacion from "./Notificacion"

// Interfaz de salida
interface EstrategiaSalida {
    mostrar(notificacion: Notificacion): void
}

// Estrategia 1: salida por consola
class SalidaConsola implements EstrategiaSalida {
    mostrar(notificacion: Notificacion): void {
        console.log(`[${notificacion.id}] ${notificacion.mensaje} - Leída: ${notificacion.leida}`)
    }
}

// Estrategia 2: salida como JSON (ejemplo API)
class SalidaJSON implements EstrategiaSalida {
    mostrar(notificacion: Notificacion): void {
        console.log(JSON.stringify({
            id: notificacion.id,
            mensaje: notificacion.mensaje,
            leida: notificacion.leida
        }))
    }
}

// Servicio que usa la estrategia
class NotificacionPrinter {
    private estrategia: EstrategiaSalida

    constructor(estrategia: EstrategiaSalida) {
        this.estrategia = estrategia
    }

    imprimir(notificacion: Notificacion) {
        this.estrategia.mostrar(notificacion)
    }
}
```
### Recomendaciones: Separar responsabilidades, Notificacion solo debería encargarse de datos y estado.

# Evaluación NotificacionAlerta SRP y OCP

## Single Responsibility

### Diagnóstico: No cumple.
### Justificación
- La clase debería representar solo una notificación de tipo Alerta.
- Pero además está implementando la lógica de envío *(console.log)*.
- Eso mezcla dos responsabilidades:
    1. Ser el modelo de una notificación de alerta.
    2. Decidir cómo se envía *(presentación)*.

### Riesgo si se mantiene así:
- Si cambia el medio de envío (email, SMS, API, archivo de logs), habría que modificar esta clase directamente.
- Esto genera acoplamiento fuerte y pruebas frágiles.

### Posible solución

```ts
import Notificacion from "./Notificacion"

export class NotificacionAlerta extends Notificacion {
    constructor(id: number, mensaje: string) {
        super(id, mensaje)
    }
}

export default NotificacionAlerta
```


## Open/Closed 

### Diagnóstico: No cumple.
### Justificación
- No está preparada para extender sin modificar.
- Solo admite console.log como medio de envío.
- Si quieres soportar múltiples salidas, habría que cambiar el código de la clase.

### Riesgo si se mantiene así:
- *Violación del principio OCP*: cada nuevo tipo de envío implica cambiar la clase.
- Afecta la mantenibilidad a largo plazo.

### Posible solución

```ts
import NotificacionAlerta from "./NotificacionAlerta"
import { EstrategiaEnvio } from "./EstrategiaEnvio"

// Estrategia: envío de alerta por consola
class EnvioAlertaConsola implements EstrategiaEnvio {
    enviar(notificacion: NotificacionAlerta): void {
        console.log("⚠️ Notificación de Alerta: " + notificacion.mensaje)
    }
}

export default EnvioAlertaConsola

```





### Evaluación del SRP (NotificacionSistema)
### 1. Clase base (Notificacion)

Encapsula los atributos comunes (id, mensaje).

Define el contrato que obliga a implementar enviar().
Tiene una sola responsabilidad: ser la abstracción de cualquier notificación.

2. Clase derivada (NotificacionSistema)

Solo redefine enviar() para mostrar cómo se envía un mensaje del sistema.

Razón de cambio única: si en el futuro cambia la forma en que se muestran las notificaciones del sistema.
Cumple con el SRP, porque no mezcla otras tareas (ejemplo: guardar en base de datos, enviar correo, registrar logs).
La clase tiene una única responsabilidad: definir el comportamiento de una notificación de tipo sistema.

 En conclucion 
 Si cambian otras cosas (persistence, interfaz gráfica, notificaciones push, etc.), esta clase no tendría que modificarse.
Cada clase hija (NotificacionAlerta, NotificacionSistema, NotificacionUsuario) tiene su propia razón de cambio y no afecta a las demás.


¿Qué pasaría si no se aplicara bien?
El SRP se rompería si, por ejemplo, NotificacionSistema también:
Guardara la notificación en base de datos.
Registrara logs de auditoría.
Manejara la configuración de notificaciones.
En ese caso, la solución es separar las responsabilidades:

```ts
// Servicio para enviar
export class ServicioEnvio {
    enviar(notificacion: Notificacion) {
        notificacion.enviar();
    }
}

// Servicio para persistencia
export class RepositorioNotificaciones {
    guardar(notificacion: Notificacion) {
        console.log("📦 Guardando en la base de datos:", notificacion);
    }
}
```

De esta forma:
* NotificacionSistema solo define el mensaje y du envio
* los servicios externos se encargan de prsistir o de gestionar envios mas complejos. 


### Evaluación del SRP (NotificacionUsuario)


1. Clase base Notificacion

Encapsula los atributos comunes (id, mensaje).
Define la interfaz/contrato del método enviar().
Tiene una sola responsabilidad: representar una notificación genérica.

2. Clase hija NotificacionUsuario

Implementa únicamente la forma de enviar una notificación dirigida al usuario.
Razón de cambio única: si en el futuro cambia la forma en que los usuarios reciben sus notificaciones (ej. de consola → correo → push).
Cumple el SRP porque no mezcla responsabilidades adicionales.

Conclucion
La clase tiene una sola responsabilidad: enviar notificaciones específicas para usuarios.
No está mezclando tareas como persistencia, logging o manejo de configuración.
Cambios en otro tipo de notificación (alerta, sistema) no afectan esta clase.

¿Qué pasaría si no se aplicara bien?
El SRP se rompería si NotificacionUsuario también se encargara de:
Guardar la notificación en base de datos.
Validar usuarios o gestionar permisos.
Definir la lógica de envío (ej. correo, SMS, push) directamente aquí.

```ts
// Servicio que gestiona el envío
export class ServicioEnvio {
    enviar(notificacion: Notificacion) {
        notificacion.enviar();
    }
}

// Servicio que gestiona persistencia
export class RepositorioNotificaciones {
    guardar(notificacion: Notificacion) {
        console.log("📦 Guardando en la base de datos:", notificacion);
    }
}
```
De esta forma 
* si se aplica bien el SRP
* motivo: tiene una sola razon de cambio , como se entrga el mensaje al ususario
* so no se aplicara bien : separar la logica en servicios especialisados para persistencia , envio masivo ,etc
   
  





}
```
