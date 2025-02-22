'use strict';

// ----------------     SELEKTORJI

const leftContainer = document.getElementById('left_container');
const leftUpperContent = document.getElementById('left_upper_content');
const upperPosition4Blog = document.getElementById('upper_position_4_blog');
const lowerPosition4Blog = document.getElementById('lower_position_4_blog');
const alternatePosition4Explanation = document.getElementById('alternate_postn_explanation');
const origPosExplanation = document.getElementById('explanation');
const leftLowerContent = document.getElementById('left_lower_content');
const rightContainer = document.getElementById('right_container');
const rightUpperContent = document.getElementById('right_upper_content');
const rightLowerContent = document.getElementById('right_lower_content');

const forTest = document.getElementById('za_test');

const hideIf1col = document.querySelectorAll('.hide_if_1_col');
const showIf1col = document.querySelectorAll('.show_if_1_col');

let lesserWidth;
let isMobile = false;
let isFirstTimeOneColumn = true;

//  če je manj kot 441  : en stolpec
// če je med 441 in 730 : dva stolpca (360 + 370, vmes je border 1px), horizontalni skrol; 2. stolpec je končno ravno nekoliko večji od prvega
// če je med 731 in 800 : dva stolpca (360 + 370–440, vmes je border 1px), brez H skrola
// če je med 801 in 960 : dva stolpca (400 + 400–560, vmes je border 1px), brez H skrola
// če je nad 960:       : dva stolpca (400 + 560, vmes je border 1px)

function init() {
  if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {    // todo to bi veljalo izboljšat s čekiranjem še širine
    isMobile = true;
    // blog premaknemo na vrh, da je bolj viden, ker je zaslon manjši; to se potem ne spreminja več, tudi če spremeniš orientacijo;
    const upperLength = upperPosition4Blog.innerHTML.length;
    upperPosition4Blog.innerHTML = lowerPosition4Blog.innerHTML;
    if (upperPosition4Blog.innerHTML.length > upperLength) {  // preverjanje al je zdaj dolžina večja kot na začetku in če ja, potem izbrišemo spodnje;
      lowerPosition4Blog.innerHTML = '';
    };

    // razširimo razmike med vrsticami v razpredelnici od bloga
    const blogs_table_chldrn_arr = [...document.getElementById("blogs_table").getElementsByTagName("tbody")[0].getElementsByTagName("tr")];
    blogs_table_chldrn_arr.forEach(tr => {
      inflate(tr.getElementsByTagName('td')[0]);
      inflate(tr.getElementsByTagName('td')[1]);
    })

    // razširimo vrstice med linki na programe (tetris, ...)
    const programs_arr = [...document.getElementById('programs').getElementsByTagName('p')];
    programs_arr.forEach(p => { inflate(p) });
  }
}

function doLayout() {

  // najprej čekiramo & prilagodimo širino
  lesserWidth = document.documentElement.clientWidth < screen.width ? document.documentElement.clientWidth : screen.width;
  console.log('lesserW:', lesserWidth);

  if (lesserWidth < 441) goForOneColumn();
  else {
    goForTwoColumns();

    //  todo reformat spodnje
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
  }

  // s tem pa čekiramo & prilagodimo višino
  checkAbsolutes();

}

function goForOneColumn() {

  //  kjer je to potrebno, prikažemo, skrijemo, premaknemo vsebino;
  // najprej premaknemo, to naredimo samo enkrat, od tu dalje (recimo pri resize ali orientation change) se ureja s hide/show;
  if (isFirstTimeOneColumn) {
    const lengthAltPosExpl = alternatePosition4Explanation.innerHTML.length;
    alternatePosition4Explanation.innerHTML = origPosExplanation.innerHTML;
    if (alternatePosition4Explanation.innerHTML.length > lengthAltPosExpl) {  // preverimo, če je skopiralo, in če, potem posodobimo spremenljivko stanja; brisat ni treba, ker se bi skrilo nekaj vrstic niže;
      isFirstTimeOneColumn = false;
    };
  }

  //  prilagodimo širino vsebine levega, edinega stolpca
  leftContainer.style.width = lesserWidth > 300 ? `${lesserWidth - 40}px` : '260px';  // -40, ker je padding 40; minimalno mora bit vsebina široka 260px;
  leftContainer.style.borderRight = 'unset';

  // skrijemo hideIf1col, s čimer se skrije tudi desni stolpec
  hideIf1col?.forEach((i) => i.classList.add('hidden'));

  // prikažemo showIf!Col
  showIf1col?.forEach((i) => i.classList.remove('hidden'));

}

function goForTwoColumns() {
  leftContainer.style.borderRight = 'solid 1px #f0fff0';
  hideIf1col?.forEach((i) => i.classList.remove('hidden'));
  showIf1col?.forEach((i) => i.classList.add('hidden'));
}

function checkAbsolutes() {

  // poiščemo, koliko največ vidi uporabnik na zaslonu
  let lesserHeight = document.documentElement.clientHeight < screen.height ? document.documentElement.clientHeight : screen.height;
  console.log('lesserH:', lesserHeight);
  forTest.innerHTML = `lesserW: ${lesserWidth}, lesserH: ${lesserHeight}, isMob: ${isMobile}`;

  // preverimo, ali vsebina levega ALI desnega stolpca sega globlje od spodnjega roba
  if (leftUpperContent?.getBoundingClientRect().height + leftLowerContent?.getBoundingClientRect().height + 20 > lesserHeight ||   // ta plus 20 je zato, da se upošteva tudi padding nad in pod levim kontejnerjem, ki sicer ni vštet v višino posmičnih elementov;
    rightUpperContent?.getBoundingClientRect().height + rightLowerContent?.getBoundingClientRect().height + 20 > lesserHeight) {

    // uredimo za levi stolpec
    leftContainer.style.bottom = 'unset';
    leftLowerContent.style.position = 'static';
    leftLowerContent.style.padding = '0 0 0 0';

    //  še za desni stolpec
    rightContainer.style.bottom = 'unset';

    // podaljšat levega, če desni predolg, in obratno
    if (rightContainer.getBoundingClientRect().height > leftContainer.getBoundingClientRect().height) leftContainer.style.height = `${rightContainer.getBoundingClientRect().height - 40}px`; // -40 ker padding
    if (leftContainer.getBoundingClientRect().height > rightContainer.getBoundingClientRect().height) rightContainer.style.height = `${leftContainer.getBoundingClientRect().height - 40}px`; // -40 ker padding

  } else {  // če je vse na enem ekranu (če ni treba skrolat dol), prilepimo dno vsebine na dno ekrana
    // levi stolpec
    leftContainer.style.bottom = '0';
    leftLowerContent.style.position = 'absolute';
    leftLowerContent.style.padding = '0 20px 20px 20px';

    //  desni stolpec
    rightContainer.style.bottom = '0';
  }

}


// ti dve funkciji spodaj bi se dalo refaktorizirat na eno
function letsplayLink() {
  let langString = 'en';
  if (navigator.language != '') {
    langString = navigator.language;
  } else if (navigator.userLanguage != '') {
    langString = navigator.userLanguage;
  };
  if (langString == 'sl' || langString == 'sl-si' || langString == 'sl-SI' || langString == 'si') {
    window.open("app/igrajmose/sl/index.html");
  }
  else window.open("app/igrajmose/en/index.html");
}

function fuelLink() {
  let langString = 'en';
  if (navigator.language != '') {
    langString = navigator.language;
  } else if (navigator.userLanguage != '') {
    langString = navigator.userLanguage;
  };
  if (langString == 'sl' || langString == 'sl-si' || langString == 'sl-SI' || langString == 'si') {
    window.open("app/fuel/sl/index.html");
  }
  else window.open("app/fuel/en/index.html");
}

function inflate(element) {
  element.style.paddingTop = '10px';
}

//  - - - - - - - - -  IZVAJANJE  - - - - - -

init();
doLayout();

if (isMobile) {
  screen.orientation.addEventListener("change", doLayout);
} else {
  window.addEventListener("resize", doLayout);
}


//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com
