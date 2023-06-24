'use strict';

const container = document.querySelector('.container');
const mainDocElement = document.querySelector('.main');
const secondFlexChild = document.querySelector('.second-flex');
const optionalBtmFiller = document.querySelector('.optional-bottom-filler');
let isTwelved = false;  // al se je font tabele že zmanjšal na 12;

let isMobile;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {
    isMobile = true;
} else {
    isMobile = false;
}

if (isMobile) {
    mainDocElement.style.paddingRight = '20px';
    mainDocElement.style.paddingLeft = '20px';
    const td = document.querySelectorAll('td');
    td.forEach((el) => el.style.fontSize = '12px');
} else {
    atResize();
    window.addEventListener("resize", atResize);
}

function atResize() {
    // po širini;
    const widthh = window.innerWidth;
    if (widthh > 1024) { // 20 + 20 padding container + 35 + 100 padd main + 835 p + 14 scroll;
        mainDocElement.style.paddingRight = `100px`;
        mainDocElement.style.paddingLeft = `35px`;
        secondFlexChild.style.width = `${widthh - 1024}px`;
        container.style.paddingLeft = `20px`;
        container.style.paddingRight = `20px`;
    } else {
        mainDocElement.style.paddingRight = `30px`;
        mainDocElement.style.paddingLeft = `20px`;
        secondFlexChild.style.width = `0px`;
        if (widthh < 790) {
            container.style.paddingLeft = `0px`;
            container.style.paddingRight = `0px`;
            if (!isTwelved) {
                const td = document.querySelectorAll('td');
                td.forEach((el) => el.style.fontSize = '12px');
                isTwelved = true;
            }
        } else {
            container.style.paddingLeft = `20px`;
            container.style.paddingRight = `20px`;
        }
    }

    // po višini
    const containerHeight = container.clientHeight;
    const viewPortHeight = window.innerHeight;
    if (viewPortHeight > containerHeight) {
        optionalBtmFiller.style.height = `${viewPortHeight - containerHeight}px`;
    } else optionalBtmFiller.style.height = `0px`;
}
