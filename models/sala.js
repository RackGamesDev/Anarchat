//modelo para cada sala
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const salaSchema = new Schema({
    nombre: String,//nombre publico de la sala
    idMiembros: [String],//los ids de todos los usuarios adentro incluyendo al fundador, si es publica esto da igual
    idFundador: String,//el id de usuario del fundador
    publica: String,//si es publica, en ese caso aparecera en el inicio y el idsala no sera necesario ("true", "false")
    mensajes: [Object],//todos los id de mensajes que tiene
    urlFoto: String,//la url de la foto de perfil
    descripcion: String,//la descripcion html de la sala
    verID: String//si los miembros pueden ver el id, en caso de que sea privada
});

const Sala = mongoose.model('sala', salaSchema);
export default Sala;