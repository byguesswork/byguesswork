'use strict';

const test = document.getElementById('test');

test.textContent = `window.innerWidth: ${window.innerWidth}, screen.width: ${screen.width}\n
window.inerHeight: ${window.innerHeight}, screen.height: ${screen.height}`;