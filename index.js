'use strict';

// ----------------     SELEKTORJI

const bodyNode = document.getElementsByTagName('body');
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
const logo = document.querySelector('.logo'); // querySelector, ker je class; če daš getElementsbyClass, ti vrne HTML collection;
const themePic = document.getElementById('theme');
const themedLks = document.getElementsByClassName('themed_link');

const hideIf1col = document.querySelectorAll('.hide_if_1_col');
const showIf1col = document.querySelectorAll('.show_if_1_col');

const themeQ = '?theme=blue'; // query za setTimeout;

// const forTest = document.getElementById('za_test');


let lesserWidth;
let isMobile = false;
let isFirstTimeOneColumn = true;
let isBlueTheme = false; 

//  če je manj kot 441  : en stolpec
// če je med 441 in 730 : dva stolpca (360 + 370, vmes je border 1px), horizontalni skrol; 2. stolpec je končno ravno nekoliko večji od prvega
// če je med 731 in 800 : dva stolpca (360 + 370–440, vmes je border 1px), brez H skrola
// če je med 801 in 960 : dva stolpca (400 + 400–560, vmes je border 1px), brez H skrola
// če je nad 960:       : dva stolpca (400 + 560, vmes je border 1px)

function doGrey () {
  
  isBlueTheme = false;

  // spremembe nastavitev, ki so povsod, na vseh straneh;
  bodyNode[0].style.background = '#313131';
  leftContainer.style.backgroundColor = '#808080';
  leftContainer.style.color = '#f0fff0';
  leftContainer.style.borderRight = 'solid 1px #f0fff0';
  rightContainer.style.backgroundColor = '#5a5a5a';
  rightContainer.style.color = '#e8f0eb';
  
  // sp. nastavitev, ki niso na vseh straneh;
  if (themePic != null) {
    themePic.style.background = 'linear-gradient( #306599, #D1E5E9 )';
    themePic.title = 'Blue theme';
    themePic.style.color = '#306599';
  }
  if (logo != null) {
    logo.style.color = '#f0fff0';
  }

  // odstranit querije z linkov;
  if (themedLks.length != 0) {
    for (let i = 0; i < themedLks.length; i++) {
      let txt = themedLks[i].attributes.href.value;
      const idx = txt.indexOf(themeQ);  // če ni noter, vrne -1;
      if (idx > 0) {
        themedLks[i].attributes.href.value = txt.substring(0, idx) 
      }
      console.log('stripped', txt.includes(themeQ), idx, txt.substring(0, idx))
    }
  }


}

function doBlue () {
  isBlueTheme = true;

  // spremembe nastavitev, ki so povsod, na vseh straneh;
  bodyNode[0].style.background = '#e8f4f7';
  leftContainer.style.backgroundColor = '#306599';
  leftContainer.style.color = '#d0ebf3';
  leftContainer.style.borderRight = 'solid 1px #306599';
  rightContainer.style.backgroundColor = '#D1E5E9';
  rightContainer.style.color = '#3F4446';
  
  // sp. nastavitev, ki niso na vseh straneh;
  if (themePic != null) {
    themePic.style.background = 'linear-gradient( #808080, #313131 )';
    themePic.title = 'Gray theme';
    themePic.style.color = '#313131';
  }
  if (logo != null) {
    logo.style.color = '#353133';
  }

  // dodat querije linkom;
  if (themedLks.length != 0) {
    for (let i = 0; i < themedLks.length; i++) {
      let txt = themedLks[i].attributes.href.value;
      txt += themeQ;
      themedLks[i].attributes.href.value = txt;
      console.log('dodan q za theme', themedLks[i].attributes.href.value);
    }
  }

}


function init() {
  // if (forTest != null) forTest.innerHTML = `forDebug`;
  if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {    // todo to bi veljalo izboljšat s čekiranjem še širine
    isMobile = true;

    if (upperPosition4Blog != null) { // to se izvede samo na glavni strani (index.html);
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
}

function doLayout() {

  // najprej čekiramo & prilagodimo širino
  lesserWidth = document.documentElement.clientWidth < screen.width ? document.documentElement.clientWidth : screen.width;
  console.log('lesserW:', lesserWidth);
  // if (forTest != null) forTest.innerHTML = `lesserW: ${lesserWidth}, isMob: ${isMobile}`;

  if (lesserWidth < 441) goForOneColumn();
  else {
    goForTwoColumns();

    //  todo reformat spodnje
    if (lesserWidth >= 441 && lesserWidth <= 730) {  // tle pustimo horizontalni skrol
      leftContainer.style.width = `${360 - 40}px`;  // 360, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding 1. stolpca
      rightContainer.style.left = `361px`           // ker je ciljna širina 1. stolpca 360 + 1 za border; - GLEJ KOMENTAR pri varianti 961
      rightContainer.style.width = `${730 - (360 + 40 + 1 + 1)}px`;  // širina 2. stolpca je arbitrarna meja 730 - (celotna širina 1. stolpca + padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    if (lesserWidth >= 731 && lesserWidth <= 800) {  // brez horiz. skrola
      leftContainer.style.width = `${360 - 40}px`;  // 360, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding 1. stolpca
      rightContainer.style.left = `361px`           // ker je ciljna širina 1. stolpca 360 + 1 za border; - GLEJ KOMENTAR pri varianti 961
      rightContainer.style.width = `${lesserWidth - (360 + 40 + 1 + 1)}px`;  // širina 2. stolpca je razpoložljiva širina - (celotna širina 1. stolpca + padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    if (lesserWidth >= 801 && lesserWidth <= 960) {  // brez horiz. skrola
      leftContainer.style.width = `${400 - 40}px`;  // 400, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding 1. stolpca;
      rightContainer.style.left = `401px`           // ker je ciljna širina 1. stolpca 400 + 1 za border; - GLEJ KOMENTAR pri varianti 961
      rightContainer.style.width = `${lesserWidth - (400 + 40 + 1 + 1)}px`;  // širina 2. stolpca je razpoložljiva širina - (celotna širina 1. stolpca + padding 2. stolpca + border + rezerva, ker če ne se pojavi Hskrolbar);
    }
    if (lesserWidth >= 961) {  // brez horiz. skrola
      leftContainer.style.width = `${400 - 40}px`;  // 400, ker je taka ciljna širina 1. stolpca, in 40, ker je tak padding
      rightContainer.style.left = `401px`           // ker je ciljna širina 1. stolpca 400 + 1 za border; AMPAK ZANIMIVO, če daš 402, je videt navpično temno rjavo črto od rjavega ozadja (kakršno je desno), ki je v ozdaju vsega
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
  leftContainer.style.borderRight = 'solid 1px #f0fff0';  // bela za sivo temo: #f0fff0 ; modra za modro temo: #306599 (izjemoma iste barve kot polje)
  hideIf1col?.forEach((i) => i.classList.remove('hidden'));
  showIf1col?.forEach((i) => i.classList.add('hidden'));
}

function checkAbsolutes() {

  // poiščemo, koliko največ vidi uporabnik na zaslonu
  let lesserHeight = document.documentElement.clientHeight < screen.height ? document.documentElement.clientHeight : screen.height;
  console.log('lesserH:', lesserHeight);
  // if (forTest != null) forTest.innerHTML = `lesserW: ${lesserWidth}, lesserH: ${lesserHeight}, isMob: ${isMobile}`;

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
    if (rightContainer.getBoundingClientRect().height > leftContainer.getBoundingClientRect().height) {
      leftContainer.style.height = `${rightContainer.getBoundingClientRect().height - 40}px`; // -40 ker padding
    } else if (leftContainer.getBoundingClientRect().height > rightContainer.getBoundingClientRect().height) {
      rightContainer.style.height = `${leftContainer.getBoundingClientRect().height - 40}px`; // -40 ker padding
    }

  } else {  // če je vse na enem ekranu (če ni treba skrolat dol), prilepimo dno vsebine na dno ekrana
    // levi stolpec
    leftContainer.style.bottom = '0';
    leftLowerContent.style.position = 'absolute';
    leftLowerContent.style.padding = '0 20px 20px 20px';

    //  desni stolpec
    rightContainer.style.bottom = '0';
  }

}

function applyTheme(){
  // preverjanje, ko prideš na page, ali ima naslov strani query za temo (v takem primeru ukrepat);
  const srchPrms = window.location.search;
  if (srchPrms.indexOf(themeQ) > -1) {
    console.log('bomo obarvali zaradi search querija');
    // obarvat
    doBlue();
  } else console.log('ni search querijev');

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


init(); // določimo, al je mobile; po potrebi premečemo in preuredimo vsebino znotraj levega stolpca;
doLayout(); // širina stolcev in premetavnaje vsebine iz stoolpca v drugega
applyTheme(); // naredimo modro temo, če treba;

if (isMobile) {
  screen.orientation.addEventListener("change", doLayout);
} else {
  window.addEventListener("resize", doLayout);
}

// listener za spreminjanje teme (plava/siva) samo na strani index.html;
if (themePic != null) {
  themePic.addEventListener('click', function(){
    if (isBlueTheme) {

      // najprej, če si na index.html, ki je modre teme in ima tudi search query za modro temo, je treba uredit, da klik na izbirnik za sivo temo naloži stran, ki nima querija za temo v URL-ju;
      // v bistvu bomo na novo naložili stran;
      let currentURL = window.location.href;
      const idx = currentURL.indexOf(themeQ);  // če ni noter, vrne -1;
      if (idx > 0) {
        // znova naložimo stran s skrajšanim URL-jem (iz katerega odstranjen theme Q);
        window.location.href = currentURL.substring(0, idx);
      }

      // sicer pa običajen doGrey;
      doGrey();

    } else doBlue();
  })
}

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com
