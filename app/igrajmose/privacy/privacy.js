'use strict';

const test = document.getElementById('test');
const mainDiv = document.querySelector('.main');

if (window.innerWidth > screen.width) {
    const width = screen.width - 35;
    mainDiv.style.width = `${width}px`;
}

test.textContent = `window.innerWidth: ${window.innerWidth}, screen.width: ${screen.width}\n
window.inerHeight: ${window.innerHeight}, screen.height: ${screen.height}`;

