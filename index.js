//import dotenv from 'dotenv';
//dotenv.config();

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


const formarPagina = (pagina) => {//devuelve una pagina entera, juntando la cabecera, lo principal y el footer
    const fileUp = path.join(process.cwd(), 'views', 'up.html');
    const stringifiedUp = readFileSync(fileUp, 'utf8');
    const fileDown = path.join(process.cwd(), 'views', 'down.html');
    const stringifiedDown = readFileSync(fileDown, 'utf8');
    const file = path.join(process.cwd(), 'views', pagina);
    const stringified = readFileSync(file, 'utf8');
    const final = stringifiedUp + stringified + stringifiedDown;
    console.log(final);
    return final;
}

//en este script van las paginas
app.get("/", (req, res) => {//inicio
    console.log("recibido");
    res.send(formarPagina('inicio.html'));
});
app.get("/rooms", (req, res) => {
    res.send(formarPagina('inicio.html'));
});
app.get("/account", (req, res) => {
    res.send(formarPagina('inicio.html'));
});
app.get("/about", (req, res) => {
    res.send(formarPagina('inicio.html'));
});


import ruta from './routes/rutas.js'
app.use("/", ruta);
import rutaRecursos from './routes/recursos.js';
app.use("/", rutaRecursos);

app.get("/*", (req, res) => {
    console.log("no");
    const file = path.join(process.cwd(), 'views', 'err404.html');
    const stringified = readFileSync(file, 'utf8');
    res.end(stringified);
});

app.listen(PORT, () => console.log("levantado en " + PORT));
console.log("todo operativo :)");