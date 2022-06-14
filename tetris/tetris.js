'use strict';
//  --- uporabljaj try/catch za iskanje napak ---
//  --- imej vključen console, da vidiš, če letijo ven kšni errorji ---

//      --------- še za naredit ---------

//  refaktorizirat init
//  omogočit nastavitev tipk za vsako smer igranja
//  pogledat "z a  n a r..."
//  indikator da bo midair change?
//  pregledat, al so morda kšne spremenljivke neuporabljene (če se pojavi le 1x ali 2x)
//	morda bi background Grid preimenoval v Mesh?
//  ver 20220323: probi na začetku sao obrnit orientacijo na horit  nato na vertik. a potem ti kar avtomatsko riše sledi, ko pdajo liki?
//  ver 20220323: razumet, zakaj in kako če odstraniš linewidth=2 pri spremembi postavitve, gre na linewidth 1, ki potem pušča sledi - ver 20220323
//  probi pogruntat barve od unih dveh slik ki si si jih shranil v mapo projekta al pa od kšnih stvari po stanovanju
//	barva od 20220226_3.0 ima zanimivo barvo za dolgo!
//  preberi si: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
//  preberi si: https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop

//      -----------------           ---------------------------         ---------------------

//  za najt zadnje delo išči:  t e m p  ali pa  c o n s o l e.log
//  za najt mesta, kjer je potrebno delo, išči:  z a  n a r e d i t


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
// const canvasFrame = canvas.getBoundingClientRect();
// vrednosti so: bottom: 532 height: 502 left: 430 right: 632 top: 30 width: 202 x: 430 y: 30 ; to je zdaj možno da drugačno
const labelPause = document.querySelector('.pause-label');
const labelGameOver = document.getElementById('game-over');
const labelsIntervalSpeed = document.querySelectorAll('.interval-speed-label');
// const labelsSteeringType = document.querySelectorAll('.steering-type-label');    // legacy, se ne uporablja
const labelSizeInfo = document.getElementById('size-info');
const labelExplosionNumberInfo = document.getElementById('explosion-number');
const labelScore = document.getElementById('score');
const labelHighScoresTable = document.getElementById('high-scores-table');
const labelHighScoresInitials = document.getElementById('high-score-initials');
const btnsIntervalSpeed = document.querySelectorAll('.interval-speed');
const btnsKeyForGameDirection = document.querySelectorAll('.button-key');
const btnKeyRandomDirection = document.querySelector('.button-random');
const btnsRandomnessLevel = document.querySelectorAll('#randomness-level p');
// const btnsSteeringType = document.querySelectorAll('.steering-type');            // legacy, se ne uporablja
const btnSubmitSize = document.getElementById('size-form-submit');
// const btnTestButton2 = document.getElementById('button-2');
const btnResetHighScores = document.querySelector('.button-1');
const boxStartGame = document.getElementById('start-game-box');
const boxIntervalSpeed = document.getElementById('box-interval-speed');
const divRandomness = document.getElementById('randomness-level');
const divBckgndGrid = document.getElementById('background-grid-div');
const divGreenMode = document.getElementById('green-mode-div');
const divSizeForm = document.getElementById('size-div');
const divDelovna = document.getElementById('delovna');
const divDesni = document.getElementById('desni');
const divLangFlag = document.getElementById('lang-flag');
const divScore = document.getElementById('div-score');
const divMessagesContainer = document.getElementById('messages-container');
const divHighScoresAll = document.getElementById('high-scores-all');
const divHighScores = document.getElementById('high-scores');
const frameResetHighScores = document.getElementById('reset-highscores');
const frameMessages = document.getElementById('messages');
const btnConfirmResetHscores = document.getElementById('btn-reset-hscores-yes');
const btnCancelResetHscores = document.getElementById('btn-reset-hscores-no');
const labelNotNow = document.getElementById('not-now');
const labelEyesOnTheGame = document.getElementById('eyes-on-the-game');
const formInitials = document.getElementById('initials-form');
const inputInitials = document.getElementById('initials-input');
const inputPlayingFieldSize = document.querySelectorAll('.size-form-input');
const overlayStartGameBox = document.getElementById('start-game-box-overlay');
const overlayIntervalBox = document.getElementById('interval-box-overlay');
const overlayRandomnessDiv = document.getElementById('randomness-div-overlay');
const overlayGameSizeDiv = document.getElementById('size-div-overlay');
const overlayDuringAlert = document.getElementById('window-overlay-for-alert');

//      -------------       SPREMENLJIVKE in VREDNOSTI

const pageLang = document.firstElementChild.lang;
let lastRow0based = 15;
let lastColumn0Based = 9;
let board = [];     //  board: spremenljivka, ki vsebuje matriko true/false, kar pomeni, da je na taki poziciji prisoten kvadratek
//                      vrhnja raven predstavlja vrstice (vrhnja vrstica je prva), druga raven predstavlja stolpce (levi stolpec je prvi)
let highScores = [];
let isAGameRunning = false;          // pomeni, da je ena igra tetrisa v teku; lahko je pavzirana
let isGamePaused = false;
let gameIntervalIsInMotion = null;  //  spremenljivka, ki kliče setInterval
let controlsTemporarilyOff = false;     // med eksplozijo se tipke ne odzivajo, nobena; med običajno igro je na false
let btnResetHighScoresPressedHuh = false;
let intervalTypeShrinkingHuh = true;
let kateriJeVesTrue;     // številska vrednost; katera vrstica je vsa true, torej vsa zapolnjena s kockami in zrela za eksplozijo;
let numberOfExplosions, numberConsecutiveXplosions, numberOfFallenForms, numberOfCycles, score;
let keyForMovementLeft = 'ArrowLeft';
let keyForMovementRight = 'ArrowRight';
let keyForFasterMvmtDown = 'ArrowDown';
let keyForRotation = 'ArrowUp';
let gameDirection = { direction: 'down', layout: 'vertical' };
const currentBlockPos = {};      // globalna spremenljivka, ki se v realnem času spremninja in uporablja za izrisovanje kock; NE UPORABLJAJ za preverjanja izvedljivosti pred premikom in niti pri polnjenju podatkov "true" na board!!
const lineColor = '#bdb9b9';    // pri lineWidth === 2 je še najboljša: #bdb9b9, pri lineWidth === 1 pa #8d8989
let mainGridLayoutsCoords = {
    vertical: { x: 30, y: 30, l: 402, h: 642 },
    horizontal: { x: 30, y: 270, l: 642, h: 402 }
};
let mainGridCoords = { x: 30, y: 30, l: 402, h: 642 };  // za naredit, to in naslednjo vrstico se morda lahko izbriše, ekr se verjetno definirata ob prvi priliki;
let miniGridCoords = { x: 467, y: 30, l: 203, h: 203 }
let blockSize = 40;
const canvasSizeData = {
    canvasBase: 700,
    canvasWidthWas: 700,
};
let insertionColumn = 4;
let arrowIconCoords = [{ x: 0, y: 60 }, { x: -20, y: 60 }, { x: 15, y: 100 }, { x: 50, y: 60 }, { x: 30, y: 60 }, { x: 30, y: 0 }, { x: 15, y: 10 }];
let isGreenMode = false;
const randomMode = {    // v initu se dodata še drugi propertyji, ki morajo bit ponastavljeni pred vsako igro, ti spodnji pa ne, se prenesejo v naslednje igre;
    isActive: false,
    level: 1,
    lowerThresholdFormsBtwnChngs: 4,    //  če spreminjaš vrednosti za to in še dve naslednji spremenljivki tukaj,..
    upperThresholdFormsBtwnChngs: 10,   //  .. jih spremeni tudi v tej funkciji: assignRandomnessLevelValues()
    oneToXOdds: 16,
};
const gamestats = {
    formReachedRow: [],
    randomDirectionChanges: [],
};
let spacePressedHuh = false;

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

const form4 = new Form([[{ rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: -1 }, { rDiff: 1, cDiff: 0 }],   //      [][]
[{ rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }, { rDiff: 2, cDiff: 1 }]], 'zamaknjena v desno', 'white')   //      [][]

const form5 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }],                  //  [][]
[{ rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: 0 }, { rDiff: 1, cDiff: 1 }, { rDiff: 2, cDiff: 0 }]], 'zamaknjena v levo', '#f8fc16') //rumena   //  [][]

const form6 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: 1 }],
[{ rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: -1 }, { rDiff: 1, cDiff: 0 }],     // [][][]
[{ rDiff: -1, cDiff: -1 }, { rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }],     //    []
[{ rDiff: -1, cDiff: 0 }, { rDiff: -1, cDiff: 1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }]], 'kljuka v desno', '#eb1d1d'); // rdeča #d81f1f #db0606

const form7 = new Form([[{ rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }, { rDiff: 1, cDiff: -1 }],
[{ rDiff: -1, cDiff: -1 }, { rDiff: -1, cDiff: 0 }, { rDiff: 0, cDiff: 0 }, { rDiff: 1, cDiff: 0 }],     // [][][]
[{ rDiff: -1, cDiff: 1 }, { rDiff: 0, cDiff: -1 }, { rDiff: 0, cDiff: 0 }, { rDiff: 0, cDiff: 1 }],     //  []
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
    ctx.lineWidth = 1;
    let [x, y] = popravekOstrine(grid.x, grid.y);
    ctx.strokeStyle = strokecolor;
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
    if (divBckgndGrid.classList.contains('background-grid-btn-selected')) {
        //  zakaj dvakrat? ker najprej je treba zbrisat dvojno črto,sicer je enojna ne bi prerisala;
        //  zakaj nisem izkoristil izvirnega RealiseForm in realiseSingleBlock? da ni toliko if-ov;
        //  za naredit: morda pa bi le izkoristil izvira realise (oba)

        activeForm.coordinates[activeForm.activeRotation].forEach(element => {
            currentBlockPos.row = activeForm.notionalPos.row + element.rDiff;
            currentBlockPos.col = activeForm.notionalPos.col + element.cDiff;

            ctx.lineWidth = 1;      // razlika: izvirno: 2
            ctx.strokeStyle = '#5a5a5a';            // barva mreže v ozadju: '#5a5a5a'
            ctx.beginPath();
            //  pri width === 1: * blockSize + .5, currentBlockPos.row * blockSize + .5, blockSize, blockSize)

            const originX = mainGridCoords.x + 0.5; // razlika: izvirno + 1
            const originY = mainGridCoords.y + 0.5;
            // razlika pri 4 vrsticah spodaj: h in l sta blockSize (torej 2x), namesto (blockSize-1);
            if (gameDirection.direction === 'down') ctx.rect(originX + currentBlockPos.col * blockSize, originY + currentBlockPos.row * blockSize, blockSize, blockSize);
            else if (gameDirection.direction === 'up') ctx.rect(originX + (lastColumn0Based - currentBlockPos.col) * blockSize, originY + (lastRow0based - currentBlockPos.row) * blockSize, blockSize, blockSize);
            else if (gameDirection.direction === 'left') ctx.rect(originX + (lastRow0based - currentBlockPos.row) * blockSize, originY + currentBlockPos.col * blockSize, blockSize, blockSize);
            else if (gameDirection.direction === 'right') ctx.rect(originX + currentBlockPos.row * blockSize, originY + (lastColumn0Based - currentBlockPos.col) * blockSize, blockSize, blockSize);

            ctx.stroke();   // razlika od izvirnega realiseForm: brez .fill()

        });
    }
}

function getRandomForm() {
    let randomForm = forms[Math.trunc(Math.random() * 7)];
    return randomForm;
}

function assignRandomnessLevelValues() {
    if (randomMode.level === 1) {   // če spreminjaš vrednosti za level 1, moraš to enako spremenit tudi pri deklaraciji spremenljivke!;
        randomMode.lowerThresholdFormsBtwnChngs = 4;
        randomMode.upperThresholdFormsBtwnChngs = 10;
        randomMode.oneToXOdds = 16;
    };
    if (randomMode.level === 2) {
        randomMode.lowerThresholdFormsBtwnChngs = 3;
        randomMode.upperThresholdFormsBtwnChngs = 8;
        randomMode.oneToXOdds = 12;
        randomMode.oneToXOddsOfMidFallChange = 3;
    };
    if (randomMode.level === 3) {
        randomMode.lowerThresholdFormsBtwnChngs = 2;
        randomMode.upperThresholdFormsBtwnChngs = 5;
        randomMode.oneToXOdds = 6;
        randomMode.oneToXOddsOfMidFallChange = 1.5;
    }
}

function executeRandomDirectionChange(type) {
    //  posodobitev relevantnih vrednosti spremenljivk randomMode in gameStats;
    randomMode.lastChangeAtFallenFormNr = numberOfFallenForms;  // zabeležimo, kdaj je bla zadnja random menjava smeri;
    randomMode.nrOfDirctnChanges++;
    const insertee = {};
    insertee.changeAtFormNr = numberOfFallenForms;
    insertee.changeType = type;
    gamestats.randomDirectionChanges.push(insertee);
    console.log(`${type} ${type === 'midair' ? ', in sicer' + (activeForm.notionalPos.row + 1) : ''}`)   //  da vidiš sproti

    //  določitev nove smeri;
    let directions = ['up', 'right', 'down', 'left'];
    directions.splice(directions.findIndex(curr => curr === gameDirection.direction), 1); // s tem skineš trenutno smer iz arraya;

    //  pri levelu 2 nekoliko preferiramo usmeritev navzdol (pri levelu 1 je to urejeno drugje, pri levelu 3 ni preferiranja);
    //  sicer, če je lihkar bil 'down', ga ne dodamo v nabor, sicer pa ja, da ga mal boostamo;
    if (randomMode.level === 2 && directions.includes('down')) directions.push('down');

    resolveGameDirectionChoice(directions[Math.trunc(Math.random() * directions.length)]);  // na random izbereš novo smer od preostalih in realiziraš;
}

const insertFormOnTop = () => {

    activeForm = nextForm;
    nextForm = getRandomForm();
    showNextFormInMiniGrid();

    activeForm.notionalPos.row = 0; // podatke o lokaciji je treba ponastavit!!, ker sicer jih podeduje od objekta, katerega referencira in torej dobi neke koordinate z dna igralnega polja
    activeForm.notionalPos.col = insertionColumn; // ker tako next kot active kažeta na objekt, je treba vrednosti ponastaviti zdaj..
    activeForm.activeRotation = 0;  // ..sicer pride do težav, če sta active in next isti lik (pred tem je v showNextFormInMiniGrid() lik dobil drugačne koordinate)
    numberOfFallenForms++;

    //  dogajanje, povezano z randomom (če je aktiven)
    if (randomMode.isActive) {

        //  če je v prejšnjem krogu padla odločitev za sprmemembo smeri sredi padanja, pa tega ni bilo mogoče izvest (prej pritisnil spejd), se to zgodi zdaj;
        if (randomMode.changeObligatory) {
            randomMode.changeObligatory = false;
            executeRandomDirectionChange('on top, forced after midair failure');
            return; // morš returnat, ker če ne brez potrebe izvaja draw spodaj, ker je draw že v resolveGameDir...;
        }

        //  če preveč časa (oz. preveč novih likov) ni prišlo do spremembe smeri, spremeni smer;
        if (randomMode.level === 3 && ((numberOfFallenForms - randomMode.lastChangeAtFallenFormNr) > (randomMode.oneToXOdds * 2))) {
            executeRandomDirectionChange('on top, dirctn change overdue constraint');
            return;
        }

        // če je level 1, prednostni poskus vrnitve na usmerjenost navzdol;
        if (randomMode.level === 1 && gameDirection.direction !== 'down')
            //  pomembno je, da je verjetnost tle enaka siceršnji verjetnosti, ker že itak ima to prednost, da se to izvaja kot prvo;
            //  po drugi strani pa ima tudi prag lahko kar vpliv in morda je treba zaradi viskoega praga znižat verjetnost ...;
            if ((Math.random() * randomMode.oneToXOdds < 1) && (numberOfFallenForms - randomMode.lastChangeAtFallenFormNr >= randomMode.lowerThresholdFormsBtwnChngs)) {
                console.log('vrnjeno na down')
                randomMode.lastChangeAtFallenFormNr = numberOfFallenForms;  // zabeležimo, da je pri tem liku bla zadnja random menjava smeri;
                randomMode.nrOfDirctnChanges++;
                resolveGameDirectionChoice('down');
                return;
            }

        let faktor = randomMode.oneToXOdds;
        if (numberOfFallenForms - randomMode.lastChangeAtFallenFormNr === 1) faktor *= 6;
        else if (numberOfFallenForms - randomMode.lastChangeAtFallenFormNr <= randomMode.lowerThresholdFormsBtwnChngs) faktor *= 3;
        else if (numberOfFallenForms - randomMode.lastChangeAtFallenFormNr <= randomMode.upperThresholdFormsBtwnChngs) faktor *= 2;

        //  GLAVNA REČ pri RANDOMU
        if (Math.random() * faktor < 1) {  // če ja, potem je treba izvest spremembo smeri
            // preverjanje, al naj se sprememba smeri zgodi sredi padanja in ne povsem na vrhu igralnega polja, tj. ob pojavu novega lika;
            if (randomMode.level !== 1 && (Math.random() * randomMode.oneToXOddsOfMidFallChange < 1)) {
                console.log('- - - jup, midfall change naročen');
                randomMode.changeObligatory = true;
                // ok, tle pride pravo delo
            } else {
                executeRandomDirectionChange('on top, regular');    //  nope, sprememba se zgodi takoj ob vnosu novega lika
                return; // morš returnat, ker če ne brez potrebe izvaja draw spodaj, ker je draw že v resolveGameDir...;
            }
        }
    }

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

function colorSelectedMenuChoices(labelNodes, btn) {
    labelNodes.forEach(label => {
        if (label.htmlFor === btn.id) label.style.color = '#2ef82e'; else label.style.color = '#252525';
    });
    if (labelNodes[0].className === 'interval-speed-label') {
        intervalTypeShrinkingHuh = btnsIntervalSpeed[0].checked === true ? true : false;
    }
}

function colorSelectedMenuChoicesAtInit() {
    // tukaj mora barvanje preverit, al je btn === checked; pri listenerju ni tako, tam preverja, ko je nek button kliknjen
    btnsIntervalSpeed.forEach(btn => { if (btn.checked) colorSelectedMenuChoices(labelsIntervalSpeed, btn) });
    // btnsSteeringType.forEach(btn => { if (btn.checked) colorSelectedMenuChoices(labelsSteeringType, btn) });     // legacy, se ne uporablja
}

function toggleOverlay(whichOverlay, basedOnWhat, doWhat) {
    const frame = basedOnWhat.getBoundingClientRect();
    whichOverlay.style.top = `${frame.top}px`;
    whichOverlay.style.left = `${frame.left}px`;
    whichOverlay.style.height = `${doWhat === 'display' ? frame.height : 1}px`;     //  PAZI: vrednost mora biti string!!!
    whichOverlay.style['width'] = `${doWhat === 'display' ? frame.width : 1}px`;       //  opazi dva načina zapisa
}

function assignGameDirectionKeys() {
    if (gameDirection.direction === 'down') {
        keyForMovementLeft = 'ArrowLeft';
        keyForMovementRight = 'ArrowRight';
        keyForFasterMvmtDown = 'ArrowDown';
        keyForRotation = 'ArrowUp';
        return;
    };
    if (gameDirection.direction === 'up') {
        keyForMovementLeft = 'ArrowRight';
        keyForMovementRight = 'ArrowLeft';
        keyForFasterMvmtDown = 'ArrowUp';
        keyForRotation = 'ArrowDown';
        return;
    };
    if (gameDirection.direction === 'left') {
        keyForMovementLeft = 'ArrowUp';
        keyForMovementRight = 'ArrowDown';
        keyForFasterMvmtDown = 'ArrowLeft';
        keyForRotation = 'ArrowRight';
        return;
    };
    if (gameDirection.direction === 'right') {
        keyForMovementLeft = 'ArrowDown';
        keyForMovementRight = 'ArrowUp';
        keyForFasterMvmtDown = 'ArrowRight';
        keyForRotation = 'ArrowLeft';
        return;
    };
}

function canExplodeHuh() {
    //  preverjanje, ali obstaja vrstica, ki je zapolnjena s kockami; ista globalna spremenljivka se uporabi pri eksploziji!
    kateriJeVesTrue = board.findIndex(arr => arr.every(el => el !== false) === true);
    if (kateriJeVesTrue < board.length - 1) return true;
    return false;
}

// za naredit: to bi lahko šlo v html, da ni vedno tega if-a
const refreshExplosionsCountDisplay = () => labelExplosionNumberInfo.innerHTML
    = `${pageLang === 'sl' ? 'Št. dokončanih vrstic: ' : 'Lines cleared: '} ${numberOfExplosions}`;

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
    refreshExplosionsCountDisplay();
    // preveri, ali je morda še kakšna vrstica za razstrelit, sicer znova zaženi gibanje likov;
    if (canExplodeHuh()) explodeRow(); else {
        if (numberConsecutiveXplosions === 1) score += 10;
        else if (numberConsecutiveXplosions === 2) {
            score += 25;
            effectDoubleTrouble();
        }
        else if (numberConsecutiveXplosions === 3) {
            score += 50;
            effectTripple();
        }
        else {
            score += 100;
            effectQuad();
        };
        refreshCurrentScore();
        numberConsecutiveXplosions = 0;
        insertOnTopAndStartInt();
    };
}

function btnsForChangeGameDirectionOperation(btn, evt) {
    // evt sem dal zgoraj noter samo zato, da je videt, da je event v priemru uporabe bind drugi parameter, ne prvi; prvi je podani argument (v tem primeru btn);
    if (!controlsTemporarilyOff && !isGamePaused) {
        let newDirection = btn.value;
        if (newDirection !== gameDirection.direction || randomMode.isActive) {
            // najprej uredit barve gumbov
            btnsKeyForGameDirection.forEach(btn => btn.classList.remove('button-key-selected'));
            btn.classList.add('button-key-selected');
            removeRandom();
            // logika izbire in urejanja nastavitev
            resolveGameDirectionChoice(newDirection);
        }
    }
    btn.blur();
}

function submitSizeBtnOperation() {
    let inputedRows = inputPlayingFieldSize[0].value !== '' ? Number(inputPlayingFieldSize[0].value) : false;
    let inputedColumns = inputPlayingFieldSize[1].value !== '' ? Number(inputPlayingFieldSize[1].value) : false;

    // najprej preverit, ali sta morda oba prazen niz, v takem primeru ne naredi ničesar
    if (inputedRows === false && inputedColumns === false) { // ker gre za striktno primerjavo (===) vrednost 0, ki je sicer falsy, ni false
        return;
    };

    // preverjanje veljavnosti vnesenih vrednosti
    // skupne funkcionalnosti prikaza opozorila za nepravilno vneseno vrednost;
    const message = { en: '', sl: '' };
    function showAlert() {
        overlayDuringAlert.style.height = `${window.innerHeight}px`;
        overlayDuringAlert.style.width = `${window.innerWidth}px`;
        overlayDuringAlert.style.background = `linear-gradient(${Math.trunc(Math.random() * 360)}deg, #e66465, #9198e5)`;
        overlayDuringAlert.style.transition = 'opacity 0.6s';
        overlayDuringAlert.style.opacity = '80%';

        setTimeout(() => {
            alert(message[pageLang]);
            overlayDuringAlert.style.height = `1px`;
            overlayDuringAlert.style.width = `1px`;
            overlayDuringAlert.style.transition = 'opacity'; // ker trajanje transitiona ni definirano, ga ni
            overlayDuringAlert.style.opacity = '0%';
        }, 50);
    };

    // preverit, da ni nobena vnesena vrednost pod 8 in nad maxBlocks; če to spodaj, spremenit še 8x8
    if ((inputedRows !== false && (inputedRows < 8 || inputedRows > canvasSizeData.maxNrBlocksAlongLongerDimension))
        || (inputedColumns !== false && (inputedColumns < 8 || inputedColumns > canvasSizeData.maxNrBlocksAlongLongerDimension))) {
        message.en = `entered values must be numbers between 8 and ${canvasSizeData.maxNrBlocksAlongLongerDimension}`;
        message.sl = `vnesti moraš število med 8 in ${canvasSizeData.maxNrBlocksAlongLongerDimension}`;
        showAlert();
        return;
    }

    // za nadaljevanje preverjanja je nujno, da če kšne vrednosti nismo vnesli na novo, jo je treba pograbit iz stanja;
    if (!inputedRows) inputedRows = lastRow0based + 1;
    if (!inputedColumns) inputedColumns = lastColumn0Based + 1;

    // preverit, da je v novem paru vrednosti vsaj ena manjša ali enaka manjši dimenziji;
    if (inputedRows > canvasSizeData.maxNrBlocksAlongShorterDim && inputedColumns > canvasSizeData.maxNrBlocksAlongShorterDim) {
        message.en = `at least one of two dimensions must be less or equal to ${canvasSizeData.maxNrBlocksAlongShorterDim}`;
        message.sl = `vsaj ena od dimenzij mora biti manjša ali enaka ${canvasSizeData.maxNrBlocksAlongShorterDim}`;
        showAlert();
        return;
    }

    // na tem mestu je konec preverjanj veljavnosti vnesenih vrednosti;

    if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden'); // če je bil gameOver, da skrije label od game.over

    //  izračun, koliko bi znašala širina in višina canvasa pri želenih novih dimenzijah

    //  POMEMBNO: kanvas je kvadrat, ima enaki stranici; zato spodaj privzameta večjo od obeh, da se lahko noer spravi katra koli orientacija igralnega polja;

    // premislek na temo; spodaj je izračun privzetih mer igr. polja, ki je neto kvadrat 700*700px (z robom je bruto 702*702px)
    // po navpični osi:
    // zgornji buffer	30px	
    // igralna površina	642px	=16*blockSize+2    (2 je border)
    // spodnji buffer	28px
    // navpično: 30+642+28=700 px

    // po vodoravni osi:
    // levi buffer	    30	
    // igralna površina	402	=10*blockSize+2 (2 je border)
    // srednji buffer	35	
    // mini grid	    203	    (201 je širina, 2 je border)
    // desni buffer	    30	
    // vodoravno:       30+402+35+203+30

    //  preverit, al je število stolpcev večje od števila vrstic;..
    //  če tako, potem mora bit mini grid nad vertikalno (široko postavitvijo) in sledi drugačen izračun širine canvasa
    let neededCanvasHeight = inputedRows >= inputedColumns ? 30 + (inputedRows * blockSize + 2) + 28 : 30 + 203 + 35 + (inputedRows * blockSize + 2) + 30;
    let neededCanvasWidth = inputedRows >= inputedColumns ? 30 + (inputedColumns * blockSize + 2) + 35 + 203 + 30 : 30 + (inputedColumns * blockSize + 2) + 28;

    console.log(neededCanvasHeight, neededCanvasWidth);
    canvas.height = neededCanvasHeight >= neededCanvasWidth ? neededCanvasHeight : neededCanvasWidth;
    canvas.width = canvas.height;   // s tem je tudi že samodejno narisan canvas z novimi dimenzijami, sicer samo obroba in srednje sivo ozadje;

    //  preverjanje, al je morda treba zamaknit prikaz točk, high scores ... zaradi širine igralnega polja
    if (canvas.width !== canvasSizeData.canvasWidthWas) {
        divDesni.style.left = `${330 + canvas.width + 3}px`; // zakaj +3? 2 je za levi in desni border od canvasa, 1 pa da se ne prekriva z borderjem
        divDesni.style.height = `${canvas.height + 2}px`;

        //  od zdaj dalje nova, posodobljena vrednost canvasWidthWas
        canvasSizeData.canvasWidthWas = canvas.width;
    }

    // sledijo izračuni koordinat in velikosti za matriko 2x3: inputedRows vs inputedColumns (2 vrednosti) X canvasHeight vs Width (3 vrednosti)
    // naslednje vrednosti so enake za vseh 6 elementov matrike:
    mainGridLayoutsCoords.vertical.x = 30;
    mainGridLayoutsCoords.horizontal.x = 30;
    mainGridLayoutsCoords.vertical.l = inputedColumns * blockSize + 2;
    mainGridLayoutsCoords.vertical.h = inputedRows * blockSize + 2;
    mainGridLayoutsCoords.horizontal.l = inputedRows * blockSize + 2;
    mainGridLayoutsCoords.horizontal.h = inputedColumns * blockSize + 2;

    // zdaj pa še določitev elemetov, katerih vrednost je odvisna od položaja v matriki
    if (inputedRows >= inputedColumns) {
        // miniGrid.x je enak za vse 3 spodnje možnosti; .y pa za 2, ampak ga vseeno dam sem skupaj, za 3. pa popravim spodaj
        miniGridCoords.x = 30 + (inputedColumns * blockSize + 2) + 35; // levi bufer + igralno polje + vmesni buffer
        miniGridCoords.y = 30;

        if (neededCanvasHeight === neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 30;
            mainGridLayoutsCoords.horizontal.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je stolpcev 6 manj kot vrstic
        }

        if (neededCanvasHeight < neededCanvasWidth) {
            // vertical y pomakni za razliko med njima dol
            mainGridLayoutsCoords.vertical.y = 30 + (neededCanvasWidth - neededCanvasHeight);
            // horizontal y = vertical y + (h-l) 
            mainGridLayoutsCoords.horizontal.y = mainGridLayoutsCoords.vertical.y + (mainGridLayoutsCoords.vertical.h - mainGridLayoutsCoords.vertical.l);
        }

        if (neededCanvasHeight > neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 30;
            // horizontal y = vertical y + (h-l)
            mainGridLayoutsCoords.horizontal.y = mainGridLayoutsCoords.vertical.y + (mainGridLayoutsCoords.vertical.h - mainGridLayoutsCoords.vertical.l);

            // vertical y od miniGrida pomakni za razliko med njima dol
            miniGridCoords.y = 30 + (neededCanvasHeight - neededCanvasWidth);
        }
    }

    if (inputedRows < inputedColumns) {
        // miniGrid.x je enak za vse 3 spodnje možnosti; .y pa za 2, ampak ga vseeno dam sem skupaj, za 3. pa popravim spodaj
        miniGridCoords.x = 30 + (inputedRows * blockSize + 2) + 35; // levi bufer + igralno polje + vmesni buffer
        miniGridCoords.y = 30;

        if (neededCanvasHeight === neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je vrstic 6 manj kot stolpcev;
            mainGridLayoutsCoords.horizontal.y = 30;
        }

        if (neededCanvasHeight > neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je vrstic 6 manj kot stolpcev;
            mainGridLayoutsCoords.horizontal.y = 30 + (neededCanvasHeight - neededCanvasWidth);
        }

        if (neededCanvasHeight < neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 270 + (neededCanvasWidth - neededCanvasHeight);
            mainGridLayoutsCoords.horizontal.y = 30;

            // vertical y od miniGrida pomakni za razliko med njima dol
            miniGridCoords.y = 30 + (neededCanvasWidth - neededCanvasHeight);
        }
    }

    if (inputPlayingFieldSize[0].value !== '') {
        inputPlayingFieldSize[0].placeholder = inputPlayingFieldSize[0].value;
        lastRow0based = inputPlayingFieldSize[0].placeholder - 1;
        mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];    // to bo treba uredit drugje, da bo upoštevalo tudi orientacijo
    };

    if (inputPlayingFieldSize[1].value !== '') {
        inputPlayingFieldSize[1].placeholder = inputPlayingFieldSize[1].value;
        lastColumn0Based = inputPlayingFieldSize[1].placeholder - 1;
        insertionColumn = inputedColumns % 2 === 0 ? (inputedColumns / 2) - 1 : (inputedColumns - 1) / 2;
        mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];    // to bo treba uredit drugje, da bo upoštevalo tudi orientacijo

    };

    standBy();                 //  to tudi nariše minigrid
    resolveEmptyMainGridAndBckgndGrid();
    drawDirectionArrow();
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
    //  od tu dalje je drawBackgroundGrid, to je edino mesto, kjer se riše mreža ozadja (mesh)
    if (divBckgndGrid.classList.contains('background-grid-btn-selected')) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#5a5a5a';    //  lineColor, ampak ta mal preveč seka

        const originX = mainGridCoords.x + 1;
        const originY = mainGridCoords.y + 1;

        for (let i = 1; i <= (gameDirection.layout === 'vertical' ? lastRow0based : lastColumn0Based); i++) {
            ctx.beginPath();
            const [x, y] = popravekOstrine(originX, originY + i * blockSize);
            ctx.moveTo(x, y);
            ctx.lineTo(x + mainGridCoords.l - 2, y);
            ctx.stroke();
        }

        for (let i = 1; i <= (gameDirection.layout === 'vertical' ? lastColumn0Based : lastRow0based); i++) {
            ctx.beginPath();
            const [x, y] = popravekOstrine(originX + i * blockSize, originY);
            ctx.moveTo(x, y);
            ctx.lineTo(x, y + mainGridCoords.h - 2);
            ctx.stroke();
        }
    };
}

function bckgndGridBtnAction() {
    if (divBckgndGrid.classList.contains('background-grid-btn-unselected')) {
        divBckgndGrid.classList.remove('background-grid-btn-unselected');
        divBckgndGrid.classList.add('background-grid-btn-selected');
    } else {
        divBckgndGrid.classList.remove('background-grid-btn-selected');
        divBckgndGrid.classList.add('background-grid-btn-unselected');
    };
    if (!isAGameRunning) {
        if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden'); // če je bil gameOver, da skrije label od game.over
        resolveEmptyMainGridAndBckgndGrid();
        drawDirectionArrow();
    } else {
        redrawEntireCurrentBoard();
        drawForm();
    };
};

function greenModeBtnAction() {
    if (divGreenMode.classList.contains('green-mode-btn-unselected')) {
        divGreenMode.classList.remove('green-mode-btn-unselected');
        divGreenMode.classList.add('green-mode-btn-selected');
        isGreenMode = true;
    } else {
        divGreenMode.classList.remove('green-mode-btn-selected');
        divGreenMode.classList.add('green-mode-btn-unselected');
        isGreenMode = false;
    }
    if (isAGameRunning) {
        redrawEntireCurrentBoard();
        drawForm();
    }
};

function toRandom() {
    randomMode.isActive = true;
    btnKeyRandomDirection.classList.add('button-random-selected');  //  gumb za random je treba označit
    toggleOverlay(overlayRandomnessDiv, divRandomness, 'hide');     //  pa prikazat možnosti za randomness
    btnsKeyForGameDirection.forEach(btn => btn.classList.remove('button-key-selected'));  // 4 smerne gumbe odznačit
}

function removeRandom() {
    randomMode.isActive = false;
    randomMode.changeObligatory = false;  //  za vsak slučaj je treba umaknit, če skineš random ravno zatem, ko se je sprožil change obligatory, ki čaka na naslednji lik;
    btnKeyRandomDirection.classList.remove('button-random-selected');   //  gumb za random je treba odznačit
    toggleOverlay(overlayRandomnessDiv, divRandomness, 'display');      //  pa skrit podopcije od random
}

function initializeScreenAndSizes() {
    // okoli 150 vrstic!
    divDesni.style.height = `${canvas.height + 2}px`;
    //  postopno zmanjševanje (po potrebi) grafičnega odtisa, oz. XxY velikosti aplikacije, da se ne pojavi HOZ/VERT scroll bar;
    //  to mora biti pred postavljanjem overlayev spodaj, ker sicer se ti lahko zamaknejo..
    //  ..(oz. točneje oni že ostanejo na mestu, samo vsebina pod njimi se zamakne, dvigne, ker se zmanjšajo presledki med odstavki)
    if (window.innerWidth < 1400 || window.innerHeight < 766) {
        // zmanjšat najprej polovične odstavke, potem pa še ta velike zmanjšat na polovico
        let bigParagraphs = document.querySelectorAll('.paragraph-end-half');
        bigParagraphs.forEach(item => {
            item.classList.remove('paragraph-end-half');
            item.classList.add('paragraph-end-quarter');
        });
        bigParagraphs = document.querySelectorAll('.paragraph-end');
        bigParagraphs.forEach(item => {
            item.classList.remove('paragraph-end');
            item.classList.add('paragraph-end-half');
        });
    }

    if (window.innerWidth < 1370) {
        smallSizeHighScoresTable();
        frameMessages.style.margin = '0 0 0 0';
        labelHighScoresInitials.style.left = '10px';
        labelHighScoresInitials.style.top = '180px';
        labelHighScoresInitials.style.width = '290px';
        inputInitials.style.width = '250px';
    }

    if (window.innerHeight < 695) {
        // zmanjšat zamike odstavkov    //  za naredit: refaktorizirat tole reč, ker se ponovi nekje gor
        let collect = document.querySelectorAll('.paragraph-end-half');
        collect.forEach(item => {
            item.classList.remove('paragraph-end-half');
            item.classList.add('paragraph-end-quarter');
        });
    }

    // tu gremo na blockSize= 32
    if (window.innerHeight < 685 || window.innerWidth < 1343) {     // eksperimentalno pridobjeni podatki
        blockSize = 32;
        canvasSizeData.canvasBase = 620;
        // canvasSizeData.canvasWidthWas = 620;   tega še ne smeš dat, ker sicer ne pride do popravka zamika desnih elementov;

        // zmanjšat fonte
        // odstavkov
        let [...collect] = document.getElementsByTagName('p');
        collect.forEach(element => element.style.fontSize = '12px')
        // in tabele z navodili
        collect = document.querySelectorAll('#navodila td')
        collect.forEach(element => element.style.fontSize = '12px')
    }

    if (window.innerWidth < 1221 || (window.innerHeight < 559 && window.innerWidth < 1239)) {
        divMessagesContainer.classList.add('hidden');
        divHighScoresAll.classList.add('hidden');
        divScore.style.fontSize = 'medium';
        divScore.style.marginLeft = '15px';
        // del tega se dogaja tudi v resolveHighScores() in posledično tudi v startni funkciji;
    }

    //  zdaj pa bistveni del iskanja dimenzij igralnega polja
    // premisleki iskanja največje možne dimenzije
    // ----  po NAVPIČNI dimenziji
    // višina strani	window.innerHeight	937px
    // rob canvasa (2x)		                2px
    // buffer (2 x 30px)                    60px
    // rob igralnega polja (2x)		        2px
    // ostane za črno (neto igralno polje):	IZRpx = 937-2-60-2
    // možno število kock                   Math.floor(IZRpx/blockSize)

    // ----  po VODORAVNI dimenziji
    // širina strani	window.innerWidth	1920px
    // širina levih menijev                 330px
    // širina desnih polj                   380px
    // rob canvasa (2x)		                2px
    // buffer (2 x 30px)                    60px
    // rob igralnega polja (2x)		        2px
    // ostane za črno (neto igralno polje):	IZRpx = 1920-330-380-2-60-2 = 1920-764 
    // možno število kock                   Math.floor(IZRpx/blockSize)
    // največje možno število kock je ta manjša vrednost od gornjih 2

    // poleg največjega možnega števila kock imaš še ta drugo, manjšo vrednost;
    // ta znaša največ: največje možno število - 6 (kolikor zahteva obstoj mini grida; tudi izvirne vrednosti so 16:10)

    const verticalOffSet = canvasSizeData.canvasBase === 700 ? 70 : 86;
    //  če na desni strani ni elementov (mesages in high-scores), ni terba rezervirat toliko placa zanje, hence 740 vs 510;
    const horizontalOffSet = (window.innerWidth < 1221 || (window.innerHeight < 559 && window.innerWidth < 1239)) ? 540 : 740;
    console.log(verticalOffSet, horizontalOffSet)

    //  ti dve spremenljivki gledata fizično, koliko bi šlo kock po vsaki od osi;
    let verticalMaxNrBlocksForPlayField = Math.floor((window.innerHeight - verticalOffSet) / blockSize);    // prava vrednost 64
    let horizontalMaxNrBlocksForPlayField = Math.floor((window.innerWidth - horizontalOffSet) / blockSize);  // prava vrednost 740 (prava prava 764)
    if (blockSize === 32) { verticalMaxNrBlocksForPlayField--; horizontalMaxNrBlocksForPlayField-- };   // ker je minigrid prevelik, a to ni upoštevano pri izračunu eno vrstico više;
    //  ti dve spremenljivki pa sta, koliko bo dejansko v igri omjitev, s tem da max tukaj je enaka manjši od ta zgornjih dveh, da si ziher, da bo vedno zadosti placa, ne glede na to, kako bi obrnil polje; 
    canvasSizeData.maxNrBlocksAlongLongerDimension = verticalMaxNrBlocksForPlayField < horizontalMaxNrBlocksForPlayField ? verticalMaxNrBlocksForPlayField : horizontalMaxNrBlocksForPlayField;
    if (canvasSizeData.maxNrBlocksAlongLongerDimension < 8) canvasSizeData.maxNrBlocksAlongLongerDimension = 8;
    canvasSizeData.maxNrBlocksAlongShorterDim = canvasSizeData.maxNrBlocksAlongLongerDimension - 6;
    if (canvasSizeData.maxNrBlocksAlongShorterDim < 8) canvasSizeData.maxNrBlocksAlongShorterDim = 8;

    labelSizeInfo.innerHTML = `${pageLang === 'en' ? 'Max:' : 'Največ:'} ${canvasSizeData.maxNrBlocksAlongLongerDimension} x ${canvasSizeData.maxNrBlocksAlongShorterDim} ${pageLang === 'en' ? 'or' : 'ali'} ${canvasSizeData.maxNrBlocksAlongShorterDim} x ${canvasSizeData.maxNrBlocksAlongLongerDimension}, &nbsp;&nbsp;min: 8x8`;
    inputPlayingFieldSize[0].max = canvasSizeData.maxNrBlocksAlongLongerDimension;  // da se prilagodi omejitev vnosa v vnosno polje (če uporabljaš une puščice v vnosnem polju);
    inputPlayingFieldSize[1].max = canvasSizeData.maxNrBlocksAlongLongerDimension;  // pač damo obe polji na isto maximalno vrednost, ker ne vemo, v katerega bomo vnesli večjo dimenzijo;

    //  ker je začetna postavitev samodejno navpična in ker je šteilo rst večje od števila stolpcev, privzamemo spodnjo metodo
    if (canvasSizeData.maxNrBlocksAlongLongerDimension < 16) {
        lastRow0based = canvasSizeData.maxNrBlocksAlongLongerDimension - 1;
        lastColumn0Based = canvasSizeData.maxNrBlocksAlongShorterDim - 1;
        inputPlayingFieldSize[0].placeholder = lastRow0based + 1;
        inputPlayingFieldSize[1].placeholder = lastColumn0Based + 1;
    }
    console.log(window.innerHeight, window.innerWidth);
    console.log(verticalMaxNrBlocksForPlayField, horizontalMaxNrBlocksForPlayField);
    console.log(canvasSizeData.maxNrBlocksAlongLongerDimension);

    let neededCanvasHeight = 30 + ((lastRow0based + 1) * blockSize + 2) + 28;
    let neededCanvasWidth = 30 + ((lastColumn0Based + 1) * blockSize + 2) + 35 + 203 + 30;

    console.log(neededCanvasHeight, neededCanvasWidth);
    canvas.height = neededCanvasHeight >= neededCanvasWidth ? neededCanvasHeight : neededCanvasWidth;
    canvas.width = canvas.height;

    // če je canvas manjši kot 620 je treba skrit navodila, sicer štrlijo spodaj 
    if (canvas.width < 620) document.getElementById('navodila').classList.add('hidden');

    //  šele na tem mestu, ko je končano spreminjanje postavitve, videza, dimenzij, ... se postavi overlaye;
    //      če je največja razpoložljiva dimenzija manjša od 14x8, potem ni mogoče spreminjati velikosti
    if (canvasSizeData.maxNrBlocksAlongLongerDimension < 14) toggleOverlay(overlayGameSizeDiv, divSizeForm, 'display');
    //      da prestavi overlay na pravo mesto, ker se je vsebina pod njim zamaknila (če so se paragrafi krajšali, ...);
    if (!randomMode.isActive) toggleOverlay(overlayRandomnessDiv, divRandomness, 'display');

    // za naredit:  to je podvojeno, treba refaktorizirat
    //  preverjanje, al je morda treba zamaknit prikaz točk, high scores ... zaradi širine igralnega polja
    if (canvas.width !== canvasSizeData.canvasWidthWas) {
        divDesni.style.left = `${330 + canvas.width + 3}px`; // zakaj +3? 2 je za levi in desni border od canvasa, 1 pa da se ne prekriva z borderjem
        divDesni.style.height = `${canvas.height + 2}px`;

        //  od zdaj dalje nova, posodobljena vrednost canvasWidthWas
        canvasSizeData.canvasWidthWas = canvas.width;
    }

    // sledijo izračuni koordinat in velikosti za matriko 2x3: inputedRows vs inputedColumns (2 vrednosti) X canvasHeight vs Width (3 vrednosti)
    // naslednje vrednosti so enake za vseh 6 elementov matrike:
    mainGridLayoutsCoords.vertical.x = 30;
    mainGridLayoutsCoords.horizontal.x = 30;
    mainGridLayoutsCoords.vertical.l = (lastColumn0Based + 1) * blockSize + 2;
    mainGridLayoutsCoords.vertical.h = (lastRow0based + 1) * blockSize + 2;
    mainGridLayoutsCoords.horizontal.l = (lastRow0based + 1) * blockSize + 2;
    mainGridLayoutsCoords.horizontal.h = (lastColumn0Based + 1) * blockSize + 2;

    miniGridCoords.x = 30 + ((lastColumn0Based + 1) * blockSize + 2) + 35; // levi bufer + igralno polje + vmesni buffer
    miniGridCoords.y = 30;  //  (ta vrednost se v zadnjem od spodnjih primerov popravi);

    if (neededCanvasHeight === neededCanvasWidth) {
        mainGridLayoutsCoords.vertical.y = 30;
        mainGridLayoutsCoords.horizontal.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je stolpcev 6 manj kot vrstic
    }

    if (neededCanvasHeight < neededCanvasWidth) {
        // vertical y pomakni za razliko med njima dol
        mainGridLayoutsCoords.vertical.y = 30 + (neededCanvasWidth - neededCanvasHeight);
        // horizontal y = vertical y + (h-l) 
        mainGridLayoutsCoords.horizontal.y = mainGridLayoutsCoords.vertical.y + (mainGridLayoutsCoords.vertical.h - mainGridLayoutsCoords.vertical.l);
    }

    if (neededCanvasHeight > neededCanvasWidth) {
        mainGridLayoutsCoords.vertical.y = 30;
        // horizontal y = vertical y + (h-l)
        mainGridLayoutsCoords.horizontal.y = mainGridLayoutsCoords.vertical.y + (mainGridLayoutsCoords.vertical.h - mainGridLayoutsCoords.vertical.l);

        // vertical y od miniGrida pomakni za razliko med njima dol
        miniGridCoords.y = 30 + (neededCanvasHeight - neededCanvasWidth);
    }

    insertionColumn = (lastColumn0Based + 1) % 2 === 0 ? ((lastColumn0Based + 1) / 2) - 1 : ((lastColumn0Based + 1) - 1) / 2;
    mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];
    resolveEmptyMainGridAndBckgndGrid();
    drawDirectionArrow();
}

//      --------------      Izvajanje točk

function refreshCurrentScore() {
    labelScore.innerHTML = `${score}`
    //	trivia (ali ne): intervalID (zaporedna številka intervala), ko gre igra skozi eksplozijo, se poveča za 7, ker setTimer in SetInterval imajo skupno štetje,
    //  ..zato interval ni primeren za vodenje točk; hm, ali bi pač morda kar interval bile točke ...
}

function smallSizeHighScoresTable() {
    let collect = document.querySelectorAll('#high-scores-table td');
    collect.forEach(element => element.style.fontSize = '11px');

    divHighScores.style.width = '95%';
    divHighScores.style.height = '-moz-fit-content';
    divHighScores.style.height = 'fit-content';
    divHighScores.style.margin = '15px 0 0 10px';
    btnResetHighScores.style.margin = '10px 0 0 10px';
};

function displayHighScores() {
    labelHighScoresTable.innerHTML = '';    // najprej počistit vsebino okvirčka z najboljšimi rezultati
    let innerText = '';
    if (highScores.length === 0) {          // če ni shranjenih rezultatov, to napiši
        if (pageLang === 'en') innerText = `
        <tr>
            <td>No high scores yet. Play some!</td>
        </tr>`; else innerText = `
        <tr>
            <td>Dejmo kej igrat!<br>Tle bi morala bit tabela z dosežki!</td>
        </tr>`;
        labelHighScoresTable.insertAdjacentHTML('beforeend', innerText);
        return;
    } else {                                //  header
        if (pageLang === 'en')
            labelHighScoresTable.insertAdjacentHTML('beforeend', `
            <tr>
                <td colspan="6">&nbsp;&nbsp;ALL-TIME HIGH SCORES !</td>
            </tr>
            <tr>
                <td>Rank</td>
                <td>Score</td>
                <td>Name</td>
                <td>Date</td>
                <td>Grid</td>
                <td>Interval</td>
            </tr>`);
        else labelHighScoresTable.insertAdjacentHTML('beforeend', `
        <tr>
            <td colspan="6">&nbsp;&nbsp;NAJVEČJE LEGENDE VSEH ČASOV!</td>
        </tr>
        <tr>
            <td>X&nbsp;</td>
            <td>točk</td>
            <td>ime</td>
            <td>datum</td>
            <td>igr.polje</td>
            <td>interval</td>
        </tr>`);
        highScores.forEach((el, i) => {         //  podatki rezultatov
            let intervalText = el.interval;
            if (pageLang === 'sl' && el.interval !== undefined)
                if (el.interval === 'shrinking') intervalText = 'vse krajši'; else intervalText = 'konstanten';
            innerText = `
            <tr>
                <td>${i + 1} </td>
                <td>${el.score} </td>
                <td>${el.name} </td>
                <td style='font-size:13px'>${el.date}</td>
                <td style='font-size:13px'>${el.grid}</td>
                <td style='font-size:12px'>${intervalText}</td>
            </tr>`
            labelHighScoresTable.insertAdjacentHTML('beforeend', innerText);
        });
    };
    if (window.innerWidth < 1370) {
        smallSizeHighScoresTable();
    }
}

function resolveHighScores() {

    function finishHighScoresProcess() {
        inputInitials.value = '';
        inputInitials.blur();
        labelHighScoresInitials.classList.add('hidden');
        formInitials.removeEventListener('submit', initialsFormSubmitted);
        document.removeEventListener('keyup', initialsFormEscaped);
        if (window.innerWidth < 1221 || (window.innerHeight < 559 && window.innerWidth < 1239)) divHighScoresAll.classList.remove('hidden');
        displayHighScores();

        //  shranit v local storage
        localStorage.setItem('highScores', JSON.stringify(highScores));

        standBy();
        controlsTemporarilyOff = false;
    }

    function initialsFormSubmitted(e) {
        e.preventDefault();     // to mora bit; ne vpliva samo na morebiten cosnole.log, ampak preprosto reštarta igro (točneje, osveži stran)
        highScores[whichIndex].name = inputInitials.value;
        finishHighScoresProcess();
    }

    function initialsFormEscaped(e) {
        if (e.key === 'Escape') {
            highScores[whichIndex].name = 'nessuno';
            finishHighScoresProcess();
        }
    }

    const datum = new Date();
    const zapisDatuma = `${datum.getDate()}-${datum.getMonth() + 1}-${String(datum.getFullYear()).slice(2)}`;
    const intervalKončaneIgre = intervalTypeShrinkingHuh === true ? 'shrinking' : 'constant';
    const currentGridSize = `${lastRow0based + 1}x${lastColumn0Based + 1}`;
    const entry = { date: zapisDatuma, score: score, interval: intervalKončaneIgre, grid: currentGridSize };
    let whichIndex;

    if (highScores.length > 0) {    // če že obstaja seznam rezultatov, delaj spodnje

        //  od katerega elementa seznama je večji trenutni score
        whichIndex = highScores.findIndex(el => score > el.score);

        //  logika
        if (whichIndex < 0) {   // če trenutni score ni večji od nobenega rezultata na seznamu
            if (highScores.length === 8) {
                standBy();
                controlsTemporarilyOff = false;
                return
            }    //  če je tabela z rezultati že polna, pač nisi prišel nanjo;
            else {
                highScores.push(entry);
                whichIndex = highScores.length - 1;     // to je treba naredit, sicer whichIndex kaže -1, kar povzroči napako v nadaljevanju
            }
        } else highScores.splice(whichIndex, 0, entry);   // če je trenutni score večji od katerega s seznama, ga vstavi (dodaj) na isto mesto
        // da ne postane predolgo; ! ! !  PAZI  ! ! !: če spreminjaš, moraš tudi par vrstic više (številko 5 ali 10 ali kar že)
        if (highScores.length > 8) highScores.splice(8, 1);
    } else {    // sicer začni polnit trenutno prazen (torej nov) seznam rezultatov    
        whichIndex = 0;
        highScores[whichIndex] = entry;
    };

    // pokaže vnosno okno za inicialke (razen če pač nisi prišel na top listo) in zatem v callbacku še vse ostalo
    labelHighScoresInitials.classList.remove('hidden');
    inputInitials.focus();
    formInitials.addEventListener('submit', initialsFormSubmitted);
    document.addEventListener('keyup', initialsFormEscaped);    // zelo pomembno: tale je na keyup, ker je en drugi event listener tudi vezan ..
    //.. na pritisk tipke exc ( document.addEventListener('keydown', btnResetHighScoresEscaped) ), ampak ta tukaj mora imet prednost; če bi bila obadva na keydown, bi se zgodila oba, tako pa tisti, ki čaka,..
    //.. da se najprej konča ta, na keydown še ni izpolnjen, ker se ta izpolni šele na keyup
    //.. za naredit: lahko pa bi seveda tudi zamenjal logiko (da esc najprej zapre oni drugi meni, šele nato tega)
}

function loadHighScores() {     // naloži iz localStorage
    highScores = JSON.parse(localStorage.getItem('highScores'));
    if (highScores === null) {
        highScores = new Array();
    }
    displayHighScores();    // kliče displayHighScores tudi če niso bili uspešno naloadani, ker je v display... varovalka za tak primer
}

function btnResetHighScoresOperation() {

    function btnResetHighScoresEscaped(e) {
        if (e.key === 'Escape' && labelHighScoresInitials.classList.contains('hidden')) {
            btnResetHighScores.blur();
            frameResetHighScores.classList.add('hidden');
            document.removeEventListener('keydown', btnResetHighScoresEscaped);
        }
    }

    document.addEventListener('keydown', btnResetHighScoresEscaped);

    if (isAGameRunning === false) {
        frameResetHighScores.classList.remove('hidden');
        btnConfirmResetHscores.addEventListener('click', function () {
            frameResetHighScores.classList.add('hidden');
            localStorage.removeItem('highScores');
            loadHighScores();
            displayHighScores();
        })
        btnCancelResetHscores.addEventListener('click', function () {
            frameResetHighScores.classList.add('hidden');
        })
    } else if (!btnResetHighScoresPressedHuh) {
        btnResetHighScoresPressedHuh = true;
        btnResetHighScores.blur();
        labelNotNow.classList.remove('hidden');
        setTimeout(() => labelNotNow.classList.add('hidden'), 1200);
        if (isGamePaused) {
            labelEyesOnTheGame.innerHTML = (pageLang === 'sl') ?
                '<p>&nbsp;&nbsp;Šele po Game Over&nbsp;&nbsp;</p>' : '<p>&nbsp;&nbsp;Wait till Game Over&nbsp;&nbsp;</p>';
        }
        setTimeout(() => labelEyesOnTheGame.classList.remove('hidden'), 1200);
        setTimeout(() => {
            if (isGamePaused) {  // vrnit nazaj izvirno besedilo za naslednjo rabo, ki morda ne bo med pavzo
                labelEyesOnTheGame.innerHTML = (pageLang === 'sl') ?
                    '<p>&nbsp;&nbsp;Rajši glej igro!&nbsp;&nbsp;</p>' : '<p>&nbsp;&nbsp;Keep your eyes on the game!&nbsp;&nbsp;</p>';
            }
            labelEyesOnTheGame.classList.add('hidden');
            btnResetHighScoresPressedHuh = false;
        }, 2600);
    };
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
    controlsTemporarilyOff = true;    // medtem ko je odprto okno za high scores, tipka enter ne sme imet funkcionalnosti "zaženi igro";
    // določanje položaja okna game.over; širina: 300px, višina: 80 px, zamik od levega roba zaradi levih menijev: 330 px;
    labelGameOver.style.top = `${mainGridCoords.y + mainGridCoords.h * 0.38 - (blockSize - 1)}px`; // *0,38 je kao zlati rez, sicer daj h/2-60 (moralo bi bit -39, ampak -60 je vizualno lepše);
    labelGameOver.style.left = `${330 + mainGridCoords.x + mainGridCoords.l / 2 - 150}px`;   // 330 je zamik od levega roba viewporta, 150 je polovica širina okna GAME.OVER;
    labelGameOver.classList.remove('hidden');
    clearMiniGrid();
    curtainInMiniGridClosing();
    setTimeout(() => resolveHighScores(), 1080);    // če spremeniš trajanje curtainMiniGrid, potem razmisli tudi o trajanju tle;
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

function changeGameLayout(newLayout) {
    eraseMainGrid();
    gameDirection.layout = newLayout;
    mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];
    resolveEmptyMainGridAndBckgndGrid();
}

function resolveGameDirectionChoice(newDirection) {
    if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden'); // če je bil gameOver, da skrije label od game.over
    const newLayout = (newDirection === 'right' || newDirection === 'left') ? 'horizontal' : 'vertical';
    if (newLayout !== gameDirection.layout) changeGameLayout(newLayout);  // if -> zamenjat layout in to tudi prikazat
    if (isAGameRunning) {   // če med igro -> zamenjat smer, na novo narisat board in prilagodit funkcionalnost igralnih tipk
        gameDirection.direction = newDirection;  // tale pripis vednosti bi lahko naredil tudi prej (pred klicem te funkcije), samo bi ga moral dvakrat, zato je tak način morda učinkovitejši
        redrawEntireCurrentBoard();
        drawForm();                 //  zakaj je treba še draw form poleg drawEntireBoard? ker padajoč form ni zabeležen na boardu!! 
        // ..ne moreš pa ga namesto tega (drawform) pred tem (drawEntire) imprintat, ker bi ga potem moral še odprintat (te funkcije pa nimam in tudi ni potrebe)
        assignGameDirectionKeys();
    } else {                                                  // če igra ni aktivna, zabeležimo novo smer igre + ...
        gameDirection.direction = newDirection;
        resolveEmptyMainGridAndBckgndGrid();
        drawDirectionArrow();
    }
}

function atKeyPress(e) {
    if (!controlsTemporarilyOff) {
        if (isAGameRunning && !isGamePaused) {
            if (e.key === keyForMovementLeft) { maneuver('left'); return };
            if (e.key === keyForMovementRight) { maneuver('right'); return };
            if (e.key === keyForFasterMvmtDown) {
                if (canFormMoveDownHuh()) moveForm('down');
                return;
            }
            if (e.key === keyForRotation || e.key === 'Enter') { rotate(); return };
            if (e.key === " " || e.code === 'ControlRight') { actionWhenSpacePressed(); return };
        };

        if (!isAGameRunning) {
            if (e.key === 'Enter') { startGame(); return; }
        };

        if (!isGamePaused) {
            if (e.code === 'KeyQ' || e.code === 'KeyW' || e.code === 'KeyE' || e.code === 'KeyR') {
                let pressed = (e.code).slice(-1);
                let whichOne, newDirection;

                // samo da pogruntaš, kateri btwn je bil pritisnjen
                btnsKeyForGameDirection.forEach((btn, i) => {
                    if (btn.textContent === pressed) {
                        whichOne = i;
                        newDirection = btn.value;
                    };
                });

                if (newDirection !== gameDirection.direction || randomMode.isActive) {     //  delaš karkoli, samo če si priklical smer, ki je drugačna od aktualne
                    //  najprej uredit barve gumbov, kar je neodvisno od same logike igre
                    btnsKeyForGameDirection.forEach((btn, i) => {
                        btn.classList.remove('button-key-selected');                    // vsakemu odvzameš klas
                        if (i === whichOne) btn.classList.add('button-key-selected');   // pravemu dodaš klas
                    });
                    removeRandom();
                    //  zdaj pa še logika in izvedba
                    resolveGameDirectionChoice(newDirection);
                };
                return;  // če nisi pritisnil tipke, ki pomeni drugačno smer kot je aktualna, potem nič, ampak tudi če si opravil menjavo smeri > return!;
            };

            if (e.code === 'KeyT') {
                if (!randomMode.isActive) toRandom(); return;  // če je T že izbran, še en pritisk ne naredi nič; pa tudi sicer > return;
            };
        }

        if (isAGameRunning) {
            if (e.key === 'Escape') {
                if (gameIntervalIsInMotion !== null) { // pri eksploziji gre na null, takrat ne sme biti možno pavzirat, sicer pride lahko do obrata pomena tipke zaradi asinhronosti
                    clearInt();
                    const frame = overlayStartGameBox.getBoundingClientRect();
                    labelPause.style.top = `${frame.top}px`;
                    labelPause.classList.toggle('hidden');
                    isGamePaused = true;
                } else if (isGamePaused) {
                    getBlocksMoving();
                    labelPause.classList.toggle('hidden');
                    isGamePaused = false;
                };
                return;
            }
        };

        if (e.code === 'KeyM') { bckgndGridBtnAction(); return };
        if (e.code === 'KeyG') { greenModeBtnAction(); return };
        if (randomMode.isActive) {
            if (e.code === 'KeyJ' || e.code === 'KeyK' || e.code === 'KeyL') {
                const pressedRandomLevel = (e.code).slice(-1);
                let whichRandomLevelKey, newRandomLevel;

                // samo da pogruntaš, kateri btwn je bil pritisnjen
                btnsRandomnessLevel.forEach((btn, i) => {
                    if (btn.dataset.shortcut === pressedRandomLevel) {
                        whichRandomLevelKey = i;
                        newRandomLevel = +btn.dataset.level;    // +, da se vsili pretvorba v številko, sicer je string
                    };
                });

                if (newRandomLevel !== randomMode.level) {     //  nadaljuješ, samo če si priklical level, ki je drugačen od aktualnega;
                    //  najprej uredit barve gumbov, kar je neodvisno od same logike igre
                    btnsRandomnessLevel.forEach((btn, i) => {
                        btn.classList.remove('selected');                               // vsakemu odvzameš klas
                        if (i === whichRandomLevelKey) btn.classList.add('selected');   // pravemu dodaš klas
                    });
                    //  zdaj pa še logika in izvedba
                    randomMode.level = newRandomLevel;
                    assignRandomnessLevelValues();
                };
            };
        }

    }
}

function decide() {     // tu se odloča, kaj se zgodi, ko poteče zadrževanje kvadratka na določenem nivoju (v določeni vrstici)

    numberOfCycles++;   // to bi moral dodat tudi v rutino ob pritisku spejsa, sicer spejs ne poveča števila ciklov; 
    //  cikli se sicer še vedno ne uporabljajo nikjer, kolikor vem;

    //  logika, al naj se sredi padanja lika zgodi random sprememba smeri
    if (randomMode.changeObligatory && activeForm.notionalPos.row !== 0) {
        let faktor = 2;
        if (randomMode.level === 2) {   //  če je level 3, ohranimo ostrejši faktor, tj. 2;
            if (activeForm.notionalPos.row === 1) faktor = 4;
            if (activeForm.notionalPos.row === 2) faktor = 3;
        }
        if (Math.random() * faktor < 1) {
            // preverjanje, da ne pride do spremembe smeri sredi padca, če si preblizu nepremičninam;
            let canPlace = true;
            const tentativeBlockPos = {};

            //  najprej, ali je prosta pot 2 kvadtaka navzdol od vsakega kvadratka lika
            for (let i = 1; i <= 2; i++) {      // NE POZABIT, DA TRENUTEN LIK NA ZAPISAN NA BOARDU !!!
                activeForm.coordinates[activeForm.activeRotation].forEach(element => {
                    tentativeBlockPos.row = (activeForm.notionalPos.row + i) + element.rDiff;
                    tentativeBlockPos.col = activeForm.notionalPos.col + element.cDiff;
                    if ((tentativeBlockPos.row <= lastRow0based + 1)    // to je zato, da ne vrže false positiva, ko si 2 kvadratka od dna;
                        && board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) { canPlace = false; }
                });
            }

            //  zdaj pa še, ali je prosto en kvdratek levo in desno
            if (canPlace) { // preverjamo samo v primeru, če je canPLace še vedno true;
                for (let i = 1; i >= -1; i = i - 2) {
                    activeForm.coordinates[activeForm.activeRotation].forEach(element => {
                        tentativeBlockPos.row = activeForm.notionalPos.row + element.rDiff;
                        tentativeBlockPos.col = (activeForm.notionalPos.col + i) + element.cDiff;
                        if (tentativeBlockPos.col >= 0 && tentativeBlockPos.col <= lastColumn0Based
                            && board[tentativeBlockPos.row][tentativeBlockPos.col] !== false) { canPlace = false; }
                    });
                }
            }

            if (canPlace) {
                randomMode.changeObligatory = false;
                executeRandomDirectionChange('midair');
            }
        }
    }

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
    if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden');
    if (window.innerWidth < 1221 || (window.innerHeight < 559 && window.innerWidth < 1239)) divHighScoresAll.classList.add('hidden');
    eraseBothMainGridLayouts();
    resolveEmptyMainGridAndBckgndGrid();
    toggleOverlay(overlayStartGameBox, boxStartGame, 'display');
    toggleOverlay(overlayIntervalBox, boxIntervalSpeed, 'display');
    toggleOverlay(overlayGameSizeDiv, divSizeForm, 'display');
    refreshCurrentScore();
    refreshExplosionsCountDisplay();
    curtainInMiniGridOpening();
    setTimeout(() => {
        assignGameDirectionKeys();
        isAGameRunning = true;
        insertOnTopAndStartInt();
    }, 1250)
}

function standBy() {
    toggleOverlay(overlayStartGameBox, boxStartGame, 'hide');
    toggleOverlay(overlayIntervalBox, boxIntervalSpeed, 'hide');
    if (canvasSizeData.maxNrBlocksAlongLongerDimension >= 14) toggleOverlay(overlayGameSizeDiv, divSizeForm, 'hide');
    board = new Array();
    board = Array(lastRow0based + 1).fill().map(() => Array(lastColumn0Based + 1).fill(false));
    board.push(new Array(lastColumn0Based + 1).fill(true));    // da naredi dno pod igralnim poljem
    numberOfCycles = 0;
    numberOfFallenForms = 0;
    score = 0;                  // ga pa ne refrešaš, da ostane prikazano, koliko si imel pri zadnji igri, če si že igral
    numberOfExplosions = 0;     // ga pa ne refrešaš, da ostane prikazano, koliko si imel pri zadnji igri, če si že igral
    numberConsecutiveXplosions = 0;
    randomMode.lastChangeAtFallenFormNr = 0;   // tega je treba ob vsakem initu azzerirat (da gre vsakič sproti ziher na 0)
    randomMode.lastChangeAtCycleNr = 0;
    randomMode.nrOfDirctnChanges = 0;
    randomMode.changeObligatory = false;
    curtainInMiniGridStaticClosed();
    nextForm = getRandomForm();
}

function faint() {
    document.body.style.transition = 'opacity 1s';
    document.body.style.opacity = '30%';
    setTimeout(function () { document.body.style.opacity = '100%'; }, 1000)
}

//  -----------         za testne namene

function testButton2Operation() {
    btnTestButton2.blur();  //  ta ukaz ostane vedno noter, glede na testne potrebe pa lahko dodaš kaj drugega
    faint();
    console.log(window.innerWidth, window.innerHeight);
    // let aa = Math.random() * 4;
    // if (aa > 3) { effectDoubleTrouble(); return }
    // if (aa > 2) { effectTripple(); return } else 
    // effectQuad();
    // console.log(document.firstElementChild.clientWidth, document.firstElementChild.clientHeight)
    labelScore.innerHTML = `${window.innerWidth} ${window.innerHeight}`;
}

//  ---------------     LISTENERJI
document.addEventListener('keydown', atKeyPress);
boxStartGame.addEventListener('mouseup', () => { if (!isAGameRunning && !controlsTemporarilyOff) startGame() }) // mouseup zato, da ne dela to polje, če si prej bil v poljih za določanje velikosti
btnsIntervalSpeed.forEach(btn => btn.addEventListener('click', () => colorSelectedMenuChoices(labelsIntervalSpeed, btn)));
btnsKeyForGameDirection.forEach(btn => btn.addEventListener('click', btnsForChangeGameDirectionOperation.bind(null, btn))); // null zato, ker na tem mestu se pričakuje this, vendar ga ne rabimo v tem primeru;
btnKeyRandomDirection.addEventListener('click', () => {
    if (!controlsTemporarilyOff && !isGamePaused) {
        if (!randomMode.isActive) toRandom();
    };
    btnKeyRandomDirection.blur();
});
btnsRandomnessLevel.forEach(btn => btn.addEventListener('click', () => {
    if (!btn.classList.contains('selected')) {    // naredi nekaj, samo če si kliknil gumb za drugačen level, kot je trentno izbran;
        btnsRandomnessLevel.forEach(btn => btn.classList.remove('selected'));
        btn.classList.add('selected');
        randomMode.level = +btn.dataset.level;
        assignRandomnessLevelValues();
    }
}));
divBckgndGrid.addEventListener('click', () => { if (!controlsTemporarilyOff) bckgndGridBtnAction() });
divGreenMode.addEventListener('click', () => { if (!controlsTemporarilyOff) greenModeBtnAction() });
// btnTestButton2.addEventListener('click', testButton2Operation);  // v live različici listener ne smebiti aktiven
btnResetHighScores.addEventListener('click', btnResetHighScoresOperation);
// spodnje samo zato, da onesposobiš tipko enter, ki bi sicer sprožila igro;
inputPlayingFieldSize.forEach(input => input.addEventListener('click', () => { controlsTemporarilyOff = true; }));
// spodnje je samo zato, da se spet vrne delovanje tipk, ki je bilo odvzeto ko klikneš v katero od polj za določanje velikosti;
document.addEventListener('click', () => {
    if (labelHighScoresInitials.classList.contains('hidden') // če je prikazano polje za vnos začetnic, klik zunaj tega polja ne sme dat controlsTempOff na false, ker če ne štala;
        && !isAGameRunning && document.activeElement !== inputPlayingFieldSize[0] && document.activeElement !== inputPlayingFieldSize[1]) {
        controlsTemporarilyOff = false;
        inputPlayingFieldSize[0].value = '';    // da je spet viden placeholder
        inputPlayingFieldSize[1].value = '';
    };
});
btnSubmitSize.addEventListener('mouseup', submitSizeBtnOperation);    // mouseup, ker se zgodi prej kot click (malo više je click na document)

//  ----------------    IZVAJANJE

loadHighScores();   // najprej loadHighScores, ker če ne inicializacija ekrana ni OK, ker ekran brez higScores še nima končnih dimenzij;
initializeScreenAndSizes();
colorSelectedMenuChoicesAtInit();
drawEmptyMainGrid();
standBy();

// temp
let testSize = document.getElementsByTagName('p');
testSize[1].innerHTML = `Ver.2.0 + testData: širina: ${window.innerWidth}, višina: ${window.innerHeight}`;
// konec temp


//  -------------------------------------------------------------------------------------------------------------------
//  ------------------  EFEKTI

function curtainRenderer(x) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(1 + (x - 70) > 0 ? 1 + (x - 70) + miniGridCoords.x : 1 + miniGridCoords.x, 1 + miniGridCoords.y); // ta dva sicer pogledta ven iz okvirja miniGrid-a
    ctx.lineTo(1 + (x - 70) > 0 ? 1 + (x - 70) + miniGridCoords.x : 1 + miniGridCoords.x, 201 + miniGridCoords.y);
    ctx.lineTo(60 + (x - 70) + miniGridCoords.x, 201 + miniGridCoords.y);
    ctx.lineTo(87 + (x - 70) + miniGridCoords.x, 130 + miniGridCoords.y);
    ctx.lineTo(100 + (x - 70) + miniGridCoords.x, 70 + miniGridCoords.y);
    ctx.lineTo(100 + (x - 70) + miniGridCoords.x, 1 + miniGridCoords.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(200 + (70 - x) < 200 ? 200 + (70 - x) + miniGridCoords.x : 201 + miniGridCoords.x, 1 + miniGridCoords.y);
    ctx.lineTo(200 + (70 - x) < 200 ? 200 + (70 - x) + miniGridCoords.x : 201 + miniGridCoords.x, 201 + miniGridCoords.y);
    ctx.lineTo(140 + (70 - x) + miniGridCoords.x, 201 + miniGridCoords.y);
    ctx.lineTo(113 + (70 - x) + miniGridCoords.x, 130 + miniGridCoords.y);
    ctx.lineTo(100 + (70 - x) + miniGridCoords.x, 70 + miniGridCoords.y);
    ctx.lineTo(100 + (70 - x) + miniGridCoords.x, 1 + miniGridCoords.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function curtainInMiniGridStaticClosed() {
    clearMiniGrid();
    ctx.strokeStyle = 'red';
    ctx.fillStyle = '#571010';
    curtainRenderer(70);
}

function curtainInMiniGridOpening() {
    for (let i = 7; i >= 1; i--) {
        setTimeout(() => {
            clearMiniGrid();
            showNextFormInMiniGrid();
            ctx.strokeStyle = 'red';
            ctx.fillStyle = '#571010';
            curtainRenderer(10 * i);
        }, 120 * (8 - i))
    };
}

function curtainInMiniGridClosing() {      //  za naredit: dodat par rdečih navpičnih črt na zavese
    ctx.strokeStyle = 'red';
    ctx.fillStyle = '#571010';

    for (let i = 1; i <= 7; i++) {
        setTimeout(() => curtainRenderer(10 * i), 120 * i)
    };

    // ta premaknjen gib zavese pri koncu zapiranja zavese (ki seže onkraj ravnotežnega položaja)
    setTimeout(() => {
        ctx.beginPath();
        ctx.moveTo(1 + miniGridCoords.x, 1 + miniGridCoords.y);
        ctx.lineTo(1 + miniGridCoords.x, 201 + miniGridCoords.y);
        ctx.lineTo(75 + miniGridCoords.x, 201 + miniGridCoords.y);   // x+15
        ctx.lineTo(94 + miniGridCoords.x, 130 + miniGridCoords.y);   // x+7
        ctx.lineTo(100 + miniGridCoords.x, 70 + miniGridCoords.y);
        ctx.lineTo(100 + miniGridCoords.x, 1 + miniGridCoords.y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(200 + miniGridCoords.x, 1 + miniGridCoords.y);
        ctx.lineTo(200 + miniGridCoords.x, 201 + miniGridCoords.y);
        ctx.lineTo(125 + miniGridCoords.x, 201 + miniGridCoords.y);
        ctx.lineTo(106 + miniGridCoords.x, 130 + miniGridCoords.y);
        ctx.lineTo(100 + miniGridCoords.x, 70 + miniGridCoords.y);
        ctx.lineTo(100 + miniGridCoords.x, 1 + miniGridCoords.y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }, 960);

    setTimeout(curtainInMiniGridStaticClosed, 1200);
}

async function effectDoubleTrouble() {

    function doAnimation(background, color1, color2, delay) {
        setTimeout(() => {
            frameMessages.style.background = background;
            //                                     tale box-sizing spodaj je ena major zadeva
            frameMessages.innerHTML = `
            <div style="background:grey;height:100%;box-sizing: border-box">
            <p style="color:${color1}"><br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DOUBLE</p>
            <p style="color:${color2}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TROUBLE</p><br> 
            </div>
            `}, delay)
    }

    frameMessages.classList.remove('hidden');
    doAnimation('yellow', 'grey', 'grey', 0);
    doAnimation('#ebeb27', 'white', 'grey', 100);   // bilo: #d8d834
    doAnimation('#d3b946', '#c9c8c8', 'grey', 350); // bilo: #b9b967
    doAnimation('#b89561', '#b3b1b1', 'white', 600);
    doAnimation('grey', 'grey', '#c9c8c8', 900);
    doAnimation('grey', 'grey', 'grey', 1200);
    setTimeout(() => frameMessages.classList.add('hidden'), 1300);
}

async function effectTripple() {
    frameMessages.style.paddingLeft = '60px';
    frameMessages.style.width = '250px';            // ti dve vrstici sta zato, da se uni možičk pomakne bolj desno
    frameMessages.classList.remove('hidden');

    frameMessages.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II]&nbsp;&nbsp;&nbsp;I^^<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;IIIIIII&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;&nbsp;&nbsp;</p>    
        `;

    setTimeout(() => {
        frameMessages.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II]&nbsp;&nbsp;&nbsp;&nbsp;I^^<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;IIIIIII&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;__&nbsp;&nbsp;</p>
        `
    }, 200);

    setTimeout(() => {
        frameMessages.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II]&nbsp;&nbsp;&nbsp;I^^<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;&nbsp;&nbsp;</p>
        `
    }, 400);

    //  obrat, nazaj
    setTimeout(() => {
        frameMessages.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^^I&nbsp;&nbsp;&nbsp;[II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
        `
    }, 700);

    setTimeout(() => {
        frameMessages.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;^^I&nbsp;&nbsp;&nbsp;[II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
        `
    }, 900);

    setTimeout(() => {
        frameMessages.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;^^I&nbsp;&nbsp;&nbsp;[II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;</p>
        `
    }, 1100);

    setTimeout(() => {
        frameMessages.style.paddingLeft = '20px';
        frameMessages.style.width = '290px';
    }, 1350);

    function doAnimation(size, color, delay) {
        setTimeout(() => {
            frameMessages.innerHTML = `
        <p style="font-size: ${size}px; text-align: center; color: ${color}; padding-right:100px">3x</p>`;
        }, delay);
    };

    doAnimation(100, 'white', 1350);
    doAnimation(120, 'yellow', 1450);
    doAnimation(150, '#24f708', 1550);
    doAnimation(150, '#41ce2f', 1650);
    doAnimation(150, '#59ad4e', 1750);
    doAnimation(150, '#6c9766', 1850);

    setTimeout(() => {
        frameMessages.innerHTML = ``;
        frameMessages.classList.add('hidden');
        frameMessages.style.paddingRight = '20px';
    }, 1950);
}

async function effectQuad() {
    frameMessages.innerHTML = '';
    frameMessages.classList.remove('hidden');
    frameMessages.style.background = 'yellow';

    setTimeout(() => frameMessages.style.background = 'white', 40);
    setTimeout(() => frameMessages.style.background = '#808080', 90);

    function doStyling(color1, color2, color3, colorBackground, colorFont, delay) {
        setTimeout(() => {
            frameMessages.style.background = `${color1}`;
            frameMessages.innerHTML = `
           <div style="background:${color2};height:100%;box-sizing: border-box;padding:20px">
               <div style="background:${color3};height:100%;box-sizing: border-box;padding:20px">
                   <div style="background:${colorBackground};height:100%;box-sizing: border-box;padding:20px">
						<p style="font-size:50px;color:${colorFont}">QUAD!</p>
                   </div
               </div
           </div`;
        }, delay);
    }

    doStyling('red', 'orange', 'yellow', 'grey', 'white', 100);
    doStyling('#b10202', '#af7303', '#b6b602', 'grey', 'white', 600);
    doStyling('#6d0202', '#704902', '#757502', 'grey', '#757502', 900);
    doStyling('#410101', '#3d2801', '#3d3d01', 'grey', '#505050', 1200);
    doStyling('grey', 'grey', 'grey', 'grey', '#505050', 1450);
    setTimeout(() => frameMessages.classList.add('hidden'), 1500);
}

//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com