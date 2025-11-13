'use strict';

// če zmanjša levega na manj kot 2, ga izklopiš;
// tick sounds
// prilagdoljiva/različna hitrost L in D udarca (blinkanja) glede na njuno hitrost
    // v bistvu bi moralo upoštevat tudi kje je naslednji drugi udarec..
    // ..(na trajanje D udarca vpliva, kdaj se pojavi naslednji L udarec, če je to prej kot naslednji D udarec); 
// izklop zvoka; morda na po dva klikerja na vsaki strani: izklop zvoka in izklop blinkanja (še vedno se vedno vrti kazalec);
// dodat uvajalno odštevanje (opcija);

// moj stari: 360*560
// moj trenuten:  384*785 


// canvasi in njihovi konteksti;
// skala in kazalec;
const canv = document.getElementById('canvas'); // to je kanvas, na katerem je narisan krog in oznake dob;
const ctx = canv.getContext('2d');
const foreCanv = document.getElementById('foreground_canvas');  // to je kanvas, na katerem se odvija vrtenje;
const foreCtx = foreCanv.getContext('2d');

// gumbi;
const canvLBeat = document.getElementById('left_beat');
const ctxLBeat = canvLBeat.getContext('2d');
const canvRBeat = document.getElementById('right_beat');
const ctxRBeat = canvRBeat.getContext('2d');
const canvPlayStop = document.getElementById('center_control');
const ctxPlayStop = canvPlayStop.getContext('2d');
const canvTempo = document.getElementById('canv_tempo');
const ctxTempo = canvTempo.getContext('2d');

// druge ročice;
const titleP = document.getElementById('title');
const infoIcon = document.getElementById('info_icon');
const canvDiv = document.getElementById('canvas_div');  // se načeloma ne rabi, ma ni odveč imet;
const foreCanvDiv = document.getElementById('foreground_canvas_div');
const contrlsDiv = document.getElementById('controls');
const rBeatDigit = document.getElementById('right_beat_digit');
const lBeatDigit = document.getElementById('left_beat_digit');
const tempoDiv = document.getElementById('tempo_div');
const bpmCluster = document.getElementById('bpm_cluster');
const tempoBeatsPMinLine = document.getElementById('beats_per_min_line');
const tempoBarsPMinLine = document.getElementById('bars_per_min_line');
const valueBeatPMin = document.getElementById('value_beats_minute');
const valueBarsPMin = document.getElementById('value_bars_minute');
const divJokerBckgnd = document.getElementById('joker_bckgnd');
const divJokerForegnd = document.getElementById('joker_foregnd');
const divJokerCloseIcon = document.getElementById('joker_close_icon');
const jokerContent = document.getElementById('joker_content');

// za testirat zvoke, da imaš samo en samplePaths;
// const samplePaths = ['Perc_Can_hi.wav','Perc_Clap_hi.wav'];

const choices = [];
choices.push(['Perc_Can_hi.wav','Perc_Clap_hi.wav']);
choices.push(['Perc_MusicStand_hi.wav','Perc_Clap_hi.wav']);
choices.push(['Perc_MetronomeQuartz_hi.wav','Perc_Clap_hi.wav']);
choices.push(['Perc_PracticePad_hi.wav','Perc_Tongue_hi.wav']);
choices.push(['Perc_PracticePad_hi.wav','Synth_Block_C_hi.wav']);
choices.push(['Perc_MetronomeQuartz_hi.wav','Synth_Block_C_hi.wav']);
const samplePaths = choices[Math.floor(Math.random() * choices.length)]; 
console.log(samplePaths)

// ZIHR:
// const samplePaths = ['Perc_Can_hi.wav','Perc_Clap_hi.wav'];
// const samplePaths = ['Perc_MusicStand_hi.wav','Perc_Clap_hi.wav'];
// const samplePaths = ['Perc_MetronomeQuartz_hi.wav','Perc_Clap_hi.wav'];
// const samplePaths = ['Perc_PracticePad_hi.wav','Perc_Tongue_hi.wav'];
// const samplePaths = ['Perc_PracticePad_hi.wav','Synth_Block_C_hi.wav'];
// const samplePaths = ['Perc_MetronomeQuartz_hi.wav','Synth_Block_C_hi.wav'];

// ni slabo
// const samplePaths = ['Perc_MetronomeQuartz_hi.wav','Perc_MusicStand_hi.wav'];
// const samplePaths = ['Perc_MetronomeQuartz_hi.wav','Perc_Tamb_B_hi.wav'];
// const samplePaths = ['Perc_Tongue_hi.wav','Perc_MusicStand_hi.wav'];

// Perc_Tongue_hi.wav - dober, suh, rezek, ampak prveč odrezav, preveč napade 

// konstante
const RIGHT = 'r';
const LEFT = 'l';
const BOTH = 'b';
const INVALID = 'inv';  // neveljaven klik;
const TEMPO_UP = 'u';
const TEMPO_DOWN = 'd';

const dialColr = '#f0fff0'; // honeydew;
const btnColor = '#a2f083'; // za puščico v sredini; kulska: #81D95E
const btnColorShaded = '#85ac75'; // za zunanji del gumbom, uno, k ni puščica;
const btnColorShadedDarkrCentr = '#7f9e72';
const btnColorShadedDarkr = '#717d6b';   // ko dosežeš mejo nastavitev in gumb postane neaktiven;
const digitColrShaded = '#85ac75';    // #84c46bff ; včasih je bil gumb malo svetlejšo od cifer;
// const bckgndColor = '#686868';  // trenutno se ne uporablja, je pa verjetno ta prava barva;

const startRad = -Math.PI / 2; // to je kot točke, ki je na vrhu kroga;
const twoPI = 2 * Math.PI;
const notchWidth = 11;

let baseDimension, notchLength, r, crclX, crclY; // basedimention je stranica kvadratnega canvasa; crclX in Y sta koordinati središča kroga, na sredini width oz. hght canvasa;
let mainBeat = 4; // na desni oz. zunaj kroga;
let leftBeat = 3; // znotraj kroga;
const tempo = {
    beatsPM: 60,    // beats per minte;
    barsPM: 15,      // bars per minte;
    isBeat: true,   // pove, al je trenutno izbran beat per minute (in ne bar per minute);
};
let frameDurtn = 16;  // na koliko ms se sproži interval, ki izrisuje kroženje;
let revltnDurtn, revltnConst, blinkDurtn = 150;
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

let angle, prevT;   // angle služi hkrati tudi kot prevAngle;
let isRotating = null;  // interval checker za vrtenje kazalca;
let tempoRepeatDelayChecker = 0;    // MS Long Press Register Delayu reče Repeat Delay (kar pa se dogaja za tem pa je Repeat Rate)..
    // .. ta pa je checker za to, neki tazga kot je intervalChecker integer, ki se povečuje z vsako zagnano serijo intervalov;
let tempoIntrvlChckr = null; // interval checker za tempo gumb;
let azzerato = true;   // to je za vodenje evidence al si esc pritisnil enkrat (samo ustaviš) ali dvakrat (ponastaviš kazalec); na začetku je true, ker je kazalec ponastavljen;
// 2 spremenljivki za touch; štartamo s false, ker na začetku je vse nastavljeno za namizni računalnik;
let mobileTouchWise = false;    // true pomeni, da je touch naprava (android/iphone/ipad)
let mobileSizeWise = false;     // true pomeni, da je mobileTouchWise true IN touch naprava velikosti telefona (android/iphone), čeprav to zajame morebitne android tablice;
let mousePressIsValid = false;
let jokerOpen = false;
let wasRunngB4Joker = false;
let audioCtx = new AudioContext();
let audioSmpls, arrayBfrs;
const foreCanvRect = {
    top: 0,
    left: 0,
};
const tempoCnvsRect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
}
const beatCanvPos = { // top je mera, kje je vrh L/D gumba za beat;
    top: 0,
    x: 0,
    y: 0
}
let playBtnTop = 0, playBtnHght = 80;
const mouseOrTchPosOnTempo = {
    x : 0,
    y : 0,
    btn : 'none'
}
const viewPrtRect = { // viewport rectangle;
    height : 0,
    width : 0
}
let bpmlabels, bpmDigits;    // za shranit DOM elemente za bpm (beats/bars per min) da jih lahko urejamo;

const notchesResets = [];   // tabela, v kateri si shraniš podatke, kdaj izbrisat obarvanje katere oznake;
    // noter grejo (push, bereš od začetka) arrayi s tako sestavo: triggerTime, startX, startY, endX, endY;
let testMsg = '';

class Notch {
    constructor(x1, y1, x2, y2, angle) {
        this.start = {x: x1, y: y1};
        this.end = {x: x2, y: y2};
        this.angle = angle;
    }
}

function initializeLayout() {
    check4mobile();
    let doContinue = false;
    if(defineDimensions()) {
        setupSamplesPt1StpBfrz(samplePaths).then((response) => {
            arrayBfrs = response;
            console.log('arrays done');
        });
        doContinue = true;
    }   // else sporočimo, da se app ne bo zagnal;
    return doContinue;
}

function check4mobile() {
    if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
        mobileTouchWise = true;
    }
}

function defineDimensions() {
    
    // velikost ekrana oz točneje viewporta;
    viewPrtRect.width = document.documentElement.clientWidth < window.innerWidth ? document.documentElement.clientWidth : window.innerWidth;
    if(screen.width < viewPrtRect.width) viewPrtRect.width = screen.width;
    viewPrtRect.height = document.documentElement.clientHeight < window.innerHeight ? document.documentElement.clientHeight : window.innerHeight;
    if(screen.height < viewPrtRect.height) viewPrtRect.height = screen.height;
    
    if(mobileTouchWise) {
        if(((screen.orientation.angle == 0 || screen.orientation.angle == 180) && viewPrtRect.height < 870 && viewPrtRect.width < 570) || // mobilc navpično;
        ((screen.orientation.angle == 90 || screen.orientation.angle == 270) && viewPrtRect.width < 870 && viewPrtRect.height < 570)) { // mobilc vodoravno;
            mobileSizeWise = true;  // gre za pravo mobilno napravo, mobilni telefon;
            
            // poslušalec za spremembo usmeritve;
            screen.orientation.addEventListener('change', atOrntnCgh);

        } // else nič, ker mobileSizeWise je že false;
    }
    console.log('mobileTouchWise:', mobileTouchWise);
    console.log('mobileSizeWise:', mobileSizeWise); // na mobilnem tellefonu sta oba true, le ipad ima mešano;

    if(!mobileSizeWise) {
        baseDimension = 444;
        notchLength = 20;

        canvPlayStop.width = 80;
        
        divJokerForegnd.style.top = '120px';
        divJokerForegnd.style.right = `${window.innerWidth * 0.2}px`;
        // divJokerForegnd - višine al bottoma nima določene, da se lahko prilagodi dolžini besedila;
        divJokerForegnd.style.left = `${window.innerWidth * 0.2}px`;
    } else {
        // treba dat sem, ker mora veljat tako za pokončni kot za ležeči začetek, v naslednji vrstici pa je potencialno return;
        divJokerForegnd.style.top = '80px';
        divJokerForegnd.style.right = '32px';
        divJokerForegnd.style.bottom = '60px';
        divJokerForegnd.style.left = '32px';

        // app si torej začel v horiz. postavitvi, takoj damo opozorilo, da to ne gre in de facto končamo;
        if(screen.orientation.angle == 90 || screen.orientation.angle == 270) {
            displayHrzWarn(false);
            return false;
        }
        
        baseDimension = viewPrtRect.width - 36; // 18 roba na vsaki strani;
        if(baseDimension % 2 == 1) baseDimension = baseDimension - 1;
        notchLength = 16;
        
        // preverimo, al bo treba krajšat po višini;
        const currHght = viewPrtRect.width + 302;
        // 302 je sestavljeno tako:
        // 43 (div titleP) + (viewPrtRect.width - 36 (basedimension = višina canvasa)) + 178 (visok beat div )+ 116 (visok bpmDiv) + 1 (borderBody);
        if((currHght > viewPrtRect.height)) {
            const totalDiffToBridge = currHght - viewPrtRect.height;
            console.log('treba urejat velikost postavitve, višina bila:',  currHght, 'skinit bo treba: ', totalDiffToBridge);
            let bridged = 0;
            if(totalDiffToBridge < 40) {
                titleP.style.marginBottom = '10px';    // pridobil 2 na prejšnjih 12;
                contrlsDiv.style.marginTop = '8px'; // pridobil 8 na prejšnjih 16;
                contrlsDiv.style.marginBottom = '12px'; // pridobil 8 na prejšnjih 20;
                tempoDiv.style.paddingBottom = '6px'; // pridobil 2 na prejšnjih 8;
                bridged = 20;
            } else {
                titleP.style.marginBottom = '6px';    // pridobil 6 na prejšnjih 12;
                contrlsDiv.style.marginTop = '4px'; // pridobil 12 na prejšnjih 16;
                contrlsDiv.style.marginBottom = '4px'; // pridobil 16 na prejšnjih 20;
                tempoDiv.style.paddingBottom = '2px'; // pridobil 6 na prejšnjih 8;
                bridged = 40;
            }

            if(totalDiffToBridge > bridged) {
                console.log('manjšamo še krog');
                let diff = totalDiffToBridge - bridged;
                if(diff % 2 == 1) diff += 3;
                    else diff += 2;
                // ta glavna reč!!
                baseDimension -= diff;
            }
        } else { contrlsDiv.style.marginTop = '16px';  }  // ker je za ne-mobile drugačno;
        
        // to mora bit tu, ker se pozneje lahko spremeni, obraten vrstni red pa ne gre;
        lBeatDigit.style.fontSize = '44px';
        rBeatDigit.style.fontSize = '44px';
        
        // še čekirat širino;
        if(viewPrtRect.width < 360) {
            let diff = 360 - viewPrtRect.width;
            if(diff % 2 == 1) diff++;
            if(diff >= 24) {
                lBeatDigit.style.fontSize = '36px';
                rBeatDigit.style.fontSize = '36px';
                lBeatDigit.style.paddingTop = '44px';
                rBeatDigit.style.paddingTop = '44px';
                valueBeatPMin.style.marginRight = '8px';
                valueBarsPMin.style.marginRight = '8px';
            }
            diff = 30 - diff / 2;   // diff tukaj v resnici postane nov margin, ne diff; 30, ker je 30 margin LD okoli srednjega gumba in tega zmanjšujemo;
            if(diff < 4) diff = 4;
            console.log('nov margin L/D od PlayStop: ', diff);
            canvPlayStop.style.marginLeft = `${diff}px`;
            canvPlayStop.style.marginRight = `${diff}px`;
        }
        
        document.getElementById('home').style.position = 'absolute';
        titleP.style.paddingTop = '10px';
        titleP.classList.add('no-click');
        infoIcon.style.fontSize = '18px';
        
        jokerContent.style.position = 'absolute';   // da dobi scroll bar in da ne sega tekst v globino;
        jokerContent.style.bottom = '32px';
        jokerContent.style.overflowY = 'scroll';
        
        canvPlayStop.style.marginTop = '14px';  // mal je treba povečat odmik zgoraj, ker je slikca manjša na mobile;
        canvPlayStop.width = 60;
        canvLBeat.style.marginLeft = '4px';
        canvLBeat.style.marginRight = '4px';
        canvRBeat.style.marginLeft = '4px';
        canvRBeat.style.marginRight = '4px';
        
        const toRemove = document.getElementsByClassName('label')
        toRemove[0].classList.add('hidden');
        toRemove[0].style.marginBottom = '0px'; // hidden ne zadošča, je treba tudi margin ločeno skint, ker če ne zaseda višino;
        toRemove[1].innerHTML = '';
        toRemove[1].style.marginBottom = '0px';
    }
    
    // izpeljemo iz baseDim;
    if(!mobileSizeWise) r = 200;    // baseDim - 2*20(notch) - 2*2 (zaradi debeline 3, da ni prirezano);
        else r = (baseDimension - 2 * 16 - 2 * 2) / 2;
    crclX = baseDimension / 2;  // središče kroga; polovica od width oz. hght canvasa;
    crclY = baseDimension / 2;
    
    canv.width = baseDimension;   // 404 je minimum, če je polmer 200 in debelina kroga 3 (središče je v 202, 202, torej polovica širine/dolžine);
    canv.height = baseDimension;
    foreCanv.width = baseDimension;
    foreCanv.height = baseDimension;

    canvLBeat.width = 60;
    canvLBeat.height = 136;
    canvRBeat.width = 60;
    canvRBeat.height = 136;
    canvPlayStop.height = 108;   // ena pojavitev je tudi v controls.js;
    canvTempo.width = 48;
    canvTempo.height = 108;

    rBeatDigit.innerHTML = mainBeat;
    lBeatDigit.innerHTML = leftBeat;

    if (document.readyState == 'loading') {
        document.addEventListener("DOMContentLoaded", positionElems);  // domcontent loaded je lahko "complete" ali pa "interactive";
    } else {
        positionElems;
    }

    return true;
}

function positionElems() {  // postavitev ali odčitanje koordinat elementov, katerih položaj je odvisen od dokončanja postavitve položaja drugih ali sebe;
    // obvezno najprej .top, ker preden daš top, canvas sega globoko dol in se pojavi stranski skrolbar..
    // ..ko določiš top, stranski scrollbar zgine in šele takrat pravilno odčitaš left, ker se širina spremeni in zadnji kanvas se premakne na novo sredino;
    foreCanvDiv.style.top = `${canv.getBoundingClientRect().top}px`;
    foreCanvDiv.style.left = `${canv.getBoundingClientRect().left}px`;
    
    foreCanvRect.top = foreCanvDiv.getBoundingClientRect().top;
    foreCanvRect.left = foreCanvDiv.getBoundingClientRect().left;
    
    beatCanvPos.top = canvRBeat.getBoundingClientRect().top; // levi in desni gumb imata isti top, zato zabeležimo samo enkrat;

    tempoCnvsRect.left = canvTempo.getBoundingClientRect().left;
    tempoCnvsRect.top = canvTempo.getBoundingClientRect().top;
    tempoCnvsRect.right = canvTempo.getBoundingClientRect().right;
    tempoCnvsRect.bottom = canvTempo.getBoundingClientRect().bottom;

    playBtnTop = canvPlayStop.getBoundingClientRect().top;  // to se ne rabi za postavite, ampak za računanje klika;
    if(mobileSizeWise) {
        playBtnTop += 16;   // ker tolko od roba se začne gumb (21) + malo gor, da lažje prime;
        playBtnHght = 70;   // naredimo malo višje (je 60), da lažje prime;
    } else playBtnTop += 28; // height pa je že pravilno 80; 

    document.removeEventListener("DOMContentLoaded", positionElems);
}


function displayHrzWarn(specialCase) { // display warning at horizontal orientation; specialCase je, če imel vertikalno in potem obrnil horizontalno;
    if(specialCase) {
        canvDiv.style.display = 'none';
        foreCanvDiv.style.display = 'none';
        contrlsDiv.style.display = 'none';
        tempoDiv.style.display = 'none';
    } // else si odprl app pri nespecial case (horiz postavitev) in zgornjih ni treba skrivat, ker niso prikazani;
    // da ni mogoče zapret opozorila ampak da imaš sao možnost dat v navpično
    divJokerCloseIcon.style.display = 'none';   // ta preglasi not Hidden v raise joker, ker je bolj specifičen;
    
    if(specialCase) raiseJoker('Currently does not support horizontal orientation.<br>Tilt back to vertical to continue');
        else raiseJoker('Currently does not support horizontal orientation.<br>Tilt to vertical to continue');
}

function atOrntnCgh() { // at orientation change;
    if(screen.orientation.angle == 0 || screen.orientation.angle == 180) location.reload();
    else if(screen.orientation.angle == 90 || screen.orientation.angle == 270) {
        displayHrzWarn(true);
    }
}

function atKeyPress(keyKey) {
    if(keyKey == 'Escape') {
        if (isRotating != null) {
            stopRotation();
        } else {    // če je vrtenje null;
            if(jokerOpen) {
                retireJoker();
            } else if(!azzerato) azzerareAfterStop();
        }
    } else if(keyKey == 'Enter') {
        if (isRotating == null && !jokerOpen) {
            startRotating(); 
        }
    }
}

function playStopBtnOprtn(e) {
    if((e.clientY > playBtnTop) && (e.clientY < (playBtnTop + playBtnHght))) {
        if(isRotating == null) startRotating();
        else stopRotation();
    }
}

function playStopBtnOprtnB4SmplInit(e) {
    if((e.clientY > playBtnTop) && (e.clientY < (playBtnTop + playBtnHght))) {
        setupSamplesPt2(arrayBfrs).then((response) => { // za videt je podobna touchDialB4SmplInit(), ampak ni ista!!;
            audioSmpls = response;
            playStopBtnOprtn(e); // zagnat;
            setListnrsAftrInit();   // poštimat listenerje;
        });
    }
}

function setListnrsAftrInit() {
    // na play gumbu se ju zamenja;
    canvPlayStop.removeEventListener('click', playStopBtnOprtnB4SmplInit);
    canvPlayStop.addEventListener('click', playStopBtnOprtn);
    // na številčnici prav tako:
    foreCanv.removeEventListener('click', touchDialB4SmplInit);
    foreCanv.addEventListener('click', touchDial);
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
    beatCanvPos.y = e.clientY - beatCanvPos.top;

    if (beatCanvPos.y < 60) {
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
    } else if(beatCanvPos.y > 76) {   // pritisk na spodnjo puščico, za zmanjšanje števila dob;
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
        if(isRotating!= null) stopRotation();
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

function atBpmLblClick(isBeat){ // isBeat kot nasprotje isBarsPerMinute; pomeni da je bila kliknjena izbira za neat per minute;
    if(bpmlabels === undefined) {
        bpmlabels = document.getElementsByClassName('bpm-label');
        bpmDigits = document.getElementsByClassName('bpm-digit');
    }
    if(isBeat) {
        if(!bpmlabels[0].classList.contains('bpm-label-selected')) {    // v nasprotnem primeru ni terba delat;
            tempo.isBeat = true;
            bpmlabels[0].classList.add('bpm-label-selected');
            bpmDigits[0].classList.add('bpm-digit-selctd');
            bpmlabels[1].classList.remove('bpm-label-selected');
            bpmDigits[1].classList.remove('bpm-digit-selctd');
            bpmCluster.style.paddingTop = '24px';
            bpmCluster.style.paddingBottom = '0px';
            tempoBeatsPMinLine.classList.add('bpm_line_selctd');
            tempoBarsPMinLine.classList.remove('bpm_line_selctd');
        }
    } else if(!bpmlabels[1].classList.contains('bpm-label-selected')) {
        tempo.isBeat = false;
        bpmlabels[1].classList.add('bpm-label-selected');
        bpmDigits[1].classList.add('bpm-digit-selctd');
        bpmlabels[0].classList.remove('bpm-label-selected');
        bpmDigits[0].classList.remove('bpm-digit-selctd');
        bpmCluster.style.paddingTop = '0px';
        bpmCluster.style.paddingBottom = '24px';
        tempoBeatsPMinLine.classList.remove('bpm_line_selctd');
        tempoBarsPMinLine.classList.add('bpm_line_selctd');
    }
}

function defineRevltnDurtn() {
    if(tempo.isBeat) {
        tempo.barsPM = Math.round(tempo.beatsPM / mainBeat);
        if(tempo.barsPM == 0) tempo.barsPM++;
    } else tempo.beatsPM = tempo.barsPM * mainBeat;
    //  čas, potreben za en krog, v milisekundah; 60, ker 60 sekund v minuti;
    // obvezno ga je treba računat iz tempo.beatsPM, ker barsPM == 1 lahko obsega recimo beatsPM od 2 do 12
    revltnDurtn = (60 / (tempo.beatsPM / mainBeat)) * 1000;
    revltnConst = twoPI / revltnDurtn;
    
    // frameDuration
    if(tempo.beatsPM > 176)
        if(tempo.beatsPM < 185) 
            if(tempo.beatsPM <= 180) {
                frameDurtn = 16;
                console.log('frame 16');
            } else {
                frameDurtn = 10;
                console.log('frame 10');
            }

    updBpmDisp();
 
    // neki zastarelega oz trenutno neuporabljenega;
    // blink duration;
    // eh, naj bo trenutno kar vedno 150ms;
    // const temp = (60 / tempo.beatsPM) * 1000; // trajanje (v ms) enega udarca;
    // if(temp <= 200) {
        //     blinkDurtn = 0.9 * temp;
        //     if(blinkDurtn > 150) {
            //         blinkDurtn = 150;
            //     } else if (blinkDurtn < 110) blinkDurtn = 110;
            // } else blinkDurtn = 150;
}

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
                zvok(RIGHT);
                doR = true;
            } else {
                zvok(LEFT);
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
        notchesResets.push([nowT + blinkDurtn, startX, startY, endX, endY]);
        
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

    // če treba, ponastavimo videz;
    if (!azzerato) {
        drawDialAndIndicator(); // ker blinkanje (vsaj zdaj ko je fiksno) pusti sled na krogu, zato je pred novim vrtenjem treba narisat krog; vrstica gre pozneje ven, verjetno;
    }
    
    // zagon;
    rotate();   // ta je da obarvaš prvo dobo + narišeš ta prvo, navpično črto (ki ni narisana, če ne zaganjaš prvič) (črta se sicer trenutno riše že v drawDialAndIndicator, ampak ta bo morda umaknjena);
    isRotating = setInterval(rotate, frameDurtn);
    restOfStartRottng();    // v async da ne dela zamud;
}

async function restOfStartRottng() {
    drawStopBtn();
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
    azzerato = false;    // ker kazalec lahko zdaj stoji kjerkoli in potencialno ga želimo ponastaviti;
    drawPlayBtn();
}

function resetForeCanv() {
    foreCanv.height = 0;
    foreCanv.height = baseDimension;
    foreCtx.strokeStyle = dialColr;
    foreCtx.lineWidth = 2;
}

function drawDialAndIndicator() {
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

    // narisat foreground canvas; navpičen kazalec; ko odpreš program, mora bit navpičen kazalec že narisan in čaka;
    resetForeCanv();
    foreCtx.beginPath();
    foreCtx.moveTo(crclX, crclY  - r);
    foreCtx.lineTo(crclX, crclY);
    foreCtx.stroke();

    azzerato = true;
}

function azzerareAfterStop() {
    drawDialAndIndicator(); // treba prav ozadje nova izrisat, da razbarvaš oznake, prestaviš kazalec in odstraniš ostanke obarvanj z robov oznak;
    // azzerato gre na true v drawDialAndIndicator
}

function setNotchCoords(WHICH) {    // ne samo izračuna oznake, ampak jih tudi izriše;

    function helper(passdBeat, passdNotchCoords) {
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
    }

    if (WHICH == RIGHT || WHICH == BOTH) {
        helper(mainBeat, notches.main.coords);
    }
    if (WHICH == LEFT || WHICH == BOTH) {
        helper(leftBeat, notches.left.coords);
    }

    // izris ozadja in s tem tudi oznak;
    drawDialAndIndicator();
}

function zvok(which) {
    if(which == RIGHT) {
        playSample(audioSmpls[0], 0);
    } else playSample(audioSmpls[1], 0);
}

// AudioContext
async function getFile(path) {
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    return audioBuffer;
}

async function getFilePt1(path) {   // del pred audioContext;
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
}

async function getFilePt2(bfr) {    // del po audioCtx, nisem prepričan da je treba dalit na 2 kosa; (kao če določeni browserji ne dovolijo audioCtxa pred uporabnikovo interakcijo);
    const audioBuffer = await audioCtx.decodeAudioData(bfr);
    return audioBuffer;
}

async function setupSamples(paths) {
    const audioBuffers = [];

    for (const path of paths) {
        const sample = await getFile(path);
        audioBuffers.push(sample);
    }

    return audioBuffers;
}

async function setupSamplesPt1StpBfrz(paths) { // setup array buffers;
    const arrayBuffers = [];

    for (const path of paths) {
        const bfr = await getFilePt1(path);
        arrayBuffers.push(bfr);
    }

    return arrayBuffers;
}

async function setupSamplesPt2(bfrs) {
    const audioBuffers = [];

    for (const bfr of bfrs) {
        const sample = await getFilePt2(bfr);
        audioBuffers.push(sample);
    }

    console.log('audio buffers done');  // 2 ms rabi za ta postopek, če sta arraybufferja že narejena;
    return audioBuffers;
}

function playSample(audioBuffer, time) {    // to je način za predvajanje audia v Web audio (audioContext);
    const sample = audioCtx.createBufferSource();
    sample.buffer = audioBuffer;
    sample.connect(audioCtx.destination);
    sample.start(time); // ta start je kot play() v HTML 5;
}


//   -  -  -   IZVAJANJE  -  - 
if(initializeLayout()) {
    defineRevltnDurtn();
    drawControls();
    setNotchCoords(BOTH);
    
    //   -  -  -   POSLUŠALCI  -  -  vsaj en mora bit šele zdaj, ker je odvisen od stanja spremenljivke mobile;
    document.addEventListener('keydown', e => { atKeyPress(e.key) });
    foreCanv.addEventListener('click', touchDialB4SmplInit);
    canvRBeat.addEventListener('click', e => { beatCountCtrlOprtn(e) });
    canvLBeat.addEventListener('click', e => { beatCountCtrlOprtn(e) });
    canvPlayStop.addEventListener('click', playStopBtnOprtnB4SmplInit);
    tempoBeatsPMinLine.addEventListener('click', () => {atBpmLblClick(true)} );
    tempoBarsPMinLine.addEventListener('click', () => {atBpmLblClick(false)} );
    //infoIcon
    infoIcon.addEventListener('click', infoClick);
    divJokerCloseIcon.addEventListener('click', retireJoker);
    if (!mobileTouchWise) {  // poslušalci, ki merijo trajanje ali spremembo položaja klika in so zato ločeni glede na mobile ali ne;
        canvTempo.addEventListener('mousedown', (e) => {mouseDownOprtn(e)});
        canvTempo.addEventListener('mouseleave', (e) => {mouseLeaveOprtn(e)});
        canvTempo.addEventListener('mouseup', (e) => {mouseUpOprtn(e)});
        canvTempo.addEventListener('mousemove', (e) => {mouseMoveOprtn(e)});
    } else {
        canvTempo.addEventListener('touchstart', (e) => {touchStartOprtn(e)}, {passive : false});
        canvTempo.addEventListener('touchmove', (e) => {touchMoveOprtn(e)}, {passive : false});
        canvTempo.addEventListener('touchend', (e) => {touchEndOprtn(e)}, {passive : false});
    }
}
