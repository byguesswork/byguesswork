'use strict';

// tako kot y ne sme bit negativen (sicer ne izrisujemo), bi bilo verejtno treba isto tudi za x/y in z/y, vidiš namreč samo določen kot;
// dodat kšne opise v index.html (recimo za fuel: I like its simplicity, maybe you will too)

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const controlsCanvas = document.getElementById('controls_canvas');
const controlsCtx = controlsCanvas.getContext('2d');
const infoSettgs = document.getElementById('info_settings');
    const infoSettgsContent = document.getElementById('info_settings_content');
    const infoSettgsOK = document.getElementById('info_settings_OK');
const joker = document.getElementById('joker');

const bckgndColr = '#4e4e4c';
const lineColor = '#f0fff0';
let wdth, hght, clientWidthWas;   // "was" se imenuje zato, ker se uporablja tudi v eni funkciji, kjer je pomembno, da je "was", sicer pa predstavlja tudi stanje "is";
let orientationChkIsInMotion = null;
let isInfoSettingsOpen = false;
const lang = checkLang();
const contrlsCnvsRect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
}
const scrnMidPoint = {
    x: 0, 
    y: 0
};

initScrn();
drawControlsIcons();

// koti; ekran od leve do desne je 3.0 radiana (malo manj kot 180', kao oponaša vidno polje človeka), pomeni da je scrnMidPoint.x = 1.5 (ali tam nekje); zdaj izračunamo še, kolikšen kot je lahko po vertikali 
const FISHEYE = Math.PI / 2;
const TELEANGLE = 0.3;
let hrzRadsFrmCentr = TELEANGLE;
let vertRadsFrmCentr, factorX, factorY;
calcVertRadsFrmCentr();
console.log(wdth, hght, scrnMidPoint, vertRadsFrmCentr);

// najprej preverimo za mobilca, ker to lahko spremeni postavitev;
let mobile = false;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
    console.log('mobile');
    mobile = true;
    const spans2remv = [...document.getElementsByClassName('not_if_mobile')];
    spans2remv.forEach(el => el.classList.add('hidden'));

    screen.orientation.addEventListener("change", () => {
        
        // ne dela dobro, bi rablo mal več testiranja, damo kar reload
        // orientationChkIsInMotion = setInterval(chkOnOrientationChgd, 50);
        // console.log('listener za obračanje se je sprožil')
        location.reload();
    });

    // če je mobile, ni info linka, ker ni kaj razlagat o tipkah;
    infoSettgs.classList.add('hidden');
}

infoSettgsContent.addEventListener('click', infoClicked);
infoSettgsOK.addEventListener('click', infoCloseClicked);

// šele po morebitni spremembi zaradi mobile umestimo zgornji okvir;
document.getElementById('mode').style.bottom = `${30 + controlsCanvas.getBoundingClientRect().height + 25}px`;   // 30 ker ima sklop pod njim bottom 30; 25 je arbitrarna meja med skopoma 
if (document.readyState == 'loading') { //.. in preberemo koordinate controlsRecta;
    document.addEventListener("DOMContentLoaded", readCntrlsCnvsRect);  // domcontent loaded je lahko "complete" ali pa "interactive";
} else {
    readCntrlsCnvsRect();
}


//  - - - -   FUNKCIJE   - - - -

function readCntrlsCnvsRect() {
    contrlsCnvsRect.left = controlsCanvas.getBoundingClientRect().left;
    contrlsCnvsRect.top = controlsCanvas.getBoundingClientRect().top;
    contrlsCnvsRect.right = controlsCanvas.getBoundingClientRect().right;
    contrlsCnvsRect.bottom = controlsCanvas.getBoundingClientRect().bottom;
    console.log('rect:', contrlsCnvsRect.left, contrlsCnvsRect.top)
}

function chkOnOrientationChgd(){    // trenutno se ne uproablja, ker ne deluje dobro;
    // console.log('widthWas:', clientWidthWas, 'width is:', document.documentElement.clientWidth, 'interval:', orientationChkIsInMotion);
    if (document.documentElement.clientWidth != clientWidthWas) {
        clearInterval(orientationChkIsInMotion);
        orientationChkIsInMotion = null;
        initScrn();
        calcVertRadsFrmCentr();
        calcReltvSpcPtsAndDraw();
    }
}

function initScrn(){
    clientWidthWas = document.documentElement.clientWidth; // da bomo pozneje lahko preverjali orietn change na mobilcu;
    
    wdth = clientWidthWas - 5; // -5 , da ni skrolbara; prej je bilo window.innerWidth, ampak ni ok, vsaj višina ne, prevelika pride;
    hght = document.documentElement.clientHeight - 5;
    scrnMidPoint.x = wdth % 2 == 0 ? wdth / 2 : wdth / 2 + 0.5;
    scrnMidPoint.y = hght % 2 == 0 ? hght / 2 : hght / 2 + 0.5;
    
    Thingy.meetCtx(ctx);
    canvas.height = hght;
    canvas.width = wdth;
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColor;
}

function calcVertRadsFrmCentr(){    // kliče se vsakokrat, ko zamenjaš narrowAngle/fish eye;
    let drawableYHeightHalved;

    vertRadsFrmCentr = toDecPlace((scrnMidPoint.y / scrnMidPoint.x) * hrzRadsFrmCentr, 4);
    drawableYHeightHalved = scrnMidPoint.y;
    
    if (vertRadsFrmCentr >= Math.PI / 2) {   // to se lahko zgodi pri pokočni postavitvi in fishEye;
        vertRadsFrmCentr = hrzRadsFrmCentr;
        drawableYHeightHalved = scrnMidPoint.x; // da je slika enaka v širino in višino, ker že po širini zajame 180', višina pa je še višja;
    }

    console.log('vertRads:', vertRadsFrmCentr)
    factorX = scrnMidPoint.x / Math.sin(hrzRadsFrmCentr);
    factorY = drawableYHeightHalved / Math.sin(vertRadsFrmCentr);

}  

function clearCanvas() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = bckgndColr;
    ctx.fillStyle = bckgndColr;
    ctx.beginPath();
    ctx.rect(1, 1, wdth, hght);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = lineColor;
}

function calcScreenPts(spacePoints, connctnsRange) {   // prejme relativne koordinate!, položaj viewerja mora torej biti že odštet;

    // i - index v arrayu spacePoints
    // j - index v arrayu s povezavami
    function chk4Intrpolate(i, j){    // to samo interpolira x in y od SpacePointa (ne ScreenPointa!!!) in vrne x in y SpacePointa!;
        // console.log('i:',i, 'j:', j)
        if (connctnsRange[j][0] == i) { // spcPt[i] se uporablja kot začetni element črte, ki jo opredeljuje connsAlt[j]; 
            if (spacePoints[connctnsRange[j][1]].y > 0) {
                startRoll = j;   // zabeležimo, da smo tle že našli, ker vsako točko interpoliramo samo enkrat, kljub temu da morda sodeluje v več povezavah;
                // console.log('negativna točka je prva točka povezave in jo lahko interpoliramo - BREAK')
                return interpolateToYAbvZero(spacePoints[connctnsRange[j][0]].x, spacePoints[connctnsRange[j][0]].y,
                    spacePoints[connctnsRange[j][1]].x, spacePoints[connctnsRange[j][1]].y);
            } else {
                // console.log('negativna točka je prva točka povezave, ampak tudi druga je negativna;')
                return false;
            }
        } else if (connctnsRange[j][1] == i) {   // spcPt[i] se uporablja kot končni element črte, ki jo opredeljuje connsAlt[j]; 
            if (spacePoints[connctnsRange[j][0]].y > 0) {
                startRoll = j;   // zabeležimo, da smo tle že našli, ker vsako točko interpoliramo samo enkrat, kljub temu da morda sodeluje v več povezavah;
                // console.log('negativna točka je končna točka povezave in jo lahko interpoliramo - BREAK')
                return interpolateToYAbvZero(spacePoints[connctnsRange[j][1]].x, spacePoints[connctnsRange[j][1]].y,
                    spacePoints[connctnsRange[j][0]].x, spacePoints[connctnsRange[j][0]].y);
            } else {
                // console.log('negativna točka je druga točka povezave, ampak tudi prva je negativna;')
                return false;
            }
        } else {
            return false;
        }
    }

    function spcPt2ScrnPt(x, y, z) {
        const scrnPt = new ScreenPoint();
        scrnPt.x = scrnMidPoint.x +  Math.sin(Math.atan2(x, (y**2 + z**2 )**(1/2))) * factorX;
        // /*1*/ scrnPt.y = scrnMidPoint.y +  Math.sin(Math.atan2(z, (y**2  + x**2 )**(1/2))) * factorY;
        /*2*/ scrnPt.y = scrnMidPoint.y +  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * factorY;
        // /*3*/ scrnPt.y = scrnMidPoint.y -  Math.sin(Math.atan2(z, (y**2  + x**2 )**(1/2))) * factorY;
        // /*4*/ scrnPt.y = scrnMidPoint.y -  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * factorY;
        return scrnPt;
    }

    // začetek dogajanja;
    const scrnPts = new Array();
    let startRoll = 0; // spremenljivka v katero shraniš, kjer si že iskal; predvidoma se poznejše točke najdejo v poznejših povezavah, zato;
    spacePoints.forEach((spcPt, i) => {
        // glavna logika je Math.atan2(offset(od navpičnice, vodoravnice), razdalja do tja);
        // računanje hipotenuze služi upoštevanju tega, da če je neka stvar visoko, je v bistvu tudi oddaljena;
        // tudi če ozkokotni pogled prikažeš cel (s faktorjem 0,2) ni čisto nič drugačen od fish eye; spreminjanje kota torej ne reši ukrivljenosti, bo treba druga metoda;
        
        if (spcPt.y > 0) {   // neproblematična varianta, tj. če imaš stvar pred sabo;
            scrnPts.push(spcPt2ScrnPt(spcPt.x, spcPt.y, spcPt.z));
        } else {    // če prideš v else, je bil podan tudi connctnsRange;
            // najst, kje v connctnsRange je taka točka (y < 0 in ima povezavo, na osnovi katere ga je mogoče interpolirati);
            let found = false;
            for (let j = startRoll; j < connctnsRange.length; j++) {
                const retrndValue = chk4Intrpolate(i, j); // če je mogoče interpolirati negativni y, vrne novi x in y koordinati spacePointa (space, ne screen) v arrayu;
                if (typeof retrndValue == 'object') {
                    found = true;
                    scrnPts.push(spcPt2ScrnPt(retrndValue[0], retrndValue[1], spcPt.z));    // frmSpcPtT... vrne array, ki ima na prvam mestu x, nato y;
                    break;
                }
            }
            if (startRoll > 0 && !found) for (let j = 0; j < startRoll; j++) {  // reroll in iskanje od začetka, če ni bilo najdeno pri koncu arraya povezav;
                const retrndValue = chk4Intrpolate(i, j);
                if (typeof retrndValue == 'object') {
                    found = true;
                    scrnPts.push(spcPt2ScrnPt(retrndValue[0], retrndValue[1], spcPt.z));
                    break;
                }
            }
            if (!found) scrnPts.push(new ScreenPoint(undefined, undefined));
        }
    });
    
    return scrnPts;
}


function calcReltvSpcPtsAndDraw(){ // calculate relative spacePoints, tj. od viewerja do predmetov;
    
    // helper funkcije;

    function helper(spcPt, item2Draw, constraints) {
        x = spcPt.x - viewPoint.x;  // x in y relativiziramo;
        y = spcPt.y - viewPoint.y;
        r = (x**2 + y**2)**(0.5);
        
        angle;
        if (y > 0) {
            angle = Math.asin(x/r) - viewngAngle;   // pri izračunu kota, pod katerim gledamo neko točko, je treba upoštevati, kam je usmerjen pogled gledalva (viewAngle)..;
        } else if (y < 0) {                             // ..pri rotaciji (objRotate) je sicer viewAngle kot, za koliko je zarotiran predmet ! ! !;
            angle = Math.PI - Math.asin(x/r) - viewngAngle;
        } else if (y == 0) {
            if (x < 0) angle = 1.5 * Math.PI - viewngAngle;
            else angle = 0.5 * Math.PI - viewngAngle;
        }
        
        //zdaj, ko smo dobili nov kot, že kar lahko izračunamo nov x in nov y (prostorske) relativne točke, ki bo izrisana;
        x = r * Math.sin(angle);
        y = r * Math.cos(angle);
        if (y > 0) constraints.allYNegAngular = false;
        else if (y < 0) constraints.atLeast1YNeg = true;
        // /*1*/ item2Draw.push(new SpacePoint(x, y, spcPt.z + viewPoint.z));
        // /*2*/ item2Draw.push(new SpacePoint(x, y, -spcPt.z + viewPoint.z));
        /*3*/ item2Draw.push(new SpacePoint(x, y, spcPt.z - viewPoint.z)); // z-ju ni treba preračunavat kota
        // /*4*/ item2Draw.push(new SpacePoint(x, y, -spcPt.z - viewPoint.z));

        // rezultati testov preračunov zaslonskih koordinat - Prva cifra pomeni kalkulacijo y v spcPt2ScrnPt oz. v calcScreenPts;:
        // 1-1 prenizko; 1-2 OK   !!; 1-3 ni ok; 1-4 previsoko;
        // 2-1 previsoko; 2-2 na spodnji strani; 2-3 OK!!; 2-4 prenizko;
        // 3-1 previsoko; 3-2 spodaj; 3-3 OK !!; 3-4 prenizko;
        // 4-1 prenizko; 4-2 OK; 4-3 spodaj; 4-4 previsoko;
    }

    // začetek dogajanja;
    let x, y, r, angle;

    // ker bomo na koncu risali, moramo na začetku vse izbrisat;
    clearCanvas();

    // določimo izhodišče pogleda in kot; slednje je odvisno od tega al landscape ali objRotate;
    const viewPoint = activeViewer.posIn3D;   // točka, iz katere gledamo;
    const viewngAngle = isLandscapeMode == true ? activeViewer.angle : 0; // kot pod katerim gledamo; N == 0;

    activeItems.forEach(spunItem => {
        // preslikava prostorskih točk na dvodimenzionalno ravnino, ..
        // ..toda ne navpično ravnino, kot je monitor, ampak vodoravno (x rase proti desno, y raste stran od gledalca);
        // kot pogleda je zelo pomemben; risanja ne moreš izvajat brez preračunavanja kota, tudi če je kot == 0,..
        // .. ker če imaš zadevo za hrbtom, tudi če gledaš direkt proti S (kot == 0), zadeve ne smeš izrisat, ker je ne moreš videt;
        
        function oneLoop(segIdx) {   // prejme index segmenta;
            const item2Draw = new Array();   // item2Draw je nov objekt, da ne spreminjamo dejanskih koordinat teles v prostoru (telesa ostajajo na istih točkah),..
                                    // ..ampak da dobimo relativne koordinate glede na gledišče, ki jih podamo v spunItem.draw;
            const constraints = {
                allYNegAngular : true,  // beleži, ali so vse y koordinate nekega predmeta negativne, tj. gledalcu za hrbtom; če tako, ničesar ne izrišemo, ker gre le za zrcalno sliko, ki je za hrbtom;
                atLeast1YNeg : false   // beleži, al ti je vsaj ena koordinata za hrbtom;
            }

            spunItem.segments[segIdx].spcPts.forEach((spcPt) => { helper(spcPt, item2Draw, constraints) })

            if (!constraints.allYNegAngular) {  // če so vse prostorske y-koordinate predmeta negativne, je predmet v celoti za hrbtom gledalca in ga ne rišemo;
                if (!constraints.atLeast1YNeg) {    // če niti ena prostorska y koordinata ni negativna, simple case;
                    //  spunItem.segments[segIdx].conns4CalcScrnPts se poda brez veze (samo za rezervo), ker itak so vsi y pozitivni;
                    spunItem.draw(calcScreenPts(item2Draw, spunItem.segments[segIdx].conns4CalcScrnPts), segIdx);
                } else { // če je kakšna y-koordinata prostorske točke negativna, je treba komplicirat, interpolirat y, da ni negativen..
                        // (zaradi kotnih preračunov se lahko stvari, ki jih imaš za hrbtom, narišejo pred tamo, zato je treba negativne y skenalsat pred kotnimi prer.); 
                    spunItem.draw(calcScreenPts(item2Draw, spunItem.segments[segIdx].conns4CalcScrnPts), segIdx);
                }
            }  // else do nuthn, ker so vse koordinate negativne in ne rišemo nič
        }
        
        // začetek dogajanja;
        const proximals = []; // sem shranimo indexe ploskev tipa PROXIMAL, ki bodo izrisane pozneje;
        // v prvi pasaži narišemo tiste segmente, ki se narišejo vedno;
        for (let k = 0; k < spunItem.segments.length; k++) {
            
            if (spunItem.segments[k].fillInfo.typ == undefined || spunItem.segments[k].fillInfo.typ != PROXIMAL) {
                oneLoop(k);
            } else { proximals.push(k); }   // zabeležimo segmente za naslednjo pasažo ;
        } 
        
        if (proximals.length > 0) {
            for (let k = 0; k < proximals.length; k++) {
                const rSrfcSptlCtr = Thingy.calcSpatialRFromSpcPt(spunItem.segments[proximals[k]].spatialCtr, viewPoint) // poda dolžino daljice od gledalca do srewdišča celega predmeta;
                const rSrfcDistlSptlCtr = Thingy.calcSpatialRFromSpcPt(spunItem.segments[proximals[k]].distlSptlCtr, viewPoint);
                // console.log(rSrfcSptlCtr, rSrfcDistlSptlCtr)
                if (rSrfcSptlCtr < rSrfcDistlSptlCtr) { oneLoop(proximals[k]); } // oneLoop prejme index segmenta, zato proximals[k];
            }
        }
    })
}


//  - - - - - - - - - - - - - - - - -  PRIPRAVA  - - - - - - - - - - - - - - - - - - - - -

// - - - - - -  USTVARJANJE LANDSCAPE STVARI, KI BODO NA EKRANU - - - - - -
const cubes = [];
// navpične kocke;
for (let i = 0; i <= 16; i += 4) {
    cubes.push(new Cube(new SpacePoint(6, 20, i), 4))
};
// vodoravne kocke;
for (let i = 10; i <= 46; i += 4) {
    cubes.push(new Cube(new SpacePoint(i, 20, 0), 4))
};

// kesonar;
const pickupTruckLndscp = new Pickup(new SpacePoint(5, 5, 0.4), '#a0a0a0');  // silver: #c0c0c0 ; grey: #808080
const othrPickupTruckLndscp = new Pickup(new SpacePoint(-9, 24, 0.4), Math.random() < 0.5 ? '#850e1e' : '#0f3477', 4.71); // modra: #0f3477 bordo : #850e1e

// rob ceste;
const lines = [];
// new Connection(new SpacePoint(-4, 0, 0), new SpacePoint(-4, 2000, 0));      // opazi, kako je line1 ravna in se ne ujema s segmentirano črto;
for(let i = 1; i <= 16; i++) {
    lines.push(new Connection(new SpacePoint(-4, (i - 1) * 4, 0), new SpacePoint(-4, i * 4, 0)));
    lines.push(new Connection(new SpacePoint(4, (i - 1) * 4, 0), new SpacePoint(4, i * 4, 0)));
    lines.push(new Connection(new SpacePoint(-4, -(i - 1) * 4, 0), new SpacePoint(-4, -i * 4, 0)));
    lines.push(new Connection(new SpacePoint(4, -(i - 1) * 4, 0), new SpacePoint(4, -i * 4, 0)));
}
for(let i = 1; i <= 4; i++) {
    lines.push(new Connection(new SpacePoint(-4, 64 + (i - 1) * 16, 0), new SpacePoint(-4, 64 + i * 16, 0)));
    lines.push(new Connection(new SpacePoint(4, 64 + (i - 1) * 16, 0), new SpacePoint(4, 64 + i * 16, 0)));
    lines.push(new Connection(new SpacePoint(-4, -64 - (i - 1) * 16, 0), new SpacePoint(-4, -64 - i * 16, 0)));
    lines.push(new Connection(new SpacePoint(4, -64 - (i - 1) * 16, 0), new SpacePoint(4, -64 - i * 16, 0)));
}
lines.push(new Connection(new SpacePoint(-4, 128, 0), new SpacePoint(-4, 2000, 0)));
lines.push(new Connection(new SpacePoint(4, 128, 0), new SpacePoint(4, 2000, 0)));
lines.push(new Connection(new SpacePoint(-4, -128, 0), new SpacePoint(-4, -2000, 0)));
lines.push(new Connection(new SpacePoint(4, -128, 0), new SpacePoint(4, -2000, 0)));

// črte na sredini ceste;
const dividingLines = [];
for (let i = -200; i <= 302; i += 10) {
    dividingLines.push(new HorzRectangle(new SpacePoint(-0.1, i, 0), 0.2, 3));
};

function getLandscItems() {
    // sortiranje landObjectsov;
    landObjects.forEach(el => { // najprej vsakemu določima razdaljo do viewerja;
        el.r = Thingy.calcPlanarRFromSpcPt(el.planrCentr, activeViewer.posIn3D)
    })
    landObjects.sort((a, b) => b.r - a.r)   // to je vsa fora da objekte posortiraš od najbolj oddaljenega proti najbližjemu

    // združit
    activeItems = landscape.concat(landObjects);
}

// - - - - - -  DODAJANJE STVARI V KATALOGE  - - - - - -
// če gledaš pokrajino - definirana morata biti dva arraya, ki morta biti vsaj prazna; vsebinolandObjects pri premikanju gledalca sortiramo po oddaljenosti;
// DELOVNA VARIANTA 
const landscape = [...lines, ...dividingLines];
const landObjects = [...cubes, pickupTruckLndscp, othrPickupTruckLndscp];

// TESTNA VARIANTA;
// const landscape = [];
// const landscape = [...lines, ...dividingLines];
// const landObjects = [];
// const landObjects = [new Pickup(new SpacePoint(-9, 24, 0.2), '#0f3477', 4.71)];
// const landObjects = [new Cube(new SpacePoint(-4, 10, 1.7), 4)]

// USTVARJANJE IN PRIPRAVA ŠE ZA MODUL OBJECT_ROTATE
const pickupTruckRotate = new Pickup(new SpacePoint(1, 5, 0), 'red');
const objRotateItems = [pickupTruckRotate];


//  - - - - - -  USTVARJANJE GLEDALCEV (2: za pomikanje po pokrajini in za gledanje rotacije predmeta);
const landscapeViewer = new Viewer(0, -9, 1.7);   // na začetku ima gledalec privzeto spacePoint 0,-9,1.7 (kao visok 1.7m), gleda naravnost vzdolž osi y, torej v {0,neskončno,1.7}, tj. kot 0;
// y == 9, da je pri normal view videt del avta

const obj2RotateViewer = new Viewer (0, 0, 1.7);

// štartamo v landscape mode;
let isLandscapeMode = true;
let activeViewer = landscapeViewer;
let activeItems;
getLandscItems();   // to napolni vsebino activeItems;

//  - - - - - - - - - - - - - - - - -  AKCIJA  - - - - - - - - - - - - - - - - - - - - -
calcReltvSpcPtsAndDraw();   // začetni izris izbranega kataloga;

let mousePressIsValid = false;  // če true, pove, da je dotik v teku in da je na veljavnem mestu;
let intervalChecker = null;
let mouseOrTchPosOnCtrls = {
    x : 0,
    y : 0,
    btn : 'none'
}

// - - - -  CONTROLS  - - - - - -

const LEFT = 'l';
const RIGHT = "r";
const FORWARD = "c";    // izvirno je bilo closer
const BACK = 'f';       // izvirno je bilo far
const UP = 'u';
const DOWN = 'd';
const CLOCKW = 'cw';
const ANTICLOCKW = 'acw';
const INVALID = 'inv';  // neveljaven klik

const lensBtns = document.getElementsByClassName('lens');
const modeBtns = document.getElementsByClassName('mode');

//   - - - - - -    listenerji
// tipke;
document.addEventListener('keydown', atKeyPress);
// besedilni gumbi;
lensBtns[0].addEventListener('click', lensBtnOprtn);
lensBtns[1].addEventListener('click', lensBtnOprtn);
modeBtns[0].addEventListener('click', modeBtnOprtn);
modeBtns[1].addEventListener('click', modeBtnOprtn);
// grafični gumbi;
if (!mobile) {  // poslušalci za ikone krmiljenja če miška;
    controlsCanvas.addEventListener('mousedown', (e) => {mouseDownOprtn(e)});
    controlsCanvas.addEventListener('mouseleave', (e) => {mouseLeaveOprtn(e)});
    controlsCanvas.addEventListener('mouseup', (e) => {mouseUpOprtn(e)});
    controlsCanvas.addEventListener('mousemove', (e) => {mouseMoveOprtn(e)});
} else {
    controlsCanvas.addEventListener('touchstart', (e) => {touchStartOprtn(e)}, {passive : false});
    controlsCanvas.addEventListener('touchmove', (e) => {touchMoveOprtn(e)}, {passive : false});
    controlsCanvas.addEventListener('touchend', (e) => {touchEndOprtn(e)}, {passive : false});

}

//  - - - - - -    funkcije
function atKeyPress(e){
    if (e.key == 'ArrowLeft') { moveViewer(LEFT) }
    else if (e.key == 'ArrowRight') { moveViewer(RIGHT);}
    else if (e.key == 'ArrowUp') { moveViewer(FORWARD) }  //e.code == 'KeyC'
    else if (e.key == 'ArrowDown') { moveViewer(BACK)  }
    else if (e.code == 'KeyU') { moveViewer(UP);}
    else if (e.code == 'KeyJ') { moveViewer(DOWN);}
    else if (e.code == 'KeyI') {
        if (isLandscapeMode) rotateViewer(ANTICLOCKW);
        else rotateObj(ANTICLOCKW);
    } else if (e.code == 'KeyO') {
        if (isLandscapeMode) rotateViewer(CLOCKW);
        else rotateObj(CLOCKW);
    } else if (e.code == 'KeyN') {
        if (lensBtns[0].classList.contains('unselected')) { changeLens(false); }
    } if (e.code == 'KeyF') {
        if (lensBtns[1].classList.contains('unselected')) { changeLens(true); }
    }
}

function moveViewer(toWhere){
    activeViewer.move(toWhere, activeViewer);
    // console.log(toDecPlace(activeViewer.posIn3D.x), toDecPlace(activeViewer.posIn3D.y), toDecPlace(activeViewer.posIn3D.z), 'kot:', toDecPlace(activeViewer.angle));
    if (isLandscapeMode) getLandscItems();  // da se določi, kateri predmeti so bližje in kateri dlje
    calcReltvSpcPtsAndDraw();
}

function rotateViewer(dir){
    activeViewer.rotate(dir);   // samo landscapeViewer pride sem;
    calcReltvSpcPtsAndDraw();
}

function rotateObj(dir){
    if (dir == CLOCKW) activeItems[0].rotate(true); // true za clockwise, sicer false;
        else activeItems[0].rotate(false);
    calcReltvSpcPtsAndDraw();
}

// - - - -  gumba FISH EYE/NARROW;
function changeLens(doFish){    // to lahko kličeš tudi s tipkami;
    lensBtns[0].classList.toggle('selected');
    lensBtns[1].classList.toggle('selected');
    lensBtns[0].classList.toggle('unselected');
    lensBtns[1].classList.toggle('unselected');
    if (doFish) hrzRadsFrmCentr = FISHEYE;
    else hrzRadsFrmCentr = TELEANGLE;
    calcVertRadsFrmCentr();
    calcReltvSpcPtsAndDraw();
}

function lensBtnOprtn(evt){
    //  evt.target.parentElement čekiramo, ker lahko klikneš span comment znotraj gumba in v tem primeru je ta span target, zato moramo skočit na parent;
    if (evt.target.classList.contains('unselected') || evt.target.parentElement.classList.contains('unselected')) {
        if (lensBtns[0].classList.contains('selected')) {
            changeLens(true);
        } else changeLens(false);
    }
}

//  - - - - -  gumba LANDSCAPE/ROTATE;
function modeBtnOprtn(evt){
    if (evt.target.classList.contains('unselected')) {
        if (modeBtns[0].classList.contains('selected')) {
            changeMode(true);
        } else changeMode(false);
        modeBtns[0].classList.toggle('selected');
        modeBtns[1].classList.toggle('selected');
        modeBtns[0].classList.toggle('unselected');
        modeBtns[1].classList.toggle('unselected');
    }

    function changeMode(doRotate){
        if (doRotate) {
            activeItems = objRotateItems;
            activeViewer = obj2RotateViewer;
            isLandscapeMode = false;
        } else {
            activeItems = landscape.concat(landObjects);   // to nastavi activeItems na pravo stvar; ni treba getLandscItems, ker bi po nepotrebnem sortiralo;
            activeViewer = landscapeViewer;
            isLandscapeMode = true;
        }
        calcReltvSpcPtsAndDraw();
    }
}

//  - -  grafične ikone za premikanje;      - - - - - - -
// če mobile

function touchStartOprtn(e) {
    if (!mousePressIsValid) {   // to naj bi bilo zato, da za zdaj je mogoče le en dotik naenkrat;
        mouseDownOprtn(e);  // lahko uporabimo isto funkcijo;
    } else {
        // za zdaj še ne podpira več dotikov hkrati;
        // je pa trenutno tako, da se izvirno gibanje ustavi, ko takneš še nekaj drugega; se mi zdi

        // joker.classList.remove('hidden');
        // joker.innerHTML = "second touch";
        // setTimeout(() => { joker.classList.add('hidden'); }, 1000);
    }
}

function touchEndOprtn(e) {
    e.preventDefault();
    mouseUpOprtn(); // lahko uporabimo isto funkcijo;
}

function touchMoveOprtn(e) {
    e.preventDefault();
    if (e.changedTouches[0].clientX < contrlsCnvsRect.left || e.changedTouches[0].clientX > contrlsCnvsRect.right
        || e.changedTouches[0].clientY < contrlsCnvsRect.top || e.changedTouches[0].clientY > contrlsCnvsRect.bottom) {
        // if (mousePressIsValid) console.log('invalidated, ker zdrsnil s controls');
        invldteCtrlsClick();
    } else {
        mouseMoveOprtn(e);   // lahko uporabimo kar od miši;
    }
}

// - -  če miška     - - - - - - - - - - - - 
function mouseDownOprtn(e){
    const reslt = determineMousPosOnCtrlsCnvs(e);
    if (reslt == INVALID) {
        invldteCtrlsClick();
    } else {
        mousePressIsValid = true;
        mouseOrTchPosOnCtrls.btn = reslt;
        if (reslt != CLOCKW && reslt != ANTICLOCKW) {
            desktopMovingHelper();
            if (reslt == FORWARD || reslt == BACK) intervalChecker = setInterval(desktopMovingHelper, 30);
            else if (reslt == LEFT || reslt == RIGHT) intervalChecker = setInterval(desktopMovingHelper, 45);
            else intervalChecker = setInterval(desktopMovingHelper, 55);
        } else {
            desktopRotationHelper();
            intervalChecker = setInterval(desktopRotationHelper, 50);
        }
    }
}

function mouseMoveOprtn(e) {
    if (mousePressIsValid) {
        const reslt = determineMousPosOnCtrlsCnvs(e);
        if (reslt != mouseOrTchPosOnCtrls.btn) {
            invldteCtrlsClick();
            // console.log('invalidated pri premiku z gumba')
        }
    }
}

function mouseUpOprtn() {
    if (mousePressIsValid) invldteCtrlsClick();
}

function mouseLeaveOprtn() {
    if (mousePressIsValid) invldteCtrlsClick();
}

function determineMousPosOnCtrlsCnvs(e) {
    if (!mobile) {
        mouseOrTchPosOnCtrls.x = e.clientX - contrlsCnvsRect.left;
        mouseOrTchPosOnCtrls.y = e.clientY - contrlsCnvsRect.top;
    } else {
        mouseOrTchPosOnCtrls.x = e.changedTouches[0].clientX - contrlsCnvsRect.left;
        mouseOrTchPosOnCtrls.y = e.changedTouches[0].clientY - contrlsCnvsRect.top;
    }
    
    if (mouseOrTchPosOnCtrls.y < 50) {  // zgornja vrstica
        return whichBtnInRow(true);
    } else if (mouseOrTchPosOnCtrls.y > 55) {   // spodnja vrstica
        return whichBtnInRow(false);
    } else return INVALID;

    function whichBtnInRow(isUpper) {   // če true, zgornja vrstica, sicer spodnja;
        if (mouseOrTchPosOnCtrls.x < 105) { // leva polovica
            if (mouseOrTchPosOnCtrls.x < 49) {  // 1. četrtina;
                if (isUpper) return ANTICLOCKW;
                else return LEFT;
            } else if (mouseOrTchPosOnCtrls.x > 55) {   // 2. četrtina
                if (isUpper) return FORWARD;
                else return BACK;
            } else return INVALID;
        } else if (mouseOrTchPosOnCtrls.x > 111) { // desna polovica;
            if (mouseOrTchPosOnCtrls.x < 161) { // 3. četrtina;
                if (isUpper) return CLOCKW;
                else return RIGHT;
            } else if (mouseOrTchPosOnCtrls.x > 179) {  // 4. četrtina;
                if (isUpper) return UP;
                else return DOWN;
            } else return INVALID;
        } else return INVALID;
    }
}

function invldteCtrlsClick() {
    mousePressIsValid = false;
    if (intervalChecker != null) {
        clearInterval(intervalChecker);
        intervalChecker = null;
    }
}

function desktopMovingHelper() {
    moveViewer(mouseOrTchPosOnCtrls.btn);
    if (isLandscapeMode) getLandscItems();
}

function desktopRotationHelper() {
    if (isLandscapeMode) rotateViewer(mouseOrTchPosOnCtrls.btn);
        else rotateObj(mouseOrTchPosOnCtrls.btn);
}
