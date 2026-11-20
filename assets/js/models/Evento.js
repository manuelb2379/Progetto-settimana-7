const FORMATO_DATA = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
const FORMATO_ORA = new Intl.DateTimeFormat('it-IT', { hour: '2-digit', minute: '2-digit' });

function toNumberOrNull(value) {
    return value === null || value === undefined || value === '' ? null : Number(value);
}

export class Evento {
    constructor(e) {
        this.id = String(e.idEvent);
        this.nome = e.strEvent ?? `${e.strHomeTeam} vs ${e.strAwayTeam}`;
        this.casa = e.strHomeTeam ?? '';
        this.trasferta = e.strAwayTeam ?? '';
        this.idCasa = String(e.idHomeTeam ?? '');
        this.idTrasferta = String(e.idAwayTeam ?? '');
        this.golCasa = toNumberOrNull(e.intHomeScore);
        this.golTrasferta = toNumberOrNull(e.intAwayScore);
        this.data = e.dateEvent ?? '';
        this.ora = e.strTime ?? '';
        this.lega = e.strLeague ?? '';
        this.stagione = e.strSeason ?? '';
        this.giornata = e.intRound ?? '';
        this.stadio = e.strVenue ?? '';
        this.citta = e.strCity ?? '';
        this.paese = e.strCountry ?? '';
        this.immagine = e.strThumb || e.strPoster || '';
        this.stato = e.strStatus ?? '';
    }

    get haRisultato() {
        return this.golCasa !== null && this.golTrasferta !== null;
    }

    /*
     * Data e ora dell'API sono in UTC: le unisco in un unico oggetto Date.
     * La "Z" finale dice a JS che l'orario è UTC, così poi viene convertito nell'ora locale.
     */
    get dataOra() {
        if (!this.data) return null;
        const ora = this.ora ? this.ora.slice(0, 8) : '00:00:00'; // "19:00:00"
        return new Date(`${this.data}T${ora}Z`);
    }

    /** Data nel formato italiano, es. "17/05/2026" (vuota se manca). */
    formattaData() {
        const d = this.dataOra;
        if (!d || Number.isNaN(d.getTime())) return '';
        return FORMATO_DATA.format(d);
    }

    /** Ora locale dell'utente, es. "21:00" (vuota se manca). */
    formattaOra() {
        const d = this.dataOra;
        if (!d || Number.isNaN(d.getTime()) || !this.ora) return '';
        return FORMATO_ORA.format(d);
    }

    /** Punteggio pronto da mostrare, es. "3 – 1" (vuoto se la partita non è ancora giocata). */
    punteggio() {
        if (!this.haRisultato) return '';
        return `${this.golCasa} – ${this.golTrasferta}`;
    }


    /* "V" vittoria, "P" pareggio, "S" sconfitta dal punto di vista della squadra indicata. */
    esitoPer(idSquadra) {
        if (!this.haRisultato) return null;
        if (this.golCasa === this.golTrasferta) return 'P';
        const vinceCasa = this.golCasa > this.golTrasferta;
        const giocaInCasa = this.idCasa === String(idSquadra);
        return vinceCasa === giocaInCasa ? 'V' : 'S';
    }
}