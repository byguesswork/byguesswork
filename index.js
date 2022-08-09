'use strict';

// ----------------     SELEKTORJI

const leftSideIndexIfMobiles = document.querySelectorAll('.if_mobile');
const rightSideIndex = document.querySelector('.right-index');
const mainLeftSide = document.querySelector('.main');

if (window.innerWidth < 500 || screen.width < 500) {
    leftSideIndexIfMobiles.forEach((p) => {
        p.classList.remove('hidden');
    });

    rightSideIndex.classList.add('hidden');

    const width = window.innerWidth > screen.width ? screen.width - 40 : window.innerWidth - 40;
    mainLeftSide.style.width = `${width}px`

} else {
    mainLeftSide.style.bottom = "0";
}

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com