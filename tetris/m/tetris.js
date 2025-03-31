'use strict';
//  --- uporabljaj try/catch za iskanje napak ---
//  --- imej vključen console, da vidiš, če letijo ven kšni errorji ---

//      --------- še za naredit ---------


//      -----------------           ---------------------------         ---------------------

//  za najt zadnje delo išči:  t e m p  ali pa  c o n s o l e.log


//  --------------  ODLOŽIŠČE ------  (morebitno)  ------------------------


//  --------------  PODATKI in PREMISLEKI

//  minimum ekran, da dela igra: 1040 x 560px
// min dimenzije za normalno postavitev pri block = 40:
// min širina 1422 notranja (window.innerwidth, ni treba gledat clientWidth od hrml-ja)
// min višina notranja 790 (taka je med igro; ko ni igre, kaže, da je min višina 774, ampak to ni merodajno; višino med igro poveča vrstica s podatki o številu eksplozij)

//  pri dimenzijah, če je širina manjša od 1280 ali višina manjša od 712 se preide na block = 32

// barva ozadja in barva ozadja v aktivnem delu canvasa: '#313131'
// barva ozadja v neaktivnem delu canvasa '#5a5a5a'
// barva razdelilne črte v canvasu '#bdbdbd'

// glede ŠIRINA ČRT in DIMENZIJE LIKA PRI IZRISOVANJU: 
//  če je širina črte===2, potem je:
//      - širina canvasa = n*širina lika + 1;
//      - ko pa potem rišeš like:
//          - postaviš jih na mrežo +1 (coordX = n*širina lika+1, coordY=m*višina lika+1),
//          - h in w risanja pa sta = širina lika - 1

//  če je širina črte === 1, potem je:
//      - širina canvasa = n*širina lika + 1;
//      - ko pa potem rišeš like:
//          - postaviš jih na mrežo - 0,5 (coordX = n*širina lika-0,5, coordY=m*višina lika-0,5),
//          - h in w risanja pa sta = širina lika (+/- 0)

//  če rišeš z debelino črt (okoli kvadratkov) === 2:
//      - če rišeš na canvasu, kjer ni prilagoditve ostrine (rob canvasa je narisan s propertijem border html elementa), so dimenzije igralnega polja: š:401, v: 641 (za 10x16 kvadratkov po 40)
//      - če pa rišeš po kanvasu, katerega rob debeline 1 si narisal s prilagoditvijo ostrine, je igralno polje š:402, v: 642

//  barve, širine črt, ... določaj na začetku vsake funkcije, kolikor pač mora biti v funkciji, sicer ni pregledno (če ne..
//  ..moraš vodit v glavi, kje in kako spreminjaš te stvari )

// ----------------     SELEKTORJI

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const contentJoker = document.getElementById('content_joker');
const scoreContent = document.getElementById('score_content');
const contentJoker2 = document.getElementById('content_joker2');
const lftBtn = document.getElementById('left_btn');
const midBtn = document.getElementById('mid_btn');
const rghtBtn = document.getElementById('right_btn');
// const btnTestButton2 = document.getElementById('button-2');

//      -------------       SPREMENLJIVKE in VREDNOSTI

// const pageLang = document.firstElementChild.lang;   // precej neuporabno, ker to sam definiraš v html-ju; v mobilni varianti se ne koristi, v web pa ja;
let lang = 'en'; // to je jezik browserja, odkrit v funkciji spodaj, kjer se lahko spremeni na 'sl';
let lastRow0based = 15;
let lastColumn0Based = 9;
let board = [];     //  board: spremenljivka, ki vsebuje matriko true/false, kar pomeni, da je na taki poziciji prisoten kvadratek
//                      vrhnja raven predstavlja vrstice (vrhnja vrstica je prva), druga raven predstavlja stolpce (levi stolpec je prvi)
let isAGameRunning = false;          // pomeni, da je ena igra tetrisa v teku; lahko je pavzirana
let isGamePaused = false;
let gameIntervalIsInMotion = null;  //  spremenljivka, ki kliče setInterval
let controlsTemporarilyOff = false;     // med eksplozijo se tipke ne odzivajo, nobena; med običajno igro je na false
let intervalTypeShrinkingHuh = true;
let kateriJeVesTrue;     // številska vrednost; katera vrstica je vsa true, torej vsa zapolnjena s kockami in zrela za eksplozijo;
let numberOfExplosions, numberConsecutiveXplosions, numberOfFallenForms, numberOfCycles, score;
let gameDirection = { direction: 'down', layout: 'vertical' };
const currentBlockPos = {};      // globalna spremenljivka, ki se v realnem času spremninja in uporablja za izrisovanje kock; NE UPORABLJAJ za preverjanja izvedljivosti pred premikom in niti pri polnjenju podatkov "true" na board!!
const lineColor = '#bdb9b9';    // pri lineWidth === 2 je še najboljša: #bdb9b9, pri lineWidth === 1 pa #8d8989
let mainGridLayoutsCoords = {
    vertical: { x: 30, y: 30, l: 402, h: 642 },
    horizontal: { x: 30, y: 270, l: 642, h: 402 }
};
let mainGridCoords = { x: 30, y: 30, l: 402, h: 642 };  // za naredit, to in naslednjo vrstico se morda lahko izbriše, ekr se verjetno definirata ob prvi priliki;
let miniGridCoords = { x: 467, y: 30, l: 203, h: 203 }
let blockSize = 40, canvasLeft = 0, canvasTop = 0; // canvasLeft je x levega roba canvasa;
const canvasSizeData = {
    canvasBase: 700,
    canvasWidthWas: 700,
};
let insertionColumn = 4;
let arrowIconCoords = [{ x: 0, y: 60 }, { x: -20, y: 60 }, { x: 15, y: 100 }, { x: 50, y: 60 }, { x: 30, y: 60 }, { x: 30, y: 0 }, { x: 15, y: 10 }];
let isGreenMode = false;
const gamestats = { // samo za potrebe razvoja; ukvarja se predvsem z random, koda je v keys_UI
    formReachedRow: [],
    randomDirectionChanges: [],
};
let spacePressedHuh = false;    // samo za potrebe razvoja;
let var1, var2, phrase; // spremenljivke in pomožna fraza za vstavljanje besedila;
const langSL = 'sl', langEN = 'en';

class Form {
    constructor(coordinates, name, color) {
        this.coordinates = coordinates;
        this.name = name;
        this.totalRotations = this.coordinates.length;
        this.activeRotation = 0;
        this.notionalPos = { row: 0, col: 4 };
        this.color = color;
    }
}

//  so liki (form) in kvadratki. Lik je sestavljen iz 4 kvadratkov.
//  koordinate odmika kvadratkov podajaš (za kvadratke) od zgoraj navzdol in od leve na desno; rotacije si sledijo v smeri vrtenja ure
//  rDiff = odmik (Diff = Offset) na osi vrstic (r = row) aktualnega kvadratka aktualne permutacije lika od notionalPos lika
//  cDiff = odmik (Diff = Offset) na osi stolpcev (c = column) aktualnega kvadratka aktualne permutacije lika od notionalPos lika
const form1 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: 0 }],
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }],     // [][][]
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }],     //   []
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: 0 }]], 'piramida', '#1b1bff'); // svetlo plava #0f88fa #1d89ee #1f1fe6

const form2 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 0, cDiff: 2 }],
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }, { rDiff: 2, cDiff: 0 }]], 'dolga', '#25cafa');    // [][][][] ta je bla še najbolj: #25cafa ali #24afff ali #2a93f5 ali #1dbdee #1ac7fc #1d89ee

const form3 = new Form([[{ rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 },               //  [][]
{ rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }]], 'kocka', '#0e0e7a');                 //  [][]  najboljša: #000080

const form4 = new Form([[{ rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: -1 }, { rDiff: 1, cDiff: 0 }],          //     [][]
[{ rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }, { rDiff: 2, cDiff: 1 }]], 'zamaknjena v desno', 'white')   //   [][]   zgornji del je zamaknjen v imenovano smer;

const form5 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }],                    //  [][]
[{ rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }, { rDiff: 2, cDiff: 0 }]], 'zamaknjena v levo', '#f8fc16') //rumena   //    [][]

const form6 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: 1 }],
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: -1 }, { rDiff: 1, cDiff: 0 }],     // [][][]
[{ rDiff: -1, cDiff: -1 }, { rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }],    //     []
[{ rDiff: -1, cDiff: 0 }, { rDiff: -1, cDiff: 1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }]], 'kljuka v desno', '#eb1d1d'); // rdeča #d81f1f #db0606

const form7 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: -1 }],
[{ rDiff: -1, cDiff: -1 }, { rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }],     // [][][]
[{ rDiff: -1, cDiff: 1 }, { rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }],      // []
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }]], 'kljuka v levo', 'green');

const forms = [form1, form2, form3, form4, form5, form6, form7];
let activeForm, nextForm; // oblika, ki trenutno pada; oblika, ki bo naslednja prišla na igralno polje 
//  v funkcijah se bo pojavljala: const tentativeBlockPos = {row:x, col:y}; to se uporablja za preverjanje (zato tentative),
//  ..ali lahko posamične kocke (zato Block), ki sestavljajo lik, gredo na nameravano mesto (zato Pos/position)

// ---------------      FUNKCIJE

//      ----------      Izvajanje dogodkov v igri

//  polje, v katerem je prikazan naslednji lik
function showNextFormInMiniGrid() {
    const miniGridSingleBlockPos = {};
    clearMiniGrid();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 1;
    ctx.fillStyle = isGreenMode === false ? nextForm.color : 'green';
    if (canvasSizeData.canvasBase === 700) {
        nextForm.notionalPos.row = nextForm.name === 'dolga' ? 2 : 1.5;		// to je da like vedno postavi v sredino tega polja
        nextForm.notionalPos.col = nextForm.name === 'dolga' || nextForm.name === 'kocka' ? 1.5 : 2;	// to je da like vedno postavi v sredino tega polja
    } else {
        nextForm.notionalPos.row = nextForm.name === 'dolga' ? 2.5 : 2;		// to je da like vedno postavi v sredino tega polja
        nextForm.notionalPos.col = nextForm.name === 'dolga' || nextForm.name === 'kocka' ? 2.2 : 2.7;	// to je da like vedno postavi v sredino tega polja        
    };
    nextForm.activeRotation = 0;
    nextForm.coordinates[nextForm.activeRotation].forEach(element => {
        miniGridSingleBlockPos.row = nextForm.notionalPos.row + element.rDiff;
        miniGridSingleBlockPos.col = nextForm.notionalPos.col + element.cDiff;
        ctx.beginPath();
        ctx.rect(miniGridSingleBlockPos.col * blockSize + miniGridCoords.x + 1, miniGridSingleBlockPos.row * blockSize + miniGridCoords.y + 1, (blockSize - 1), (blockSize - 1));
        ctx.fill();
        ctx.stroke();
    });
}

function popravekOstrine(v1, v2) {   // brez tega lihe debeline črte riše nejasno (1 px bolj debelo) oz z nepravo (bolj bledo) barvo
    if (ctx.lineWidth % 2 === 1) {
        v1 = v1 - 0.5;
        v2 = v2 - 0.5;
    }
    return [v1, v2];
}

function styleCertainGrid(grid, strokecolor, fillcolor) {
    ctx.lineWidth = 0;
    let [x, y] = popravekOstrine(grid.x, grid.y);
    ctx.strokeStyle = fillcolor;  // v web: ctx.strokeStyle = strokecolor; tukaj pa ni obrobe;
    ctx.fillStyle = fillcolor;
    ctx.beginPath();
    ctx.rect(x, y, grid.l, grid.h);
    ctx.fill();
    ctx.stroke();
}

const clearMiniGrid = () => styleCertainGrid(miniGridCoords, '#bdbdbd', '#313131');
const clearMainGrid = () => styleCertainGrid(mainGridCoords, '#bdbdbd', '#313131');
const eraseCertainGrid = (grid) => styleCertainGrid(grid, '#5a5a5a', '#5a5a5a');    //  #5a5a5a je barva svetlo sivega ozadja canvasa, tam, kjer se ne odvija igra; efektivno to izbriše nek grid
const eraseMainGrid = () => eraseCertainGrid(mainGridCoords);
const eraseBothMainGridLayouts = () => {
    eraseCertainGrid(mainGridLayoutsCoords.vertical);
    eraseCertainGrid(mainGridLayoutsCoords.horizontal);
};
const drawEmptyMainGrid = () => clearMainGrid();

//  osnovna funkcija za risanje (posamičnega kvadratka)
function realiseSingleBlock(color, fillColor) {
    ctx.lineWidth = 2;
    ctx.strokeStyle = color;
    ctx.fillStyle = fillColor;
    ctx.beginPath();

    //  pri width === 2: * blockSize + 1, currentBlockPos.row * blockSize + 1, (blockSize-1), (blockSize-1))
    //  pri width === 1: * blockSize + .5, currentBlockPos.row * blockSize + .5, blockSize, blockSize)

    const originX = mainGridCoords.x + 1;
    const originY = mainGridCoords.y + 1;
    //  za normalno gibanje likov navzdol (padanje):
    if (gameDirection.direction === 'down') ctx.rect(originX + currentBlockPos.col * blockSize, originY + currentBlockPos.row * blockSize, (blockSize - 1), (blockSize - 1));

    //  za gibanje likov navzgor:
    else if (gameDirection.direction === 'up') ctx.rect(originX + (lastColumn0Based - currentBlockPos.col) * blockSize, originY + (lastRow0based - currentBlockPos.row) * blockSize, (blockSize - 1), (blockSize - 1));

    //  za gibanje liov na levo:
    else if (gameDirection.direction === 'left') ctx.rect(originX + (lastRow0based - currentBlockPos.row) * blockSize, originY + currentBlockPos.col * blockSize, (blockSize - 1), (blockSize - 1));

    //  za gibanje liov na desno:
    else if (gameDirection.direction === 'right') ctx.rect(originX + currentBlockPos.row * blockSize, originY + (lastColumn0Based - currentBlockPos.col) * blockSize, (blockSize - 1), (blockSize - 1));

    ctx.fill();
    ctx.stroke();
}

//  osnovna funkcija za risanje (lika)
function realiseForm(color, fillColor) {
    activeForm.coordinates[activeForm.activeRotation].forEach(element => {
        currentBlockPos.row = activeForm.notionalPos.row + element.rDiff;
        currentBlockPos.col = activeForm.notionalPos.col + element.cDiff;
        realiseSingleBlock(color, fillColor);
    });
}

const drawForm = () => realiseForm(lineColor, (isGreenMode === false ? activeForm.color : 'green'));    // line color: #bdb9b9
const deleteForm = () => {
    realiseForm('#313131', '#313131');         // ozadje je '#313131'
}

function getRandomForm() {
    let randomForm = forms[Math.trunc(Math.random() * 7)];
    return randomForm;
}

const insertFormOnTop = () => {

    activeForm = nextForm;
    nextForm = getRandomForm();
    showNextFormInMiniGrid();

    activeForm.notionalPos.row = 0; // podatke o lokaciji je treba ponastavit!!, ker sicer jih podeduje od objekta, katerega referencira in torej dobi neke koordinate z dna igralnega polja
    activeForm.notionalPos.col = insertionColumn; // ker tako next kot active kažeta na objekt, je treba vrednosti ponastaviti zdaj..
    activeForm.activeRotation = 0;  // ..sicer pride do težav, če sta active in next isti lik (pred tem je v showNextFormInMiniGrid() lik dobil drugačne koordinate)
    numberOfFallenForms++;

    drawForm();
}

function insertOnTopAndStartInt() {
    insertFormOnTop();
    getBlocksMoving();
}

function canInsertFormOnTopHuh() {
    nextForm.notionalPos.row = 0; // podatke o lokaciji je treba ponastavit!!, ker sicer jih podeduje od objekta, katerega referencira in torej dobi neke koordinate z dna igralnega polja
    nextForm.notionalPos.col = insertionColumn;
    nextForm.activeRotation = 0;
    let canPlace = true;
    const tentativeBlockPos = {};   //  uporablja se za preverjanje (: tentative), ali lahko posamične kocke (:  Block), ki sestavljajo lik, gredo na nameravano mesto (: Pos/position);

    nextForm.coordinates[nextForm.activeRotation].forEach(element => {
        tentativeBlockPos.row = nextForm.notionalPos.row + element.rDiff;
        tentativeBlockPos.col = nextForm.notionalPos.col + element.cDiff;
        if (tentativeBlockPos.row < 0 || board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) canPlace = false;
    });
    return canPlace;
}

function canMoveSidewaysHuh(direction) {
    const tentativeNotionalPos = direction === 'right' ? activeForm.notionalPos.col + 1 : activeForm.notionalPos.col - 1;
    let canIt = true;
    const tentativeBlockPos = {};

    activeForm.coordinates[activeForm.activeRotation].forEach(element => {
        tentativeBlockPos.row = activeForm.notionalPos.row + element.rDiff;
        tentativeBlockPos.col = tentativeNotionalPos + element.cDiff;
        if (tentativeBlockPos.col < 0 || tentativeBlockPos.col > lastColumn0Based
            || board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) canIt = false;
    });
    return canIt;
}

function canFormMoveDownHuh() {
    const tentativeNotionalPos = activeForm.notionalPos.row + 1;
    let canIt = true;
    const tentativeBlockPos = {};
    activeForm.coordinates[activeForm.activeRotation].forEach(element => {
        tentativeBlockPos.row = tentativeNotionalPos + element.rDiff;
        tentativeBlockPos.col = activeForm.notionalPos.col + element.cDiff;
        if (tentativeBlockPos.row > lastRow0based || board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) canIt = false;
    });
    return canIt;
}

function moveForm(direction) {
    deleteForm();
    if (direction === 'left') activeForm.notionalPos.col--;
    if (direction === 'right') activeForm.notionalPos.col++;
    if (direction === 'down') activeForm.notionalPos.row++;
    drawForm();
}

function maneuver(direction) {
    if (canMoveSidewaysHuh(direction)) moveForm(direction);
}

function rotate() {
    let targetRotation = activeForm.activeRotation === activeForm.totalRotations - 1 ? 0 : activeForm.activeRotation + 1;
    let canIt = true;
    const tentativeBlockPos = {};
    activeForm.coordinates[targetRotation].forEach(element => {
        tentativeBlockPos.row = activeForm.notionalPos.row + element.rDiff;
        tentativeBlockPos.col = activeForm.notionalPos.col + element.cDiff;
        if (tentativeBlockPos.row < 0 || tentativeBlockPos.row > lastRow0based || tentativeBlockPos.col < 0
            || tentativeBlockPos.col > lastColumn0Based || board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) canIt = false;
    });

    if (canIt) {
        deleteForm();
        activeForm.activeRotation = targetRotation;
        drawForm();
    };
}

function redrawEntireCurrentBoard() {
    resolveEmptyMainGridAndBckgndGrid();
    for (let i = 0; i <= lastRow0based; i++)    //  potem na izpraznjeno igralno polje dodat (narisat) kvadratke
        for (let j = 0; j <= lastColumn0Based; j++) {
            currentBlockPos.row = i;
            currentBlockPos.col = j;
            if (board[i][j] !== false) realiseSingleBlock(lineColor,
                (isGreenMode === false ? board[currentBlockPos.row][currentBlockPos.col] : 'green'));
        }
}

function canExplodeHuh() {
    //  preverjanje, ali obstaja vrstica, ki je zapolnjena s kockami; ista globalna spremenljivka se uporabi pri eksploziji!
    kateriJeVesTrue = board.findIndex(arr => arr.every(el => el !== false) === true);
    if (kateriJeVesTrue < board.length - 1) return true;
    return false;
}

async function explodeRow() {

    function pauseInSecs(secs) {
        return new Promise(function (resolve) { setTimeout(resolve, secs * 1000) })
    }

    function helperFunkcijaZaExplozijo(line, fill) {
        for (let n = 0; n <= lastColumn0Based; n++) {
            currentBlockPos.col = n;
            realiseSingleBlock(line, fill);
        }
    }

    clearInt();
    controlsTemporarilyOff = true;     // med explozijo itak nimaš kaj pritiskat
    numberOfExplosions++;
    numberConsecutiveXplosions++;

    //  eksplozija
    currentBlockPos.row = kateriJeVesTrue;
    helperFunkcijaZaExplozijo('white', 'red');
    await pauseInSecs(0.1);
    helperFunkcijaZaExplozijo('white', 'yellow');
    await pauseInSecs(0.1);
    helperFunkcijaZaExplozijo('white', 'white');
    await pauseInSecs(0.1);
    helperFunkcijaZaExplozijo('white', 'yellow');
    await pauseInSecs(0.1);
    helperFunkcijaZaExplozijo('white', 'grey');
    await pauseInSecs(0.1);
    helperFunkcijaZaExplozijo('white', '#313131');
    await pauseInSecs(0.1);

    controlsTemporarilyOff = false;    // vrnemo delovanje tipk
    //  odstranit najdeno polno vrstico, posodobit board in narisat posodobljeno igralno polje
    board.splice(kateriJeVesTrue, 1);
    board.splice(0, 0, new Array(lastColumn0Based + 1).fill(false));
    redrawEntireCurrentBoard();
    // refreshExplosionsCountDisplay(); samo web;
    // preveri, ali je morda še kakšna vrstica za razstrelit, sicer znova zaženi gibanje likov;
    if (canExplodeHuh()) explodeRow(); else {
        if (numberConsecutiveXplosions === 1) {
            score += 10;
            refreshCurrentScore();      // pri efektih pa je ponovno sproženje igre premaknjeno na konec efekta, ..
            insertOnTopAndStartInt();   // ..da naslednji lik še ne pada, ko se efekt izvaja;
        } else if (numberConsecutiveXplosions === 2) {
            score += 25;
            effectDoubleTrouble();
        }else if (numberConsecutiveXplosions === 3) {
            score += 50;
            effectTripple();
        } else {
            score += 100;
            effectQuad();
        };
        numberConsecutiveXplosions = 0;
    };
}


function drawDirectionArrow() {     // puščica, ki je pred začetkom igre lahko narisana, da kaže trenutno izbrano smer igre

    //  določanje podatkov
    let start = { x: mainGridCoords.x, y: mainGridCoords.y };   // za določit začetno koordinato
    if (gameDirection.direction === 'down') { start.x += mainGridCoords.l / 2 - 15; start.y += blockSize };
    if (gameDirection.direction === 'up') { start.x += mainGridCoords.l / 2 + 15; start.y += mainGridCoords.h - blockSize };
    if (gameDirection.direction === 'right') { start.x += blockSize; start.y += mainGridCoords.h / 2 - 15 };
    if (gameDirection.direction === 'left') { start.x += mainGridCoords.l - blockSize; start.y += mainGridCoords.h / 2 + 15 };
    let first, second;                                          // za določit al gre za izvirno risanje al primarno preslikavo (za 90')
    if (gameDirection.layout === 'vertical') {
        first = 'x'; second = 'y';
    } else {
        first = 'y'; second = 'x';
    };
    //    za določit, al gre za izvirno al sekundarno preslikavo (zrcalno, 180')
    let faktor = (gameDirection.direction === 'up' || gameDirection.direction === 'left') ? -1 : 1;
    // obrat first | second in pa faktor 1 | -1 da matriko 4 možnosti, torej 4 smeri risanja puščice

    // izvedba
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#2a93f5'; // lineColor
    ctx.fillStyle = lineColor;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y)
    arrowIconCoords.forEach(function (_, i) {
        let [x, y] = popravekOstrine(start.x + faktor * arrowIconCoords[i][first], start.y + faktor * arrowIconCoords[i][second]);
        ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function resolveEmptyMainGridAndBckgndGrid() {
    drawEmptyMainGrid();
}

function initializeScreenAndSizes() {

    /*
    ----  po NAVPIČNI dimenziji
    20px higienski rob zgoraj
        minigrid (5 kock)
    20px higienski rob (v canvasu)
        glavni grid (16 kock)
    90px (gumbov del):
        20px zgoraj
        50px gumb
        20px spodaj

    ----  po VODORAVNI dimenziji
    20px hig. rob levo
    20px hig. rob desno
    */

    const lesserBoundingHorizontal = window.innerWidth > screen.width ? screen.width : window.innerWidth;
    const avail4blocksHrztl = lesserBoundingHorizontal - 40;    // 40px je ne-canvas del, glej izračun zgoraj;
    let hrztlBlckSze = Math.floor(avail4blocksHrztl / 10);  // 10 kock širine je igralno polje;
    if (hrztlBlckSze > 40) hrztlBlckSze = 40;
    const lesserBoundingVertical = window.innerHeight > screen.height ? screen.height : window.innerHeight;
    const avail4blocksVerticl = lesserBoundingVertical - 130; // 130px je ne-grid delov, glej izračun zgoraj;
    let vertBlckSze = Math.floor(avail4blocksVerticl / 21);   // 21 = 5 kock minigrid + 16 kock igralni del; brez roba;
    if (vertBlckSze > 40) vertBlckSze = 40;

    // contentJoker.innerHTML+=`<br>blckSzHz: ${hrztlBlckSze}, blockSzeVErt: ${vertBlckSze}`;

    // kocke smejo biti le toliko velike, kot je manjša od obeh omejitev;
    blockSize = hrztlBlckSze < vertBlckSze ? hrztlBlckSze : vertBlckSze;
    canvas.width = 10 * blockSize;
    canvas.height = 21 * blockSize + 20;
    canvas.style.top = '20px';
    canvas.style.left = `${(lesserBoundingHorizontal - canvas.width) / 2}px`
    canvasLeft = canvas.getBoundingClientRect().left;
    canvasTop = canvas.getBoundingClientRect().top;
    console.log('canvasLeft:', canvasLeft, 'canvasTop:', canvasTop, 'block size:', blockSize);

    // vrednosti za lokacijo miniGrida in mainGrida; IZRAŽENE v koordinatah na canvasu, ne na ekranu!!!
    mainGridLayoutsCoords.vertical.x = 0;   // vertical pomeni pri vertikalni postavitvi; x pomeni odmik zgornje leve točke main grida v canvasu;
    mainGridLayoutsCoords.vertical.y = 5 * blockSize + 20;
    mainGridLayoutsCoords.vertical.l = (lastColumn0Based + 1) * blockSize;
    mainGridLayoutsCoords.vertical.h = (lastRow0based + 1) * blockSize;
    // če se bo obračalo, bo treba določit tudi hzntl;

    mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];   // v mobile je trenutno je to vedno vertical;

    miniGridCoords.x = 2.5 * blockSize; // ker je mini dolg 5 in cel kanvas 10, je na obeh straneh minija 2,5 kocke placa;
    miniGridCoords.y = 0;
    miniGridCoords.l = 5 * blockSize;
    miniGridCoords.h = 5 * blockSize;

    insertionColumn = (lastColumn0Based + 1) % 2 === 0 ? ((lastColumn0Based + 1) / 2) - 1 : ((lastColumn0Based + 1) - 1) / 2;
    // resolveEmptyMainGridAndBckgndGrid();
    // drawDirectionArrow();

    // umestitev srednjega gumba
    midBtn.style.left = `${lesserBoundingHorizontal / 2 - 25}px`;   // -25, ker je širina gumba 50px;
    
}

//      ---------------     Potek igre

function clearInt() {
    clearInterval(gameIntervalIsInMotion);  // brez počiščenja intervala zadeva ne deluje
    gameIntervalIsInMotion = null;
}

function decisionAfterFormMovementEnded() {

    // (IMPRINT FORM ONTO BOARD)
    //  ta pripis vrednosti je treba narediti tukaj, ker zdaj (ko ne more več it dol) lik postane del boarda
    //  zabeležba lika na matriko false/barva, ki predstavlja mrežno igralno polje in morebitno zasedenost posamičnega mrežnega elementa
    const helperPos = {};
    activeForm.coordinates[activeForm.activeRotation].forEach(element => {
        helperPos.row = activeForm.notionalPos.row + element.rDiff;
        helperPos.col = activeForm.notionalPos.col + element.cDiff;
        board[helperPos.row][helperPos.col] = activeForm.color;
    });

    //  temp    samo za potrebe razvoja
    if (spacePressedHuh) spacePressedHuh = false; else { gamestats.formReachedRow.push('touchdown'); }
    //  temp

    // ali lahko explodira
    if (canExplodeHuh()) {	// tega se ne da refaktorizirat na eno samo funkcijo, ker tudi explodeRow sam kliče canExplodeHuh in pa samega sebe
        score++;
        refreshCurrentScore();
        explodeRow();
        return;
    }

    //ali lahko vstaviš novo kocko na vrhu igralnega polja?
    if (canInsertFormOnTopHuh()) {
        score++;
        refreshCurrentScore();
        if (gameIntervalIsInMotion === null) insertOnTopAndStartInt(); else insertFormOnTop(); // če spejs, potem insertontopANDstartint, sicer samo insertFormOnTop
        return;
    }

    // in če ne, je pač game over;
    if (gameIntervalIsInMotion !== null) clearInt(); // če ni spejs, je treba odstranit intervalni callBK; če je spejs, je interval že bil ustavljen
    console.log(' G A M E   O V E R ');
    isAGameRunning = false;
    // controlsTemporarilyOff = true;    // če bo vpisovanje inicialk, je treba to odpret; medtem ko je odprto okno za high scores, tipka enter ne sme imet funkcionalnosti "zaženi igro";
    clearMiniGrid();
    curtainInMiniGridClosing();
    setTimeout(() => behAftrCurtnsCloseAtGOver(), 1080);    // če spremeniš trajanje curtainMiniGrid, potem razmisli tudi o trajanju tle;
}

function behAftrCurtnsCloseAtGOver() {
    contentJoker2.className = '';   // to odstrani tudi morebitni hidden;
    contentJoker2.className = 'blk_bckg';
    if (lang === langEN) {
        var1 = 'G A M E&nbsp;&nbsp;';
        var2 = 'O V E R';
    } else {
        var1 = 'I G R E&nbsp;&nbsp;J E';
        var2 = 'K O N E C';
    }
    contentJoker2.innerHTML = `<div>${var1}</div><div class="rotate">${var2}</div>`;
    standBy();
    contentJoker.innerHTML = phrase;
}

function actionWhenSpacePressed() {

    clearInt();
    let canSpace = true;                 //  ali naj ima tipka spejs kak efekt ali ne
    let tillWhichRowNotionalPos = 0;    //  do katere vrstice se lahko spusti notioanlPos lika po pristisku na spejs
    const tentativeBlockPos = {};

    for (let i = activeForm.notionalPos.row + 1; i <= lastRow0based; i++) {
        activeForm.coordinates[activeForm.activeRotation].forEach(element => {
            tentativeBlockPos.row = i + element.rDiff;
            tentativeBlockPos.col = activeForm.notionalPos.col + element.cDiff;
            if (board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) canSpace = false;
        });
        if (canSpace) tillWhichRowNotionalPos = i;
        else break;
    }

    if (tillWhichRowNotionalPos > activeForm.notionalPos.row) {
        // temp     samo za potrebe razvoja
        gamestats.formReachedRow.push(activeForm.notionalPos.row + 1);
        spacePressedHuh = true;
        // temp
        deleteForm();
        activeForm.notionalPos.row = tillWhichRowNotionalPos;
        drawForm();
    }

    decisionAfterFormMovementEnded();
}

function decide() {     // tu se odloča, kaj se zgodi, ko poteče zadrževanje kvadratka na določenem nivoju (v določeni vrstici)

    numberOfCycles++;   // to bi moral dodat tudi v rutino ob pritisku spejsa, sicer spejs ne poveča števila ciklov; 
    //  cikli se sicer še vedno ne uporabljajo nikjer, kolikor vem;

    //  premakni lik en štuk dol, če lahko
    if (canFormMoveDownHuh()) {
        moveForm('down');
        return;
    }

    decisionAfterFormMovementEnded();
}

function getBlocksMoving() {    // motor vsega
    if (gameIntervalIsInMotion === null && isAGameRunning) {
        if (intervalTypeShrinkingHuh) gameIntervalIsInMotion = setInterval(decide, 1000 - 1.5 * numberOfFallenForms);
        else gameIntervalIsInMotion = setInterval(decide, 1000);
    }
}

function startGame() {
    phrase = lang === langEN ? 'Pause game' : 'Začasno ustavi igro';
    contentJoker.innerHTML = phrase;
    contentJoker2.classList.add('hidden');
    eraseBothMainGridLayouts();
    resolveEmptyMainGridAndBckgndGrid();
    refreshCurrentScore();
    // refreshExplosionsCountDisplay(); samo web
    curtainInMiniGridOpening();
    setTimeout(() => {
        isAGameRunning = true;
        insertOnTopAndStartInt();
    }, 1250)
}

function standBy() {
    board = new Array();
    board = Array(lastRow0based + 1).fill().map(() => Array(lastColumn0Based + 1).fill(false));
    board.push(new Array(lastColumn0Based + 1).fill(true));    // da naredi dno pod igralnim poljem
    numberOfCycles = 0;
    numberOfFallenForms = 0;
    score = 0;                  // ga pa ne refrešaš, da ostane prikazano, koliko si imel pri zadnji igri, če si že igral
    numberOfExplosions = 0;     // ga pa ne refrešaš, da ostane prikazano, koliko si imel pri zadnji igri, če si že igral
    numberConsecutiveXplosions = 0;
    curtainInMiniGridStaticClosed();
    nextForm = getRandomForm();
    phrase = lang === langSL ? "ZAČNI IGRO" : "START GAME";
    contentJoker.innerHTML = phrase;
}

function refreshCurrentScore() {
    if (lang === langEN) {
        var1 = "Score: ";
        var2 = "Lines: ";
    } else {
        var1 = "Točke: ";
        var2 = "Vrstice: ";
    }
    scoreContent.innerHTML = `${var1}${score}<br>${var2}${numberOfExplosions}`;
    //	trivia (ali ne): intervalID (zaporedna številka intervala), ko gre igra skozi eksplozijo, se poveča za 7, ker setTimer in SetInterval imajo skupno štetje,
    //  ..zato interval ni primeren za vodenje točk; hm, ali bi pač morda kar interval bile točke ...
}

function assignControlListeners() {
    contentJoker.addEventListener('click', () => {
        if (!isAGameRunning && !controlsTemporarilyOff) startGame() ;
        else if (isAGameRunning && !controlsTemporarilyOff && gameIntervalIsInMotion !== null) {    // pri eksploziji gre na null, takrat ne sme biti možno pavzirat,
            isGamePaused = true;
            clearInt();
            phrase = lang === langEN ? 'GAME PAUSED click to resume' : 'PAVZIRANO, kliknite za nadalj.';
            contentJoker.innerHTML = phrase;
        } else if (isGamePaused) {
            isGamePaused = false;
            getBlocksMoving();
            phrase = lang === langEN ? 'Pause game' : 'Začasno ustavi igro';
            contentJoker.innerHTML = phrase;
        }
        });
    lftBtn.addEventListener('click', () => {if (isAGameRunning && !isGamePaused && !controlsTemporarilyOff) maneuver('left')});
    rghtBtn.addEventListener('click', () => {if (isAGameRunning && !isGamePaused && !controlsTemporarilyOff)  maneuver('right')});
    midBtn.addEventListener('click', () => {if (isAGameRunning && !isGamePaused && !controlsTemporarilyOff) rotate()});
    canvas.addEventListener('click', (e) => {
        console.log(e.x, miniGridCoords.x);
        if (!controlsTemporarilyOff && isAGameRunning && !isGamePaused) {
            if ((e.y > (canvas.height - 3 * blockSize))) {
                if (canFormMoveDownHuh()) moveForm('down');
            } else if (e.x > canvasLeft + miniGridCoords.x && e.x < canvasLeft + miniGridCoords.x + miniGridCoords.l
                && e.y > canvasTop && e.y < canvasTop + miniGridCoords.h) { // e.x vrne abs koordinate ekrana, ne na canvasu;
                    actionWhenSpacePressed();
            }
        } 
    });
}

function checkLang(){
    let checkLangStr = 'en';
    if (navigator.language != '') {
        checkLangStr = navigator.language;
    } else if (navigator.userLanguage != '') {
        checkLangStr = navigator.userLanguage;
    };
    if (checkLangStr == 'sl' || checkLangStr == 'sl-si' || checkLangStr == 'sl-SI' || checkLangStr == 'si') { lang = 'sl' } // privzeto, ob deklaraciji, je "en";
}

function faint() {
    document.body.style.transition = 'opacity 1s';
    document.body.style.opacity = '30%';
    setTimeout(function () { document.body.style.opacity = '100%'; }, 1000)
}

//  -----------         za testne namene

// function testButton2Operation() {
//     btnTestButton2.blur();  //  ta ukaz ostane vedno noter, glede na testne potrebe pa lahko dodaš kaj drugega
//     faint();
//     console.log(window.innerWidth, window.innerHeight);
//     // let aa = Math.random() * 4;
//     // if (aa > 3) { effectDoubleTrouble(); return }
//     // if (aa > 2) { effectTripple(); return } else 
//     // effectQuad();
//     // console.log(document.firstElementChild.clientWidth, document.firstElementChild.clientHeight)
// }


//  ---------------     LISTENERJI

// btnTestButton2.addEventListener('click', testButton2Operation);  // v live različici listener ne smebiti aktiven

 
/* 
klik v polje desno ali levo od kocke, da je premakneš tja
podrsat lik dol, da ga vržeš dol
klik na lik, da ga obrneš
*/

//  ----------------    IZVAJANJE

initializeScreenAndSizes();
drawEmptyMainGrid();
checkLang();
standBy();
assignControlListeners();


//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com