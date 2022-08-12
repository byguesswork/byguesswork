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

  //  TODO dodat za več stolpecv

  checkAbsolutes();

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

  //  3. potem pogledamo, al je treba umaknit absolute, ampak to se naredi s klicem funkcije v doLayout();

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


}

// TODO uredit za oriantationChange
//  TODO  uredit za resize

//  - - - - - - - - -  IZVAJANJE  - - - - - -

doLayout();


//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com