# SportsHub

Applicazione web per cercare squadre sportive, vedere prossime partite e ultimi risultati
e salvare le squadre preferite. I dati arrivano dall'API pubblica di TheSportsDB.

## Funzionalità

### Base
- Ricerca squadre per nome: indirizzo costruito con `new URL(...)` e `searchParams.set()`,
  chiamata con `async/await` e `try/catch`
- Spinner durante il caricamento e alert rosso in caso di errore
- Card squadra con logo, nome, campionato e paese (create con `createElement` e `textContent`)
- Messaggio "Nessuna squadra trovata" se la ricerca non dà risultati
- Click su una card: prossimi eventi e ultimi risultati caricati in parallelo con `Promise.all`
- Classi `Squadra` ed `Evento`; `Evento` ha i metodi per formattare data e ora
  con `Intl.DateTimeFormat` e per generare il punteggio

### Intermedio
- Preferiti salvati in `localStorage` (pulsanti Aggiungi / Rimuovi), all'avvio la lista è vuota
- Click su una preferita: ricarica i suoi dettagli senza ricercarla
- Ricerca mentre si scrive con debounce di 400ms e `AbortController`
- Layout responsive: 1 card per riga su mobile, 2+1 da 768px, 3 per riga da 1200px

### Extra
- All'avvio carica i prossimi appuntamenti di tutte le preferite con `Promise.allSettled`
  (una squadra che fallisce non blocca le altre), ordinati per data
- Filtro per sport: Tutti / Calcio / Basket / Football (campo `strSport`)
- Modale Bootstrap con i dettagli di un evento
- Tema chiaro / scuro salvato in `localStorage`
- Codice diviso in moduli ES (`import` / `export`) con un solo `<script type="module">`

## Struttura del JavaScript

    assets/js/
    ├── main.js            → file principale: stato dell'app ed event listener
    ├── api.js             → chiamate all'API di TheSportsDB
    ├── storage.js         → preferiti e tema in localStorage
    ├── elementi.js        → creazione degli elementi della pagina con createElement
    ├── strumenti.js       → funzioni di aiuto riutilizzabili
    └── models/
        ├── Squadra.js     → classe Squadra
        └── Evento.js      → classe Evento

> Nota sui nomi: rispetto alla suddivisione suggerita (`api.js`, `ui.js`, `main.js`)
> il file `ui.js` è stato rinominato **`elementi.js`**. `script.js` è stato rinominato
> **`main.js`**. In più sono stati aggiunti `storage.js`, `strumenti.js` e la cartella `models/`.

- **main.js**: prende gli elementi del DOM con `querySelector`, tiene lo stato dell'app e collega
  gli event listener (ricerca, click sulle card con event delegation, filtri, eventi, tema).
- **api.js**: funzioni `async/await` per cercare squadre, prossimi eventi, ultimi risultati e
  dettaglio evento. Gli indirizzi sono costruiti con `new URL()` e `searchParams.set()`.
  Gestisce gli errori (es. limite di 30 richieste al minuto) con `throw`.
- **storage.js**: legge, aggiunge e rimuove i preferiti e salva il tema in `localStorage`.
- **elementi.js**: funzioni che ricevono dati e restituiscono elementi HTML (card, spinner, errori,
  filtri, liste eventi, dettagli squadra, contenuto della modale).
- **strumenti.js**: `debounce` e `creaElemento`.
- **models/Squadra.js**: classe con costruttore che trasforma i dati dell'API in proprietà leggibili.
- **models/Evento.js**: classe per le partite con i metodi `formattaData()`, `formattaOra()`
  (con `Intl.DateTimeFormat`, convertendo da UTC all'ora locale) e `punteggio()`.

## API utilizzata

[TheSportsDB](https://www.thesportsdb.com/documentation) con la chiave gratuita `123`.

| Endpoint | Restituisce |
|---|---|
| `searchteams.php?t={nome}` | squadre trovate |
| `eventsnext.php?id={idTeam}` | prossimi eventi |
| `eventslast.php?id={idTeam}` | ultimi risultati |
| `lookupevent.php?id={idEvent}` | dettaglio di un evento |

Limiti della versione gratuita: 1 risultato per ricerca, solo partite in casa per prossimi eventi
e ultimi risultati, massimo 30 richieste al minuto.

## Come avviarlo

Il progetto usa i moduli ES: va aperto con un server locale (es. Live Server di VS Code),
non con doppio clic sul file `index.html`.

# Progetto Settimana 7 - EPICODE

Questo file `README.md` è stato creato per documentare e presentare il **Progetto della Settimana 7 del percorso EPICODE**, raccogliendo le informazioni principali sul lavoro svolto, la struttura e i ruoli coinvolti nella realizzazione.

## Realizzato da

| Persona | Ruolo |
|---|---|
| Manuel Burgalassi | README, HTML, CSS, JavaScript |