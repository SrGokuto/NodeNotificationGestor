# Informe sobre el Principio de Responsabilidad Única (SRP)

## Análisis de las Clases

En el proyecto se identifican las siguientes clases relacionadas con notificaciones:
- `Notificacion` (base)
- `NotificacionAlerta`
- `NotificacionSistema`
- `NotificacionUsuario`

Cada clase representa un tipo específico de notificación y hereda de la clase base `Notificacion`. Por ejemplo, `NotificacionAlerta` implementa el método `enviar` para mostrar un mensaje de alerta.


### Evaluación del SRP 
El **Principio de Responsabilidad Única** establece que una clase debe tener una única razón para cambiar, es decir, debe estar enfocada en una sola responsabilidad.

#### ¿Se aplica bien?
- **Sí, se aplica correctamente.**
- Cada clase hija (`NotificacionAlerta`, `NotificacionSistema`, `NotificacionUsuario`) tiene la responsabilidad única de definir el comportamiento de envío para su tipo de notificación.
- La clase base `Notificacion` encapsula los atributos y métodos comunes, mientras que las clases derivadas se encargan de la lógica específica de cada tipo.

### Evaluación del SRP (Notificacion)
La clase base Notificacion si cumple con SRP.
- La clase solo tiene una responsabilidad:
- Representar una notificación y permitir cambiar su estado *(de no leída a leída)*.
- No mezcla otras tareas como mostrar en consola, enviar por email o decidir cómo se notifica.
- Sus métodos *(constructor y marcarLeida)* están enfocados únicamente en gestionar datos internos de la notificación.

#### ¿Por qué cumple SRP?
- Modelo de datos → atributos `id, mensaje, leida`.
- Lógica mínima del estado → `marcarLeida`.

#### Propuesta de mejora
Podrías evitar que se cambie el *id* o el *mensaje* después de creado, porque lo normal es que una notificación tenga un mensaje fijo.

```ts
class Notificacion {
    readonly id: number
    readonly mensaje: string
    private _leida: boolean

    constructor(id: number, mensaje: string) {
        this.id = id
        this.mensaje = mensaje
        this._leida = false
    }

    marcarLeida() {
        this._leida = true
    }

    get leida() {
        return this._leida
    }
}
```
Así, el *mensaje* nunca cambia, y el estado leida se controla solo con el método.


### Evaluación del SRP (NotificacionAlerta)
La clase NotificacionAlerta no cumple con SRP.
- Por un lado, la clase representa una notificación de tipo alerta *(su responsabilidad principal)*.
- Pero también se encarga de definir cómo se envía *(en este caso, imprimiendo en consola con console.log)*.

#### ¿Por qué no cumple SRP?
Tal como está, NotificacionAlerta no cumple SRP, porque mezcla modelo *(qué es la notificación)* con acción *(cómo se envía)*.

#### Propuesta de mejora
La solución es separar responsabilidades: la clase se encarga de ser el modelo, y los servicios/estrategias externos se encargan del envío.

`1. Solución`
Dejar a la clase solo como modelo de datos *(cumpliendo SRP)*.

```ts
import Notificacion from "./Notificacion"

export class NotificacionAlerta extends Notificacion {
    constructor(id: number, mensaje: string) {
        super(id, mensaje)
    }
}

export default NotificacionAlerta
```

`2. Solución`
Crear un servicio de envío *(responsabilidad aparte)*.

```ts
import Notificacion from "./Notificacion"

class EnvioConsola {
    enviar(notificacion: Notificacion) {
        console.log("⚠️ Notificación de Alerta: " + notificacion.mensaje)
    }
}

export default EnvioConsola
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
