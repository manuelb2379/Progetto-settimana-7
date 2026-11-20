import { cercaSquadre, prossimiEventi, ultimiRisultati, dettaglioEvento } from './api.js';
import { getPreferiti, isPreferita, aggiungiPreferito, rimuoviPreferito, leggiTema, salvaTema } from './storage.js';
import * as ui from './elementi.js';
import { debounce, valoriUnici } from './strumenti.js';

const MIN_CARATTERI = 3;
const DEBOUNCE_MS = 400;

// 
const els = {
    html: document.documentElement,
    btnTema: document.querySelector('#theme-toggle'),
    form: document.querySelector('#search-form'),
    input: document.querySelector('#search-input'),
    preferiti: document.querySelector('#favorites-row'),
    preferitiVuoto: document.querySelector('#favorites-empty'),
    filtriPreferiti: document.querySelector('#favorites-filters'),
    appuntamenti: document.querySelector('#upcoming-list'),
    risultati: document.querySelector('#results-row'),
    risultatiStato: document.querySelector('#results-status'),
    filtriRisultati: document.querySelector('#results-filters'),
    dettagli: document.querySelector('#team-details'),
    modale: document.querySelector('#event-modal'),
    modaleTitolo: document.querySelector('#event-modal-title'),
    modaleCorpo: document.querySelector('#event-modal-body'),
};

// stato
const stato = {
    risultati: [],
    filtri: { preferiti: 'Tutte', risultati: 'Tutte' },
    idSelezionata: null,
    controllerRicerca: null,
    cacheProssimi: new Map(),
    eventi: new Map(),
    eventoAperto: null,
    richiestaAppuntamenti: 0,
};

/* render */ 

/* svuota il contenitore e ci inserisce i nuovi elementi. */
function mostra(contenitore, ...elementi) {
    contenitore.textContent = '';
    contenitore.append(...elementi);
}

const filtraPerLega = (lista, filtro) => (filtro === 'Tutte' ? lista : lista.filter((s) => s.lega === filtro));

function opzioniGriglia() {
    return {
        idsPreferiti: new Set(getPreferiti().map((s) => s.id)),
        idSelezionata: stato.idSelezionata,
    };
}

/* disegna una griglia di card con la sua barra di filtri (per lega). */
function renderGriglia({ lista, scope, contenitore, contenitoreFiltri }) {
    const leghe = valoriUnici(lista.map((s) => s.lega));
    if (!leghe.includes(stato.filtri[scope])) stato.filtri[scope] = 'Tutte';

    // I filtri hanno senso solo se ci sono almeno 2 leghe diverse
    contenitoreFiltri.hidden = leghe.length < 2;
    contenitoreFiltri.textContent = '';
    if (leghe.length >= 2) contenitoreFiltri.append(...ui.filtri(leghe, stato.filtri[scope], scope));

    mostra(contenitore, ...ui.cardsSquadre(filtraPerLega(lista, stato.filtri[scope]), opzioniGriglia()));
}

function renderPreferiti() {
    const preferiti = getPreferiti();
    els.preferitiVuoto.hidden = preferiti.length > 0;
    renderGriglia({
        lista: preferiti,
        scope: 'preferiti',
        contenitore: els.preferiti,
        contenitoreFiltri: els.filtriPreferiti,
    });
}

function renderRisultati() {
    renderGriglia({
        lista: stato.risultati,
        scope: 'risultati',
        contenitore: els.risultati,
        contenitoreFiltri: els.filtriRisultati,
    });
}

/* svuota la griglia dei risultati e mostra un messaggio/spinner/errore. */
function svuotaRisultati(...elementi) {
    stato.risultati = [];
    els.risultati.textContent = '';
    els.filtriRisultati.hidden = true;
    mostra(els.risultatiStato, ...elementi);
}

function registraEventi(lista) {
    lista.forEach((e) => stato.eventi.set(e.id, e));
}

/* ricerca */

async function eseguiRicerca(testo) {
    const query = testo.trim();

    // Annullo l'eventuale richiesta precedente ancora in corso
    stato.controllerRicerca?.abort();

    if (query.length < MIN_CARATTERI) {
        svuotaRisultati(ui.messaggio(
            query ? `Scrivi almeno ${MIN_CARATTERI} caratteri.` : 'Cerca una squadra per vedere i risultati.',
        ));
        return;
    }

    const controller = new AbortController();
    stato.controllerRicerca = controller;
    svuotaRisultati(ui.spinner(`Cerco "${query}"...`));

    try {
        const squadre = await cercaSquadre(query, controller.signal);
        stato.risultati = squadre;
        stato.filtri.risultati = 'Tutte';
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

/* preferiti */

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
    renderRisultati();
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

        registraEventi(items.map((i) => i.evento));
        mostra(els.appuntamenti, ui.appuntamenti(items, nErrori));
    } catch (err) {
        console.error(err);
        mostra(els.appuntamenti, ui.errore('Impossibile caricare i prossimi appuntamenti.'));
    }
}

/* squadra */

function evidenziaSelezionata() {
    document.querySelectorAll('.team-card').forEach((card) => {
        card.classList.toggle('selected', card.dataset.id === stato.idSelezionata);
    });
}

async function mostraDettagli(squadra) {
    stato.idSelezionata = squadra.id;
    evidenziaSelezionata();

    els.dettagli.hidden = false;
    mostra(els.dettagli, ui.dettagliLoading(squadra));
    els.dettagli.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
        const [prossimi, ultimi] = await Promise.all([prossimiEventi(squadra.id), ultimiRisultati(squadra.id)]);
        if (stato.idSelezionata !== squadra.id) return; // l'utente ha cliccato un'altra squadra

        registraEventi([...prossimi, ...ultimi]);
        mostra(els.dettagli, ui.dettagli(squadra, prossimi, ultimi));
    } catch (err) {
        console.error(err);
        if (stato.idSelezionata !== squadra.id) return;
        mostra(els.dettagli, ui.dettagliErrore(squadra, err.message || 'Impossibile caricare i dettagli.'));
    }
}

/* modale */

async function apriModaleEvento(idEvento) {
    const modale = bootstrap.Modal.getOrCreateInstance(els.modale);
    const base = stato.eventi.get(idEvento);
    stato.eventoAperto = idEvento;

    els.modaleTitolo.textContent = base?.nome ?? 'Dettagli evento';
    mostra(els.modaleCorpo, ui.spinner('Carico i dettagli...'));
    modale.show();

    try {
        const evento = (await dettaglioEvento(idEvento)) ?? base;
        if (stato.eventoAperto !== idEvento) return;
        if (!evento) throw new Error('Evento non trovato.');

        stato.eventi.set(evento.id, evento);
        els.modaleTitolo.textContent = evento.nome;
        mostra(els.modaleCorpo, ui.modaleEvento(evento));
    } catch (err) {
        console.error(err);
        if (stato.eventoAperto !== idEvento) return;
        // Se ho già i dati base dell'evento li mostro comunque
        if (base) {
            mostra(els.modaleCorpo, ui.modaleEvento(base));
        } else {
            mostra(els.modaleCorpo, ui.errore(err.message || 'Impossibile caricare l\'evento.'));
        }
    }
}

/* tema chiaro/scuro */

function applicaTema(tema) {
    els.html.setAttribute('data-bs-theme', tema);
    const scuro = tema === 'dark';
    els.btnTema.textContent = scuro ? '☀️' : '🌙';
    els.btnTema.setAttribute('aria-label', scuro ? 'Attiva tema chiaro' : 'Attiva tema scuro');
}

/* event listener */

/* click su una card: il bottone gestisce i preferiti, il resto apre i dettagli. */
function gestisciClickCard(event) {
    const card = event.target.closest('.team-card');
    if (!card) return;

    const id = card.dataset.id;
    if (event.target.closest('[data-action="toggle-fav"]')) {
        togglePreferito(id);
        return;
    }

    const squadra = trovaSquadra(id);
    if (squadra) mostraDettagli(squadra);
}

/* tastiera: Invio/Spazio su card o evento si comportano come un click. */
function gestisciTastiera(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!event.target.matches('.team-card, .event-item')) return;
    event.preventDefault();
    event.target.click();
}

function gestisciClickFiltro(event) {
    const btn = event.target.closest('[data-filtro]');
    if (!btn) return;
    stato.filtri[btn.dataset.scope] = btn.dataset.filtro;
    if (btn.dataset.scope === 'preferiti') renderPreferiti();
    else renderRisultati();
}

function init() {
    applicaTema(leggiTema());
    renderPreferiti();
    caricaAppuntamenti();
    svuotaRisultati(ui.messaggio('Cerca una squadra per vedere i risultati.'));

    // Ricerca: al submit (subito) e mentre si scrive (debounce)
    els.form.addEventListener('submit', (event) => {
        event.preventDefault();
        ricercaConDebounce.cancel();
        eseguiRicerca(els.input.value);
    });
    els.input.addEventListener('input', () => ricercaConDebounce(els.input.value));

    // card vengono ricreate a ogni render
    els.preferiti.addEventListener('click', gestisciClickCard);
    els.risultati.addEventListener('click', gestisciClickCard);

    // filtri
    els.filtriPreferiti.addEventListener('click', gestisciClickFiltro);
    els.filtriRisultati.addEventListener('click', gestisciClickFiltro);

    // eventi in modale
    document.addEventListener('click', (event) => {
        const item = event.target.closest('.event-item');
        if (item) apriModaleEvento(item.dataset.eventId);
    });

    document.addEventListener('keydown', gestisciTastiera);

    els.btnTema.addEventListener('click', () => {
        const nuovo = els.html.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
        applicaTema(nuovo);
        salvaTema(nuovo);
    });
}

init();