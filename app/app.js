'use strict';

const mainDocElement = document.querySelector('.main');

let isMobile;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {
    isMobile = true;
} else {
    isMobile = false;
}

console.log('smo prebrali');

if (isMobile) {
    mainDocElement.style.marginTop = '30px';
    mainDocElement.style.marginRight = '30px';
    mainDocElement.style.marginLeft = '20px';
}