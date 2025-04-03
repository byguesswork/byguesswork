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
const labelSizeInfo = document.getElementById('size-info');
const labelExplosionNumberInfo = document.getElementById('explosion-number');
const labelInvite = document.getElementById('invite');
const labelScore = document.getElementById('score');
// const btnTestButton2 = document.getElementById('button-2');
const boxStartGame = document.getElementById('start-game-box');
const boxIntervalSpeed = document.getElementById('box-interval-speed');
const divSizeForm = document.getElementById('size-div');
const divDelovna = document.getElementById('delovna');
const divDesni = document.getElementById('desni');
const divLangFlag = document.getElementById('lang-flag');
const divScore = document.getElementById('div-score');
const divMessagesContainer = document.getElementById('messages-container');
const frameMessages = document.getElementById('messages');
const labelNotNow = document.getElementById('not-now');
const labelEyesOnTheGame = document.getElementById('eyes-on-the-game');
const formInitials = document.getElementById('initials-form');
const inputInitials = document.getElementById('initials-input');
const overlayStartGameBox = document.getElementById('start-game-box-overlay');
const overlayIntervalBox = document.getElementById('interval-box-overlay');
const overlayGameSizeDiv = document.getElementById('size-div-overlay');
const overlayDuringAlert = document.getElementById('window-overlay-for-alert');

//      -------------       SPREMENLJIVKE in VREDNOSTI

const pageLang = document.firstElementChild.lang;    /* ta lang sam definiraš v HTML-ju, tako da ne gre za neko odkrivanje, se pa rabi v highScores, zato je potrebno */
let lang = 'en';    // to pa odkrije (funkijca na dnu), kateri je jezik navigatorja; v tem programu se sicer ne rabi, tle je samo demonstracijsko;
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
let blockSize = 40;
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
    // samo web, divBckgndGrid v keys_UI;
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

const insertFormOnTop = () => {

    activeForm = nextForm;
    nextForm = getRandomForm();
    showNextFormInMiniGrid();

    activeForm.notionalPos.row = 0; // podatke o lokaciji je treba ponastavit!!, ker sicer jih podeduje od objekta, katerega referencira in torej dobi neke koordinate z dna igralnega polja
    activeForm.notionalPos.col = insertionColumn; // ker tako next kot active kažeta na objekt, je treba vrednosti ponastaviti zdaj..
    activeForm.activeRotation = 0;  // ..sicer pride do težav, če sta active in next isti lik (pred tem je v showNextFormInMiniGrid() lik dobil drugačne koordinate)
    numberOfFallenForms++;

    //  dogajanje, povezano z randomom (če je aktiven); koda večinoma v keys_UI;
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
                resolveGameDirectionChoice('down'); // v keys_UI;
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

function toggleOverlay(whichOverlay, basedOnWhat, doWhat) {
    const frame = basedOnWhat.getBoundingClientRect();
    whichOverlay.style.top = `${frame.top}px`;
    whichOverlay.style.left = `${frame.left}px`;
    whichOverlay.style.height = `${doWhat === 'display' ? frame.height : 1}px`;     //  PAZI: vrednost mora biti string!!!
    whichOverlay.style['width'] = `${doWhat === 'display' ? frame.width : 1}px`;       //  opazi dva načina zapisa
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
    // samo web, divBckgndGrid v keys_UI;
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
        smallSizeHighScoresTable(); // v scores.js
        frameMessages.style.margin = '0 0 0 0';
        labelHighScoresInitials.style.left = '10px';    // ta in dva niže v scores.js
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
    if (window.innerWidth < 1343 || window.innerHeight < 685) {     // eksperimentalno pridobjeni podatki
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

    if (window.innerWidth < 1221 || (window.innerWidth < 1239 && window.innerHeight < 559)) {
        divMessagesContainer.classList.add('hidden');
        divHighScoresAll.classList.add('hidden');   // v scores.js
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
    const horizontalOffSet = (window.innerWidth < 1221 || (window.innerWidth < 1239 && window.innerHeight < 559)) ? 540 : 740;
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
    // spodnja dva v keys_UI;
    inputPlayingFieldSize[0].max = canvasSizeData.maxNrBlocksAlongLongerDimension;  // da se prilagodi omejitev vnosa v vnosno polje (če uporabljaš une puščice v vnosnem polju);
    inputPlayingFieldSize[1].max = canvasSizeData.maxNrBlocksAlongLongerDimension;  // pač damo obe polji na isto maximalno vrednost, ker ne vemo, v katerega bomo vnesli večjo dimenzijo;

    //  ker je začetna postavitev samodejno navpična in ker je šteilo rst večje od števila stolpcev, privzamemo spodnjo metodo
    if (canvasSizeData.maxNrBlocksAlongLongerDimension < 16) {
        lastRow0based = canvasSizeData.maxNrBlocksAlongLongerDimension - 1;
        lastColumn0Based = canvasSizeData.maxNrBlocksAlongShorterDim - 1;
        // spodnja dva v keys_UI;
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
	if (window.innerHeight>800 && (window.innerHeight-canvas.height > 60)) labelInvite.classList.remove('hidden')

    // če je canvas manjši kot 620 je treba skrit navodila, sicer štrlijo spodaj 
    if (canvas.width < 620) document.getElementById('navodila').classList.add('hidden');

    //  šele na tem mestu, ko je končano spreminjanje postavitve, videza, dimenzij, ... se postavi overlaye;
    //      če je največja razpoložljiva dimenzija manjša od 14x8, potem ni mogoče spreminjati velikosti
    if (canvasSizeData.maxNrBlocksAlongLongerDimension < 14) toggleOverlay(overlayGameSizeDiv, divSizeForm, 'display');
    //      da prestavi overlay na pravo mesto, ker se je vsebina pod njim zamaknila (če so se paragrafi krajšali, ...);
    if (!randomMode.isActive) toggleOverlay(overlayRandomnessDiv, divRandomness, 'display');    // spremenljivka in oba selectorja so v keys_UI

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
    setTimeout(() => resolveHighScores(), 1080);    // v scores.js;  če spremeniš trajanje curtainMiniGrid, potem razmisli tudi o trajanju tle;
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

    //  logika, al naj se sredi padanja lika zgodi random sprememba smeri   - koda za random je v keys_UI;
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

            //  zdaj pa še, ali je prosto en kvadratek levo in desno
            if (canPlace) { // preverjamo samo v primeru, če je canPlace še vedno true;
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
    // v scores.js
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
    // za random mode; koda v keys_UI;
    randomMode.lastChangeAtFallenFormNr = 0;   // tega je treba ob vsakem initu azzerirat (da gre vsakič sproti ziher na 0)
    randomMode.lastChangeAtCycleNr = 0;
    randomMode.nrOfDirctnChanges = 0;
    randomMode.changeObligatory = false;
    // !za random mode;
    curtainInMiniGridStaticClosed();
    nextForm = getRandomForm();
}

function refreshCurrentScore() {
    labelScore.innerHTML = `${score}`
    //	trivia (ali ne): intervalID (zaporedna številka intervala), ko gre igra skozi eksplozijo, se poveča za 7, ker setTimer in SetInterval imajo skupno štetje,
    //  ..zato interval ni primeren za vodenje točk; hm, ali bi pač morda kar interval bile točke ...
}

function checkLang(){
    let langString = 'en';
    if (navigator.language != '') {
        langString = navigator.language;
    } else if (navigator.userLanguage != '') {
        langString = navigator.userLanguage;
    };
    if (langString == 'sl' || langString == 'sl-si' || langString == 'sl-SI' || langString == 'si') { lang = 'sl' } // privzeto, od deklaracije, je "en";
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
}


//  ---------------     LISTENERJI

boxStartGame.addEventListener('mouseup', () => { if (!isAGameRunning && !controlsTemporarilyOff) startGame() }) // mouseup zato, da ne dela to polje, če si prej bil v poljih za določanje velikosti
// btnTestButton2.addEventListener('click', testButton2Operation);  // v live različici listener ne smebiti aktiven



//  ----------------    IZVAJANJE
if (screen.width < 1040 || screen.height < 560 || window.innerWidth < 1040 || window.innerHeight < 559) { // ni mobile, a je premajhen zaslon;
    document.body.innerHTML = `<p style="padding-left: 20px;"><br><a href="../index.html" title="back to By Guesswork"><img src="../images/home.PNG" alt="home"></a><br><br>This game is not fond of small screens.<br>
A tetris block might fall off the screen and<br>hurt your foot. Not good for you.<br><br>
Please do revisit when viewing on a<br>regular desktop or laptop monitor.<br></p>
<p class="comment" style="padding-left: 20px; padding-top:5px">Min required size: 1040 x 560px<br>Suggested size: 1350 x 700px<br>Do not forget to bring a keyboard!</p>
<p style="padding-left: 20px;"><br>Warmly welcome!</p>`;
} else {  //  če pasa test velikosti, zaženeš igro v web;
    loadHighScores();   // v scores.js; najprej loadHighScores, ker če ne inicializacija ekrana ni OK, ker ekran brez higScores še nima končnih dimenzij;
    initializeScreenAndSizes();
    colorSelectedMenuChoicesAtInit();   // samo web
    drawEmptyMainGrid();
    checkLang();
    standBy();
}


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


//  coded with love and by guesswork by Ivo Makuc, 2022
//  byguesswork@gmail.com