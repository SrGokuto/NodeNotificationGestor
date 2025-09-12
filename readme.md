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

#### Ejemplo:
```typescript
// NotificacionAlerta.ts
export class NotificacionAlerta extends Notificacion {
    enviar() {
        console.log("⚠️ Notificación de Alerta: " + this.mensaje)
    }
}
```
