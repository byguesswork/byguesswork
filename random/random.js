'use strict';

const mainDocElement = document.querySelector('.main');

let isMobile;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {
    isMobile = true;
} else {
    isMobile = false;
}

if (isMobile) {
    mainDocElement.style.marginRight = '30px';
    mainDocElement.style.marginLeft = '20px';
    const td = document.querySelectorAll('td');
    td.forEach((el) => el.style.fontSize = '12px');
} else atResize();

function atResize() {
    if (window.innerWidth > 910) {
        if (window.innerWidth > 2355) {
            const newRightMargin = window.innerWidth * 0.61;
            mainDocElement.style.marginRight = `${newRightMargin}px`;
            mainDocElement.style.marginLeft = `45px`;
        } else {
            const newRightMargin = window.innerWidth - 910;
            mainDocElement.style.marginRight = `${newRightMargin}px`;
            mainDocElement.style.marginLeft = `30px`;
        }
    } else {
        mainDocElement.style.marginRight = `20px`;
        mainDocElement.style.marginLeft = `20px`;
    }
}

window.addEventListener("resize", atResize);