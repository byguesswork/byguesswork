'use strict';

// ----------------     SELEKTORJI

const leftSideIndexIfMobiles = document.querySelectorAll('.if_mobile');
const rightSideIndex = document.querySelector('.right-index');
const mainLeftSide = document.querySelector('.main');
const mainleftSideUpperPart = document.querySelector('.main_upper_part');
const mainleftSideBottomPart = document.querySelector('.bottom');
const aboutRightSideBlabber = document.querySelector('.main-blabber');
const aboutRightSide = document.querySelector('.right-about');


if (window.innerWidth < 500 || screen.width < 500) {
    leftSideIndexIfMobiles.forEach((p) => {
        p.classList.remove('hidden');
    });

    rightSideIndex?.classList.add('hidden');

    const width = window.innerWidth > screen.width ? screen.width - 40 : window.innerWidth - 40; // -40 ker je padding 20 levo in desno
    mainLeftSide.style.width = `${width}px`

} else if (mainleftSideUpperPart != null) { // za index in disclaimer, ki imata tako strukturo
    if ((mainleftSideUpperPart.getBoundingClientRect().height + mainleftSideBottomPart.getBoundingClientRect().height + 30) < window.innerHeight) {
        // to je zato, ker če ne na računalnku zabije dno gor in del teksta ni videm, če tega ni
        // če pa je to prisotno pri mobilcu, je dno zaklenjeno in ne skrola in spet ni vidno vse besedilo, zato se doda samo na računalniku pri zadostni višini
        mainLeftSide.style.bottom = "0";
        mainleftSideBottomPart.style.position = "absolute";
    }
} else if (aboutRightSideBlabber.getBoundingClientRect().height > window.innerHeight) {  // v tem primeru gre za about, ki ima svojo strukturo
    aboutRightSide.style.position = "relative";
    document.getElementsByTagName('body')[0].style.background = "#808080";
}


//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com