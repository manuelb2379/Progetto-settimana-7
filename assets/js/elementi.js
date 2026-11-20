import { creaElemento } from './strumenti.js';

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

// bottoni filtri

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

function bottonePreferito(squadra, preferita) {
    const btn = creaElemento('button', 'btn btn-sm w-100 mt-auto');
    btn.type = 'button';
    btn.dataset.action = 'toggle-fav';

    if (preferita) {
        btn.classList.add('btn-remove');
        btn.textContent = '🗑 Rimuovi';
        btn.setAttribute('aria-label', `Rimuovi ${squadra.nome} dai preferiti`);
    } else {
        btn.classList.add('btn-outline-primary', 'fw-semibold');
        btn.textContent = '☆ Aggiungi ai preferiti';
        btn.setAttribute('aria-label', `Aggiungi ${squadra.nome} ai preferiti`);
    }
    return btn;
}

export function cardSquadra(squadra, { preferita = false, selezionata = false } = {}) {
    const col = creaElemento('div', 'col');

    const card = creaElemento('article', 'card team-card h-100 text-center');
    if (selezionata) card.classList.add('selected');
    card.dataset.id = squadra.id;
    card.tabIndex = 0;
    card.setAttribute('aria-label', `${squadra.nome}: premi Invio per vedere i dettagli`);

    const body = creaElemento('div', 'card-body d-flex flex-column align-items-center');
    if (squadra.stemma) body.append(stemma(squadra)); // senza stemma: nessuna immagine
    body.append(
        creaElemento('h3', 'h6 fw-bold mb-1', squadra.nome),
        creaElemento('p', 'small text-body-secondary mb-0', squadra.lega),
        creaElemento('p', 'small text-body-secondary mb-3', squadra.paese),
        bottonePreferito(squadra, preferita),
    );

    card.append(body);
    col.append(card);
    return col;
}

/* restituisce un array di card (una colonna per squadra). */
export function cardsSquadre(squadre, { idsPreferiti, idSelezionata }) {
    return squadre.map((s) => cardSquadra(s, {
        preferita: idsPreferiti.has(s.id),
        selezionata: s.id === idSelezionata,
    }));
}

// risultati eventi

const CLASSI_ESITO = { V: 'text-bg-success', P: 'text-bg-secondary', S: 'text-bg-danger' };

function rigaEvento(evento, { idSquadra = null, etichetta = '' } = {}) {
    const li = creaElemento('li', 'event-item');
    li.dataset.eventId = evento.id;
    li.tabIndex = 0;
    li.setAttribute('role', 'button');
    li.setAttribute('aria-label', `Dettagli di ${evento.nome}`);

    // riga piccola: (squadra ·) data · ora
    const quando = [evento.formattaData(), evento.formattaOra()].filter(Boolean).join(' · ');
    const info = creaElemento('small', 'd-block text-body-secondary');
    if (etichetta) info.append(creaElemento('strong', '', etichetta), ' · ');
    info.append(quando);

    li.append(info, creaElemento('span', 'fw-semibold', evento.nome));

    // badge con il punteggio, colorato in base all'esito
    if (evento.haRisultato) {
        const classe = CLASSI_ESITO[evento.esitoPer(idSquadra)] ?? 'text-bg-success';
        li.append(creaElemento('span', `badge ${classe} ms-2`, `${evento.golCasa} – ${evento.golTrasferta}`));
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

/* prossimi appuntamenti di tutte le preferite */
export function appuntamenti(items, numeroErrori = 0) {
    const box = creaElemento('div');

    if (numeroErrori) {
        box.append(creaElemento('div', 'alert alert-warning py-2 small',
            `Non è stato possibile caricare gli eventi di ${numeroErrori} squadra/e.`));
    }

    const card = creaElemento('div', 'card border-0 shadow-sm');
    const body = creaElemento('div', 'card-body px-4 py-2');
    const righe = items.map(({ evento, squadra }) => rigaEvento(evento, { etichetta: squadra.nome }));

    body.append(listaEventi(righe, 'Nessun evento in programma per le tue preferite'));
    card.append(body);
    box.append(card);
    return box;
}

// dettagli squadra 

/* card dei dettagli con l'intestazione (nome, stadio, anno) e il contenuto passato. */
function contenitoreDettagli(squadra, ...contenuto) {
    const card = creaElemento('div', 'card border-0 shadow-sm');
    const body = creaElemento('div', 'card-body p-4');

    const intestazione = creaElemento('div', 'mb-4');
    intestazione.append(creaElemento('h2', 'details-title h3 mb-0', squadra.nome));

    const meta = [
        squadra.stadio && `🏟 ${squadra.stadio}`,
        squadra.fondazione && `Fondata nel ${squadra.fondazione}`,
    ].filter(Boolean).join(' · ');
    if (meta) intestazione.append(creaElemento('small', 'text-body-secondary', meta));

    body.append(intestazione, ...contenuto);
    card.append(body);
    return card;
}

export function dettagliLoading(squadra) {
    return contenitoreDettagli(squadra, spinner('Carico partite e risultati...'));
}

export function dettagliErrore(squadra, messaggioErrore) {
    return contenitoreDettagli(squadra, errore(messaggioErrore));
}

function colonnaEventi(titolo, eventi, idSquadra, testoVuoto) {
    const col = creaElemento('div', 'col-12 col-md-6');
    const righe = eventi.map((e) => rigaEvento(e, { idSquadra }));
    col.append(creaElemento('h3', 'details-heading h5', titolo), listaEventi(righe, testoVuoto));
    return col;
}

export function dettagli(squadra, prossimi, ultimi) {
    const row = creaElemento('div', 'row g-4');
    row.append(
        colonnaEventi('Prossimi eventi', prossimi, squadra.id, 'Nessun evento in programma'),
        colonnaEventi('Ultimi risultati', ultimi, squadra.id, 'Nessun risultato disponibile'),
    );
    return contenitoreDettagli(squadra, row);
}

// modale evento 

export function modaleEvento(evento) {
    const box = creaElemento('div');

    if (evento.immagine) {
        const img = creaElemento('img', 'img-fluid rounded mb-3');
        img.src = evento.immagine;
        img.alt = '';
        box.append(img);
    }

    // casa, punteggio, trasferta
    const punteggio = evento.haRisultato ? evento.punteggio() : 'vs';
    const sfida = creaElemento('div', 'd-flex justify-content-center align-items-center gap-3 text-center mb-4');
    sfida.append(
        creaElemento('span', 'fw-bold flex-fill', evento.casa),
        creaElemento('span', 'badge text-bg-dark fs-6', punteggio),
        creaElemento('span', 'fw-bold flex-fill', evento.trasferta),
    );

    // elenco informazioni (solo quelle presenti)
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