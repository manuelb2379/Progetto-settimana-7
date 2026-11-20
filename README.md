# Progetto-settimana-7

# SportsHub

Applicazione web per cercare squadre sportive, vedere prossime partite e ultimi risultati
e salvare le squadre preferite. I dati arrivano dall'API pubblica di TheSportsDB.

## Funzionalità

### Base
- Ricerca squadre per nome con spinner durante il caricamento e alert in caso di errore
- Card squadra con logo, nome, campionato e paese (create con `createElement`)
- Messaggio "Nessuna squadra trovata" se la ricerca non dà risultati
- Click su una card: prossimi eventi e ultimi risultati caricati in parallelo con `Promise.all`
- Classi `Squadra` ed `Evento` per trasformare i dati dell'API

### Intermedio
- Preferiti salvati in `localStorage` (pulsanti Aggiungi / Rimuovi), all'avvio la lista è vuota
- Ricerca mentre si scrive con debounce di 400ms e `AbortController`
- Layout responsive: 1 card per riga su mobile, 2+1 da 768px, 3 per riga da 1200px

### Extra
- All'avvio carica i prossimi appuntamenti di tutte le preferite con `Promise.allSettled`, ordinati per data
- Pulsanti per filtrare le card
- Modale Bootstrap con i dettagli di un evento
- Tema chiaro / scuro salvato in `localStorage`
- Codice diviso in moduli ES (`import` / `export`)

## Struttura del JavaScript

    assets/js/
    ├── script.js          → file principale: stato dell'app ed event listener
    ├── api.js             → chiamate all'API di TheSportsDB
    ├── storage.js         → preferiti e tema in localStorage
    ├── elementi.js        → creazione degli elementi della pagina con createElement
    ├── strumenti.js       → funzioni di aiuto riutilizzabili
    └── models/
        ├── Squadra.js     → classe Squadra
        └── Evento.js      → classe Evento

- **script.js**: prende gli elementi del DOM con `querySelector`, tiene lo stato dell'app e collega
  gli event listener (ricerca, click sulle card con event delegation, filtri, eventi, tema).
- **api.js**: funzioni `async/await` per cercare squadre, prossimi eventi, ultimi risultati e dettaglio
  evento. Gestisce gli errori (es. limite di 30 richieste al minuto) con `throw`.
- **storage.js**: legge, aggiunge e rimuove i preferiti e salva il tema in `localStorage`.
- **elementi.js**: funzioni che ricevono dati e restituiscono elementi HTML (card, spinner, errori,
  liste eventi, dettagli squadra, contenuto della modale).
- **strumenti.js**: `debounce`, `creaElemento`, `formatDate` e `valoriUnici`.
- **models/Squadra.js**: classe con costruttore che trasforma i dati dell'API in proprietà leggibili.
- **models/Evento.js**: classe per le partite: converte data e ora da UTC all'ora locale e calcola
  l'esito (vittoria, pareggio, sconfitta).

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