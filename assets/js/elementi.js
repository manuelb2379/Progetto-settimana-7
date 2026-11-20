import { creaElemento } from './strumenti.js';

// stati generici

export function spinner(testo = 'Caricamento...') {
    const box = creaElemento('div', 'd-flex align-items-center justify-content-center gap-2 py-4 text-body-secondary');
    box.setAttribute('role', 'status');

    const cerchio = creaElemento('div', 'spinner-border spinner-border-sm text-primary');
    cerchio.setAttribute('aria-hidden', 'true');

    box.append(cerchio, creaElemento('span', '', testo));
    return box;
}

export function errore(messaggio) {
    const box = creaElemento('div', 'alert alert-danger d-flex align-items-center gap-2 mb-0');
    box.setAttribute('role', 'alert');

    const icona = creaElemento('span', '', '⚠️');
    icona.setAttribute('aria-hidden', 'true');

    box.append(icona, creaElemento('span', '', messaggio));
    return box;
}

export function messaggio(testo) {
    return creaElemento('p', 'text-body-secondary fst-italic mb-0', testo);
}

export function nessunaSquadra() {
    const card = creaElemento('div', 'card border-0 shadow-sm');
    const body = creaElemento('div', 'card-body text-center py-4');

    const icona = creaElemento('div', 'fs-2', '🔍');
    icona.setAttribute('aria-hidden', 'true');

    body.append(
        icona,
        creaElemento('p', 'fw-semibold mb-1', 'Nessuna squadra trovata'),
        creaElemento('p', 'small text-body-secondary mb-0', 'Controlla il nome e riprova.'),
    );
    card.append(body);
    return card;
}

// filtri per sport

// etichetta = testo del pulsante, valore = campo strSport dell'API
const SPORT = [
    { etichetta: 'Tutti', valore: 'Tutti' },
    { etichetta: 'Calcio', valore: 'Soccer' },
    { etichetta: 'Basket', valore: 'Basketball' },
    { etichetta: 'Football', valore: 'American Football' },
];

export function filtri(attivo, scope) {
    return SPORT.map(({ etichetta, valore }) => {
        const isAttivo = valore === attivo;
        const classeColore = isAttivo ? 'btn-primary' : 'btn-outline-primary';

        const btn = creaElemento('button', `btn btn-sm rounded-pill ${classeColore}`, etichetta);
        btn.type = 'button';
        btn.dataset.filtro = valore;
        btn.dataset.scope = scope;
        btn.setAttribute('aria-pressed', isAttivo);
        return btn;
    });
}

/* messaggio quando il filtro non lascia nessuna card (occupa tutta la riga). */
export function nessunaPerSport() {
    const col = creaElemento('div', 'col-12');
    col.append(messaggio('Nessuna squadra per questo sport.'));
    return col;
}

// card squadra

function stemma(squadra) {
    const img = creaElemento('img', 'team-badge mb-3');
    img.src = squadra.stemma;
    img.alt = `Stemma ${squadra.nome}`;
    img.loading = 'lazy';
    return img;
}

/* bottone dei risultati per aggiungere la squadra ai preferiti */
function bottoneAggiungi(squadra) {
    const btn = creaElemento('button', 'btn btn-sm btn-outline-primary fw-semibold w-100', '☆ Aggiungi ai preferiti');
    btn.type = 'button';
    btn.dataset.action = 'toggle-fav';
    btn.setAttribute('aria-label', `Aggiungi ${squadra.nome} ai preferiti`);
    return btn;
}

/* testo al posto del bottone quando la squadra è già tra i preferiti. */
function avvisoGiaPreferita() {
    return creaElemento('p', 'small fw-semibold text-success mb-0', '★ Squadra già inserita nei preferiti');
}

function bottoneDettagli(squadra) {
    const btn = creaElemento('button', 'btn btn-sm btn-primary flex-fill', 'Dettagli');
    btn.type = 'button';
    btn.dataset.action = 'dettagli';
    btn.setAttribute('aria-label', `Vedi i dettagli di ${squadra.nome}`);
    return btn;
}

function bottoneRimuovi(squadra) {
    const btn = creaElemento('button', 'btn btn-sm btn-remove flex-fill', '🗑 Rimuovi');
    btn.type = 'button';
    btn.dataset.action = 'toggle-fav';
    btn.setAttribute('aria-label', `Rimuovi ${squadra.nome} dai preferiti`);
    return btn;
}

/* Card di una squadra.
 - nei risultati (inPreferiti = false): stella + Dettagli
 - nei preferiti (inPreferiti = true): Dettagli + Rimuovi
 */
export function cardSquadra(squadra, { preferita = false, inPreferiti = false } = {}) {
    const col = creaElemento('div', 'col');

    const card = creaElemento('article', 'card team-card h-100 text-center');
    card.dataset.id = squadra.id;
    card.tabIndex = 0;
    card.setAttribute('aria-label', `${squadra.nome}: premi Invio per vedere i dettagli`);

    const body = creaElemento('div', 'card-body d-flex flex-column align-items-center');
    if (squadra.stemma) body.append(stemma(squadra)); // senza stemma: nessuna immagine
    body.append(
        creaElemento('h3', 'h6 fw-bold mb-1', squadra.nome),
        creaElemento('p', 'small text-body-secondary mb-0', squadra.lega),
        creaElemento('p', 'small text-body-secondary mb-3', squadra.paese),
    );

    const azioni = creaElemento('div', 'd-flex gap-2 w-100 mt-auto justify-content-center');
    if (inPreferiti) {
        azioni.append(bottoneDettagli(squadra), bottoneRimuovi(squadra));
    } else if (preferita) {
        azioni.append(avvisoGiaPreferita());
    } else {
        azioni.append(bottoneAggiungi(squadra));
    }
    body.append(azioni);

    card.append(body);
    col.append(card);
    return col;
}
/* restituisce un array di card (una colonna per squadra). */
export function cardsSquadre(squadre, { idsPreferiti, inPreferiti = false }) {
    return squadre.map((s) => cardSquadra(s, {
        preferita: idsPreferiti.has(s.id),
        inPreferiti,
    }));
}

// eventi

const CLASSI_ESITO = { V: 'text-bg-success', P: 'text-bg-secondary', S: 'text-bg-danger' };

function rigaEvento(evento, { idSquadra = null, etichetta = '', cliccabile = false } = {}) {
    const li = creaElemento('li');

    if (cliccabile) {
        li.classList.add('event-item');
        li.dataset.eventId = evento.id;
        li.tabIndex = 0;
        li.setAttribute('role', 'button');
        li.setAttribute('aria-label', `Dettagli di ${evento.nome}`);
        if (idSquadra) li.dataset.teamId = idSquadra;
    }

    // riga piccola
    const quando = [evento.formattaData(), evento.formattaOra()].filter(Boolean).join(' · ');
    const info = creaElemento('small', 'd-block text-body-secondary');
    if (etichetta) info.append(creaElemento('strong', '', etichetta), ' · ');
    info.append(quando);

    li.append(info, creaElemento('span', 'fw-semibold', evento.nome));

    // badge con il punteggio, colorato in base all'esito
    if (evento.haRisultato) {
        const classe = CLASSI_ESITO[evento.esitoPer(idSquadra)] ?? 'text-bg-success';
        li.append(creaElemento('span', `badge ${classe} ms-2`, evento.punteggio()));
    }
    return li;
}

function listaEventi(righe, testoVuoto) {
    const ul = creaElemento('ul', 'event-list list-unstyled mb-0');
    if (righe.length) {
        ul.append(...righe);
    } else {
        ul.append(creaElemento('li', 'fst-italic', testoVuoto));
    }
    return ul;
}

/* prossimi appuntamenti di tutte le preferite*/
export function appuntamenti(items, nErrori = 0) {
    const box = creaElemento('div');

    if (nErrori) {
        box.append(creaElemento('div', 'alert alert-warning py-2 small',
            `Non è stato possibile caricare gli eventi di ${nErrori} squadra/e.`));
    }

    const card = creaElemento('div', 'card border-0 shadow-sm');
    const body = creaElemento('div', 'card-body px-4 py-2');

    const righe = items.map(({ evento, squadra }) => rigaEvento(evento, {
        etichetta: squadra.nome,
        idSquadra: squadra.id,
        cliccabile: true,
    }));

    body.append(listaEventi(righe, 'Nessun evento in programma per le tue preferite'));
    card.append(body);
    box.append(card);
    return box;
}

// modale squadra

/* parte alta della modale: logo, campionato, paese, stadio, anno e descrizione. */
function infoSquadra(squadra) {
    const box = creaElemento('div', 'mb-4');

    const intestazione = creaElemento('div', 'text-center mb-3');
    if (squadra.stemma) intestazione.append(stemma(squadra));

    const campionato = [squadra.lega, squadra.paese].filter(Boolean).join(' · ');
    if (campionato) intestazione.append(creaElemento('p', 'fw-semibold mb-1', campionato));

    const extra = [
        squadra.stadio && `🏟 ${squadra.stadio}`,
        squadra.fondazione && `Fondata nel ${squadra.fondazione}`,
    ].filter(Boolean).join(' · ');
    if (extra) intestazione.append(creaElemento('p', 'small text-body-secondary mb-0', extra));

    box.append(intestazione);
    if (squadra.descrizione) {
        box.append(creaElemento('p', 'team-description small mb-0', squadra.descrizione));
    }
    return box;
}

function colonnaEventi(titolo, eventi, idSquadra, testoVuoto) {
    const col = creaElemento('div', 'col-12 col-md-6');
    const righe = eventi.map((e) => rigaEvento(e, { idSquadra, cliccabile: true }));
    col.append(creaElemento('h3', 'details-heading h5', titolo), listaEventi(righe, testoVuoto));
    return col;
}

/* contenuto della modale mentre arrivano prossimi eventi e ultimi risultati. */
export function modaleSquadraLoading(squadra) {
    const box = creaElemento('div');
    box.append(infoSquadra(squadra), spinner('Carico partite e risultati...'));
    return box;
}

/* contenuto della modale se il caricamento delle partite fallisce. */
export function modaleSquadraErrore(squadra, messaggioErrore) {
    const box = creaElemento('div');
    box.append(infoSquadra(squadra), errore(messaggioErrore));
    return box;
}

/* contenuto completo della modale: info squadra + prossimi eventi + ultimi risultati. */
export function modaleSquadra(squadra, prossimi, ultimi) {
    const box = creaElemento('div');

    const row = creaElemento('div', 'row g-4');
    row.append(
        colonnaEventi('Prossimi eventi', prossimi, squadra.id, 'Nessun evento in programma'),
        colonnaEventi('Ultimi risultati', ultimi, squadra.id, 'Nessun risultato disponibile'),
    );

    box.append(infoSquadra(squadra), row);
    return box;
}

/** Bottone per tornare dai dettagli della partita a quelli della squadra. */
function bottoneTorna() {
    const btn = creaElemento('button', 'btn btn-sm btn-outline-secondary mb-3', '← Torna alla squadra');
    btn.type = 'button';
    btn.dataset.action = 'torna';
    return btn;
}

/** Contenuto della modale mentre arriva il dettaglio della partita. */
export function modaleEventoLoading() {
    const box = creaElemento('div');
    box.append(bottoneTorna(), spinner('Carico i dettagli della partita...'));
    return box;
}

/** Contenuto della modale se il dettaglio della partita non si carica. */
export function modaleEventoErrore(messaggioErrore) {
    const box = creaElemento('div');
    box.append(bottoneTorna(), errore(messaggioErrore));
    return box;
}

/** Contenuto della modale con tutti i dati della partita. */
export function modaleEvento(evento) {
    const box = creaElemento('div');
    box.append(bottoneTorna());

    if (evento.immagine) {
        const img = creaElemento('img', 'img-fluid rounded mb-3');
        img.src = evento.immagine;
        img.alt = '';
        box.append(img);
    }

    // Casa - punteggio - trasferta
    const punteggio = evento.haRisultato ? evento.punteggio() : 'vs';
    const sfida = creaElemento('div', 'd-flex justify-content-center align-items-center gap-3 text-center mb-4');
    sfida.append(
        creaElemento('span', 'fw-bold flex-fill', evento.casa),
        creaElemento('span', 'badge text-bg-dark fs-6', punteggio),
        creaElemento('span', 'fw-bold flex-fill', evento.trasferta),
    );

    // Elenco informazioni (solo quelle presenti)
    const info = [
        ['Competizione', evento.lega],
        ['Stagione', evento.stagione],
        ['Giornata', evento.giornata],
        ['Data', evento.formattaData()],
        ['Ora', evento.formattaOra()],
        ['Stadio', evento.stadio],
        ['Città', [evento.citta, evento.paese].filter(Boolean).join(', ')],
        ['Stato', evento.stato],
    ].filter(([, valore]) => valore);

    const dl = creaElemento('dl', 'row mb-0 small');
    info.forEach(([etichetta, valore]) => {
        dl.append(
            creaElemento('dt', 'col-5 text-body-secondary', etichetta),
            creaElemento('dd', 'col-7', valore),
        );
    });

    box.append(sfida, dl);
    return box;
}