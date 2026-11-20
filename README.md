# Progetto-settimana-7

SPORTHUB

BASE:

dati arrivano da API
Pagina responsive:px 576 mobile tutti in verticale, px768 2+1 delle card e desktop t3 per fila
barra ricerca squadre da impostare se al change o al button o entrambi
se non trova squadra perchè errore nel nome "Nessuna squadra trovata"
async await
try catch
spinner caso errore 
card per la squadra o nessuna squadra trovata se null
click sulla card dopo la ricerca per dettagli squadra di prossimo evento e ultimo risultato (non prevista chiusura di base)
class squadra per costruttore
hover sulle card
button rimuovi per rimuovere dai preferiti
l'applicazione di base non ha nessun preferito

(non ci sono ma idee per extra:
tema chiaro/scuro
sticky top)

NON C'È FOOTER

INTERMEDIO:

aggiungi ai preferiti in localstorage
debouce sulla ricerca di 400ms con AbortController


EXTRA:

allávvio carica tutti i dettagli delle preferite mostra porssimi appuntamenti
bottoni per filtro delle card
modale per dettagli evento

EXTRA DI EXTRA:

struttura modulare in base a quello che fa


## HTML

- scritto le varie section ed header per inserimento dati tramite JS
- modale per i dettagli partita

## CSS

- fatto il css della pagina base

## Struttura del JavaScript

Il codice è diviso in moduli (`import` / `export`): ogni file ha un compito preciso.
Per funzionare la pagina va aperta con un server locale (es. Live Server).

    assets/js/
    ├── script.js          → file principale collegato all'HTML (per ora di prova)
    ├── api.js             → chiamate all'API di TheSportsDB
    ├── strumenti.js       → funzioni di aiuto riutilizzabili
    └── models/
        ├── Squadra.js     → classe Squadra
        └── Evento.js      → classe Evento

- **strumenti.js**: `debounce` per ritardare la ricerca, `creaElemento` per creare elementi HTML, `formatDate` per le date (`2026-05-17` → `17/05/2026`) e `valoriUnici` per creare i filtri.
- **models/Squadra.js**: classe con costruttore che trasforma i dati dell'API (`strTeam`, `strLeague`...) in proprietà leggibili (`nome`, `lega`...).
- **models/Evento.js**: classe per le partite: converte data e ora da UTC all'ora locale e calcola l'esito (vittoria, pareggio, sconfitta).
- **api.js**: funzioni `async/await` per cercare squadre, prossimi eventi, ultimi risultati e dettaglio evento. Gestisce gli errori (es. limite di 30 richieste al minuto) con `throw`.
- **script.js**: per ora contiene una prova in console della ricerca.

### API utilizzata
[TheSportsDB](https://www.thesportsdb.com/documentation) con la chiave gratuita `123`.
Limiti della versione gratuita: 1 risultato per ricerca, solo partite in casa per prossimi eventi e ultimi risultati, massimo 30 richieste al minuto.