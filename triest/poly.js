'use strict';

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

const audioMain = new Audio('Perc_Can_hi.mp3');
const audioLeft = new Audio('Perc_Clap_hi.mp3');

// listenerji
document.addEventListener('keydown', e => { atKeyPress(e.key) });
canvRBeat.addEventListener('click', e => { beatClick(e) });
canvLBeat.addEventListener('click', e => { beatClick(e) });
canvPlayStop.addEventListener('click', atClickEvent);

// konstante
const RIGHT = 'r';
const LEFT = 'l';
const BOTH = 'b';

const bckgndColor = '#686868';  // preveri, da je isto v css!;
const btnColor = '#a2f083ff';
const btnColorShaded = '#84c46bff';

const baseDimension = 436;
const r = 200;
const crclX = baseDimension / 2;  // polovica od width oz. hght canvasa;
const crclY = baseDimension / 2;
const notchWidth = 7;

canv.width = baseDimension;   // 404 je minimum, če je polmer 200 in debelina kroga 3 (središče je v 202, 202, torej polovica širine/dolžine);
canv.height = baseDimension;
foreCanv.width = baseDimension;
foreCanv.height = baseDimension;

canvLBeat.width = 60;
canvLBeat.height = 136;
canvRBeat.width = 60;
canvRBeat.height = 136;
canvPlayStop.width = 80;
canvPlayStop.height = 136;

let mainBeat = 4; // na desni oz. zunaj kroga;
let leftBeat = 3; // znotraj kroga;
let bpm = 60;   // beatsPerMinute; potem bo treba ločit še bars per minute;
const startRad = -Math.PI / 2; // to je kot točke, ki je na vrhu kroga;
let revltnDurtn = (60 / (bpm / mainBeat)) * 1000;  //  čas, potreben za en krog, v milisekundah; 60, ker 60 sekund v minuti;
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
let isRotating = null;
let azzerato = false;   // to je za vodenje evidence (samo pri upravljanju s tipkami) al si esc pritisnil enkrat (samo ustaviš) ali večkrat (ponastaviš kazalec);


class Notch {
    constructor(x1, y1, x2, y2, angle) {
        this.start = {x: x1, y: y1};
        this.end = {x: x2, y: y2};
        this.angle = angle;
    }
}

function positionElems() {
    foreCanvDiv.style.top = `${canv.getBoundingClientRect().top}px`;
    foreCanvDiv.style.left = `${canv.getBoundingClientRect().left}px`;

    posOnCtrl.top = canvRBeat.getBoundingClientRect().top; // levi in desni gumb imata isti top, zato zabeležimo samo enkrat;

    rBeatDigit.style.left = `${canvRBeat.getBoundingClientRect().right}px`;
    rBeatDigit.style.top = `${posOnCtrl.top + 60 - 17}px`;  // -17 (al kolko pač) od oka da je črka bolja na sredini
    rBeatDigit.style.color = btnColorShaded;
    rBeatDigit.innerHTML = mainBeat;

    lBeatDigit.style.right = `${window.innerWidth - canvLBeat.getBoundingClientRect().left}px`;
    lBeatDigit.style.top = `${posOnCtrl.top + 60 - 17}px`;  // -17 (al kolko pač) od oka da je črka bolja na sredini
    lBeatDigit.style.color = btnColorShaded;
    lBeatDigit.innerHTML = leftBeat;
}

function atKeyPress(keyKey) {
    if(keyKey == 'Escape') {
        if (isRotating != null) stopRotation();
            else if(!azzerato) {
                azzerato = true;
                drawBckgnd(); // treba prav ozadje nova izrisat, da razbarvaš oznake, prestaviš kazalec in odstraniš ostanke obarvanj z robov oznak;
            }
    } else if(keyKey == 'Enter') {
        if (isRotating == null) { startRotating(); }
    }
}

function atClickEvent() {
    if(isRotating == null) startRotating();
    else stopRotation();
}

function beatClick(e) {
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

function rotate() {
    // izračunamo kot, kamor trenutno kaže kazalec;
    const tDiff = (Date.now() - tStart) % revltnDurtn;
    const tRatio = tDiff / revltnDurtn;
    const angle = tRatio * (2 * Math.PI) // delež kota 360';

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
    tStart = Date.now();
    drawBckgnd(); // ker blinkanje (vsaj zdaj ko je fiksno) pusti sled na krogu, zato je pred novim vrtenjem treba narisat krog; vrstica gre pozneje ven, verjetno;
    rotate();   // ta je da obarvaš prvo dobo + narišeš ta prvo, navpično črto (ki ni narisana, če ne zaganjaš prvič) (črta se sicer trenutno riše že v drawBckgnd, ampak ta bo morda umaknjena);
    isRotating = setInterval(rotate, 20);
    drawPauseBtn();
    azzerato = false;
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
    console.log('isRotating je false');
}

function resetBckgndCanv() {
    canv.height = 0;
    canv.height = baseDimension;
    ctx.strokeStyle = 'honeydew';
    ctx.lineWidth = 3;
}

function resetForeCanv() {
    foreCanv.height = 0;
    foreCanv.height = baseDimension;
    foreCtx.strokeStyle = 'honeydew';
    foreCtx.lineWidth = 2;
}

function drawBckgnd() {
    // krog;
    resetBckgndCanv();
    ctx.beginPath();
    ctx.arc(crclX, crclY, r, 0, 2 * Math.PI);
    ctx.stroke();

    drawNotches();

    // navpičen kazalec; ko odpreš program, mora bit navpičen kazalec že narisan in čaka;
    resetNeedle();
}

function resetNeedle() {
    resetForeCanv();
    foreCtx.beginPath();
    foreCtx.moveTo(crclX, crclY  - r);
    foreCtx.lineTo(crclX, crclY);
    foreCtx.stroke();
}

function setNotchCoords(WHICH) {

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

    drawBckgnd();
}

function drawNotches() {

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
}

function zvok(which) {
    if (which == RIGHT) { audioMain.play(); } 
        else audioLeft.play();
}


//   -  -  -   IZVAJANJE  -  - 
drawControls();
setNotchCoords(BOTH);
if (document.readyState == 'loading') {
    document.addEventListener("DOMContentLoaded", positionElems);  // domcontent loaded je lahko "complete" ali pa "interactive";
} else {
    positionElems;
}




