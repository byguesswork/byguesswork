'use strict';

const mainDocElement = document.querySelector('.main');
const td = document.querySelectorAll('td');

let isMobile;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {
    isMobile = true;
} else {
    isMobile = false;
}

if (isMobile) {
    mainDocElement.style.marginRight = '30px';
    mainDocElement.style.marginLeft = '20px';
    td.forEach((el) => el.style.fontSize = '12px');
} else atResize();

function atResize() {
    if (window.innerWidth > 1280) {
        let newRightMargin = window.innerWidth / 2.5;
        mainDocElement.style.marginRight = `${newRightMargin}px`;
    } else mainDocElement.style.marginRight = `100px`;
}

window.addEventListener("resize", atResize);