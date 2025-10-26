'use strict';

// če zmanjša levega na manj kot 2, ga izklopiš;
// izklop zvoka
// beats per bar
// i - noter licenca
// dodat uvajalno odštevanje (opcija);

// skala in kazalec;
const canv = document.getElementById('canvas'); // to je kanvas, na katerem je narisan krog in oznake dob;
const ctx = canv.getContext('2d');
const foreCanv = document.getElementById('foreground_canvas');  // to je kanvas, na katerem se odvija vrtenje;
const foreCtx = foreCanv.getContext('2d');
const foreCanvDiv = document.getElementById('foreground_canvas_div');

// gumbi;
const canvLBeat = document.getElementById('left_beat');
const ctxLBeat = canvLBeat.getContext('2d');
const canvRBeat = document.getElementById('right_beat');
const ctxRBeat = canvRBeat.getContext('2d');
const canvPlayStop = document.getElementById('center_control');
const ctxPlayStop = canvPlayStop.getContext('2d');

const rBeatDigit = document.getElementById('right_beat_digit');
const lBeatDigit = document.getElementById('left_beat_digit');

const canvTempo = document.getElementById('canv_tempo');
const ctxTempo = canvTempo.getContext('2d');
const displayTempo = document.getElementById('display_tempo');

const audioMain = new Audio('Perc_Can_hi.mp3');
const audioLeft = new Audio('Perc_Clap_hi.mp3');

// konstante
const RIGHT = 'r';
const LEFT = 'l';
const BOTH = 'b';
const INVALID = 'inv';  // neveljaven klik;
const TEMPO_UP = 'u';
const TEMPO_DOWN = 'd';

const bckgndColor = '#686868';  // preveri, da je isto v css!;
const btnColor = '#a2f083'; // kulska: #81D95E
const btnColorShaded = '#85ac75';   // #85ac75
const digitColrShaded = '#85ac75';    // #84c46bff ; včasih je bil gumb malo svetlejšo od cifer;

let baseDimension, notchLength, notchWidth, r, crclX /* polovica od width oz. hght canvasa; */, crclY;

let mainBeat = 4; // na desni oz. zunaj kroga;
let leftBeat = 3; // znotraj kroga;
let bpm = 60;   // beatsPerMinute; potem bo treba ločit še bars per minute;
const startRad = -Math.PI / 2; // to je kot točke, ki je na vrhu kroga;
const twoPI = 2 * Math.PI;
let revltnDurtn, revltnConst;
const frameDurtn = 20;  // na koliko ms se sproži interval, ki izrisuje kroženje;
let angle, prevT;   // angle služi hkrati tudi kot prevAngle;
let notchCoords = {
    main: [],
    left: []
}
let notchBlinks = {
    main: {
        active: [], // tu so shranjeni podatki, kako osvetlimo neko zarezo
        nextAngle: 0, // tu je shranjen podatek, pri katerem kotu dodamo nov active;
        nextIdx: 0 // tu je shranjen index, ki ga ima doba, ki bo NASLEDNJA blinkala (da bomo takrat, ko pridemo do nje, vedeli od kod jemat podatke);
    },
    left: {
        active: [],
        nextAngle: 0,
        nextIdx: 0
    }
};
const posOnCtrl = {
    top: 0,
    x: 0,
    y: 0
}

let tStart; // čas (v ms od 1970), ko se je začelo vrteti;
let isRotating = null;  // interval checker za vrtenje kazalca;
let tempoIntrvlChckr = null; // interval checker za tempo gumb;
let azzerato = false;   // to je za vodenje evidence (samo pri upravljanju s tipkami) al si esc pritisnil enkrat (samo ustaviš) ali večkrat (ponastaviš kazalec);
let mobile = false;
let mousePressIsValid = false;
const tempoCnvsRect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
}
let mouseOrTchPosOnTempo = {
    x : 0,
    y : 0,
    btn : 'none'
}

class Notch {
    constructor(x1, y1, x2, y2, angle) {
        this.start = {x: x1, y: y1};
        this.end = {x: x2, y: y2};
        this.angle = angle;
    }
}

function initialize() {
    defineRevltnDurtn();
    check4mobile();
    defineDimensions();
}

function check4mobile() {
    if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
        console.log('mobile');
        mobile = true;
    
        // screen.orientation.addEventListener("change", () => {
        //    to bo še treba 
        // });
    
    }
}

function defineDimensions() {
    if(!mobile) {
        baseDimension = 444;
        notchLength = 20;
        r = 200;    // baseDim - 2*20(notch) - 2*2 (zaradi debeline 3, da ni prirezano)
        canvPlayStop.width = 80;
    } else {
        let width = document.documentElement.clientWidth < window.innerWidth ? document.documentElement.clientWidth : window.innerWidth;
        if(screen.width < width) width = screen.width;
        if(width % 2 == 1) width = width - 1;
        baseDimension = width - 24; // 12 roba na vsaki strani;
        notchLength = 16;
        r = (baseDimension - 2 * 16 - 2 * 2) / 2;

        document.getElementById('home').style.position = 'absolute';
        document.getElementById('home').style.paddingTop = '0px';

        canvLBeat.style.marginTop = '16px';
        canvLBeat.style.marginRight = '8px';
        canvRBeat.style.marginTop = '16px';
        canvRBeat.style.marginLeft = '8px';
        canvPlayStop.style.marginTop = '24px'
        canvPlayStop.width = 60;

        const toRemove = document.getElementsByClassName('label')
        toRemove[0].innerHTML = '';
        toRemove[1].innerHTML = '';
    }

    crclX = baseDimension / 2;  // polovica od width oz. hght canvasa;
    crclY = baseDimension / 2;
    notchWidth = 7;

    canv.width = baseDimension;   // 404 je minimum, če je polmer 200 in debelina kroga 3 (središče je v 202, 202, torej polovica širine/dolžine);
    canv.height = baseDimension;
    foreCanv.width = baseDimension;
    foreCanv.height = baseDimension;

    canvLBeat.width = 60;
    canvLBeat.height = 136;
    canvRBeat.width = 60;
    canvRBeat.height = 136;
    canvPlayStop.height = 136;
    canvTempo.width = 48;
    canvTempo.height = 108;
}

function positionElems() {
    foreCanvDiv.style.top = `${canv.getBoundingClientRect().top}px`;
    foreCanvDiv.style.left = `${canv.getBoundingClientRect().left}px`;

    tempoCnvsRect.left = canvTempo.getBoundingClientRect().left;
    tempoCnvsRect.top = canvTempo.getBoundingClientRect().top;
    tempoCnvsRect.right = canvTempo.getBoundingClientRect().right;
    tempoCnvsRect.bottom = canvTempo.getBoundingClientRect().bottom;

    posOnCtrl.top = canvRBeat.getBoundingClientRect().top; // levi in desni gumb imata isti top, zato zabeležimo samo enkrat;

    rBeatDigit.style.left = `${canvRBeat.getBoundingClientRect().right}px`;
    rBeatDigit.style.top = `${posOnCtrl.top + 60 - 17}px`;  // -17 (al kolko pač) od oka da je črka bolja na sredini
    rBeatDigit.style.color = digitColrShaded;
    rBeatDigit.innerHTML = mainBeat;

    lBeatDigit.style.right = `${window.innerWidth - canvLBeat.getBoundingClientRect().left}px`;
    lBeatDigit.style.top = `${posOnCtrl.top + 60 - 17}px`;  // -17 (al kolko pač) od oka da je črka bolja na sredini
    lBeatDigit.style.color = digitColrShaded;
    lBeatDigit.innerHTML = leftBeat;
}

function atKeyPress(keyKey) {
    if(keyKey == 'Escape') {
        if (isRotating != null) stopRotation();
            else if(!azzerato) { azzerareAfterStop()};
    } else if(keyKey == 'Enter') {
        if (isRotating == null) { startRotating(); }
    }
}

function playStopBtnOprtn() {
    if(isRotating == null) startRotating();
    else stopRotation();
}

function click4BeatChg(e) {
    let actionedBeat, otherBeat;
    if(e.target == canvRBeat) {
        actionedBeat = mainBeat;
        otherBeat = leftBeat;
    } else {
        actionedBeat = leftBeat;
        otherBeat = mainBeat;
    }
    let doChange = false;
    posOnCtrl.y = e.clientY - posOnCtrl.top;
    if (posOnCtrl.y < 60) {
        if(actionedBeat < 12) {
            actionedBeat++;
            doChange = true;
        }
    } else if(posOnCtrl.y > 76) {
        if(actionedBeat > 2) {
            actionedBeat--;
            doChange = true;
        }
    }
    if(doChange) {
        stopRotation();
        if(e.target == canvRBeat) { 
            mainBeat = actionedBeat;
            rBeatDigit.innerHTML = mainBeat;
            setNotchCoords(RIGHT);
        } else {
            leftBeat = actionedBeat;
            lBeatDigit.innerHTML = leftBeat;
            setNotchCoords(LEFT);
        }
    }
}

function defineRevltnDurtn() {
    revltnDurtn = (60 / (bpm / mainBeat)) * 1000;  //  čas, potreben za en krog, v milisekundah; 60, ker 60 sekund v minuti;
    revltnConst = twoPI / revltnDurtn;
}

async function rotate() {
    // izračunamo kot, kamor trenutno kaže kazalec;
    const nowT = Date.now();
    const dT = nowT - prevT;
    const dAngle = dT * revltnConst // delež kota 360'; če ne bi prej izračunal konstante, bi bilo tako: dAngle = (dT / revltnDurtn) * twoPI;
    angle += dAngle;    // iz prevAngle arta aktualni angle;
    if(angle > twoPI) angle -= twoPI;
    prevT = nowT;   // lahko bi šlo v async;

    function helper(passBlinkCoords, passdNotchCoords) {

        // najprej pogledamo, al je treba dodat kak element v array za blinkanje;
        // tako zakomplicirano čekiranje, ker zadnja doba ima next angle 0 in tako bi imela vedno izpolnjen pogoj, da je večja od next angle, takrat je treba potrdit angle < notchCoords[1].angle;
        if (angle >= passBlinkCoords.nextAngle && (passBlinkCoords.nextAngle > 0 || angle < passdNotchCoords[1].angle)) { 
            // dodamo podatke za naslednji blink (sem pride tudi blink prve dobe takoj po štartu);
            const set = [];
            for (let i = 1; i <=6; i++) {  set.push(JSON.parse(JSON.stringify(passdNotchCoords[passBlinkCoords.nextIdx])));  }
            // set[0].color = '#00ffffff';
            // set[0].color = '#81ff50ff';
            
            const isMain = passdNotchCoords == notchCoords.main ? true : false;
            if(isMain) {
                set[0].color = '#fa0707ff';
                set[1].color = '#fa0707ff';
                set[2].color = '#fa0707ff';
                set[3].color = '#fa4646ff';
                set[4].color = '#fc8383ff';
            } else {
                set[0].color = '#0707faff';
                set[1].color = '#0707faff';
                set[2].color = '#0707faff';
                set[3].color = '#0707faff';
                set[4].color = '#0707faff';
            }
            
            // zadnja (enaka za vse možnosti);
            set[5].color = '#f0fff0';
    
            passBlinkCoords.active.push(set); // na začetku vrtenja je nextIdx == 0;
            // dodamo trigger za naslednji blink;
            // najprej njegov index;
            if (passBlinkCoords.nextIdx == passdNotchCoords.length - 1) passBlinkCoords.nextIdx = 0;
            else passBlinkCoords.nextIdx++;
            passBlinkCoords.nextAngle = passdNotchCoords[passBlinkCoords.nextIdx].angle // nato še njegov kot;

            // zvok;
            if(isMain) zvok(RIGHT)
                else zvok(LEFT);

        }
        // morebitno izvajanje blinkanja dob (zarez/notch); dogaja se v backCanv;
        if (passBlinkCoords.active.length > 0) {
            ctx.lineWidth = notchWidth;
            ctx.strokeStyle = passBlinkCoords.active[0][0].color;
            ctx.beginPath();
            ctx.moveTo(passBlinkCoords.active[0][0].start.x, passBlinkCoords.active[0][0].start.y);
            ctx.lineTo(passBlinkCoords.active[0][0].end.x, passBlinkCoords.active[0][0].end.y);
            ctx.stroke();
            passBlinkCoords.active[0].shift(); // po izvajanju odstranimo (prvi) element;
            if(passBlinkCoords.active[0].length == 0) {
                passBlinkCoords.active.length = 0;  // ne sme bit = [], ker to ustvari novo referenco na nov prazen array, tle pa delamo s podano referenco in bi jo tako uničili.
            }
        }
    }

    helper(notchBlinks.main, notchCoords.main);
    helper(notchBlinks.left, notchCoords.left);

    // kazalec (dogaja se v forecanv;)
    resetForeCanv();
    foreCtx.beginPath();
    foreCtx.arc(crclX, crclY, r, startRad + angle, startRad + angle); // finta, da se postaviš v določeno točko na krogu: končni kot daš isti kot začetni
    foreCtx.lineTo(crclX, crclY);
    foreCtx.stroke();
}

function startRotating() {
    // ponastavimo procesne vrednosti;
    prevT = Date.now();
    angle = 0;

    // ponastavimo videz ali kontrolno spremenljivko;
    if (!azzerato) {    // to prav pri prvem zagonu odveč riše še enkrat, ampak naj bo
        drawBckgnd(); // ker blinkanje (vsaj zdaj ko je fiksno) pusti sled na krogu, zato je pred novim vrtenjem treba narisat krog; vrstica gre pozneje ven, verjetno;
    } else azzerato = false;    // smo že ponastavili kazale, ni treba še enkrat izrisovat, je pa treba ponastavit ta checker;
    
    // zagon;
    rotate();   // ta je da obarvaš prvo dobo + narišeš ta prvo, navpično črto (ki ni narisana, če ne zaganjaš prvič) (črta se sicer trenutno riše že v drawBckgnd, ampak ta bo morda umaknjena);
    isRotating = setInterval(rotate, frameDurtn);
    restOfStartRottng();    // v async da ne dela zamud;
}

async function restOfStartRottng() {
    drawStopBtn();
    if(mobile) foreCanv.removeEventListener('touchstart', (e) => {touchAzzerareDial(e)}, {passive : false}); 
}

function stopRotation() {
    clearInterval(isRotating);
    isRotating = null;
    // azzeriramo podatke za blinkanje;
    notchBlinks.main.active = [];
    notchBlinks.main.nextAngle = 0;
    notchBlinks.main.nextIdx = 0;
    notchBlinks.left.active = [];
    notchBlinks.left.nextAngle = 0;
    notchBlinks.left.nextIdx = 0;
    drawPlayBtn();
    if(mobile) foreCanv.addEventListener('touchstart', (e) => {touchAzzerareDial(e)}, {passive : false});  // da s pritiskom številčnice ponastaviš kazalec (ki po zaustavitvi ostane, kjer je bil);
}

function resetForeCanv() {
    foreCanv.height = 0;
    foreCanv.height = baseDimension;
    foreCtx.strokeStyle = 'honeydew';
    foreCtx.lineWidth = 2;
}

function drawBckgnd() {
    // reset bckgCanvas
    canv.height = 0;
    canv.height = baseDimension;
    ctx.strokeStyle = 'honeydew';
    ctx.lineWidth = 3;
    // krog;
    ctx.beginPath();
    ctx.arc(crclX, crclY, r, 0, twoPI);
    ctx.stroke();

    // narisat oznake;
    function helper(which) {
        for (let i = 0; i < which.length; i++) {
            ctx.beginPath();
            ctx.moveTo(which[i].start.x, which[i].start.y);
            ctx.lineTo(which[i].end.x, which[i].end.y);
            ctx.stroke();
        }
    }

    ctx.strokeStyle = 'honeydew';
    ctx.lineWidth = notchWidth;
    helper(notchCoords.main);
    helper(notchCoords.left);

    // navpičen kazalec; ko odpreš program, mora bit navpičen kazalec že narisan in čaka;
    resetForeCanv();
    foreCtx.beginPath();
    foreCtx.moveTo(crclX, crclY  - r);
    foreCtx.lineTo(crclX, crclY);
    foreCtx.stroke();
}

function azzerareAfterStop() {
    azzerato = true;
    drawBckgnd(); // treba prav ozadje nova izrisat, da razbarvaš oznake, prestaviš kazalec in odstraniš ostanke obarvanj z robov oznak;
}

function setNotchCoords(WHICH) {    // ne samo izračuna oznake, ampak jih tudi izriše;

    function helper(passdBeat, passdNotchCoords) {
        const angleSlice = (Math.PI * 2) / passdBeat; // kot celega kroga deljeno s številom dob;
        const diff = passdNotchCoords == notchCoords.main ? 20 : -20;
        passdNotchCoords.length = 0; // spraznimo array; ne sme bit = [], ker to ustvari nov array in se zgubi referenca !!!!!;
        for (let i = 0; i < passdBeat; i++) {
            passdNotchCoords.push(
                new Notch(
                    crclX + Math.sin(i * angleSlice) * r,   // za točko na krogu
                    crclY - Math.cos(i * angleSlice) * r,
                    crclX + Math.sin(i * angleSlice) * (r + diff),    // za točko zunaj kroga
                    crclY - Math.cos(i * angleSlice) * (r + diff),
                    i * angleSlice
                )
            );
        }
    }

    if (WHICH == RIGHT || WHICH == BOTH) {
        helper(mainBeat, notchCoords.main)
    }
    if (WHICH == LEFT || WHICH == BOTH) {
        helper(leftBeat, notchCoords.left)
    }

    // izris ozadja in torej tudi oznak;
    drawBckgnd();
}

function zvok(which) {
    if (which == RIGHT) { audioMain.play(); } 
        else audioLeft.play();
}


//   -  -  -   IZVAJANJE  -  - 
initialize();
drawControls();
setNotchCoords(BOTH);
if (document.readyState == 'loading') {
    document.addEventListener("DOMContentLoaded", positionElems);  // domcontent loaded je lahko "complete" ali pa "interactive";
} else {
    positionElems;
}


//   -  -  -   POSLUŠALCI  -  -  vsaj en mora bit šele zdaj, ker je odvisen od stanja spremenljivke mobile;
document.addEventListener('keydown', e => { atKeyPress(e.key) });
canvRBeat.addEventListener('click', e => { click4BeatChg(e) });
canvLBeat.addEventListener('click', e => { click4BeatChg(e) });
canvPlayStop.addEventListener('click', playStopBtnOprtn);
if (!mobile) {  // poslušalci za spremembo tempa; najprej, če miška;
    canvTempo.addEventListener('mousedown', (e) => {mouseDownOprtn(e)});
    canvTempo.addEventListener('mouseleave', (e) => {mouseLeaveOprtn(e)});
    canvTempo.addEventListener('mouseup', (e) => {mouseUpOprtn(e)});
    canvTempo.addEventListener('mousemove', (e) => {mouseMoveOprtn(e)});
} else {
    canvTempo.addEventListener('touchstart', (e) => {touchStartOprtn(e)}, {passive : false});
    canvTempo.addEventListener('touchmove', (e) => {touchMoveOprtn(e)}, {passive : false});
    canvTempo.addEventListener('touchend', (e) => {touchEndOprtn(e)}, {passive : false});
}


