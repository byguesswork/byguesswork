'use strict';

const test = document.getElementById('test');
const mainDiv = document.querySelector('.main');

if (window.innerWidth > screen.width) {
    const width = screen.width - 46;  // toliko sta horiz paddinga
    mainDiv.style.width = `${width}px`;
}



