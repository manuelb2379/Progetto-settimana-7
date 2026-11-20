/* debounce */
export function debounce(fn, delay = 400) {
    let timer;
    const debounced = (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
    debounced.cancel = () => clearTimeout(timer);
    return debounced;
}

/* Crea un elemento con classi e testo in una riga. */

export function creaElemento(tag, classi = '', testo = '') {
    const elemento = document.createElement(tag);
    if (classi) elemento.className = classi;
    if (testo !== '') elemento.textContent = testo;
    return elemento;
}
