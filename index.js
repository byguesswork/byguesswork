'use strict';

// ----------------     SELEKTORJI

const leftContainer = document.getElementById('left_container');
const leftUpperContent = document.getElementById('left_upper_content');
const upperPosition4Blog = document.getElementById('upper_position_4_blog');
const lowerPosition4Blog = document.getElementById('lower_position_4_blog');
const leftLowerContent = document.getElementById('left_lower_content');
const rightContainer = document.getElementById('right_container');
const rightUpperContent = document.getElementById('right_upper_content');
const rightLowerContent = document.getElementById('right_lower_content');

const hideIf1col = document.querySelectorAll('.hide_if_1_col');

let lesserWidth;
let isMobile;

//  če je manj kot 441  : en stolpec
// če je med 441 in 730 : dva stolpca (360 + 370, vmes je border 1px), horizontalni skrol; 2. stolpec je končno ravno nekoliko večji od prvega
// če je med 731 in 800 : dva stolpca (360 + 370–440, vmes je border 1px), brez H skrola
// če je med 801 in 960 : dva stolpca (400 + 400–560, vmes je border 1px), brez H skrola
// če je nad 960:       : dva stolpca (400 + 560, vmes je border 1px)

function init() {
  if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {    // todo to bi veljalo izboljšat s čeiranjem še širine
    isMobile = true;
    upperPosition4Blog.innerHTML = lowerPosition4Blog.innerHTML;    // blog premaknemo na vrh, da je bolj viden, ker je zaslon manjši; to se potem ne spreminja več, tudi če spremeniš orientacijo;
    lowerPosition4Blog.innerHTML = '';
  }
}

function doLayout() {

  // najprej čekiramo & prilagodimo širino
  lesserWidth = document.documentElement.clientWidth < screen.width ? document.documentElement.clientWidth : screen.width;

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


  checkAbsolutes();

}

function goForOneColumn() {

  //  prilagodimo širino vsebine levega, edinega stolpca
  leftContainer.style.width = lesserWidth > 300 ? `${lesserWidth - 40}px` : '260px';  // -40, ker je padding 40; minimalno mora bit vsebina široka 260px;
  leftContainer.style.borderRight = 'unset';

  //  kjerje to potrebno, prikažemo, skrijemo (v prihodnje morda tudi premaknemo) vsebino

  // najprej prikažemo show_if_mobile, nato skrijemo hide_if_mobile, s čimer se skrije tudi desni stolpec
  hideIf1col?.forEach((i) => i.classList.add('hidden'));

}

function goForTwoColumns() {
  leftContainer.style.borderRight = 'solid 1px #f0fff0';
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

    //  še za desni stolpec
    rightContainer.style.bottom = 'unset';

    // podaljšat levega, če desni predolg, in obratno
    if (rightContainer.getBoundingClientRect().height > leftContainer.getBoundingClientRect().height) leftContainer.style.height = `${rightContainer.getBoundingClientRect().height - 40}px`; // -40 ker padding
    if (leftContainer.getBoundingClientRect().height > rightContainer.getBoundingClientRect().height) rightContainer.style.height = `${leftContainer.getBoundingClientRect().height - 40}px`; // -40 ker padding

    // za about.html, spravit vsebino pod fiksni del
    if (leftUpperContent.classList.contains('fixed')) {
      leftUpperContent.style.width = `${leftContainer.getBoundingClientRect().width - 20 - 1}px`; // -20 ker je treba odštet levi padding, -1, ker je teba odštet vidni border;
      leftLowerContent.style.marginTop = `${leftUpperContent.getBoundingClientRect().bottom}px`;

      //test
      leftContainer.style.paddingTop = '0';       // zakaj tukaj vzet 20px (0) in spodaj dodat 20px (40px) ?;
      leftContainer.style.paddingBottom = '40px'; // ker skupni vertikalni padding levega kontejnerja mora še vedno biti 40, sicer se levi in desni kontejner razlikujeta po višini;
      leftUpperContent.style.paddingTop = '20px'; // tako se naredi, da ni nad fiksnim delom prozornega dela, v katerem bi se videlo besedilo od about, ki ga skrolaš navzgor

      // konec test

    }

  } else {  // če je vse na enem ekranu, prilepimo dno vsebine na dno ekrana
    // levi stolpec
    leftContainer.style.bottom = '0';
    leftLowerContent.style.position = 'absolute';

    //  desni stolpec
    rightContainer.style.bottom = '0';
  }

}


//  - - - - - - - - -  IZVAJANJE  - - - - - -

init();
doLayout();

if (isMobile) screen.orientation.addEventListener("change", () => { doLayout(); });

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com
