export class Squadra {
    constructor({ id, nome, lega = '', paese = '', stemma = '', sport = '', stadio = '', fondazione = '', descrizione = '' }) {
        this.id = String(id);
        this.nome = nome;
        this.lega = lega;
        this.paese = paese;
        this.stemma = stemma;
        this.sport = sport;
        this.stadio = stadio;
        this.fondazione = fondazione;
        this.descrizione = descrizione;
    }

    /* Crea una Squadra partendo da un oggetto "team" di TheSportsDB. */
    static fromApi(team) {
        return new Squadra({
            id: team.idTeam,
            nome: team.strTeam,
            lega: team.strLeague ?? '',
            paese: team.strCountry ?? '',
            stemma: team.strBadge || team.strTeamBadge || '',
            sport: team.strSport ?? '',
            stadio: team.strStadium ?? '',
            fondazione: team.intFormedYear ?? '',
            descrizione: team.strDescriptionIT || team.strDescriptionEN || '',
        });
    }
}