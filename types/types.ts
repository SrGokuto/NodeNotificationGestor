// | [] <>

type User = string;
type TiposNotificacion = "sistema" | "ocio" | "volumen"
type Notificacion = {tipo: TiposNotificacion, message: string}

export {User, Notificacion}