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



# Evaluacion NotificacionSistema SRP y  OCP

## Single Responsibility
1. Diagnóstico

La clase NotificacionSistema hereda de Notificacion y redefine el método enviar().

Cumple parcialmente con el Principio de Responsabilidad Única (SRP), porque su única función es representar y enviar notificaciones del sistema.

Cumple parcialmente con el Principio Abierto/Cerrado (OCP), ya que extiende Notificacion sin modificarla, pero su método enviar() depende directamente de console.log, lo que limita su extensión hacia otros canales (ej. email, SMS, etc.).



---

2. Justificación

✅ A favor SRP: La clase está enfocada en un solo tipo de notificación (sistema).

⚠️ En contra OCP: Si se necesita enviar la notificación del sistema a otro medio (correo, base de datos, API externa), habría que modificar la clase directamente en lugar de extender su comportamiento.



---

3. Riesgo identificado

Rigidez del código: La dependencia de console.log hace que la clase no sea fácilmente escalable ni adaptable a otros mecanismos de envío.

Violación futura de OCP: Cada nuevo tipo de salida obligará a cambiar enviar(), rompiendo el principio de extensión sin modificación.



---

4. Posible solución propuesta

Implementar un patrón estrategia o inyectar una interfaz de envío para abstraer el mecanismo de notificación.

Ejemplo de mejora:
// Definimos una interfaz para el envío
interface IEnviador {
    enviar(mensaje: string): void;
}
```ts
// Implementación concreta (ejemplo: consola)
class EnviadorConsola implements IEnviador {
    enviar(mensaje: string): void {
        console.log("💻 Notificación del Sistema: " + mensaje);
    }
}

// Clase NotificacionSistema mejorada
import Notificacion from "./Notificacion"

export class NotificacionSistema extends Notificacion {
    private enviador: IEnviador;

    constructor(id: number, mensaje: string, enviador: IEnviador) {
        super(id, mensaje);
        this.enviador = enviador;
    }

    enviar() {
        this.enviador.enviar(this.mensaje);
    }
}
```
# Evaluacion Notificacionusuario  SRP y  OCP
1. Diagnóstico

La clase NotificacionUsuario extiende de Notificacion y sobrescribe el método enviar() para personalizar el mensaje dirigido a usuarios. A primera vista cumple el Principio de Responsabilidad Única (SRP) y respeta el Principio Abierto/Cerrado (OCP), ya que especializa el comportamiento sin modificar la clase base.


---

2. Justificación

Correcto:

Se mantiene la herencia de la clase padre Notificacion, reutilizando atributos comunes (id y mensaje).

La clase se especializa en un tipo específico de notificación: para usuarios.

El método enviar() personaliza la lógica de salida con un ícono y formato claro.


Posible mejora:

Actualmente, el método enviar() depende de console.log, lo que lo hace rígido para escenarios más avanzados (ej. envío por correo, push notification, SMS).

Si en el futuro se requieren múltiples canales, la clase podría violar el SRP al manejar demasiada lógica de salida.




---

3. Riesgo

Si cada subclase (NotificacionSistema, NotificacionUsuario, NotificacionEmail, etc.) define su propia lógica interna de enviar(), se corre el riesgo de duplicación de código y dificultad para escalar.

Se vuelve difícil mantener el sistema si mañana se decide cambiar el medio de envío (por ejemplo, pasar de console.log a un servicio externo).



---

4. Posible Solución

Aplicar el Patrón Estrategia o Inversión de Dependencias (DIP):

Definir una interfaz CanalNotificacion con un método enviar(mensaje: string).

Crear implementaciones concretas: CanalConsola, CanalEmail, CanalPush, etc.

Inyectar la estrategia en el constructor de NotificacionUsuario.


✅ Ejemplo ajustado:

```ts
interface CanalNotificacion {
    enviar(mensaje: string): void;
}

class CanalConsola implements CanalNotificacion {
    enviar(mensaje: string): void {
        console.log("👤 Notificación para Usuario: " + mensaje);
    }
}

import Notificacion from "./Notificacion"

export class NotificacionUsuario extends Notificacion {
    private canal: CanalNotificacion;

    constructor(id: number, mensaje: string, canal: CanalNotificacion) {
        super(id, mensaje);
        this.canal = canal;
    }

    enviar() {
        this.canal.enviar(this.mensaje);
    }
}


```
