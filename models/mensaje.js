//modelo para cada mensaje
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const mensajeSchema = new Schema({
    texto: String,//el texto en si del mensaje
    idPropietario: String,//el id del usuario que lo mando
    fecha: String,//la fecha humana en la que se envio
    orden: Number//empezando desde el 0, cual es el numero dentro de su sala
});

const Mensaje = mongoose.model('mensaje', mensajeSchema);
export default Mensaje;