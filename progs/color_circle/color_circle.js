'use strict';

const circle = document.getElementById('circle');
const leftCol = document.getElementById('left-col');
const altPosExplanation = document.getElementById('alternative-right-col');
const mainColorHueLbl = document.getElementById('main-color-hue');
const mainColorTonedLbl = document.getElementById('main-color-color');
const mainColorAngleLbl = document.getElementById('main-color-angle');
const offsetColorHueLbl = document.getElementById('offset-hue');
const offsetColorTonedLbl = document.getElementById('offset-toned-color');
const offsetColorOffsetLbl = document.getElementById('offset-color-offset');
const rightCol = document.getElementById('right-col');

// inicializiramo spodnji (v smislu spodnji sloj) canvas (za ozadje) in narišemo začetni lik (slednje se bo zgodilo s klicem axis = new Axis());
const canvas = document.getElementById('circlette');
const ctxBckgrnd = canvas.getContext('2d');
canvas.width = 100;
canvas.height = 100;

// inicializiramo delovni canvas (vrhnji sloj nad spodnjim slojem);
const activeCanvas = document.getElementById('circlette-overlay');
const ctx = activeCanvas.getContext('2d');

let lastChange = 'widened';
let isFirstTimeSetup = true;

function doLayout() {
    const windowInnerW = window.innerWidth;
    const screenWidth = screen.width;
    const elementWidth = document.documentElement.clientWidth;

    let geringest = windowInnerW;
    if (screenWidth < geringest) geringest = screenWidth;
    if (elementWidth < geringest) geringest = elementWidth;

    if (geringest > 950) {
        if (lastChange === 'shrinked') {    // začetni je "widened", ker je tako določeno v CSS z merami;
            moveDivsAround('widen');
        }
        leftCol.style.width = '600px';
        circle.style.width = '600px';
        rightCol.style.width = '270px';
    } else {
        if (lastChange === 'widened') {
            moveDivsAround('shrink');
        }
        if (geringest > 680) {
            leftCol.style.width = '600px';
            circle.style.width = '600px';
        } else {
            leftCol.style.width = `${geringest - 50}px`;
            circle.style.width = `${geringest - 50}px`;
        }
    }

    if (!isFirstTimeSetup) {
        positionCirclette();
        axis.controls.getBoundingRects();
    } else {    // samo prvič;
        const visible = Math.min(window.innerHeight, screen.height, document.documentElement.clientHeight)
        const needed = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight);
        if (visible < needed) {
            const signature = document.getElementById('signature');
            signature.style.marginTop = '5px';
            signature.style.textAlign = 'end';
        }
    }

}

function moveDivsAround(instruction) {
    if (instruction === 'shrink') {     // vsebino desnega stolpca prenesemo na drugo lokacijo, desni stolpec izpraznimo in mu damo širino 0;
        altPosExplanation.innerHTML = rightCol.innerHTML;
        rightCol.innerHTML = '';
        rightCol.style.width = '0px';
        lastChange = 'shrinked';
    } else if (instruction === 'widen') {    // vsebino desnega stolpca prenesemo na z alternativne na izvirno lokacijo in uredimo širino;
        rightCol.innerHTML = altPosExplanation.innerHTML;
        altPosExplanation.innerHTML = '';
        rightCol.style.width = '250px';
        lastChange = 'widened';
    }
}

function positionCirclette() {   // to pozicionira glavni canvas (activeCanvas), da leži točno nad ozadjem glavnega canvasa;
    const bckgndCanvasFrame = canvas.getBoundingClientRect();
    activeCanvas.style.top = `${bckgndCanvasFrame.top - 20}px`;     // -20, ker ima body, ki je relative source tega absoulta, margin 20;
    activeCanvas.style.left = `${bckgndCanvasFrame.left - 20}px`;   // -20, ker ima body, ki je relative source tega absoulta, margin 20;
    activeCanvas.style.width = '100px';
    activeCanvas.style.height = '100px';
    activeCanvas.width = 100;
    activeCanvas.height = 100;

    axis.circlette();
}


// - - - -   IZVAJANJE   - - - -

doLayout();
const axis = new Axis();
positionCirclette();    // najprej mora bit inicializiran axis;
isFirstTimeSetup = false;
window.addEventListener("resize", doLayout);



// -- -- zakomentirano je bila izvirna rešitev, prvi dan ...

// 0':     ff0000     rdeča
// 60'     ffff00     rumena
// 120':   00ff00     zelena
// 180':   00ffff     svetlo modra
// 240':   0000ff     temno modra
// 300':   ff00ff     magenta

// to je kot (angle) od heading barve; na vrhu, navpično navzgor oz. 0deg, je rdeča;
// let heading = 0;

// glavna oz. neodvisna barva (kot heading pri orientaciji, torej kamor si usmerjen);
// let headingColorR = 'ff';
// let headingColorG = '00';
// let headingColorB = '00';
// let headingColor = `${headingColorR}${headingColorG}${headingColorB}`;

// odvisna barva, ki je za določen kot na barvnem krogu drugačna od glavne barve
// let offsetColorR = '00';
// let offsetColorG = 'ff';
// let offsetColorB = 'ff';
// let offsetColor = `${offsetColorR}${offsetColorG}${offsetColorB}`;

// function draw() {
//     // privzeto gre gradient 0deg od spodaj navzgor; začetna (neodvisna, nosilna, heading) barva je torej v mojem primeru podana v drug barvni atribut, ne v prvega;
//     circle.style.backgroundImage = `linear-gradient(${heading}deg, #${offsetColor}, #${headingColor})`;
// }

// function calculateComponentValues() {
// greš po komponentah, pri vsaki preverjaš za 4 območja: kjer je komponenta ff, kjer je 00 in dve območji, kjer prehaja med skrajnostma;
// recimo pri R je ff od 300 do 60; 00 od 120 do 240; v dveh 60-stopinjskih intervalih pa prehaja med 00 in ff oz. obratno;
// to krat 3 = 12 možnosti;
// boljše je torej kar direkt obdelat vsako od 12 možnosti: 6 večkratnikov kota 60 in 6 vmesnih območij (ker pri širših, 120-stopinjskih območjih obstajajo taka, ki so delno levo, delno desno od 0deg in torej de facto ratajo dve območji);
// in sicer najprej prehodna, in sicer v zaporedju 1, 4, 2, 5, 3, 6 (da izenačiš verjetnosti izhoda iz zanke if-else), potem pa še 6 čistih prehodnih točk (te šele na koncu, ker so manj verjetne kot prehodna območja);



// }

// klas, ki bo vseboval glavno podatkovno strukturo, se imenuje Axis;

// function atKeyPress(evt) {
//     if (evt.key === 'ArrowLeft') {
//         heading--;
//         if (heading < 0) heading = 359;
//     };
//     if (evt.key === 'ArrowRight') {
//         heading++;
//         if (heading > 359) heading = 0;
//     };
//     calculateComponentValues();
//     draw();
// }



// - - - - - - - -     IZVAJANJE    - - - -

// document.addEventListener('keydown', atKeyPress);


