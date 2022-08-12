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
const moveLeftIfMobiles = document.querySelectorAll('.move_left_if_mobile');

const testWindow = document.getElementById('za_test');

let lesserWidth;

testWindow.innerHTML = `<p style="font-size:small">Širina:<br>document.documentElement.clientWidth: ${document.documentElement.clientWidth},<br>window.innerWidth: ${window.innerWidth},<br>window.outerWidth: ${window.outerWidth},<br>screen.width: ${screen.width}<br><br>
Višina:<br>
document.documentElement.clientHeight: ${document.documentElement.clientHeight},<br>window.innerHeight: ${window.innerHeight},<br>window.outerHeight: ${window.outerHeight},<br>screen.height: ${screen.height}<br><br>
document.body.scrollHeight: ${document.body.scrollHeight}, document.documentElement.scrollHeight: ${document.documentElement.scrollHeight},
document.body.offsetHeight: ${document.body.offsetHeight}, document.documentElement.offsetHeight: ${document.documentElement.offsetHeight},
document.body.clientHeight: ${document.body.clientHeight}, document.documentElement.clientHeight: ${document.documentElement.clientHeight}</p>`;

//  če je manj kot 441  : en stolpec
// če je med 441 in 730 : dva stolpca (360 + 370, vmes je border 1px), horizontalni skrol
// če je med 731 in 800 : dva stolpca (360 + 370–440, vmes je border 1px), brez H skrola
// če je med 801 in 960 : dva stolpca (400 + 400–560, vmes je border 1px), brez H skrola
// če je nad 960:       : dva stolpca (400 + 560, vmes je border 1px)

function doLayout() {

  lesserWidth = document.documentElement.clientWidth < screen.width ? document.documentElement.clientWidth : screen.width;

  if (lesserWidth < 441) { goForOneColumn() }

}

function goForOneColumn() {

  //  1. prilagodimo širino vsebine levega, edinega stolpca
  leftContainer.style.width = `${lesserWidth - 40}px`;  // ker je padding 40

  //  2. najprej prikažemo, skrijemo, premaknemo vso vsebino

  // najprej prikažemo show_if_mobile, nato skrijemo hide_if_mobile, s čimer se skrije tudi desni stolpec
  showIfMobiles?.forEach((i) => i.classList.remove('hidden'));
  hideIfMobiles?.forEach((i) => i.classList.add('hidden'));
  rightContainer.classList.add('hidden');

  // TODO treba še dodat za moveLeft

  //  3. potem pogledamo, al je treba umaknit absolute
  checkAbsolutes();

}

function checkAbsolutes() {
  // poiščemo, koliko največ vidi uporabnik na zaslonu
  let lesserHeight = document.documentElement.clientHeight < screen.height ? document.documentElement.clientHeight : screen.height;

  // preverimo, ali vsebina levega ALI desnega stolpca sega globlje od spodnjega roba 
  if (leftUpperContent?.getBoundingClientRect().height + leftLowerContent?.getBoundingClientRect().height > lesserHeight ||
    rightUpperContent?.getBoundingClientRect().height + rightLowerContent?.getBoundingClientRect().height > lesserHeight) {

    // uredimo za levi stolpec
    leftContainer.style.bottom = 'unset';
    leftLowerContent.style.position = 'static';

    //  TODO uredit še za desni stolpec


  }

  // TODO za desni se verjetno doda preprosto tako, da v if dodaš še ali z isto stvarno jza desni


}

// leftLowerContent.style.bottom = 'initial';

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


doLayout();

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com