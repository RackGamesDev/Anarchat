import {Router} from "express";
const rutaRecursos = Router();

import { readFileSync } from 'fs';
import path from 'path';
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//este script esta hecho para proporcionar media a la pagina
rutaRecursos.get('/public/global0.css', (req, res) => {
    const file = path.join(process.cwd(), 'public', 'global0.css');
    //const stringified = readFileSync(file, 'utf8');
    //const stringified = readFileSync(file, 'text/css');
    //res.end(stringified);

    res.setHeader('Content-type', 'text/css');
    res.write(readFileSync(file));
    res.end();
});



export default rutaRecursos;
