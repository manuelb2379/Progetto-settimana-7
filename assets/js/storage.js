import { Squadra } from './models/Squadra.js';

const KEY_PREFERITI = 'sportshub:preferiti';
const KEY_TEMA = 'sportshub:tema';

/* la lista parte vuota se localStorage è vuoto */

function leggiDaStorage() {
    try {
        const raw = localStorage.getItem(KEY_PREFERITI);
        const lista = raw ? JSON.parse(raw) : [];
        return Array.isArray(lista) ? lista.map((obj) => new Squadra(obj)) : [];
    } catch (err) {
        console.error('Errore nella lettura dei preferiti:', err);
        return []; // JSON corrotto o storage non disponibile
    }
}

let preferiti = leggiDaStorage();

function salva() {
    try {
        localStorage.setItem(KEY_PREFERITI, JSON.stringify(preferiti));
    } catch (err) {
        /* storage pieno o bloccato: i preferiti restano solo in memoria */
        console.error('Errore nel salvataggio dei preferiti:', err);
    }
}

export function getPreferiti() {
    return [...preferiti];
}

export function isPreferita(id) {
    return preferiti.some((s) => s.id === String(id));
}

export function aggiungiPreferito(squadra) {
    if (isPreferita(squadra.id)) return;
    preferiti.push(squadra);
    salva();
}

export function rimuoviPreferito(id) {
    preferiti = preferiti.filter((s) => s.id !== String(id));
    salva();
}

// Tema chiaro/scuro

export function leggiTema() {
    try {
        const salvato = localStorage.getItem(KEY_TEMA);
        if (salvato === 'light' || salvato === 'dark') return salvato;
    } catch (err) {
        console.error('Errore nella lettura del tema:', err);
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function salvaTema(tema) {
    try {
        localStorage.setItem(KEY_TEMA, tema);
    } catch {
        console.error('Errore nel salvataggio del tema:', err);
    }
}