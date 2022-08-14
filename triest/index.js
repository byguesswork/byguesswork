'use strict';

// ----------------     SELEKTORJI

const leftContainer = document.getElementById('left_container');
const leftUpperContent = document.getElementById('left_upper_content');
const leftLowerContent = document.getElementById('left_lower_content');
const rightContainer = document.getElementById('right_container');
const rightUpperContent = document.getElementById('right_upper_content');
const rightLowerContent = document.getElementById('right_lower_content');

const hideIfMobiles = document.querySelectorAll('.hide_if_mobile');
const showIf1col = document.querySelectorAll('.show_if_1_col');
const hideIf1col = document.querySelectorAll('.hide_if_1_col');
const moveLeftIfMobiles = document.querySelectorAll('.move_left_if_mobile');

const testWindow = document.getElementById('za_test');

let lesserWidth;
let isMobile;
let htmlText;


//  če je manj kot 441  : en stolpec
// če je med 441 in 730 : dva stolpca (360 + 370, vmes je border 1px), horizontalni skrol; 2. stolpec je končno ravno nekoliko večji od prvega
// če je med 731 in 800 : dva stolpca (360 + 370–440, vmes je border 1px), brez H skrola
// če je med 801 in 960 : dva stolpca (400 + 400–560, vmes je border 1px), brez H skrola
// če je nad 960:       : dva stolpca (400 + 560, vmes je border 1px)

function init() {
  initializeTestField();
  updateTestField();
  htmlText = '<p style="font-size:small">  - - - - - - - - - - - -  KONEC zAČETNIH PODATKOV  - - - - - - - - - </p>';
  testWindow.insertAdjacentHTML("beforeend", htmlText);
}

function initializeTestField() {
  // inicializiramo testno polje
  testWindow.innerHTML = `<p style="font-size:small"> 
  različica testa: 112 </p>`;
  htmlText = navigator.userAgent.match(/(android|iphone|ipad)/i) != null ? '<p style="font-size:small">UserAgent: je mobile</p>' : '<p style="font-size:small">UserAgent: ni mobile</p>';
  testWindow.insertAdjacentHTML("beforeend", htmlText);
  htmlText = navigator.userAgentData.mobile == true ? '<p style="font-size:small">UserAgentData: je mobile</p>' : '<p style="font-size:small">UserAgentData: ni mobile</p>';
  testWindow.insertAdjacentHTML("beforeend", htmlText);
}

function updateTestField() {

  //  DOpišemo nekaj podatkov v testno polje
  testWindow.insertAdjacentHTML("beforeend", `<p style="font-size:small">
  Širina:<br>document.documentElement.clientWidth: ${document.documentElement.clientWidth},<br>window.innerWidth: ${window.innerWidth},<br>window.outerWidth: ${window.outerWidth},<br>screen.width: ${screen.width}<br><br>
  Višina:<br>document.documentElement.clientHeight: ${document.documentElement.clientHeight},<br>window.innerHeight: ${window.innerHeight},<br>window.outerHeight: ${window.outerHeight},<br>screen.height: ${screen.height}<br></p>`);

  testWindow.insertAdjacentHTML("beforeend", `<p style="font-size:small">document.body.scrollHeight: ${document.body.scrollHeight}, document.documentElement.scrollHeight: ${document.documentElement.scrollHeight},<br>
  document.body.offsetHeight: ${document.body.offsetHeight}, document.documentElement.offsetHeight: ${document.documentElement.offsetHeight},
  document.body.clientHeight: ${document.body.clientHeight}, document.documentElement.clientHeight: ${document.documentElement.clientHeight}<br><br>
  document.body.scrollWidth: ${document.body.scrollWidth}, document.documentElement.scrollWidth: ${document.documentElement.scrollWidth},<br>
  document.body.offsetW: ${document.body.offsetWidth}, document.documentElement.offsetW: ${document.documentElement.offsetWidth},
  document.body.clientW: ${document.body.clientWidth}, document.documentElement.clientW: ${document.documentElement.clientWidth}</p>`);

  htmlText = `<p style="font-size:small">
  screen.orientation.angle je: ${screen.orientation.angle}<br>
  screen.orientation.onchange je: ${screen.orientation.onchange}<br>
  screen.orientation.type je: ${screen.orientation.type}<br> - - - - - - -</p>`;



  testWindow.insertAdjacentHTML("beforeend", htmlText);

}

function doLayout() {

  // najprej čekiramo & prilagodimo širino
  lesserWidth = document.documentElement.clientWidth < screen.width ? document.documentElement.clientWidth : screen.width;

  if (lesserWidth < 441) goForOneColumn();
  else {
    goForTwoColumns();

    if (lesserWidth >= 441 && lesserWidth <= 730) {  // tle pustimo horizontalni skrol
      leftContainer.style.width = `${360 - 40}px`;  // 360, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding 1. stolpca
      rightContainer.style.left = `362px`           // ker je ciljna širina 1. stolpca 360 + 1 za border;
      rightContainer.style.width = `${730 - (360 + 40 + 1 + 1)}px`;  // širina 2. stolpca je arbitrarna meja 730 - (celotna širina 1. stolpca + padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    if (lesserWidth >= 731 && lesserWidth <= 800) {  // brez horiz. skrola
      leftContainer.style.width = `${360 - 40}px`;  // 360, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding 1. stolpca
      rightContainer.style.left = `362px`           // ker je ciljna širina 1. stolpca 360 + 1 za border;
      rightContainer.style.width = `${lesserWidth - (360 + 40 + 1 + 1)}px`;  // širina 2. stolpca je razpoložljiva širina - (celotna širina 1. stolpca + padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    if (lesserWidth >= 801 && lesserWidth <= 960) {  // brez horiz. skrola
      leftContainer.style.width = `${400 - 40}px`;  // 400, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding 1. stolpca;
      rightContainer.style.left = `402px`           // ker je ciljna širina 1. stolpca 400 + 1 za border;
      rightContainer.style.width = `${lesserWidth - (400 + 40 + 1 + 1)}px`;  // širina 2. stolpca je razpoložljiva širina - (celotna širina 1. stolpca + padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    if (lesserWidth >= 961) {  // brez horiz. skrola
      leftContainer.style.width = `${400 - 40}px`;  // 400, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding
      rightContainer.style.left = `402px`           // ker je ciljna širina 1. stolpca 400 + 1 za border;
      rightContainer.style.width = `${560 - (40 + 1 + 1)}px`;  // širina 2. stolpca je ciljna širina (560) - (padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    // TODO neki ne dela prav po širini: pri 3. in 4. kategoriji kot da clientInner Witdh ne zazna širine vertikalnega skrolbara in potem je deni kontejner nekoliko preozek in zahteva horiz skrolbar, čeprav ni načrtovano
  }

  // potem čekiramo & prilagodimo višino

  updateTestField();
  checkAbsolutes(); // ta mora bit zadnji, ker če ne se zgodi, da bi update testfield za tem podaljšal vsebino skozi dno

}

function goForOneColumn() {

  //  1. prilagodimo širino vsebine levega, edinega stolpca
  leftContainer.style.width = lesserWidth > 300 ? `${lesserWidth - 40}px` : '260px';  // -40, ker je padding 40; minimalno mora bit vsebina široka 260px;
  leftContainer.style.borderRight = 'unset';

  //  2. najprej prikažemo, skrijemo, premaknemo vso vsebino

  // najprej prikažemo show_if_mobile, nato skrijemo hide_if_mobile, s čimer se skrije tudi desni stolpec
  showIf1col?.forEach((i) => i.classList.remove('hidden'));  // TODO to bi blo treba ločit, kaj je šou if mobile (en dodaen spejs na dnu) in kaj je šou if one column, ampak to je kompliciranje
  hideIf1col?.forEach((i) => i.classList.add('hidden'));

  // TODO treba še dodat za moveLeft

  //  3. potem pogledamo, al je treba umaknit absolute, ampak to se naredi s klicem funkcije v doLayout();

}

function goForTwoColumns() {
  leftContainer.style.borderRight = 'solid 1px #f0fff0';
  showIf1col?.forEach((i) => i.classList.add('hidden'));  // TODO to bi blo treba ločit, kaj je šou if mobile (en dodaen spejs na dnu) in kaj je šou if one column, ampak to je kompliciranje
  hideIf1col?.forEach((i) => i.classList.remove('hidden'));
}

function checkAbsolutes() {

  // poiščemo, koliko največ vidi uporabnik na zaslonu
  let lesserHeight = document.documentElement.clientHeight < screen.height ? document.documentElement.clientHeight : screen.height;

  // preverimo, ali vsebina levega ALI desnega stolpca sega globlje od spodnjega roba 
  if (leftUpperContent?.getBoundingClientRect().height + leftLowerContent?.getBoundingClientRect().height + 20 > lesserHeight ||   // ta plus 20 je zato, da se upošteva tudi padding nad in pod levim kontejnerjem, ki sicer ni vštet v višino posmičnih elementov;
    rightUpperContent?.getBoundingClientRect().height + rightLowerContent?.getBoundingClientRect().height + 20 > lesserHeight) {

    // uredimo za levi stolpec
    leftContainer.style.bottom = 'unset';
    leftLowerContent.style.position = 'static';

    //  TODO uredit še za desni stolpec

  } else {
    // levi stolpec
    leftContainer.style.bottom = '0';
    leftLowerContent.style.position = 'absolute';
  }

}

// TODO uredit za oriantationChange
//  TODO  uredit za resize

//  - - - - - - - - -  IZVAJANJE  - - - - - -

init();
doLayout();

screen.orientation.addEventListener("change", () => {
  doLayout();
});
// todo dodat, da se ta listener kliče samo če se izve, da je mobile

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com
