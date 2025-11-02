'use strict';

// dodaj da je Beta
// naredit AB test v triest
// dat risanj v async, zbrat najprej vse poteze za eno rundo
// če zmanjša levega na manj kot 2, ga izklopiš;
// dodat podpis
// krajšanje trajanja lbinks s hitrejšimi udarci (L in D enaka hitrost)
// prilagdoljiva/različna hitrost L in D udarca (blinkanja) glede na njuno hitrost
// izklop zvoka; morda na po dva klikerja na vsaki strani: izklop zvoka in izklop blinkanja (še vedno se vedno vrti kazalec);
// beats per bar
// zagon in ustavitev s klikom na številčnico
// vodoravna postavitev
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
const bPMinuteLbl = document.getElementById('b_per_minute');
const displayTempo = document.getElementById('display_tempo');

const infoIcon = document.getElementById('avg_hex_info_icon');
const divJokerBckgnd = document.getElementById('joker_bckgnd');
const divJokerForegnd = document.getElementById('joker_foregnd');
const divJokerCloseIcon = document.getElementById('joker_close_icon');
const jokerContent = document.getElementById('joker_content');

let tstMsg = '';
let audioCtx = new AudioContext();
let audioSmpls;
tstMsg += `state takoj na začetki: ${audioCtx.state}<br>`;
const samplePaths = ['Perc_Squeak_hi.wav','Perc_Can_hi.mp3'];

// konstante
const RIGHT = 'r';
const LEFT = 'l';
const BOTH = 'b';
const INVALID = 'inv';  // neveljaven klik;
const TEMPO_UP = 'u';
const TEMPO_DOWN = 'd';

const dialColr = 'honeydew';
const bckgndColor = '#686868';  // preveri, da je isto v css!;
const btnColor = '#a2f083'; // kulska: #81D95E
const btnColorShaded = '#85ac75';
const btnColorShadedDarkrCentr = '#7f9e72';
const btnColorShadedDarkr = '#717d6b';   // ko dosežeš mejo nastavitev in gumb postane neaktiven;
const digitColrShaded = '#85ac75';    // #84c46bff ; včasih je bil gumb malo svetlejšo od cifer;

const notchWidth = 11;
const startRad = -Math.PI / 2; // to je kot točke, ki je na vrhu kroga;
const twoPI = 2 * Math.PI;
const frameDurtn = 10;  // na koliko ms se sproži interval, ki izrisuje kroženje;

let baseDimension, notchLength, r, crclX /* polovica od width oz. hght canvasa; */, crclY;
let mainBeat = 4; // na desni oz. zunaj kroga;
let leftBeat = 3; // znotraj kroga;
let bpm = 60;   // beatsPerMinute; potem bo treba ločit še bars per minute;
let revltnDurtn, revltnConst;
let angle, prevT;   // angle služi hkrati tudi kot prevAngle;
const notches = {
    main: {
        coords: [], // tu so shranjeni podatki, kako osvetlimo neko zarezo
        nextBlinkAngle: 0, // tu je shranjen podatek, pri katerem kotu dodamo nov active;
        nextBlinkIdx: 0 // tu je shranjen index, ki ga ima doba, ki bo NASLEDNJA blinkala (da bomo takrat, ko pridemo do nje, vedeli od kod jemat podatke);
    },
    left: {
        coords: [],
        nextBlinkAngle: 0,
        nextBlinkIdx: 0
    }
}
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
let jokerOpen = false;
let wasRunngB4Joker = false;
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
const audioMain = [];   // arraya za zvoke. Main je desni, left je levi;
const audioLeft = [];
const notchesResets = [];   // tabela, v kateri si shraniš podatke, kdaj izbrisat obarvanje katere oznake;
    // noter grejo (push, bereš od začetka) arrayi s tako sestavo: triggerTime, startX, startY, endX, endY;

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
        
        divJokerForegnd.style.left = `${window.innerWidth * 0.2}px`;
        divJokerForegnd.style.right = `${window.innerWidth * 0.2}px`;
    } else {
        let width = document.documentElement.clientWidth < window.innerWidth ? document.documentElement.clientWidth : window.innerWidth;
        if(screen.width < width) width = screen.width;
        if(width % 2 == 1) width = width - 1;
        baseDimension = width - 24; // 12 roba na vsaki strani;
        notchLength = 16;
        r = (baseDimension - 2 * 16 - 2 * 2) / 2;

        document.getElementById('home').style.position = 'absolute';
        document.getElementById('home').style.paddingTop = '0px';
        infoIcon.style.right = '12px';

        divJokerForegnd.style.top = '80px';
        divJokerForegnd.style.left = '32px';
        divJokerForegnd.style.right = '32px';

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

function beatCountCtrlOprtn(e) {
    let actionedBeat, isActionedRBeat;
    if(e.target == canvRBeat) {
        actionedBeat = mainBeat;
        isActionedRBeat = true;
    } else {
        actionedBeat = leftBeat;
        isActionedRBeat = false;
    }
    let doChange = false; 
    let wasMaxed = false; // shrani potrditev, da je gumb, preden si ga pritisnil, bil razbarvan/neaktiven (imel največjo vrednost navzgor ali navzdol);
    posOnCtrl.y = e.clientY - posOnCtrl.top;

    if (posOnCtrl.y < 60) {
        // pritisk na zgornjo puščico, za povečanje števila dob;
        if(actionedBeat < 12) {
            if(actionedBeat == 2) wasMaxed = true;  // je bil neaktiven na spodnji meji;
            actionedBeat++;
            doChange = true;
            if(actionedBeat == 12) {    // če si dosegel zgornji max, deaktivirat zgornjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, false, true);
                else drawBeatCount(LEFT, false, true);
            } else if(wasMaxed) { // če si zapustil spodnjo mejo, aktivirat spodnjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, true, true);
                else drawBeatCount(LEFT, true, true);
            }
        }
    } else if(posOnCtrl.y > 76) {   // pritisk na spodnjo puščico, za zmanjšanje števila dob;
        if(actionedBeat > 2) {
            if(actionedBeat == 12) wasMaxed = true;  // je bil neaktiven na zgornji meji;
            actionedBeat--;
            doChange = true;
            if(actionedBeat == 2) { // če si dosegel spodnji max, deaktivirat spodnjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, true, false);
                else drawBeatCount(LEFT, true, false)
            } else if(wasMaxed) {   // če si zapustil zgornje nedovoljeno območje, aktivirat zgornjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, true, true);
                else drawBeatCount(LEFT, true, true);
            }
        }
    }
    if(doChange) {
        stopRotation();
        if(e.target == canvRBeat) { 
            mainBeat = actionedBeat;
            rBeatDigit.innerHTML = mainBeat;
            setNotchCoords(RIGHT);
            defineRevltnDurtn(); // samo če si spremenil desni beat, ker je on merilo 
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

// test
async function load(what){
    what.load();
}
// !t

// test
function pause(idx) {
    audioMain[idx].pause();
    // console.log('jup pavza,', Date.now())
    audioMain[idx].currentTime = 0;

}
// !test



function rotate() {
    // izračunamo kot, kamor trenutno kaže kazalec;
    const nowT = Date.now();
    angle += (nowT - prevT) * revltnConst // delež kota 360'; če ne bi prej izračunal konstante, bi bilo tako: dAngle = (dT / revltnDurtn) * twoPI; dT = nowT - prevT;
    if(angle > twoPI) angle -= twoPI;
    prevT = nowT;
    let doR = false, doL = false; // gre na true, če se pri preverjanju zvoka ugotovi, da je izpolnjen pogoj za blinkanje (L/R);

    function doSnd(passdNotches, which) {  // do sound helper;
        // najprej pogledamo, al je treba dodat kak element v array za blinkanje;
        // tako zakomplicirano čekiranje, ker zadnja doba ima next angle 0 in tako bi imela vedno izpolnjen pogoj, da je večja od next angle,..
        // ..takrat je treba potrdit angle < notchCoords[1].angle;
        if (angle >= passdNotches.nextBlinkAngle && (passdNotches.nextBlinkAngle > 0 || angle < passdNotches.coords[1].angle)) {
            // na tem mestu v zanki vemo da je ima stran (L/R) na tej točki oznako;
            if(which == RIGHT) {
                zvok(RIGHT, passdNotches.nextBlinkIdx); // nextBlinkIdx tukaj dejansko pomeni currentIdx;
                setTimeout(pause, 150, passdNotches.nextBlinkIdx)
                // if(passdNotches.nextBlinkIdx == passdNotches.coords.length - 1) /*audioMain[0].load();*/ load(audioMain[0]);
                //     else /*audioMain[passdNotches.nextBlinkIdx + 1].load() */ load(audioMain[passdNotches.nextBlinkIdx + 1]);
                doR = true;
            } else {
                zvok(LEFT, passdNotches.nextBlinkIdx);
                // if(passdNotches.nextBlinkIdx == passdNotches.coords.length - 1) audioLeft[0].load();
                //     else audioLeft[passdNotches.nextBlinkIdx + 1].load();
                doL = true;
            }
        }
    }

    function helper(passdNotches, which) {

        // na tem mestu v zanki vemo, da bo na tem mestu na številčnici blink;
        
        // pomožne spremenljivke;
        const passdNotchCoords = passdNotches.coords;
        const blinkIdx = passdNotches.nextBlinkIdx; // do posodobitve (bolj spodaj) je nextBlinkIdx dejansko currentIdx!!;
        
        // blink
        const startX = passdNotchCoords[blinkIdx].start.x;
        const startY = passdNotchCoords[blinkIdx].start.y;
        const endX = passdNotchCoords[blinkIdx].end.x;
        const endY = passdNotchCoords[blinkIdx].end.y;
        ctx.lineWidth = notchWidth;
        if(which == RIGHT) ctx.strokeStyle = '#fa0707';
        else ctx.strokeStyle = '#0707fa';
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // si zabeležimo, da izbrišemo čez čas, okoli 100ms;
        // zvoka trajata okoli 169 ms, morda je OK, če sveti približno toliko
        notchesResets.push([nowT + 140, startX, startY, endX, endY]);
        
        // dodamo trigger za naslednji blink;
        // najprej njegov index;
        if (blinkIdx == passdNotchCoords.length - 1) passdNotches.nextBlinkIdx = 0;
        else passdNotches.nextBlinkIdx++;
        passdNotches.nextBlinkAngle = passdNotchCoords[passdNotches.nextBlinkIdx].angle // nato še njegov kot;
    }

    // najprej zvok;
    doSnd(notches.main, RIGHT);
    doSnd(notches.left, LEFT);
    
    // risanje utripanja;
    if(doR) helper(notches.main, RIGHT);
    if(doL) helper(notches.left, LEFT);

    // brisanje predhodno osvetljenih oznak;
    if(notchesResets.length > 0) {
        let toSpl = 0;  // kolko jih bo treba splice-at;
        for(let i = 0; i < notchesResets.length; i++) {
            if(nowT > notchesResets[i][0]) {
                toSpl++;
                ctx.lineWidth = notchWidth;
                ctx.strokeStyle = dialColr;
                ctx.beginPath();
                ctx.moveTo(notchesResets[i][1], notchesResets[i][2]);   // idx 1 in 2 start startX in startY:
                ctx.lineTo(notchesResets[i][3], notchesResets[i][4]);   // idx 3 in 4 sta za end;
                ctx.stroke();
            }
        }
        if(toSpl > 0) {
            notchesResets.splice(0, toSpl)
        }
    }

    // kazalec (dogaja se v forecanv;)
    resetForeCanv();
    foreCtx.beginPath();
    foreCtx.arc(crclX, crclY, r, startRad + angle, startRad + angle); // finta, da se postaviš v določeno točko na krogu: končni kot daš isti kot začetni
    foreCtx.lineTo(crclX, crclY);
    foreCtx.stroke();

    // opomba: brez blinkanja (samo zvok, vzet iz arraya) naredi celo funkcijo v isti ms, v 20% primerih rabi 1 ms
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
        else foreCanv.removeEventListener('touchstart', (e) => {touchAzzerareDial(e)}); 
}

function stopRotation() {
    clearInterval(isRotating);
    isRotating = null;
    // azzeriramo podatke za blinkanje;
    notches.main.nextBlinkAngle = 0;
    notches.main.nextBlinkIdx = 0;
    notches.left.nextBlinkAngle = 0;
    notches.left.nextBlinkIdx = 0;
    notchesResets.length = 0;
    drawPlayBtn();
    if(mobile) foreCanv.addEventListener('touchstart', (e) => {touchAzzerareDial(e)}, {passive : false});  // da s pritiskom številčnice ponastaviš kazalec (ki po zaustavitvi ostane, kjer je bil);
        else foreCanv.addEventListener('click', (e) => {touchAzzerareDial(e)});
}

function resetForeCanv() {
    foreCanv.height = 0;
    foreCanv.height = baseDimension;
    foreCtx.strokeStyle = dialColr;
    foreCtx.lineWidth = 2;
}

function drawBckgnd() {
    // reset bckgCanvas
    canv.height = 0;
    canv.height = baseDimension;
    ctx.strokeStyle = dialColr;
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

    ctx.strokeStyle = dialColr;
    ctx.lineWidth = notchWidth;
    helper(notches.main.coords);
    helper(notches.left.coords);

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

    function helper(passdBeat, passdNotchCoords, passdAudioArr) {
        const angleSlice = twoPI / passdBeat; // kot celega kroga deljeno s številom dob;
        const diff = passdNotchCoords == notches.main.coords ? 20 : -20;
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
        // po potrebi dofilamo toliko zvokov, da ustreza številu dob;
        if(passdAudioArr.length < passdBeat) {
            const diff = passdBeat - passdAudioArr.length;
            for(let i = 0; i < diff; i++ ) {
                if(passdAudioArr == audioMain) {
                    passdAudioArr.push(new Audio('Perc_Can_hi.mp3'));
                    passdAudioArr[i].addEventListener('canplay', () => {console.log('main canplay',i, Date.now())})
                } else {
                    passdAudioArr.push(new Audio('Perc_Clap_hi.mp3'));
                }
            }
        }
    }

    if (WHICH == RIGHT || WHICH == BOTH) {
        helper(mainBeat, notches.main.coords, audioMain)
    }
    if (WHICH == LEFT || WHICH == BOTH) {
        helper(leftBeat, notches.left.coords, audioLeft)
    }

    // izris ozadja in torej tudi oznak;
    drawBckgnd();
}

function zvok(which, idx) {
    if (which == RIGHT) { 
        audioMain[idx].play(); 
        // console.log('main play', idx, Date.now())
        // console.log('- -- - -')
    } 
        else audioLeft[idx].play();
}

// AudioContext
async function getFile(path) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    tstMsg += `v getFile1: ${audioCtx.state}<br>`;
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    tstMsg += `v getFile2: ${audioCtx.state}<br>`;
    return audioBuffer;
}

async function setupSamples(paths) {
    console.log('začeli štimat')
    tstMsg += `v setupSamples: ${audioCtx.state}<br>`;
    const audioBuffers = [];

    for (const path of paths) {
        const sample = await getFile(path);
        audioBuffers.push(sample);
    }

    console.log('naštimano')
    return audioBuffers;
}

function playSample(audioBuffer, time) {
    const sampleSource = audioCtx.createBufferSource();
    sampleSource.buffer = audioBuffer;
    sampleSource.connect(audioCtx.destination);
    sampleSource.start(time);
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
canvRBeat.addEventListener('click', e => { beatCountCtrlOprtn(e) });
canvLBeat.addEventListener('click', e => { beatCountCtrlOprtn(e) });
canvPlayStop.addEventListener('click', playStopBtnOprtn);
bPMinuteLbl.addEventListener('click', () => {   // TODO to gre pozneje v funkcijo
    // test
    if(audioCtx.state == 'suspended') audioCtx.resume();
    tstMsg += `po kliku: ${audioCtx.state}<br>`;

    setupSamples(samplePaths).then((response) => {
        audioSmpls = response;
        console.log(audioSmpls);
        playSample(audioSmpls[0], 0);
    })
    // !test
 });
if (!mobile) {  // poslušalci za spremembo tempa; najprej, če miška;
    canvTempo.addEventListener('mousedown', (e) => {mouseDownOprtn(e)});
    canvTempo.addEventListener('mouseleave', (e) => {mouseLeaveOprtn(e)});
    canvTempo.addEventListener('mouseup', (e) => {mouseUpOprtn(e)});
    canvTempo.addEventListener('mousemove', (e) => {mouseMoveOprtn(e)});
    //infoIcon
    infoIcon.addEventListener('click', infoClick);
    divJokerCloseIcon.addEventListener('click', retireJoker);
} else {
    canvTempo.addEventListener('touchstart', (e) => {touchStartOprtn(e)}, {passive : false});
    canvTempo.addEventListener('touchmove', (e) => {touchMoveOprtn(e)}, {passive : false});
    canvTempo.addEventListener('touchend', (e) => {touchEndOprtn(e)}, {passive : false});
    // infoIcon;
    infoIcon.addEventListener('touchstart', () => {infoClick()}, {passive : false});
    divJokerCloseIcon.addEventListener('touchstart', () => {retireJoker()}, {passive : false});
}

