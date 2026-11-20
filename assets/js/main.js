import { cercaSquadre, prossimiEventi, ultimiRisultati } from './api.js';
import { getPreferiti, isPreferita, aggiungiPreferito, rimuoviPreferito, leggiTema, salvaTema } from './storage.js';
import * as ui from './elementi.js';
import { debounce } from './strumenti.js';

const MIN_CARATTERI = 3;
const DEBOUNCE_MS = 400;

// querySelector 
const els = {
    html: document.documentElement,
    btnTema: document.querySelector('#theme-toggle'),
    form: document.querySelector('#search-form'),
    input: document.querySelector('#search-input'),
    risultati: document.querySelector('#results-row'),
    risultatiStato: document.querySelector('#results-status'),
    preferiti: document.querySelector('#favorites-row'),
    preferitiVuoto: document.querySelector('#favorites-empty'),
    filtriPreferiti: document.querySelector('#favorites-filters'),
    appuntamenti: document.querySelector('#upcoming-list'),
    modale: document.querySelector('#team-modal'),
    modaleTitolo: document.querySelector('#team-modal-title'),
    modaleCorpo: document.querySelector('#team-modal-body'),
};
// stato
const stato = {
    risultati: [],
    filtroPreferiti: 'Tutti',
    idAperta: null,
    controllerRicerca: null,
    cacheProssimi: new Map(),
    richiestaAppuntamenti: 0,
};

/* render */

/* Svuota il contenitore e ci inserisce i nuovi elementi. */
function mostra(contenitore, ...elementi) {
    contenitore.textContent = '';
    contenitore.append(...elementi);
}

const filtraPerSport = (lista, sport) => (sport === 'Tutti' ? lista : lista.filter((s) => s.sport === sport));

function idsPreferiti() {
    return new Set(getPreferiti().map((s) => s.id));
}

/* Card dei preferiti con la barra dei filtri per sport. */
function renderPreferiti() {
    const preferiti = getPreferiti();
    els.preferitiVuoto.hidden = preferiti.length > 0;

    // I filtri si vedono solo se c'è almeno una preferita
    els.filtriPreferiti.hidden = preferiti.length === 0;
    mostra(els.filtriPreferiti, ...ui.filtri(stato.filtroPreferiti, 'preferiti'));

    const filtrate = filtraPerSport(preferiti, stato.filtroPreferiti);
    if (preferiti.length && !filtrate.length) {
        mostra(els.preferiti, ui.nessunaPerSport());
    } else {
        mostra(els.preferiti, ...ui.cardsSquadre(filtrate, { idsPreferiti: idsPreferiti(), inPreferiti: true }));
    }
}

/* Card dei risultati della ricerca (con la stella). */
function renderRisultati() {
    mostra(els.risultati, ...ui.cardsSquadre(stato.risultati, { idsPreferiti: idsPreferiti() }));
}

/* Svuota i risultati e mostra (se passato) un messaggio/spinner/errore. */
function svuotaRisultati(...elementi) {
    stato.risultati = [];
    els.risultati.textContent = '';
    mostra(els.risultatiStato, ...elementi);
}

//ricerca
async function eseguiRicerca(testo) {
    const query = testo.trim();

    // Annullo l'eventuale richiesta precedente ancora in corso
    stato.controllerRicerca?.abort();

    if (!query) {
        svuotaRisultati(); // barra vuota: nessun risultato e nessun messaggio
        return;
    }
    if (query.length < MIN_CARATTERI) {
        svuotaRisultati(ui.messaggio(`Scrivi almeno ${MIN_CARATTERI} caratteri.`));
        return;
    }

    const controller = new AbortController();
    stato.controllerRicerca = controller;
    svuotaRisultati(ui.spinner(`Cerco "${query}"...`));

    try {
        const squadre = await cercaSquadre(query, controller.signal);
        stato.risultati = squadre;
        if (squadre.length) {
            els.risultatiStato.textContent = '';
        } else {
            mostra(els.risultatiStato, ui.nessunaSquadra());
        }
        renderRisultati();
    } catch (err) {
        if (err.name === 'AbortError') return; // superata da una ricerca più recente: nessun errore
        console.error(err);
        svuotaRisultati(ui.errore(err.message || 'Errore durante la ricerca.'));
    } finally {
        if (stato.controllerRicerca === controller) stato.controllerRicerca = null;
    }
}

const ricercaConDebounce = debounce(eseguiRicerca, DEBOUNCE_MS);

//preferiti

function trovaSquadra(id) {
    return getPreferiti().find((s) => s.id === id) ?? stato.risultati.find((s) => s.id === id);
}

function togglePreferito(id) {
    const squadra = trovaSquadra(id);
    if (!squadra) return;

    if (isPreferita(id)) {
        rimuoviPreferito(id);
        stato.cacheProssimi.delete(id);
    } else {
        aggiungiPreferito(squadra);
    }

    renderPreferiti();
    renderRisultati(); // aggiorna la stella (piena/vuota) nei risultati
    caricaAppuntamenti();
}

/* prossimi appuntamenti di tutte le preferite (chiamate in parallelo, con cache). */
async function caricaAppuntamenti() {
    const preferiti = getPreferiti();
    const idRichiesta = ++stato.richiestaAppuntamenti;

    if (!preferiti.length) {
        mostra(els.appuntamenti, ui.messaggio('Aggiungi una squadra ai preferiti per vedere i suoi prossimi impegni.'));
        return;
    }

    const daCaricare = preferiti.filter((s) => !stato.cacheProssimi.has(s.id));
    if (daCaricare.length) mostra(els.appuntamenti, ui.spinner('Carico i prossimi appuntamenti...'));

    try {
        // allSettled: se una squadra fallisce, le altre vengono mostrate comunque
        const esiti = await Promise.allSettled(daCaricare.map((s) => prossimiEventi(s.id)));
        esiti.forEach((esito, i) => {
            if (esito.status === 'fulfilled') stato.cacheProssimi.set(daCaricare[i].id, esito.value);
        });
        const nErrori = esiti.filter((e) => e.status === 'rejected').length;

        if (idRichiesta !== stato.richiestaAppuntamenti) return; // nel frattempo è partita un'altra richiesta

        // Unisco, tolgo i doppioni (due preferite nella stessa partita) e ordino per data
        const items = [];
        const idVisti = new Set();
        getPreferiti().forEach((squadra) => {
            const eventi = stato.cacheProssimi.get(squadra.id) ?? [];
            eventi.forEach((evento) => {
                if (idVisti.has(evento.id)) return; // partita già inserita
                idVisti.add(evento.id);
                items.push({ evento, squadra });
            });
        });
        items.sort((a, b) => (a.evento.dataOra ?? 0) - (b.evento.dataOra ?? 0));

        mostra(els.appuntamenti, ui.appuntamenti(items, nErrori));
    } catch (err) {
        console.error(err);
        mostra(els.appuntamenti, ui.errore('Impossibile caricare i prossimi appuntamenti.'));
    }
}

// modale squadra
async function apriModaleSquadra(squadra) {
    const modale = bootstrap.Modal.getOrCreateInstance(els.modale);
    stato.idAperta = squadra.id;

    els.modaleTitolo.textContent = squadra.nome;
    mostra(els.modaleCorpo, ui.modaleSquadraLoading(squadra));
    modale.show();

    try {
        const [prossimi, ultimi] = await Promise.all([prossimiEventi(squadra.id), ultimiRisultati(squadra.id)]);
        if (stato.idAperta !== squadra.id) return; // nel frattempo è stata aperta un'altra squadra

        mostra(els.modaleCorpo, ui.modaleSquadra(squadra, prossimi, ultimi));
    } catch (err) {
        console.error(err);
        if (stato.idAperta !== squadra.id) return;
        mostra(els.modaleCorpo, ui.modaleSquadraErrore(squadra, err.message || 'Impossibile caricare i dettagli.'));
    }
}

//tema chiaro/scuro

function applicaTema(tema) {
    els.html.setAttribute('data-bs-theme', tema);
    const scuro = tema === 'dark';
    els.btnTema.textContent = scuro ? '☀️' : '🌙';
    els.btnTema.setAttribute('aria-label', scuro ? 'Attiva tema chiaro' : 'Attiva tema scuro');
}

//event listener

/**
 * Click su una card:
 * - stella o Rimuovi (data-action="toggle-fav") → aggiunge/toglie dai preferiti
 * - pulsante Dettagli o qualunque altro punto della card → apre la modale
 */
function gestisciClickCard(event) {
    const card = event.target.closest('.team-card');
    if (!card) return;

    const id = card.dataset.id;
    if (event.target.closest('[data-action="toggle-fav"]')) {
        togglePreferito(id);
        return;
    }

    const squadra = trovaSquadra(id);
    if (squadra) apriModaleSquadra(squadra);
}

/** Tastiera: Invio/Spazio su una card si comportano come un click. */
function gestisciTastiera(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!event.target.matches('.team-card')) return;
    event.preventDefault();
    event.target.click();
}

function gestisciClickFiltro(event) {
    const btn = event.target.closest('[data-filtro]');
    if (!btn) return;
    stato.filtroPreferiti = btn.dataset.filtro;
    renderPreferiti();
}

function init() {
    applicaTema(leggiTema());
    renderPreferiti();
    caricaAppuntamenti();

    // Ricerca: al submit (subito) e mentre si scrive (debounce)
    els.form.addEventListener('submit', (event) => {
        event.preventDefault();
        ricercaConDebounce.cancel();
        eseguiRicerca(els.input.value);
    });
    els.input.addEventListener('input', () => ricercaConDebounce(els.input.value));

    // Card (event delegation: le card vengono ricreate a ogni render)
    els.risultati.addEventListener('click', gestisciClickCard);
    els.preferiti.addEventListener('click', gestisciClickCard);

    // Filtri dei preferiti
    els.filtriPreferiti.addEventListener('click', gestisciClickFiltro);

    document.addEventListener('keydown', gestisciTastiera);

    els.btnTema.addEventListener('click', () => {
        const nuovo = els.html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        applicaTema(nuovo);
        salvaTema(nuovo);
    });
}

init();