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


//en este script van las paginas
app.get("/", (req, res) => {
    console.log("recibido");
    const file = path.join(process.cwd(), 'views', 'index.html');
    const stringified = readFileSync(file, 'utf8');
    res.end(stringified);
});
app.get("/rooms", (req, res) => {
    res.send("rooms");
    // const file = path.join(process.cwd(), 'views', 'index.html');
    // const stringified = readFileSync(file, 'utf8');
    // res.end(stringified);
});
app.get("/account", (req, res) => {
    res.send("account");
    // const file = path.join(process.cwd(), 'views', 'index.html');
    // const stringified = readFileSync(file, 'utf8');
    // res.end(stringified);
});
app.get("/about", (req, res) => {
    res.send("about");
    // const file = path.join(process.cwd(), 'views', 'index.html');
    // const stringified = readFileSync(file, 'utf8');
    // res.end(stringified);
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