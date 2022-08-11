'use strict';

// ----------------     SELEKTORJI

const leftContainer = document.getElementById('left_container');
const leftUpperContent = document.getElementById('left_upper_content');
const leftLowerContent = document.getElementById('left_lower_content');
const rightContainer = document.getElementById('right_container');
const rightUpperContent = document.getElementById('right_upper_content');
const rightLowerContent = document.getElementById('right_lower_content');

const hideIfMobiles = document.querySelectorAll('.hide_if_mobile');
const showIfMobiles = document.querySelectorAll('.show_if_mobile');

const testWindow = document.getElementById('za_test');

testWindow.innerHTML = `<p>Širina:<br>document.documentElement.clientWidth: ${document.documentElement.clientWidth},<br>window.innerWidth: ${window.innerWidth},<br>window.outerWidth: ${window.outerWidth},<br>screen.width: ${screen.width}<br><br>
Višina:<br>
document.documentElement.clientHeight: ${document.documentElement.clientHeight},<br>window.innerHeight: ${window.innerHeight},<br>window.outerHeight: ${window.outerHeight},<br>screen.height: ${screen.height}<br><br>
document.body.scrollHeight: ${document.body.scrollHeight}, document.documentElement.scrollHeight: ${document.documentElement.scrollHeight},
  document.body.offsetHeight: ${document.body.offsetHeight}, document.documentElement.offsetHeight: ${document.documentElement.offsetHeight},
  document.body.clientHeight: ${document.body.clientHeight}, document.documentElement.clientHeight: ${document.documentElement.clientHeight}</p>`;

leftLowerContent.style.bottom = 'initial';

// hideIfMobiles?.forEach((i) => { i.classList.add('hidden') });


// if (window.innerWidth < 500 || screen.width < 500) {
//     leftSideIndexIfMobiles.forEach((p) => {
//         p.classList.remove('hidden');
//     });

//     rightSideIndex?.classList.add('hidden'); // skrije desni del pri indexu
//     aboutRightSide?.classList.add('hidden'); // skrije desni del pri disclaimerju

//     const width = window.innerWidth > screen.width ? screen.width - 40 : window.innerWidth - 40; // -40 ker je padding 20 levo in desno
//     mainLeftSide.style.width = `${width}px`

// } else if (mainleftSideUpperPart != null) { // za index in disclaimer, ki imata tako strukturo
//     if ((mainleftSideUpperPart.getBoundingClientRect().height + mainleftSideBottomPart.getBoundingClientRect().height + 30) < window.innerHeight) {
//         // to je zato, ker če ne na računalnku zabije dno gor in del teksta ni videm, če tega ni
//         // če pa je to prisotno pri mobilcu, je dno zaklenjeno in ne skrola in spet ni vidno vse besedilo, zato se doda samo na računalniku pri zadostni višini
//         mainLeftSide.style.bottom = "0";
//         mainleftSideBottomPart.style.position = "absolute";
//         if (aboutRightSide) aboutRightSide.style.position = "relative";
//     }
// } else if (aboutRightSideBlabber.getBoundingClientRect().height > window.innerHeight) {  // v tem primeru gre za about, ki ima svojo strukturo
//     aboutRightSide.style.position = "relative";
//     document.getElementsByTagName('body')[0].style.background = "#808080";
// }


//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com