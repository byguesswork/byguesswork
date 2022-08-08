'use strict';

// ----------------     SELEKTORJI

const leftSideIndexIfMobiles = document.querySelectorAll('.if_mobile');
const rightSideIndex = document.querySelector('.right-index');

if (window.innerWidth < 500) {
    leftSideIndexIfMobiles.forEach((p) => {
        p.classList.remove('hidden');
    });

    rightSideIndex.classList.add('hidden');

}

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com