import { formatDate } from '../strumenti.js';

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
     Data e ora dell'API sono in UTC: le unisco in un unico oggetto Date.
     La "Z" finale dice a JS che l'orario è UTC, così poi viene convertito nell'ora locale.
     */
    get dataOra() {
        if (!this.data) return null;
        const ora = this.ora ? this.ora.slice(0, 8) : '00:00:00'; // "19:00:00"
        return new Date(`${this.data}T${ora}Z`);
    }

    get dataFormattata() {
        return formatDate(this.data);
    }

    /* Ora locale dell'utente (es. "21:00"), vuota se non disponibile. */
    get oraFormattata() {
        const d = this.dataOra;
        if (!d || Number.isNaN(d.getTime()) || !this.ora) return '';
        return d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
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