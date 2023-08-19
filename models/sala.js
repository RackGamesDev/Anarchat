//modelo para cada sala
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const salaSchema = new Schema({
    nombre: String,//nombre publico de la sala
    idSala: String,//id especial de la sala para invitar
    idMiembros: [String],//los ids de todos los usuarios adentro incluyendo al fundador
    idFundador: String,//el id de usuario del fundador
    publica: String,//si es publica, en ese caso aparecera en el inicio y el idsala no sera necesario ("true", "false")
    mensajes: [String]//todos los id de mensajes que tiene
});

const Sala = mongoose.model('sala', salaSchema);
export default Sala;