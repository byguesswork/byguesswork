'use strict';

// če bi hotel preuredit točke, ki so gledalcu za hrbtom in pokvarijo kote, bi moral to preurejanje (y bi moral ekstrapolirat na recimo 0,1)..
// naredit pred preračunavanjem calcScreenPoints; polg tega bi moral naredit nove povezave, ker ista točka lahko recimo nastopa v več povezavah..
// in potem je treba naredit ločeno ekstrapolacijo za vsako od povezav;

// dodat kšne opise v index.html (recimo za fuel: I like its simplicity, maybe you will too)

// probat uno idejo s koti, da do desnega roba ne greš sorazmerno s piksli, ampak glede na naraščanje kota!! 

const wdth = window.innerWidth - 5; // -5 , da ni skrolbara;
const hght = window.innerHeight - 5;
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
const someBrdr = document.getElementById('controls').getBoundingClientRect().top;
document.getElementById('mode').style.bottom = `${hght - someBrdr + 25}px`;


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
        scrnPt.x = scrnMidPoint.x + (Math.atan2(spcPt.x - viewer.posIn3D.x, ((spcPt.y - viewer.posIn3D.y)**2 + (spcPt.z + viewer.posIn3D.z)**2 )**(1/2))/hrzRadsFrmCentr) * scrnMidPoint.x;
        // (spcPt.y**2 + spcPt.z**2)**(1/2) - je glavna scena, da upošteva, da se recimo nebotičnik proti navzgor oža;
        
        // y;
        scrnPt.y = scrnMidPoint.y + (Math.atan2(spcPt.z + viewer.posIn3D.z, ((spcPt.y - viewer.posIn3D.y)**2  + (spcPt.x - viewer.posIn3D.x)**2 )**(1/2))/vertRadsFrmCentr) * scrnMidPoint.y;
        
        scrnPts.push(scrnPt);
    });
    
    return scrnPts;
    
}

function rotate(spunOne, dirctn){
    // gledamo samo vodoravno ravnino, kje x rase proti desno, y proti stran od gledalca;
    
    // najprej najst središčno točko, za zdaj s simple aritmetično sredino največjih in najmanjših
    let xMin = spunOne.spacePoints[0].x;
    let xMax = spunOne.spacePoints[0].x;    // za zdaj so lahko enaki, se bojo spremenili med naslednjo primerjavo;
    let yMin = spunOne.spacePoints[0].y;
    let yMax = spunOne.spacePoints[0].y;
    spunOne.spacePoints.forEach(el => {
        //x, lahko z elsom;
        if (el.x < xMin) xMin = el.x;
        else if (el.x > xMax) xMax = el.x;
        // y;
        if (el.y < yMin) yMin = el.y;
        else if (el.y > yMax) yMax = el.y;
    });
    const center = {x: (xMin + xMax) / 2, y: (yMin + yMax) / 2};
    
    // preslikava prostorskih točk na dvodimenzionalno ravnino;
    const centeredShapeOnPlane = [];
    spunOne.spacePoints.forEach(el => {
        const x = el.x - center.x;
        const y = el.y - center.y;
        centeredShapeOnPlane.push({x: x, y: y, r: (x**2 + y**2)**(0.5)} )
    })
    
    const rotationAngleIncrmnt = Math.PI/16;
    const dAngle = dirctn == ANTICLOCKW ? rotationAngleIncrmnt : -rotationAngleIncrmnt;
    centeredShapeOnPlane.forEach((el, i) => {
        // predpostavka, da se kot meri od pozitivne x osi navzgor (proti pozitivni y osi), tj. stran od gledalca;
        // ŽE KAR TAKOJ prištejemo kot zasuka;
        if (el.x > 0) {
            if (el.y < 0) el.angle = 2* Math.PI + Math.asin(el.y/el.r) + dAngle; // +, ker je kot (asin) pri y<0 negativen;
            else el.angle = Math.asin(el.y/el.r) + dAngle; // 
        } else if (el.x < 0) {
            el.angle = Math.PI - Math.asin(el.y/el.r) + dAngle; // tuki, zanimivo, v obeh y primerih isti izraz, zato ga napišem samo enkrat;
        } else if (el.x == 0) {
            if (el.y < 0) el.angle = 1.5 * Math.PI + dAngle;
            else el.angle = 0.5 * Math.PI + dAngle;
        }
        //zdaj, ko smo dobili nov kot, že kar lahko izračunamo nov x in nov y in ga pripišemo ciljnemu telesu;
        spunOne.spacePoints[i].x = el.r * Math.cos(el.angle) + center.x;
        spunOne.spacePoints[i].y = el.r * Math.sin(el.angle) + center.y;
    });

    // narišemo novo stanje;
    clearCanvas();
    spunOne.draw(calcScreenPts(spunOne.spacePoints));
}


//  - - - -  AJDE  - - -
const viewer = new Viewer(0, 0, 1.7);
// na začetku ima gledalec privzeto spacePoint 0,0,1.7 (kao visok 1.7m) in gleda naravnost naprej vzdolž osi y, torej v {0,neskončno,1.7}


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

const rotateItems = [pickupTruckRotate];

let activeItems = landscapeItems;


//  - - - - - -   ZAČETNI IZRIS PRIVZETEGA KATALOGA   - - - - - -
activeItems.forEach(elt => {
    elt.draw(calcScreenPts(elt.spacePoints))
});


// - - - -  CONTROLS  - - - - - -
document.addEventListener('keydown', atKeyPress);
const LEFT = 'l';
const RIGHT = "r";
const CLOSER = "c";
const FAR = 'f';
const UP = 'u';
const DOWN = 'd';
const CLOCKW = 'cw';
const ANTICLOCKW = 'acw';

function moveViewer(toWhere){
    viewer.move(toWhere);
    clearCanvas();
    activeItems.forEach(el => el.draw(calcScreenPts(el.spacePoints)));
}

function atKeyPress(e){
    if (e.key == 'ArrowLeft') { moveViewer(LEFT) }
    else if (e.key == 'ArrowRight') { moveViewer(RIGHT);}
    else if (e.code == 'KeyC') { moveViewer(CLOSER) }
    else if (e.code == 'KeyF') { moveViewer(FAR)  }
    else if (e.key == 'ArrowUp') { moveViewer(UP);}
    else if (e.key == 'ArrowDown') { moveViewer(DOWN);}
    else if (e.code == 'KeyI') {
        if (activeItems.length == 1) rotate(activeItems[0], ANTICLOCKW);
    } else if (e.code == 'KeyO') {
        if (activeItems.length == 1) rotate(activeItems[0], CLOCKW);
    }
}

const rotateDiv = document.getElementById('rotate');
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
            rotateDiv.classList.remove('hidden');
            activeItems = rotateItems;
        } else {
            rotateDiv.classList.add('hidden');
            activeItems = landscapeItems;
        }
        clearCanvas();
        activeItems.forEach(element => {
            element.draw(calcScreenPts(element.spacePoints))
        });        
    }
}

const lensBtns = document.getElementsByClassName('lens');
lensBtns[0].addEventListener('click', lensBtnOprtn);
lensBtns[1].addEventListener('click', lensBtnOprtn);
function lensBtnOprtn(evt){
    if (evt.target.classList.contains('unselected')) {
        if (lensBtns[0].classList.contains('selected')) {
            changeLens(true);
        } else changeLens(false);
        lensBtns[0].classList.toggle('selected');
        lensBtns[1].classList.toggle('selected');
        lensBtns[0].classList.toggle('unselected');
        lensBtns[1].classList.toggle('unselected');
    }

    function changeLens(doFish){
        if (doFish) hrzRadsFrmCentr = FISHEYE;
        else hrzRadsFrmCentr = TELEANGLE;
        calcVertRadsFrmCentr();
        clearCanvas();
        activeItems.forEach(element => {
            element.draw(calcScreenPts(element.spacePoints))
        });        
    }
}

const rotateBtns = document.getElementsByClassName('rotate');
rotateBtns[0].addEventListener('click', rotateBtnsOprtn);
rotateBtns[1].addEventListener('click', rotateBtnsOprtn);
function rotateBtnsOprtn(e){
    if (e.target == rotateBtns[0]) { rotate(activeItems[0], CLOCKW); }
    else { rotate(activeItems[0], ANTICLOCKW); }
}

const zoomBtns = document.getElementsByClassName('zoom');
zoomBtns[0].addEventListener('click', zoomBtnsOprtn);
zoomBtns[1].addEventListener('click', zoomBtnsOprtn);
function zoomBtnsOprtn(e){
    if (e.target == zoomBtns[0]) { moveViewer(CLOSER); }
    else { moveViewer(FAR); }
}

const panBtns = document.getElementsByClassName('pan');
panBtns[0].addEventListener('click', panBtnsOprtn);
panBtns[1].addEventListener('click', panBtnsOprtn);
function panBtnsOprtn(e){
    if (e.target == panBtns[0]) { moveViewer(RIGHT); }
    else { moveViewer(LEFT); }
}

const riseBtns = document.getElementsByClassName('rise');
riseBtns[0].addEventListener('click', riseBtnsOprtn);
riseBtns[1].addEventListener('click', riseBtnsOprtn);
function riseBtnsOprtn(e){
    if (e.target == riseBtns[0]) { moveViewer(UP); }
    else { moveViewer(DOWN); }
}