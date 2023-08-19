//---------------------------------------------------------importar y crear app:

import dotenv from 'dotenv';
try{
    dotenv.config();
} catch (err){
    console.log("problema con dotenv.   " + err);
}


import { readFileSync } from 'fs';
import path from 'path';

import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

import { createServer} from "http";
import express  from "express";
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());


//---------------------------------------------------------conectar a la base de datos:

import mongoose from 'mongoose';//conexion a mongodb
const user = process.env.MONGODB_USER || 'usuario';
const password = process.env.MONGODB_PASSWORD || 'contrasena1';
const dbname = process.env.MONGODB_DATABASE || 'Data'
const uri = process.env.MONGODB_URL || 'error';
mongoose.connect(uri, {useNewUrlParser: true})
.then(() => console.log("conectado a mongodb"))
.catch(e => console.log(e));

import Usuario from './models/usuario.js';
import Sala from './models/sala.js';
import Mensaje from './models/mensaje.js';








//---------------------------------------------------------ofrecer paginas:

const formarPagina = (pagina) => {//devuelve una pagina entera, juntando la cabecera, lo principal y el footer
    const fileUp = path.join(process.cwd(), 'views', 'up.html');
    const stringifiedUp = readFileSync(fileUp, 'utf8');
    const fileDown = path.join(process.cwd(), 'views', 'down.html');
    const stringifiedDown = readFileSync(fileDown, 'utf8');
    const file = path.join(process.cwd(), 'views', pagina);
    const stringified = readFileSync(file, 'utf8');
    const final = stringifiedUp + stringified + stringifiedDown;
    return final;
}

//en esta parte van las paginas
app.get("/", (req, res) => {//inicio
    console.log("recibido");
    res.send(formarPagina('inicio.html'));
});
app.get("/rooms", (req, res) => {
    res.send(formarPagina('rooms.html'));
});
app.get("/account", (req, res) => {
    res.send(formarPagina('account.html'));
});
app.get("/about", (req, res) => {
    res.send(formarPagina('about.html'));
});
app.get("/login", (req, res) => {
    res.send(formarPagina('login.html'));
});
app.get("/signin", (req, res) => {
    res.send(formarPagina('signin.html'));
});
app.get("/loginSuccess", (req, res) => {
    res.send(formarPagina('loginSuccess.html'));
});
app.get("/logout", (req, res) => {
    res.send(formarPagina('logout.html'));
});


import ruta from './routes/rutas.js'
app.use("/", ruta);
import rutaRecursos from './routes/recursos.js';
app.use("/", rutaRecursos);


//---------------------------------------------------------endpoints para backend:
//EN ESTA PARTE VAN LOS ENDPOINTS:
app.get("/b/user/:id", async (req, res) => {//conseguir los datos de un usuario, sin contrasegna
    //const cual = req.query.id;
    const { id } = req.params;
    Usuario.findById(id)
    .then((data) => {
        //res.json(data);
        res.send(data.nombre);
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/err404");
    });
});
app.post("/b/user", async (req, res) => {//crear un usuario
    const user = Usuario(req.body);
    user.save()
    .then((data) => {
        //res.json(data);
        res.send("ok, toca el redirect");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/err404");
    });
});
app.delete("/b/user/:id", async (req, res) => {//eliminar un usuario, hace falta la contrasegna
    const { id } = req.params;
    Usuario.deleteOne({_id: id})
    .then((data) => {
        res.send("ok");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/err404");
    });
    console.log("delete el " + id);
});
app.put("/b/user/:id", async (req, res) => {//actualizar cualquier dato que no sea ni el id ni la contrasegna del usuario
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    Usuario.updateOne({_id: id}, {$set: {nombre, descripcion}})
    .then((data) => {
        res.send("ok");
    })
    .catch((err) => {
        console.log(err);
        res.redirect("/err404");
    });
});
app.put("/b/userp", async (req, res) => {//actualizar contrasegna del usuario, necesita haber iniciado sesion

});

app.get("/b/room", async (req, res) => {//conseguir todos los datos de una sala incluyendo mensajes

});
app.post("/b/room", async (req, res) => {//crear una sala
    
});
app.post("/b/join", async (req, res) => {//unirse a una sala, hace falta el id de sala y el de usuario
    
});
app.post("/b/exit", async (req, res) => {//salir de una sala, por haber sido expulsado o salir manualmente, no se puede salir siendo el fundador
    
});
app.delete("/b/room", async (req, res) => {//borrar una sala, se necesita el id de usuario y de sala y que el usuario sea el fundador
    
});
app.get("/b/invite", async (req, res) => {//devuelve datos para invitacion, hace falta el id de sala
    
});

app.post("/b/say", async (req, res) => {//decir algo en una sala, muchos datos necesitados
    
});
app.delete("/b/say", async (req, res) => {//borrar un mensaje de una sala
    
});










//---------------------------------------------------------lanzar servidor:
app.get("/b", (req, res) => {
    console.log("no");
    res.send(formarPagina('err404.html'));
});
app.get("/*", (req, res) => {
    console.log("no");
    res.send(formarPagina('err404.html'));
});
app.listen(PORT, () => console.log("levantado en " + PORT));
console.log("todo operativo :)");