'use strict';

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

const midPoint = {
    x: wdth % 2 == 0 ? wdth / 2 : wdth / 2 + 0.5, 
    y: hght % 2 == 0 ? hght / 2 : hght / 2 + 0.5
}
// koti; ekran od leve do desne je 3.0 radiana (malo manj kot 180', kao oponaša vidno polje človeka), pomeni da je midPoint.x = 1.5 (ali tam nekje); zdaj izračunamo še, kolikšen kot je lahko po vertikali 
const FISHEYE = 1.45;
const TELEANGLE = 0.25;
let hrzRadsFrmCentr = FISHEYE;
let vertRadsFrmCentr;
calcVertRadsFrmCentr();
function calcVertRadsFrmCentr(){
    vertRadsFrmCentr = (Math.round(10000 * (midPoint.y * hrzRadsFrmCentr) / midPoint.x)) / 10000;
}  
console.log(wdth, hght, midPoint, vertRadsFrmCentr);

function calcScreenPts(spacePoints) {
    const scrnPts = new Array();
    spacePoints.forEach(element => {
        const scrnPt = new ScreenPoint();
        //x
        // glavna logika je Math.atan2(offset(od navpičnice, vodoravnice), razdalja do tja);
        scrnPt.x = midPoint.x + (Math.atan2(element.x - viewer.x, ((element.y + viewer.y)**2 + (element.z + viewer.z)**2 )**(1/2))/hrzRadsFrmCentr) * midPoint.x;
            // (element.y**2 + element.z**2)**(1/2) - je glavna scena, da upošteva, da se recimo nebotičnik proti navzgor oža;

        // y;
        scrnPt.y = midPoint.y + (Math.atan2(element.z + viewer.z, ((element.y + viewer.y)**2  + (element.x - viewer.x)**2 )**(1/2))/vertRadsFrmCentr) * midPoint.y;

        scrnPts.push(scrnPt);
    });

    return scrnPts;

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

const viewer = new SpacePoint(0, 0, 1.7);
// na začetku ima gledalec privzeto spacePoint 0,0,1.7 (kao visok 1.7m) in gleda naravnost naprej vzdolž osi y, torej v {0,neskončno,1.7}

// - - - - - -  DODAJANJE STVARI - - - - - -
const cubes = [];
// navpične kocke;
for (let i = 0; i <= 16; i += 4) {
    cubes.push(new Cube(new SpacePoint(6, 20, i), 4))
};
// vodoravne kocke;
for (let i = 10; i <= 46; i += 4) {
    cubes.push(new Cube(new SpacePoint(i, 20, 0), 4))
};

const pickupTruck = new Pickup(new SpacePoint(5, 5, 0));

// const line1 = new Connection(new SpacePoint(-4, 0, 0), new SpacePoint(-4, 2000, 0));
const line1_1 = new Connection(new SpacePoint(-4, 0, 0), new SpacePoint(-4, 2, 0));
const line1_2 = new Connection(new SpacePoint(-4, 2, 0), new SpacePoint(-4, 4, 0));
const line1_3 = new Connection(new SpacePoint(-4, 4, 0), new SpacePoint(-4, 8, 0));
const line1_4 = new Connection(new SpacePoint(-4, 8, 0), new SpacePoint(-4, 16, 0));
const line1_5 = new Connection(new SpacePoint(-4, 16, 0), new SpacePoint(-4, 2000, 0));
const line2 = new Connection(new SpacePoint(4, 0, 0), new SpacePoint(4, 2000, 0));  // opazi, kako je line2 ravna in tudi posga v avto, ko grejo predmeti zadosti desno; razdeljena linija 2 pa je OK z avtom;
const line2_1 = new Connection(new SpacePoint(4, 0, 0), new SpacePoint(4, 2, 0));
const line2_2 = new Connection(new SpacePoint(4, 2, 0), new SpacePoint(4, 4, 0));
const line2_3 = new Connection(new SpacePoint(4, 4, 0), new SpacePoint(4, 8, 0));
const line2_4 = new Connection(new SpacePoint(4, 8, 0), new SpacePoint(4, 16, 0));
const line2_5 = new Connection(new SpacePoint(4, 16, 0), new SpacePoint(4, 2000, 0));
const dividingLines = [];
for (let i = 2; i <= 302; i += 10) {
    dividingLines.push(new HorzRectangle(new SpacePoint(-0.1, i, 0), 0.2, 3))
};


//  - - - - - -   IZRIS DODANIH STVARI   - - - - - -
const activeItems = [/*line1,*/ line1_1, line1_2, line1_3, line1_4, line1_5, line2, line2_1, line2_2,
    line2_3, line2_4, line2_5, ...dividingLines, ...cubes, pickupTruck];
activeItems.forEach(elt => {
    elt.draw(calcScreenPts(elt.spacePoints))
});


// - - - -  CONTROLS  - - - - - -
document.addEventListener('keydown', atKeyPress);
const LEFT = 'l';
const RIGHT = "r";
const CLOSER = "c";
const FAR = 'f';

function moveItems(toWhere){
    clearCanvas();
    activeItems.forEach(el => el.move(toWhere));
}

function atKeyPress(e){
    if (e.key == 'ArrowLeft') { moveItems(LEFT) }
    else if (e.key == 'ArrowRight') { moveItems(RIGHT);}
    else if (e.code == 'KeyC') { moveItems(CLOSER) }
    else if (e.code == 'KeyF') { moveItems(FAR)  }
}

const lensBtns = document.getElementsByClassName('lens');
lensBtns[0].addEventListener('click', lensBtnOprtn);
lensBtns[1].addEventListener('click', lensBtnOprtn);
function lensBtnOprtn(evt){
    if (evt.target.classList.contains('lens-unselected')) {
        if (lensBtns[0].classList.contains('lens-selected')) {
            changeLens(true);
        } else changeLens(false);
        lensBtns[0].classList.toggle('lens-selected');
        lensBtns[1].classList.toggle('lens-selected');
        lensBtns[0].classList.toggle('lens-unselected');
        lensBtns[1].classList.toggle('lens-unselected');
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

const zoomBtns = document.getElementsByClassName('zoom');
zoomBtns[0].addEventListener('click', zoomBtnsOprtn);
zoomBtns[1].addEventListener('click', zoomBtnsOprtn);
function zoomBtnsOprtn(e){
    if (e.target == zoomBtns[0]) { moveItems(CLOSER); }
    else { moveItems(FAR); }
}

const panBtns = document.getElementsByClassName('pan');
panBtns[0].addEventListener('click', panBtnsOprtn);
panBtns[1].addEventListener('click', panBtnsOprtn);
function panBtnsOprtn(e){
    if (e.target == panBtns[0]) { moveItems(LEFT); }
    else { moveItems(RIGHT); }
}