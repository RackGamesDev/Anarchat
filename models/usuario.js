//modelo para cada usuario
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    nombre: String,//nombre publico del usuario, el id lo hace mongodb
    contrasegna: String,//contrasegna del usuario
    urlFoto: String,//la url de la foto del usuario, preferiblemente imgur
    descripcion: String,//la descripcion publica del usuario
    modoOscuro: String,//si tiene el modo oscuro o no ("true", "false")
    salas: [String],//las salas en las que esta, no discrimina si es el admin o no
    tienePublica: String//si ya ha creado su sala publica unica ("true", "false")
});

const Usuario = mongoose.model('usuario', usuarioSchema);
export default Usuario;