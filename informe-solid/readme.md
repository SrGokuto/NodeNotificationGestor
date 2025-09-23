# Informe sobre principios SRP y OCP 

## Análisis de las Clases

En el proyecto se identifican las siguientes clases relacionadas con notificaciones:
- `Notificacion` (base)
- `NotificacionAlerta`
- `NotificacionSistema`
- `NotificacionUsuario`

Cada clase representa un tipo específico de notificación y hereda de la clase base `Notificacion`. Por ejemplo, `NotificacionAlerta` implementa el método `enviar` para mostrar un mensaje de alerta.


### Definicion SRP y OCP
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

## Conclusiones Generales

 - El diseño actual de las clases de notificación no cumple plenamente con los principios SOLID SRP (Responsabilidad Única) y OCP (Abierto/Cerrado).
 - El motivo principal es que las clases mezclan la lógica de datos/estado con la lógica de presentación o envío (por ejemplo, el uso directo de console.log dentro de los métodos).
 - Esto genera acoplamiento fuerte, dificulta la extensión y hace que cualquier cambio en el medio de salida requiera modificar las clases base y derivadas.



# Informe sobre LID

## Informe de Evaluación:Principio de Sustitución de Liskov (LSP)

Tenemos una clase base
```ts
class Notificacion { ... }
```

Tenemos tres subclases: 
```ts
export class NotificacionUsuario extends Notificacion { ... }  
export class NotificacionAlerta extends Notificacion { ... }  
export class NotificacionSistema extends Notificacion { ... }
```

El uso de index.ts:
```ts
let notificaciones: Notificacion[] = []
```
Y por último las instancias de las subclases:  
```ts
let nueva: Notificacion  
if (tipo === "usuario") {  
nueva = new NotificacionUsuario(...)  
} else if (tipo === "alerta") {  
nueva = new NotificacionAlerta(...)  
} else {  
nueva = new NotificacionSistema(...)  
}  
notificaciones.push(nueva)  
nueva.mostrar()  
;(nueva as any).enviar?.()
```

El problema por el que no se cumple Liskov es porque el método enviar no está definido en la clase base Notificación.  
Solo existe en las subclases, por ejemplo: 
```ts
enviar() {  
console.log("Notificación para Usuario: " + this.mensaje)  
}  
```

Entonces, cuando hago esto: 
```ts
;(nueva as any).enviar?.()  
```

Estoy forzando el uso de un método que no garantiza que exista en Notificación, lo que rompe LSP ya que la clase padre (Notificación) no define un contrato para ese comportamiento.  

Cómo solucionar esto:  
Agrega enviar() como un método en Notificación, y haz que todas las subclases lo sobrescriban. 
```ts
class Notificacion {  
...  
enviar() {  
console.log(`📨 Notificación: ${this.mensaje}`)  
}  
}  
```
Y en cada subclase: 
```ts
enviar() {  
console.log("👤 Notificación para Usuario: " + this.mensaje)  
}  
```
Y ahora puedes hacer:
```ts
nueva.enviar()  
```
Conclusión:  
¿Mi proyecto cumple con el principio de sustitución de Liskov?  
No, actualmente no cumple.  

Porque:  
Se invoca enviar() sobre objetos del tipo base (Notificación), pero ese método no está definido en la clase base.  
Se usa un "hack" (as any) para evitar errores de tipo.  

Recomendación:  
Define enviar en la clase base Notificación como método que puede ser sobrescrito por las subclases:  
```ts
class Notificacion {  
...  
enviar() {  
console.log(`📨 Notificación genérica: ${this.mensaje}`)  
}  
}
```

# Informe de Evaluación: I-Principio de segregacion de interfaces 

Una *clase* no debería estar obligada a implementar métodos que no necesita. En TypeScript/POO esto se traduce en: las interfaces deben ser pequeñas, específicas y enfocadas, para que las clases que las implementen no carguen con métodos innecesarios. 

## Análisis 

### 1. Clase base *Notificacion* 
- Tiene solo lo esencial: `id`, `mensaje`, `leida`, y métodos `mostrar()` y `marcarLeida()`.
- - Ningún hijo se ve obligado a sobrescribir nada que no necesite → **esto sí respeta ISP** . 

### 2. Clases hijas *(NotificacionAlerta, NotificacionSistema, NotificacionUsuario)* 
- Cada una hereda de Notificacion y agrega su propio comportamiento con el método enviar().
- Aquí hay un detalle: la clase padre no define el contrato de “enviar”, pero el código del index lo usa con (nueva as any).enviar?.().
- Eso es un “hack” que rompe el tipado y muestra que no hay una interfaz clara para notificaciones que se envían.

## Problema con ISP 
- Unas clases tienen enviar() y otras no, y por eso usas as any. Eso *viola ISP* porque el consumidor (el index) no sabe con certeza qué métodos puede usar.
  
## Si no cumplen, ¿cómo se pueden dividir en interfaces más pequeñas y cohesionadas?
Se podrían crear interfaces separadas y específicas, por ejemplo:

- `IMostrable` → con el método mostrar().
- `IMarcarLeida` → con el método marcarLeida().
- `IEnviable` → con el método enviar().

## Solución

** Antes
```ts
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
 ```

```ts
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
 ```

```ts
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
 ```

** Despues - Solución
```ts
interface IMostrable {
  mostrar(): void
}

interface IMarcarLeida {
  marcarLeida(): void
}

interface IEnviable {
  enviar(): void
}

 ```
---

# Informe de Evaluación: Dependency Inversion Principle (DIP)


**Dependency Inversion Principle** establece que:

1. Los módulos de alto nivel no deben depender de módulos de bajo nivel. Ambos deben depender de abstracciones.
2. Las abstracciones no deben depender de detalles. Los detalles deben depender de abstracciones.


## Análisis de Cumplimiento del DIP

###  **Aspectos que SÍ cumplen con DIP**

#### 1. Uso de Herencia y Polimorfismo
- **Buena práctica**: Las clases `NotificacionUsuario`, `NotificacionAlerta` y `NotificacionSistema` extienden la clase base `Notificacion`.
- **Cumplimiento DIP**: El código de alto nivel (main loop) depende de la abstracción `Notificacion` en lugar de las implementaciones concretas.

```typescript
//  El array usa la abstracción, no implementaciones concretas
let notificaciones: Notificacion[] = []

//  Llama métodos de la abstracción
notificaciones.forEach(n => n.mostrar())
```

#### 2. Polimorfismo en Acción
- **Fortaleza**: El método `mostrar()` y `marcarLeida()` se invocan polimórficamente sin importar el tipo específico de notificación.

###  **Violaciones del DIP Identificadas**

#### 1. **Violación Principal: Dependencias Directas en el Módulo Principal**

El archivo `index.ts` (módulo de alto nivel) tiene dependencias directas de implementaciones concretas:

```typescript
//  VIOLACIÓN DIP: Depende directamente de clases concretas
import NotificacionUsuario from "./Notificaciones/NotificacionUsuario"
import NotificacionAlerta from "./Notificaciones/NotificacionAlerta"
import NotificacionSistema from "./Notificaciones/NotificacionSistema"

//  VIOLACIÓN DIP: Instanciación directa de clases concretas
if (tipo === "usuario") {
    nueva = new NotificacionUsuario(contadorId++, mensaje)
} else if (tipo === "alerta") {
    nueva = new NotificacionAlerta(contadorId++, mensaje)
} else {
    nueva = new NotificacionSistema(contadorId++, mensaje)
}
```

**Problema**: El módulo principal conoce y depende de todas las implementaciones concretas.

#### 2. **Falta de Abstracciones para Creación de Objetos**

- No existe un patrón Factory o Abstract Factory
- No hay interfaces que definan contratos
- La lógica de creación está acoplada al código principal

#### 3. **Método `enviar()` No Está en la Abstracción**

```typescript
//  VIOLACIÓN DIP: Casting para acceder a método no abstracto
;(nueva as any).enviar?.()
```

**Problema**: El método `enviar()` existe en las clases concretas pero no en la abstracción base.

### 1. **Crear Interfaces y Abstracciones**

```typescript
// Propuesta: Interface para notificaciones
interface INotificacion {
    id: number;
    mensaje: string;
    leida: boolean;
    mostrar(): void;
    marcarLeida(): void;
    enviar(): void; // ¡Incluir en la abstracción!
}

// Propuesta: Interface para factory
interface INotificacionFactory {
    crear(tipo: string, id: number, mensaje: string): INotificacion;
}
```

### 2. **Implementar Factory Pattern**

```typescript
// Propuesta: Factory para desacoplar creación
class NotificacionFactory implements INotificacionFactory {
    crear(tipo: string, id: number, mensaje: string): INotificacion {
        switch(tipo) {
            case "usuario": return new NotificacionUsuario(id, mensaje);
            case "alerta": return new NotificacionAlerta(id, mensaje);
            case "sistema": return new NotificacionSistema(id, mensaje);
            default: throw new Error("Tipo no soportado");
        }
    }
}
```

### 3. **Inyección de Dependencias**

```typescript
// Propuesta: Main class que recibe dependencias
class GestorNotificaciones {
    constructor(private factory: INotificacionFactory) {}
    
    async crearNotificacion(tipo: string, mensaje: string): Promise<INotificacion> {
        const nueva = this.factory.crear(tipo, this.contadorId++, mensaje);
        // ... resto de lógica
        return nueva;
    }
}
```

### 4. **Refactoring del Archivo Principal**

El `index.ts` debería:
- Solo importar interfaces/abstracciones
- Usar inyección de dependencias
- Delegar la creación de objetos a factories

## Beneficios de Implementar las Mejoras

1. **Extensibilidad**: Agregar nuevos tipos de notificación sin modificar código existente
2. **Testabilidad**: Mockear dependencias fácilmente
3. **Mantenibilidad**: Cambios en implementaciones no afectan módulos de alto nivel
4. **Flexibilidad**: Intercambiar implementaciones en tiempo de ejecución

## Conclusión DIP

El proyecto actual tiene una base sólida con herencia y polimorfismo, pero **viola significativamente el DIP** debido a las dependencias directas del módulo principal hacia implementaciones concretas. 

**Prioridades de refactoring:**
1.  **Alta**: Implementar Factory Pattern para desacoplar creación
2.  **Alta**: Crear interfaces formales 
3.  **Media**: Añadir método `enviar()` a la abstracción base
4.  **Media**: Implementar inyección de dependencias

Con estas mejoras, el proyecto alcanzaría un cumplimiento del DIP de **8-9/10**.

---
