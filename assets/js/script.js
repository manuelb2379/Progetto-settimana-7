

import { cercaSquadre } from './api.js';

async function prova() {
    try {
        const squadre = await cercaSquadre('Arsenal');
        console.log(squadre);
    } catch (err) {
        console.error(err);
    }
}

prova();