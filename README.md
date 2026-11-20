# SportsHub

Applicazione web per cercare squadre sportive, vedere prossime partite e ultimi risultati
e salvare le squadre preferite. I dati arrivano dall'API pubblica di TheSportsDB.

## Funzionalità

Legenda: ✅ fatto · ❌ non fatto

### Base – Ricerca squadre e dettagli

**Ricerca squadre**
- ✅ Titolo SportsHub + form con input e bottone Cerca
- ✅ Al submit: GET a `searchteams.php` con indirizzo costruito da `new URL(...)` e `searchParams.set("t", query)`
- ✅ Chiamata con `async/await` + `try/catch`
- ✅ Spinner durante il caricamento
- ✅ Alert rosso in caso di errore
- ✅ Card con logo, nome, campionato e paese create con `createElement` e `textContent`
- ✅ "Nessuna squadra trovata" se `teams` è `null`

**Dettagli squadra**
- ✅ Click su una card: carica in parallelo con `Promise.all` prossimi eventi (`eventsnext.php`)
  e ultimi risultati (`eventslast.php`)
- ✅ Due liste "Prossimi eventi" e "Ultimi risultati", mostrate in una modale insieme a logo,
  campionato, paese, stadio, anno di fondazione e descrizione
- ✅ Ogni evento mostra data, casa vs trasferta ed eventuale punteggio

**Classi**
- ✅ `class Squadra` con costruttore che mappa i dati dell'API (id, nome, logo, lega, paese, ...)
- ✅ `class Evento` con costruttore che mappa i dati dell'API (id, data, casa, trasferta, punteggi, ...)
- ✅ Metodi per formattare data e ora con `Intl.DateTimeFormat` (`formattaData()`, `formattaOra()`)
- ✅ Metodo per generare il punteggio (`punteggio()`)

### Intermedio – Preferite, debounce, responsive

**Squadre preferite**
- ✅ Bottone "☆ Aggiungi ai preferiti" su ogni card dei risultati
  (se è già salvata compare "★ Squadra già inserita nei preferiti")
- ✅ Sezione "Le tue squadre preferite" salvata in `localStorage`, che sopravvive al refresh
- ✅ Bottone "Rimuovi" per togliere una squadra
- ✅ Click su una preferita: ricarica i suoi dettagli senza ricercarla

**Debounce sulla ricerca**
- ✅ La ricerca parte dopo 400ms di pausa nella digitazione
- ✅ Con `AbortController` viene annullata la richiesta precedente ancora in corso

**Layout responsive**
- ✅ Griglia da 1 colonna (mobile) a 3 (desktop): 1 card per riga, 2+1 da 768px, 3 per riga da 1200px
- ✅ Testato ai tre breakpoint

### Extra – Versione avanzata

- ✅ Caricamento parallelo delle preferite all'avvio con `Promise.allSettled`
  (una squadra che fallisce non blocca le altre), con i prossimi appuntamenti ordinati per data
- ✅ Filtro per sport: bottoni Tutti / Calcio / Basket / Football sul campo `strSport`
  (applicato alle card dei preferiti)
- ✅ Modale dettagli evento: cliccando una partita (dalla modale della squadra o dai prossimi
  appuntamenti) si vedono tutti i dati della partita, con il bottone "← Torna alla squadra"
- ✅ Moduli ES: codice diviso in `api.js`, `elementi.js` (al posto di `ui.js`), `main.js` e altri
  moduli, con un solo `<script type="module">` nell'HTML

### Aggiunte personali (non richieste dalle slide)

**Header**
- ✅ Header sticky (resta in alto mentre si scorre)
- ✅ Altezza responsive: 250px su mobile, 300px da 768px, 350px da 1200px
- ✅ Immagine di sfondo a tema sport, con velo blu semitrasparente e animazione di entrata da sinistra
- ✅ Tema chiaro / scuro salvato in `localStorage`; in modalità scura anche i bottoni dell'header diventano scuri

**Ricerca e preferiti**
- ✅ Risultati mostrati subito sotto la barra di ricerca
- ✅ Dopo aver aggiunto o rimosso una squadra dai preferiti, la barra di ricerca e i risultati si svuotano
- ✅ Contatore accanto al titolo dei preferiti, es. "(3)"
- ✅ Toast di conferma quando una squadra viene aggiunta o rimossa
- ✅ Card cliccabili anche da tastiera (Invio / Spazio)

**Altro**
- ✅ Bottone "torna su" in basso a destra, visibile solo dopo aver scorso la pagina
- ✅ Footer con link ai social (Instagram, Facebook, X) con icone di Bootstrap Icons

## Struttura del progetto

    index.html
    assets/
    ├── css/
    │   └── style.css
    ├── img/
    │   └── header-sport.jpg   → immagine di sfondo dell'header
    └── js/
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
  gli event listener (ricerca, card con event delegation, filtri, modale, prossimi appuntamenti,
  tema, scroll). Gestisce la modale della squadra e quella della partita, il toast e il bottone "torna su".
- **api.js**: funzioni `async/await` per cercare squadre, prossimi eventi, ultimi risultati e
  dettaglio partita. Gli indirizzi sono costruiti con `new URL()` e `searchParams.set()`.
  Gestisce gli errori (es. limite di 30 richieste al minuto) con `throw`.
- **storage.js**: legge, aggiunge e rimuove i preferiti e salva il tema in `localStorage`.
- **elementi.js**: funzioni che ricevono dati e restituiscono elementi HTML (card, spinner, errori,
  filtri, liste eventi, contenuto della modale della squadra e della partita).
- **strumenti.js**: `debounce` e `creaElemento`.
- **models/Squadra.js**: classe con costruttore che trasforma i dati dell'API in proprietà leggibili
  (nome, campionato, paese, logo, sport, stadio, anno di fondazione, descrizione).
- **models/Evento.js**: classe per le partite con i metodi `formattaData()`, `formattaOra()`
  (con `Intl.DateTimeFormat`, convertendo da UTC all'ora locale), `punteggio()` ed `esitoPer()`
  (vittoria / pareggio / sconfitta, per il colore del punteggio).

## Librerie esterne

- [Bootstrap 5.3](https://getbootstrap.com/) per layout, componenti, modale e toast
- [Bootstrap Icons](https://icons.getbootstrap.com/) per le icone del footer e del bottone "torna su"

## API utilizzata

[TheSportsDB](https://www.thesportsdb.com/documentation) con la chiave gratuita `123`.

| Endpoint | Restituisce |
|---|---|
| `searchteams.php?t={nome}` | squadre trovate |
| `eventsnext.php?id={idTeam}` | prossimi eventi |
| `eventslast.php?id={idTeam}` | ultimi risultati |
| `lookupevent.php?id={idEvent}` | dettaglio di una partita |

Limiti della versione gratuita: 1 risultato per ricerca, solo partite in casa per prossimi eventi
e ultimi risultati, massimo 30 richieste al minuto. Se si supera il limite le richieste vengono
bloccate per qualche minuto.

## Cronologia delle versioni

- **v1.1** – Base del progetto: pagina, modelli e fetch dati
- **v1.2** – Card con `createElement`, ricerca con debounce e modale; aggiunti `storage.js`,
  `elementi.js` e `script.js` completo; `script.js` rinominato in `main.js`
- **v2.1** – Adeguamento alle specifiche: `URL`/`searchParams`, `Intl.DateTimeFormat`;
  metodi `formattaData`, `formattaOra` e `punteggio` in `Evento`
- **v2.2** – Rimozione degli elementi non più utili e piccole sostituzioni
- **v3.1** – Modale dettagli squadra, nuove card, footer e header sticky; risultati sotto la barra
  di ricerca; card cliccabile che apre la modale con descrizione, prossimi eventi e ultimi risultati;
  bottone "Aggiungi ai preferiti" e "Dettagli/Rimuovi" nei preferiti; filtro per sport solo sui
  preferiti; footer con icone social; header sticky con immagine di sfondo; bottone torna su
- **v4.1** – Partite cliccabili (dalla modale della squadra e dai prossimi appuntamenti) con
  modale dettagli partita; contatore e toast nei preferiti; barra di ricerca che si svuota dopo
  l'aggiunta; bottone torna su visibile solo dopo lo scroll; header con altezza responsive e
  leggero movimento dell'immagine; bottoni scuri in modalità scura

## Come avviarlo

Il progetto usa i moduli ES: va aperto con un server locale (es. Live Server di VS Code),
non con doppio clic sul file `index.html`.

# Progetto Settimana 7 - EPICODE

Questo file `README.md` è stato creato per documentare e presentare il **Progetto della Settimana 7 del percorso EPICODE**, raccogliendo le informazioni principali sul lavoro svolto, la struttura e i ruoli coinvolti nella realizzazione.

## Realizzato da

| Persona | Ruolo |
|---|---|
| Manuel Burgalassi | README, HTML, CSS, JavaScript |