'use strict';

const test = document.getElementById('test');
const mainDiv = document.querySelector('.main');

if (window.innerWidth > screen.width) {
    const width = screen.width - 50;  // horiz. padinga + margin + 10px, da je na desni malo zelene
    mainDiv.style.width = `${width}px`;
}



