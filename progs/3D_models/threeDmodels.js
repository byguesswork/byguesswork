'use strict';

// element.draw v listenerjih za lens in mode je treba zaobit, ker zdaj ne rišemo več z draw ampak unim drugim

// težava, ker v calcReltvSpcPtsAndDraw "predpostavka, da se kot meri od pozitivne x osi navzgor (proti pozitivni y osi), tj. stran od gledalca;"
// viewer pa gleda kot glede na pozitivno os y

// interpolacija y-na na 0 že kar v calcReltvSpcPtsAndDraw

// probat uno idejo s koti, da do desnega roba ne greš sorazmerno s piksli, ampak glede na naraščanje kota!! 

// če bi hotel preuredit točke, ki so gledalcu za hrbtom in pokvarijo kote, bi moral to preurejanje (y bi moral ekstrapolirat na recimo 0,1)..
// naredit pred preračunavanjem calcScreenPoints; polg tega bi moral naredit nove povezave, ker ista točka lahko recimo nastopa v več povezavah..
// in potem je treba naredit ločeno ekstrapolacijo za vsako od povezav;

// dodat kšne opise v index.html (recimo za fuel: I like its simplicity, maybe you will too)


const wdth = document.documentElement.clientWidth - 5; // -5 , da ni skrolbara; prej je bilo window.innerWidth, ampak ni ok, vsaj višina ne, prevelika pride;
const hght = document.documentElement.clientHeight - 5;
const canvas = document.getElementById('canvas');
canvas.height = hght;
canvas.width = wdth;
const ctx = canvas.getContext('2d');
const bckgndColr = '#4e4e4c';
const lineColor = '#f0fff0';
ctx.lineWidth = 1;
ctx.strokeStyle = lineColor;
Thingy.meetCtx(ctx);

const scrnMidPoint = {
    x: wdth % 2 == 0 ? wdth / 2 : wdth / 2 + 0.5, 
    y: hght % 2 == 0 ? hght / 2 : hght / 2 + 0.5
}
// koti; ekran od leve do desne je 3.0 radiana (malo manj kot 180', kao oponaša vidno polje človeka), pomeni da je scrnMidPoint.x = 1.5 (ali tam nekje); zdaj izračunamo še, kolikšen kot je lahko po vertikali 
const FISHEYE = 1.45;
const TELEANGLE = 0.3;
let hrzRadsFrmCentr = FISHEYE;
let vertRadsFrmCentr;
calcVertRadsFrmCentr();
function calcVertRadsFrmCentr(){    // kliče se vsakokrat, ko zamenjaš narrowAngle/fish eye;
    vertRadsFrmCentr = (Math.round(10000 * (scrnMidPoint.y * hrzRadsFrmCentr) / scrnMidPoint.x)) / 10000;
    // if (vertRadsFrmCentr > hrzRadsFrmCentr) vertRadsFrmCentr = hrzRadsFrmCentr; // čebi hotel dat to, bi moral omejit tudi višino, do katere sega canvas..
    // canvas bi v takem primeru moral naredit kvadrat, ker zdaj poskuša isti majhen kot raztegnit do vrha pokončnega telefona in tako sliko raztegne navzgor;
}  
console.log(wdth, hght, scrnMidPoint, vertRadsFrmCentr);

// najprej mobilca, ker to lahko spremeni postavitev;
let mobile = false;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {
    mobile = true;
    const spans2remv = [...document.getElementsByClassName('not_if_mobile')];
    spans2remv.forEach(el => el.classList.add('hidden'));
}

// šele po morebitni spremembi zaradi mobile umestimo zgornji okvir;
const modeRectHght = document.getElementById('controls').getBoundingClientRect().height;
document.getElementById('mode').style.bottom = `${30 + modeRectHght + 25}px`;   // 30 ker ima sklop pod njim bottom 30; 25 je arbitrarna meja med skopoma 



//  - - - -   FUNKCIJE   - - - -
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

function calcScreenPts(spacePoints) {
    const scrnPts = new Array();
    spacePoints.forEach(spcPt => {
        // glavna logika je Math.atan2(offset(od navpičnice, vodoravnice), razdalja do tja);
        // računanje hipotenuze služi upoštevanju tega, da če je neka stvar nisoko, je v bistvu tudi oddaljena;
        // odštevanje viewer.x (y, z) je zato, da se upošteva gledišče viewerja  
        // tudi če ozkokotni pogled prikažeš cel (s faktorjem 0,2) ni čisto nič drugačen od fish eye; spreminjanje kota torej ne reši ukrivljenosti, bo treba druga metoda;
        
        const scrnPt = new ScreenPoint();
        //x
        scrnPt.x = scrnMidPoint.x + (Math.atan2(spcPt.x - activeViewer.posIn3D.x, ((spcPt.y - activeViewer.posIn3D.y)**2 + (spcPt.z + activeViewer.posIn3D.z)**2 )**(1/2))/hrzRadsFrmCentr) * scrnMidPoint.x;
        // (spcPt.y**2 + spcPt.z**2)**(1/2) - je glavna scena, da upošteva, da se recimo nebotičnik proti navzgor oža;
        
        // y;
        scrnPt.y = scrnMidPoint.y + (Math.atan2(spcPt.z + activeViewer.posIn3D.z, ((spcPt.y - activeViewer.posIn3D.y)**2  + (spcPt.x - activeViewer.posIn3D.x)**2 )**(1/2))/vertRadsFrmCentr) * scrnMidPoint.y;
        
        scrnPts.push(scrnPt);
    });
    
    return scrnPts;
}

function calcReltvSpcPtsAndDraw(){ // calculate relative spacePoints, tj. od viewerja do predmetov;
    let viewngAngle, center;
    if (activeItems == landscapeItems) {
        center = {x: activeViewer.posIn3D.x, y: activeViewer.posIn3D.y};    // activeViewer je v tem primeru itak landscapeViewer;
        viewngAngle = activeViewer.angle;
        // console.log(Math.trunc(activeViewer.angle * 1000) / 1000, Math.trunc(Math.sin(activeViewer.angle) * 100) / 100,
        // 'cos:',  Math.trunc(Math.cos(activeViewer.angle) * 100) / 100);
    } else {
        if (obj2Rotate.center == undefined) {
            // s simple aritmetično sredino največjih in najmanjših;
            let xMin = activeItems[0].spacePoints[0].x;
            let xMax = activeItems[0].spacePoints[0].x;    // za zdaj so lahko enaki, se bojo spremenili med naslednjo primerjavo;
            let yMin = activeItems[0].spacePoints[0].y;
            let yMax = activeItems[0].spacePoints[0].y;
            activeItems[0].spacePoints.forEach(el => {
                //x, lahko z elsom;
                if (el.x < xMin) xMin = el.x;
                else if (el.x > xMax) xMax = el.x;
                // y;
                if (el.y < yMin) yMin = el.y;
                else if (el.y > yMax) yMax = el.y;
            });
            obj2Rotate.center = {x: (xMin + xMax) / 2, y: (yMin + yMax) / 2};
        }
        center = obj2Rotate.center;
        viewngAngle = obj2Rotate.angle;
    }

    activeItems.forEach(spunItem => {
        // preslikava prostorskih točk na dvodimenzionalno ravnino, ..
        // ..toda ne navpično ravnino, kot je monitor, ampak vodoravno (x rase proti desno, y raste stran od gledalca);
        
        let allYNeg = true; // beleži, ali so vse y koordinate nekega predmeta negativne, tj. gledalcu za hrbtom; če tako, ničesar ne izrišemo, ker gre le za zrcalno sliko, ki je za hrbtom;
        const item2Draw = new Array();   // item2Draw je nov objekt, da ne spreminjamo dejanskih koordinat teles v prostoru (telesa ostajajo na istih točkah),..
                                // ..ampak da dobimo relativne koordinate glede na center vrtenja in jih podamo v spunItem.draw (in tako dobimo na voljo še connections);
        spunItem.spacePoints.forEach(spcPt => {
            let x = spcPt.x - center.x;  // x in y relativiziramo;
            let y = spcPt.y - center.y;
            const r = (x**2 + y**2)**(0.5);
            let angle;

            // predpostavka, da se kot meri od pozitivne x osi navzgor (proti pozitivni y osi), tj. stran od gledalca;
            // izračunamo kot točke z relativnimix in y koordinatami in ŽE KAR TAKOJ prištejemo kot zasuka;
            if (x > 0) {
                angle = Math.asin(y/r) + viewngAngle;
            } else if (x < 0) {
                angle = Math.PI - Math.asin(y/r) + viewngAngle;
            } else if (x == 0) {
                if (y < 0) angle = 1.5 * Math.PI + viewngAngle;
                else angle = 0.5 * Math.PI + viewngAngle;
            }
            //zdaj, ko smo dobili nov kot, že kar lahko izračunamo nov x in nov y relativne točke, ki bo izrisana;
            x = r * Math.cos(angle) + center.x;
            y = r * Math.sin(angle) + center.y;
            item2Draw.push(new SpacePoint(x, y, spcPt.z)); // z-ja ni treba nič preračunavat
            if (y > 0) allYNeg = false;
        })
    
        // narišemo novo stanje, ampak samo če niso vse y koordinate negativne, ker v slednjem primeru gre za zrcalno sliko za hrbtom;
        if (!allYNeg) spunItem.draw(calcScreenPts(item2Draw));
    })
}


//  - - - -  AJDE  - - -
const landscapeViewer = new Viewer(0, 0, 1.7);   // na začetku ima gledalec privzeto spacePoint 0,0,1.7 (kao visok 1.7m), gleda naravnost vzdolž osi y, torej v {0,neskončno,1.7}, tj. kot 0;
const obj2RotateViewer = new Viewer (0, 0, 1.7);
const obj2Rotate = {
    angle : 0,  // kot 0 gleda vzdolž osi y, v smeri naraščanja y;
    rotnAngleIncrmnt : Math.PI/30,
    center: undefined
};

// - - - - - -  USTVARJANJE STVARI, KI BODO NA EKRANU - - - - - -
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
const pickupTruckLndscp = new Pickup(new SpacePoint(5, 5, 0));
const pickupTruckRotate = new Pickup(new SpacePoint(1, 5, 0));

// rob ceste;
const line1 = new Connection(new SpacePoint(-4, 0, 0), new SpacePoint(-4, 2000, 0));      // opazi, kako je line1 ravna in se ne ujema s segmentirano črto;
const line1_1 = new Connection(new SpacePoint(-4, 0, 0), new SpacePoint(-4, 2, 0));
const line1_2 = new Connection(new SpacePoint(-4, 2, 0), new SpacePoint(-4, 4, 0));
const line1_3 = new Connection(new SpacePoint(-4, 4, 0), new SpacePoint(-4, 8, 0));
const line1_4 = new Connection(new SpacePoint(-4, 8, 0), new SpacePoint(-4, 16, 0));
const line1_5 = new Connection(new SpacePoint(-4, 16, 0), new SpacePoint(-4, 2000, 0));
const line2 = new Connection(new SpacePoint(4, 0, 0), new SpacePoint(4, 2000, 0));  // opazi, kako je line2 ravna in tudi posega v avto, ko gre gledalec zadosti levo; segmentirana linija 2 pa je OK z avtom;
const line2_1 = new Connection(new SpacePoint(4, 0, 0), new SpacePoint(4, 2, 0));
const line2_2 = new Connection(new SpacePoint(4, 2, 0), new SpacePoint(4, 4, 0));
const line2_3 = new Connection(new SpacePoint(4, 4, 0), new SpacePoint(4, 8, 0));
const line2_4 = new Connection(new SpacePoint(4, 8, 0), new SpacePoint(4, 16, 0));
const line2_5 = new Connection(new SpacePoint(4, 16, 0), new SpacePoint(4, 2000, 0));

// črte na sredini ceste;
const dividingLines = [];
for (let i = 2; i <= 302; i += 10) {
    dividingLines.push(new HorzRectangle(new SpacePoint(-0.1, i, 0), 0.2, 3))
};

// - - - - - -  DODAJANJE STVARI V KATALOGE  - - - - - -
const landscapeItems = [line1, line1_1, line1_2, line1_3, line1_4, line1_5, /*line2*/, line2_1, line2_2,
    line2_3, line2_4, line2_5, ...dividingLines, ...cubes, pickupTruckLndscp];

const objRotateItems = [pickupTruckRotate];

let activeItems = landscapeItems;
let activeViewer = landscapeViewer;


//  - - - - - -   ZAČETNI IZRIS PRIVZETEGA KATALOGA   - - - - - -
activeItems.forEach(elt => {
    elt.draw(calcScreenPts(elt.spacePoints))
});

// - - - -  CONTROLS  - - - - - -
document.addEventListener('keydown', atKeyPress);
const LEFT = 'l';
const RIGHT = "r";
const FORWARD = "c";
const BACK = 'f';
const UP = 'u';
const DOWN = 'd';
const CLOCKW = 'cw';
const ANTICLOCKW = 'acw';

function moveViewer(toWhere){
    activeViewer.move(toWhere, activeViewer);
    console.log(Math.trunc(activeViewer.posIn3D.x * 100) / 100, Math.trunc(activeViewer.posIn3D.y * 100) / 100, Math.trunc(activeViewer.posIn3D.z * 100) / 100,
'kot:', Math.trunc(activeViewer.angle * 100) / 100);
    clearCanvas();
    calcReltvSpcPtsAndDraw();
}

function rotateViewer(dir){
    activeViewer.rotate(dir);   // samo landscapeViewer pride sem;
    clearCanvas();
    calcReltvSpcPtsAndDraw();
}

function rotateObj(dir){
    if (dir == ANTICLOCKW) obj2Rotate.angle += obj2Rotate.rotnAngleIncrmnt;
        else obj2Rotate.angle -= obj2Rotate.rotnAngleIncrmnt;
    clearCanvas();
    calcReltvSpcPtsAndDraw();
}

function atKeyPress(e){
    if (e.key == 'ArrowLeft') { moveViewer(LEFT) }
    else if (e.key == 'ArrowRight') { moveViewer(RIGHT);}
    else if (e.key == 'ArrowUp') { moveViewer(FORWARD) }  //e.code == 'KeyC'
    else if (e.key == 'ArrowDown') { moveViewer(BACK)  }
    else if (e.code == 'KeyU') { moveViewer(UP);}
    else if (e.code == 'KeyJ') { moveViewer(DOWN);}
    else if (e.code == 'KeyI') {
        if (activeItems.length > 1) rotateViewer(ANTICLOCKW);
        else rotateObj(ANTICLOCKW);
    } else if (e.code == 'KeyO') {
        if (activeItems.length > 1) rotateViewer(CLOCKW);
        else rotateObj(CLOCKW);
    } else if (e.code == 'KeyN') {
        if (lensBtns[0].classList.contains('unselected')) { changeLens(false); }
    } if (e.code == 'KeyF') {
        if (lensBtns[1].classList.contains('unselected')) { changeLens(true); }
    }
}

const modeBtns = document.getElementsByClassName('mode');
modeBtns[0].addEventListener('click', modeBtnOprtn);
modeBtns[1].addEventListener('click', modeBtnOprtn);
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
        } else {
            activeItems = landscapeItems;
            activeViewer = landscapeViewer;
        }
        clearCanvas();
        activeItems.forEach(element => {
            element.draw(calcScreenPts(element.spacePoints))
        });        
    }
}

//  - - - - - - - - - 2 povezani funkciji
function changeLens(doFish){    // to lahko kličeš tudi s tipkamiM
    lensBtns[0].classList.toggle('selected');
    lensBtns[1].classList.toggle('selected');
    lensBtns[0].classList.toggle('unselected');
    lensBtns[1].classList.toggle('unselected');
    if (doFish) hrzRadsFrmCentr = FISHEYE;
    else hrzRadsFrmCentr = TELEANGLE;
    calcVertRadsFrmCentr();
    clearCanvas();
    activeItems.forEach(element => {
        element.draw(calcScreenPts(element.spacePoints))
    });        
}

const lensBtns = document.getElementsByClassName('lens');
lensBtns[0].addEventListener('click', lensBtnOprtn);
lensBtns[1].addEventListener('click', lensBtnOprtn);
function lensBtnOprtn(evt){
    if (evt.target.classList.contains('unselected') || evt.target.parentElement.classList.contains('unselected')) {
        if (lensBtns[0].classList.contains('selected')) {
            changeLens(true);
        } else changeLens(false);
    }
}
//  - - - - - - - - - !2 povezani funkciji

const rotateBtns = document.getElementsByClassName('rotate');
rotateBtns[0].addEventListener('click', rotateBtnsOprtn);
rotateBtns[1].addEventListener('click', rotateBtnsOprtn);
function rotateBtnsOprtn(e){
    if (e.target == rotateBtns[0] || e.target.parentElement == rotateBtns[0]) {
        if (activeItems.length > 1) rotateViewer(CLOCKW);
        else rotateObj(CLOCKW);
    } else {
        if (activeItems.length > 1) rotateViewer(ANTICLOCKW);
        else rotateObj(ANTICLOCKW);
    }
}

const proceedBtns = document.getElementsByClassName('proceed');
proceedBtns[0].addEventListener('click', proceedBtnsOprtn);
proceedBtns[1].addEventListener('click', proceedBtnsOprtn);
function proceedBtnsOprtn(e){
    if (e.target == proceedBtns[0] || e.target.parentElement == proceedBtns[0]) { moveViewer(FORWARD); }
    else { moveViewer(BACK); }
}

const panBtns = document.getElementsByClassName('pan');
panBtns[0].addEventListener('click', panBtnsOprtn);
panBtns[1].addEventListener('click', panBtnsOprtn);
function panBtnsOprtn(e){
    if (e.target == panBtns[0] || e.target.parentElement == panBtns[0]) { moveViewer(RIGHT); }
    else { moveViewer(LEFT); }
}

const riseBtns = document.getElementsByClassName('rise');
riseBtns[0].addEventListener('click', riseBtnsOprtn);
riseBtns[1].addEventListener('click', riseBtnsOprtn);
function riseBtnsOprtn(e){
    if (e.target == riseBtns[0] || e.target.parentElement == riseBtns[0]) { moveViewer(UP); }
    else { moveViewer(DOWN); }
}