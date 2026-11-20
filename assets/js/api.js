import { Squadra } from './models/Squadra.js';
import { Evento } from './models/Evento.js';

const URL = 'https://www.thesportsdb.com/api/v1/json/123';

async function fetchJSON(indirizzo, { signal } = {}) {
    const response = await fetch(indirizzo, { signal });

    if (response.status === 429) {
        throw new Error('Troppe richieste all\'API (max 30 al minuto). Riprova tra un minuto.');
    }
    if (!response.ok) {
        throw new Error(`Errore del server (${response.status}). Riprova più tardi.`);
    }

    // A volte l'API risponde con un corpo vuoto: lo tratto come "nessun dato"
    const testo = await response.text();
    return testo ? JSON.parse(testo) : {};
}

/** Cerca squadre per nome. Restituisce sempre un array (vuoto se nessuna). */
export async function cercaSquadre(nome, signal) {
   const data = await fetchJSON(`${URL}/searchteams.php?t=${nome}`, { signal });
    return (data.teams ?? []).map((team) => Squadra.fromApi(team));
}

/** Prossimi eventi della squadra, dal più vicino. */
export async function prossimiEventi(idSquadra, signal) {
   const data = await fetchJSON(`${URL}/eventsnext.php?id=${idSquadra}`, { signal });
    return (data.events ?? [])
        .map((e) => new Evento(e))
        .sort((a, b) => (a.dataOra ?? 0) - (b.dataOra ?? 0));
}

/** Ultimi risultati della squadra, dal più recente. */
export async function ultimiRisultati(idSquadra, signal) {
   const data = await fetchJSON(`${URL}/eventslast.php?id=${idSquadra}`, { signal });
    return (data.results ?? [])
        .map((e) => new Evento(e))
        .sort((a, b) => (b.dataOra ?? 0) - (a.dataOra ?? 0));
}

/** Dettaglio completo di un evento (null se non trovato). */
export async function dettaglioEvento(idEvento, signal) {
   const data = await fetchJSON(`${URL}/lookupevent.php?id=${idEvento}`, { signal });
    const evento = data.events?.[0];
    return evento ? new Evento(evento) : null;
}