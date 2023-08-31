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
app.get("/account", (req, res) => {
    res.send(formarPagina('account.html'));
});
app.get("/login", (req, res) => {
    res.send(formarPagina('login.html'));
});
app.get("/signin", (req, res) => {
    res.send(formarPagina('signin.html'));
});
app.get("/editPassword", (req, res) => {
    res.send(formarPagina('editPassword.html'));
});
app.get("/deleteAccount", (req, res) => {
    res.send(formarPagina('deleteAccount.html'));
});
app.get("/logout", (req, res) => {
    res.send(formarPagina('logout.html'));
});
app.get("/rooms", (req, res) => {
    res.send(formarPagina('rooms.html'));
});
app.get("/createRoom", (req, res) => {
    res.send(formarPagina('createRoom.html'));
});
app.get("/joinRoom", (req, res) => {
    res.send(formarPagina('joinRoom.html'));
});
app.get("/room", (req, res) => {
    res.send(formarPagina('room.html'));
});
app.get("/roomEdit", (req, res) => {
    res.send(formarPagina('roomEdit.html'));
});
app.get("/roomDel", (req, res) => {
    res.send(formarPagina('roomDel.html'));
});
app.get("/roomExit", (req, res) => {
    res.send(formarPagina('roomExit.html'));
});
app.get("/goRoom*", (req, res) => {
    res.send(formarPagina('goRoom.html'));
});
app.get("/roomAll", (req, res) => {
    res.send(formarPagina('roomAll.html'));
});
app.get("/about", (req, res) => {
    res.send(formarPagina('about.html'));
});
app.get("/settings", (req, res) => {
    res.send(formarPagina('settings.html'));
});


import ruta from './routes/rutas.js'
app.use("/", ruta);
import rutaRecursos from './routes/recursos.js';
import { debug } from 'console';
import { verify } from 'crypto';
app.use("/", rutaRecursos);


//---------------------------------------------------------endpoints para backend:
//EN ESTA PARTE VAN LOS ENDPOINTS:

app.get("/b/user/:id", async (req, res) => {//conseguir los datos de un usuario, sin contrasegna
    console.log("GET USUARIO DATOS");
    //const cual = req.query.id;
    const { id } = req.params;
    if(id != undefined){
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
app.get("/b/userProfile/:id", async (req, res) => {//conseguir los datos de un usuario para el miniperfil
    console.log("GET USUARIO DATOS PERFIL");
    const { id } = req.params;
    if(id != undefined){
        Usuario.findById(id)
        .then((data) => {
            const dataFinal = {nombre: data.nombre, descripcion: data.descripcion, urlFoto: data.urlFoto}
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
    console.log("CREAR USUARIO");
    req.body.tienePublica = "false";
    const user = Usuario(req.body);
    try{
        if(user != undefined && user.nombre.length > 7 && user.contrasegna.length > 7 && user.nombre != user.contrasegna && user.nombre.length < 33 && user.contrasegna.length < 33){
            user.save()
            .then((data) => {
                res.redirect("/account");
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
app.post("/b/userdel/:id", async (req, res) => {//eliminar un usuario, hace falta la contrasegna
    console.log("ELIMINAR USUARIO");
    const { id } = req.params;
    const { contrasegna } = req.body;
    if(id != undefined && contrasegna != undefined){
        Usuario.findById(id)
        .then((data) => {
            if(data.contrasegna == contrasegna){
                data.salas.forEach((laSala) => {//borrar todas las salas
                    Sala.findById(laSala)
                    .then((data2) => {
                        if(data2.idFundador == id && data2.publica != "true"){//en la sala publica
                            data2.idMiembros.forEach((elMiembro) => {//sacar a los miembros
                                if(elMiembro != id){
                                    Usuario.findById(elMiembro)
                                    .then((data3) => {
                                        const nuevoSalas = data3.salas;
                                        let index = data3.salas.indexOf(laSala);
                                        nuevoSalas.splice(index, 1);
                                        Usuario.updateOne({_id: elMiembro}, {$set: {salas: nuevoSalas}})
                                        .catch((err) => {
                                            console.log(err);
                                            res.redirect("/err404");
                                        });
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        res.redirect("/err404");
                                    });
                                }
                                
                            });
                            Sala.deleteOne({_id: laSala})//borrar su sala
                            .catch((err) => {
                                console.log(err);
                                res.redirect("/err404");
                            });
                        } else if(data2.publica != "true"){//en la sala privada
                            const nuevoMiembros = data2.idMiembros;
                            let index = data2.idMiembros.indexOf(laSala);
                            nuevoMiembros.splice(index, 1);
                            Sala.updateOne({_id: laSala}, {$set: {idMiembros: nuevoMiembros}})
                            .catch((err) => {
                                console.log(err);
                                res.redirect("/err404");
                            });
                        }
                        if(data2.publica == "true" && data2.idFundador == id){//borrar su sala publica
                            Sala.deleteOne({_id: laSala})
                            .catch((err) => {
                                console.log(err);
                                res.redirect("/err404");
                            });
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/err404");
                    });
                    Usuario.deleteOne({_id: id})//y borrar el usuario
                    .then(() => {
                        res.status(200);
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/err404");
                    });
                });
            } else {
                console.log("contrasegna incorrecta")
                res.redirect("/err404");
            }
        })
        .catch((err) => {
            console.log(err + "  usuario no existe")
            res.redirect("/err404");
        })
    } else {
        res.redirect("/err404");
    }
    res.send("ok");
});
app.put("/b/user/:id", async (req, res) => {//actualizar cualquier dato que no sea ni el id ni la contrasegna del usuario
    console.log("ACTUALIZAR USUARIO");
    const { id } = req.params;
    const { nombre, descripcion, urlFoto, modoOscuro } = req.body;
    if(id != undefined && nombre != undefined && descripcion != undefined && urlFoto != undefined && modoOscuro != undefined){
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
    console.log("LOGIN");
    const { nombre, contrasegna } = req.body;
    if(nombre != undefined && contrasegna != undefined){
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
app.get("/b/userp/:id", async (req, res) => {//recibe la contrasegna de un usuario, cuidado
    console.log("DAR CONTRASEGNA USUARIO");
    const { id } = req.params;
    if(id != undefined){
        Usuario.findById(id)
        .then((data) => {
            const dataFinal = {contrasegna: data.contrasegna}
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
app.put("/b/userp/:id", async (req, res) => {//actualizar contrasegna del usuario, necesita haber iniciado sesion
    console.log("ACTUALIZAR CONTRASEGNA USUARIO");
    const { id } = req.params;
    const { nuevaContrasegna, viejaContrasegna } = req.body;
    if(id != undefined && nuevaContrasegna != undefined && viejaContrasegna != undefined && nuevaContrasegna.length < 33){
        Usuario.findById(id)
        .then((data) => {
            if(data.contrasegna == viejaContrasegna){
                Usuario.updateOne({_id: id}, {$set: {contrasegna: nuevaContrasegna}})
                .then(() => {
                    res.send("ok");
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/err404");
                });
            } else {
                res.redirect("/err404");
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");
        });

        
    } else {
        res.redirect("/err404");
    }
});
app.put("/b/userpb/:id", async (req, res) => {//cambiar si el usuario ya a creado su sala publica o no
    console.log("CAMBIAR POSIBILIDAD PUBLICA");
    const { id } = req.params;
    const { deja } = req.body;
    if(id != undefined && deja != undefined){
        Usuario.updateOne({_id: id}, {$set: {tienePublica: deja}})
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
app.get("/b/userpb/:id", async (req, res) => {//saber si el usuario hizo ya su sala o no
    console.log("RECIBIR USUARIO PUBLICA");
    const { id } = req.params;
    if(id != undefined){
        Usuario.findById(id)
        .then((data)=>{
            res.json({tienePublica: data.tienePublica});
        })
        .catch((err)=>{
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});



app.get("/b/roomMembers/:sala", async (req, res) => {//devuelve los miembros de la sala
    console.log("CONSEGUIR MIEMBROS SALA");
    const { sala } = req.params;
    if(sala != undefined){
        Sala.findById(sala)
        .then((data) => {
            let dataFinal = {_id: data._id, idMiembros: data.idMiembros}
            res.json(dataFinal);
        })
        .catch((err)=>{
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.get("/b/roomData/:sala", async (req, res)=>{//conseguir informacion de perfilado de una sala
    console.log("CONSEGUIR PERFILADO SALA");
    const { sala } = req.params;
    if(sala != undefined){
        Sala.findById(sala)
        .then((data) => {
            let dataFinal = {_id: data._id, nombre: data.nombre, descripcion: data.descripcion, urlFoto: data.urlFoto, nombreFundador: "", idFundador: "", publica: data.publica, verID: data.verID, cantidadMiembros: data.idMiembros.length}
            Usuario.findById(data.idFundador)
            .then((data2) => {
                dataFinal.nombreFundador = data2.nombre;
                dataFinal.idFundador = data2._id
                res.json(dataFinal);
            })
            .catch((err)=>{
                console.log(err);
                res.redirect("/err404");
            });
        })
        .catch((err)=>{
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.get("/b/rooms/:id", async (req, res) => {//conseguir la informacion basica de todas las salas de un usuario
    console.log("CONSEGUIR ID SALAS USUARIO");
    const { id } = req.params;
    if(id != undefined){
        //conseguir array de salas del usuario
        Usuario.findById(id)
        .then((data) => {
            res.json({salas: data.salas});
        })
        .catch((err)=>{
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.get("/b/founder/:sala", async (req, res) => {//conseguir el fundador de una sala
    console.log("CONSEGUIR FUNDADOR SALA");
    const { sala } = req.params;
    if(sala != undefined){
        Sala.findById(sala)
        .then((data) => {
            Usuario.findById(data.idFundador)
            .then((data2) => {
                const dataFinal = {_id: data2._id, nombre: data2.nombre, descripcion: data2.descripcion, urlFoto: data2.urlFoto}
                res.json(dataFinal);
            })
            .catch((err)=>{
                console.log(err);
                res.redirect("/err404");
            });
        })
        .catch((err)=>{
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.post("/b/room/:id", async (req, res) => {//crear una sala
    console.log("CREAR SALA");
    const { id } = req.params;
    const { nombre, idFundador, publica, urlFoto, descripcion, verID } = req.body;
    if(nombre != undefined && idFundador != undefined && publica != undefined && urlFoto != undefined && descripcion != undefined && id != undefined && verID != undefined){
        //crear sala
        const sala = Sala(req.body);
        sala.save()
            .then((data1) => {
                //recibir usuario
                Usuario.findById(id)
                .then((data2) => {
                    let susSalas = data2.salas;
                    //recibir id de la nueva sala
                    Sala.findById(data1._id)
                    .then((data3) => {
                        susSalas.push(data3._id);
                        //unir al usuario con la sala
                        Usuario.updateOne({_id: id}, {$set: {salas: susSalas}})
                        .then((data4) => {
                            //unir a la sala con el usuario
                            Sala.updateOne({_id: data3._id}, {$set: {idMiembros: [id]}})
                            .then((data5)=>{
                                res.status(200);
                            })
                            .catch((err) => {
                                console.log(err);
                                res.redirect("/err404");
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            res.redirect("/err404");
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/err404");
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/err404");
                });    
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/err404");
            });
    } else {
        res.redirect("/err404");
    }
    res.redirect("/rooms");
});
app.post("/b/join/:id", async (req, res) => {//unirse a una sala, hace falta el id de sala y el de usuario
    console.log("UNIRSE A SALA");
    const { id } = req.params;
    const { sala } = req.body;
    if(id != undefined && sala != undefined){
        //ver si la sala existe
        Sala.findById(sala)
        .then((data) => {
            if(data.idMiembros.includes(id) || data.publica == "true"){
                res.json({stat: 400});//el usuario ya esta dentro o es publica
            } else {
                let miembros = data.idMiembros;
                miembros.push(id);
                //unir a la sala
                Sala.updateOne({_id: sala}, {$set: {idMiembros: miembros}})
                .then((data2) => {
                    //recibir salas del usuario
                    Usuario.findById(id)
                    .then((data3) => {
                        let salasn = data3.salas;
                        salasn.push(sala);
                        //unir sala
                        Usuario.updateOne({_id: id}, {$set: {salas: salasn}})
                        .then((data4) => {
                            console.log("va");
                            res.json({stat: 200});//funciona
                        })
                        .catch((err) => {
                            console.log(err);
                            res.redirect("/err404");
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/err404");
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/err404");
                });
            }
        })
        .catch((err) => {
            console.log(err);
            res.json({stat: 400});//la sala no existe
        });
    } else {
        res.redirect("/err404");
    }
});
app.get("/roomsPublic/:limit", (req, res) => {//consigue todas las salas publicas de la base de datos
    console.log("CONSEGUIR SALAS PUBLICAS TODAS");
    const { limit } = req.params;
    if(limit != NaN){
        Sala.find({publica: {$in: "true"}})
        .limit()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.json({stat: 400});//la sala no existe
        });
    } else {
        res.redirect("/err404");
    }
});
app.put("/b/roomEdit/:room/:user", async (req, res) => {//editar una sala
    console.log("EDITAR SALA");
    const { nombre, descripcion, urlFoto, verID, publica } = req.body;
    const { room, user } = req.params;
    if(nombre != undefined && descripcion != undefined && urlFoto != undefined && verID != undefined && publica != undefined && room != undefined && user != undefined){
        Usuario.findById(user)
        .then((data1) => {//buscar usuario
            Sala.findById(room)
            .then((data2) => {//buscar la sala
                if(data2.idFundador == user){
                    Sala.updateOne({_id: room}, {$set: {nombre, descripcion, urlFoto, verID, publica}})//actualizar sala
                    .then((data3) => {
                        //res.status(200);
                        res.redirect("/room");
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/err404");
                    });
                } else {
                    res.redirect("/err404");//el usuario no es el fundador
                }
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/err404");//sala no existe
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");//usuario no existe
        });
    } else {
        res.redirect("/err404");
    }
});
app.put("/b/exit", async (req, res) => {//salir de una sala, por haber sido expulsado o salir manualmente, no se puede salir siendo el fundador
    console.log("SALIR DE SALA");
    const { usuario, sala } = req.body;
    if(usuario != undefined && sala != undefined){
        Usuario.findById(usuario)//encontrar al usuario que se va a salir
        .then((data) => {
            let nuevoSalas = data.salas;
            let index1 = data.salas.indexOf(sala);
            nuevoSalas.splice(index1, 1);
            Usuario.updateOne({_id: usuario}, {$set: {salas: nuevoSalas}})//quitar la sala del usuario
            .then((data2) => {
                Sala.findById(sala)//encontrar la sala de la que se va a salir
                .then((data3) => {
                    let nuevoMiembros = data3.idMiembros;
                    let index2 = data3.idMiembros.indexOf(usuario);
                    nuevoMiembros.splice(index2, 1);
                    Sala.updateOne({_id: sala}, {$set: {idMiembros: nuevoMiembros}})//quitar el usuario de la sala
                    .then((data4) => {
                        res.redirect("/rooms");
                    })
                    .catch((err) => {
                        console.log(err);
                        res.json({stat: 400});//la sala no existe
                    });
                })
                .catch((err) => {
                    console.log(err);
                    res.json({stat: 400});//la sala no existe
                });
            })
            .catch((err) => {
                console.log(err);
                res.json({stat: 400});//la sala no existe
            });
        })
        .catch((err) => {
            console.log(err);
            res.json({stat: 400});//la sala no existe
        });
    } else {
        res.redirect("/err404");
    }
});
app.post("/b/roomdel", async (req, res) => {//borrar una sala, se necesita el id de usuario y de sala y que el usuario sea el fundador
    console.log("BORRAR SALA");
    const { sala, usuario } = req.body;
    if(sala != undefined && usuario != undefined){
        Sala.findById(sala)//conseguir detalles de la sala
        .then((data1) => {
            if(data1.idFundador == usuario){
                data1.idMiembros.forEach((e) => {//salir a cada usuario de la sala
                    Usuario.findById(e)
                    .then((usr) => {
                        if(data1.publica){//dejar al usuario hacer mas salas publicas
                            Usuario.updateOne({_id: usr._id}, {$set: {tienePublica: "false"}})
                            .catch((err) => {
                                console.log(err);
                                res.redirect("/err404");
                            });
                        }
                        let nuevoSalas = usr.salas;
                        let index = usr.salas.indexOf(sala);
                        nuevoSalas.splice(index, 1);
                        Usuario.updateOne({_id: usr._id}, {$set: {salas: nuevoSalas}})
                        .catch((err) => {
                            console.log(err);
                            res.redirect("/err404");
                        });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.redirect("/err404");
                    });
                });
                Sala.deleteOne({_id: sala})//borrar ya la sala
                .then((data2) => {
                    res.status(200);
                })
                .catch((err) => {
                    console.log(err);
                    res.redirect("/err404");
                });
            } else {
                res.redirect("/err404");//el usuari no es fundador
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");//la sala no existe o el usuario no es fundador
        });
    } else {
        res.redirect("/err404");
    }
});


app.get("/b/roomMsg/:sala/:limit", async (req, res) => {//conseguir x numero de mensajes de una sala
    //console.log("CONSEGUIR MENSAJES (endpoint repetitivo)");
    const { sala, limit } = req.params;
    if(sala != undefined && limit != undefined){
        Sala.findById(sala)
        .then((data) => {
            if(data.mensajes.length > 0){
                let dataFinal = [];
                let ii = 0;
                for(let i = data.mensajes.length; i >= 0; i--){
                    ii++;
                    if(ii < limit){
                        dataFinal.push(data.mensajes[i]);
                    } else {
                        break;
                    }
                }
                dataFinal.splice(0, 1);
                res.json(dataFinal);
            } else {
                res.json([]);
            }
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");//la sala no existe
        });
    } else {
        res.redirect("/err404");
    }
});
app.post("/b/say/:sala", async (req, res) => {//decir algo en una sala, muchos datos necesitados
    console.log("DECIR MENSAJE ");
    const {sala} = req.params;
    const {urlFoto, idUsuario, mensaje, nombre} = req.body;
    if(sala != undefined && urlFoto != undefined && idUsuario != undefined && mensaje != undefined && nombre != undefined && mensaje.length < 1024){
        Sala.findById(sala)
        .then((data) => {
            const dataFinal = {
                urlFoto: urlFoto,
                idUsuario: idUsuario,
                nombre: nombre,
                mensaje: mensaje,
                fecha: Date.now(),
                orden: data.mensajes.length
            }
            let mensajesn = data.mensajes;
            mensajesn.push(dataFinal);
            Sala.updateOne({_id: sala}, {$set: {mensajes: mensajesn}})
            .then((data2) => {
                res.status(200);
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/err404");
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");//la sala no existe o el usuario no es fundador
        });
    } else {
        res.redirect("/err404");
    }
});
app.post("/b/saydel/:sala/:numero", async (req, res) => {//borrar un mensaje de una sala
    console.log("BORRAR MENSAJE");
    const {sala, numero} = req.params;
    if(sala != undefined && numero != undefined){
        Sala.findById(sala)
        .then((data) => {
            let nuevoMensajes = data.mensajes;
            let indiceBorrar = 0;
            for(let i = 0; i < nuevoMensajes.length; i++){
                if(nuevoMensajes[i].orden == numero){
                    indiceBorrar = i;
                    break;
                }
            }
            nuevoMensajes.splice(indiceBorrar, 1);
            Sala.updateOne({_id: sala}, {$set: {mensajes: nuevoMensajes}})
            .then((data2) => {
                res.status(200);
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/err404");
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
});
app.put("/b/say/:sala/:numero", async (req, res) => {//editar un mensaje de una sala
    console.log("EDITAR MENSAJE");
    const {sala, numero} = req.params;
    const {nuevoTexto} = req.body;
    if(sala != undefined && numero != undefined && nuevoTexto != undefined && nuevoTexto != ""){
        Sala.findById(sala)
        .then((data) => {
            console.log("voy a editar " + numero);
            let nuevoMensajes = data.mensajes;
            for(let i = 0; i < nuevoMensajes.length; i++){
                if(nuevoMensajes[i].orden == numero){
                    nuevoMensajes[i].mensaje = nuevoTexto;
                    break;
                }
            }
            Sala.updateOne({_id: sala}, {$set: {mensajes: nuevoMensajes}})
            .then((data2) => {
                res.status(200);
            })
            .catch((err) => {
                console.log(err);
                res.redirect("/err404");
            });
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/err404");
        });
    } else {
        res.redirect("/err404");
    }
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

