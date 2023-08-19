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
    if(id != null){
        Usuario.findById(id)
        .then((data) => {
            const dataFinal = {nombre: data.nombre, urlFoto: data.urlFoto, descripcion: data.descripcion, salas: data.salas}
            res.json(dataFinal);
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.post("/b/user", async (req, res) => {//crear un usuario
    const user = Usuario(req.body);
    try{
        if(user != null && user.nombre.length > 7 && user.contrasegna.length > 7 && user.nombre != user.contrasegna){
            user.save()
            .then((data) => {
                res.redirect("/");
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/err404");
            });
        } else {
            res.redirect("/err404");
        }
    } catch(err){
        console.log(err);
        res.redirect("/err404");
    }
    //INICIAR SESION
});
app.delete("/b/user/:id", async (req, res) => {//eliminar un usuario, hace falta la contrasegna
    const { id } = req.params;
    if(id != null){
        Usuario.deleteOne({_id: id})
        .then((data) => {
            res.send("ok");
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.put("/b/user/:id", async (req, res) => {//actualizar cualquier dato que no sea ni el id ni la contrasegna del usuario
    const { id } = req.params;
    const { nombre, descripcion, urlFoto, modoOscuro } = req.body;
    if(id != null && nombre != null && descripcion != null && urlFoto != null && modoOscuro != null){
        Usuario.updateOne({_id: id}, {$set: {nombre, descripcion, urlFoto, modoOscuro}})
        .then((data) => {
            res.send("ok");
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.post("/b/userlogin", async (req, res) => {//hacer login, comprueba si el usuario existe y en tal caso lo devuelve
    const { nombre, contrasegna } = req.body;
    if(nombre != null && contrasegna != null){
        Usuario.findOne({nombre: nombre, contrasegna: contrasegna})
        .then((data) => {
            res.json({status: "ok", elId: data._id, oscuro: data.modoOscuro});
        })
        .catch((err) => {
            res.json({status: "no", elId: ""});
        });
    } else {
        res.redirect("/err404");
    }
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