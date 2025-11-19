'use strict';

// tick sounds
// dat klice asyncov v try catch al kaj takega;
// prilagdoljiva/različna hitrost L in D udarca (blinkanja) glede na njuno hitrost
    // v bistvu bi moralo upoštevat tudi kje je naslednji drugi udarec..
    // ..(na trajanje D udarca vpliva, kdaj se pojavi naslednji L udarec, če je to prej kot naslednji D udarec); 
// izklop zvoka; morda na po dva klikerja na vsaki strani: izklop zvoka in izklop blinkanja (še vedno se vedno vrti kazalec);
// dodat uvajalno odštevanje (opcija);

// moj stari: 360*560
// moj trenuten:  384*785 

// preverit
// v37
// init tudi s klikom na campleChg

let vers = 37;

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

let baseDimension, notchLength; // basedimention je stranica kvadratnega canvasa;
let r, rWas, crclX, crclY; //  crclX in Y sta koordinati središča kroga, na sredini width oz. hght canvasa; rWas je samo neka kontrolna, da pri resizanju ne-mobila ne računamo vedno notchev;
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
const arrayBfrsTmp = [];
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

class ClickSample {
    constructor(path) {
        this.path = path;
        this.buffer = undefined;
    }
}

const clickSmpls = [];
clickSmpls.push(new ClickSample('Perc_Can_hi.wav'));   // 0
clickSmpls.push(new ClickSample('Perc_Clap_hi.wav'));
clickSmpls.push(new ClickSample('Perc_MusicStand_hi.wav'));
clickSmpls.push(new ClickSample('Perc_MetronomeQuartz_hi.wav'));  // 3
clickSmpls.push(new ClickSample('Perc_PracticePad_hi.wav'));
clickSmpls.push(new ClickSample('Perc_Tongue_hi.wav'));
clickSmpls.push(new ClickSample('Synth_Block_C_hi.wav'));   // 6

// navedba 6 izbranih dvojic za referenco;
// (['Perc_Can_hi.wav','Perc_Clap_hi.wav']);
// (['Perc_MusicStand_hi.wav','Perc_Clap_hi.wav']);
// (['Perc_MetronomeQuartz_hi.wav','Perc_Clap_hi.wav']);
// (['Perc_PracticePad_hi.wav','Perc_Tongue_hi.wav']);
// (['Perc_PracticePad_hi.wav','Synth_Block_C_hi.wav']);
// (['Perc_MetronomeQuartz_hi.wav','Synth_Block_C_hi.wav']);

// ni slabo
// ['Perc_MetronomeQuartz_hi.wav','Perc_MusicStand_hi.wav'];
// ['Perc_MetronomeQuartz_hi.wav','Perc_Tamb_B_hi.wav'];
// ['Perc_Tongue_hi.wav','Perc_MusicStand_hi.wav'];

// Perc_Tongue_hi.wav - dober, suh, rezek, ampak prveč odrezav, preveč napade;

const clickDuos = {
    selctd : [0, 1],
    selctdDuoIdx : 0,
    catalog: [  // posamezen idx v katalogu pove, kateri sample se uporablja za desni beat ([0]) in kateri za levega ([1]);
        [0, 1],
        [2, 1],
        [3, 1],
        [4, 5],
        [4, 6],
        [3, 6]
    ],
    allLoaded: false
}

//  -  -  -  -  -   FUNKCIJE  -  -  -  -  -  -

function initializeLayout() {
    check4mobile();
    let doContinue = false;
    if(defineDimensions()) {
        console.log('mobileTouchWise:', mobileTouchWise);   // to mora bit tukaj, ker če ne se pri resizanju vedno znova kliče
        console.log('mobileSizeWise:', mobileSizeWise); // na mobilnem tellefonu sta oba true, le ipad ima mešano;
        setupSamplesPt1StpBfrz(/*samplePaths*/).then((/*response*/) => {
            // arrayBfrs = response;    // tako je bilo včasih, ko smo še prejemali response; setupSamplesPt1StpBfrz sicer samodejno vrača Promise, ker je async/await;
            console.log('arrays done');
        });
        doContinue = true;
    }   // else (samo v primeru mobile + horiz.postavitev) smo prikazali displayHrzWarn(false), tj. sporočilo, da se app ne bo zagnal;
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

    if(!mobileSizeWise) {
        baseDimension = 444;
        notchLength = 20;

        canvPlayStop.width = 80;

        // ta rWas == undefined je zato, da se listener doda samo 1x; če večkrat dodaš event listener, se večkrat izvaja, tako je blo videt ...
        if(rWas == undefined) window.addEventListener('resize', () => {
            defineDimensions();
            drawControls();
            if(r == rWas) drawDialAndIndicator();
                else setNotchCoordsNdDraw(BOTH);
            rWas = r;
        });
    } else {
        // treba dat sem, ker mora veljat tako za pokončni kot za ležeči začetek, v naslednji vrstici pa je potencialno return;
        divJokerForegnd.style.top = '80px';
        divJokerForegnd.style.right = '32px';
        divJokerForegnd.style.bottom = '60px';
        divJokerForegnd.style.left = '32px';

        if(screen.orientation.angle == 90 || screen.orientation.angle == 270) {
            // app si torej začel v horiz. postavitvi, takoj damo opozorilo, da to ne gre in de facto končamo;
            displayHrzWarn(false);
            return false;
        }
        
        baseDimension = viewPrtRect.width - 36; // 18 roba na vsaki strani;
        if(baseDimension % 2 == 1) baseDimension = baseDimension - 1;
        notchLength = 16;
        
        // to mora bit tu, ker se pozneje lahko spremeni, obraten vrstni red pa ne gre;
        lBeatDigit.style.fontSize = '44px';
        rBeatDigit.style.fontSize = '44px';

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

    chkDimnsnConstrnts();
    
    // izpeljemo iz baseDim;
    if(baseDimension == 444) r = 200;    // 444 je na namiznem, ki ima dovolj velik viewport; baseDim - 2*20(notch) - 2*2 (zaradi debeline 3, da ni prirezano);
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

    if (document.readyState == 'loading') { // to je true samo pri loadanju strani, pri resizanju (ne-mobile) pa ne;
        document.addEventListener("DOMContentLoaded", positionElems);  // domcontent loaded je lahko "complete" ali pa "interactive";
    } else {
        positionElems();
    }

    return true;
}

function chkDimnsnConstrnts(){
    // zahteve: 
    // ne-mobile: 500*870;
    // mobile: 360*(širina + 302);

    // preverimo, al bo treba krajšat po višini;
    // postavitev na mobilni napravi je priveto taka: viewPrtRect.width + 302, pri čemer je 302 sestavljeno tako:
    // 43 (div titleP) + (viewPrtRect.width - 36 (basedimension = višina canvasa)) + 178 (visok beat div )+ 116 (visok bpmDiv) + 1 (borderBody);
    // neobdelana postavitev na ne-mobilni napravi je visoka 870;
    const defaultHght = mobileSizeWise ? viewPrtRect.width + 302 : 870;  
    if((defaultHght > viewPrtRect.height)) {
        const totalDiffToBridge = defaultHght - viewPrtRect.height;
        console.log('treba urejat velikost postavitve, višina bila:',  defaultHght, 'skinit bo treba: ', totalDiffToBridge);
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
    
    // še čekirat širino;
    const minWidth = mobileSizeWise ? 360 : 500;
    if(viewPrtRect.width < minWidth) {
        // za določit r kroga;
        baseDimension = viewPrtRect.width - 36; // 18 roba na vsaki strani;
        if(baseDimension % 2 == 1) baseDimension = baseDimension - 1;

        // za popravit margine in fonte;
        let diff = minWidth - viewPrtRect.width;
        if(diff % 2 == 1) diff++;
        if(diff >= 24) {
            lBeatDigit.style.fontSize = '36px';
            rBeatDigit.style.fontSize = '36px';
            lBeatDigit.style.paddingTop = '44px';
            rBeatDigit.style.paddingTop = '44px';
            valueBeatPMin.style.marginRight = '6px';
            valueBarsPMin.style.marginRight = '6px';
            canvTempo.style.marginLeft = '4px';
            if(!mobileSizeWise) { // na namiznem je treba še dodatno ožat, pri mobile smo to že;
                // izbrišemo lable, ker vplivajo na širino;
                const toRemove = document.getElementsByClassName('label')
                toRemove[0].classList.add('hidden');
                toRemove[0].style.marginBottom = '0px'; // hidden ne zadošča, je treba tudi margin ločeno skint, ker če ne zaseda višino;
                toRemove[1].innerHTML = '';
                toRemove[1].style.marginBottom = '0px';
                // še margini on gumbov za število dob;
                canvLBeat.style.marginLeft = '12px';
                canvLBeat.style.marginRight = '24px';
                canvRBeat.style.marginLeft = '24px';
                canvRBeat.style.marginRight = '12px';
            }
        }
        diff = 30 - diff / 2;   // diff tukaj v resnici postane nov margin, ne diff; 30, ker je 30 margin LD okoli srednjega gumba in tega zmanjšujemo;
        if(diff < 4) diff = 4;
        canvPlayStop.style.marginLeft = `${diff}px`;
        canvPlayStop.style.marginRight = `${diff}px`;
    }
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
    if(evalStartBtnClick(e)) {
        if(isRotating == null) startRotating();
        else stopRotation();
    }
}

function evalStartBtnClick(e) {
    let reslt = false;
    if((e.clientY > playBtnTop) && (e.clientY < (playBtnTop + playBtnHght))) reslt = true;
    return reslt;

}

function initAudioAndStart() {
    setupSamplesPt2().then(() => {
        startRotating(); // zagnat;
        setListnrsAftrInit();   // poštimat listenerje;
        console.log('Začetek preloadanja, čas:', Date.now())
        preLoadNext();
    });
}

function playStopBtnOprtnB4SmplInit(e) {
    if(evalStartBtnClick(e)) {
        initAudioAndStart();
    }
}

function setListnrsAftrInit() {
    // na play gumbu se ju zamenja;
    canvPlayStop.removeEventListener('click', playStopBtnOprtnB4SmplInit);
    canvPlayStop.addEventListener('click', playStopBtnOprtn);
    // na številčnici prav tako:
    foreCanv.removeEventListener('click', touchDialB4SmplInit);
    foreCanv.addEventListener('click', touchDial);
    // za spremembo samplov;
    titleP.removeEventListener('click', sampleClckB4Init);
    titleP.addEventListener('click', sampleClick);
}

function beatCountCtrlOprtn(e) {
    let actionedBeat, isActionedRBeat, minLimit;
    if(e.target == canvRBeat) {
        actionedBeat = mainBeat;
        isActionedRBeat = true;
        minLimit = 2;   // katera je najmanjša vrednost, ki jo lahko zavzame ta beat count; desni == 2;
    } else {
        actionedBeat = leftBeat;
        isActionedRBeat = false;
        minLimit = 1;   // 1 služi za izklop, pri ena je levi beat izklopljen;
    }
    let doChange = false; 
    let wasMaxed = false; // shrani potrditev, da je gumb, preden si ga pritisnil, bil razbarvan/neaktiven (imel največjo vrednost navzgor ali navzdol);
    beatCanvPos.y = e.clientY - beatCanvPos.top;

    if (beatCanvPos.y < 60) {
        // pritisk na zgornjo puščico, za povečanje števila dob;
        if(actionedBeat < 12) {
            if(actionedBeat == minLimit) wasMaxed = true;  // je bil neaktiven na spodnji meji;
            actionedBeat++;
            doChange = true;
            if(actionedBeat == 12) {    // če si dosegel zgornji max, deaktivirat zgornjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, false, true);
                else drawBeatCount(LEFT, false, true);
            } else if(wasMaxed) { // če pa si zapustil spodnjo mejo, aktivirat spodnjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, true, true);
                else drawBeatCount(LEFT, true, true);
            }
        }
    } else if(beatCanvPos.y > 76) {   // pritisk na spodnjo puščico, za zmanjšanje števila dob;
        if(actionedBeat > minLimit) {
            if(actionedBeat == 12) wasMaxed = true;  // je bil neaktiven na zgornji meji;
            actionedBeat--;
            doChange = true;
            if(actionedBeat == minLimit) { // če si dosegel spodnji max, deaktivirat spodnjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, true, false);
                else drawBeatCount(LEFT, true, false)
            } else if(wasMaxed) {   // če pa si zapustil zgornje nedovoljeno območje, aktivirat zgornjo puščico;
                if(isActionedRBeat) drawBeatCount(RIGHT, true, true);
                else drawBeatCount(LEFT, true, true);
            }
        }
    }
    if(doChange) {
        if(isRotating!= null) stopRotation();
        if(isActionedRBeat) { 
            mainBeat = actionedBeat;
            rBeatDigit.innerHTML = mainBeat;
            setNotchCoordsNdDraw(RIGHT);
            defineRotationParams(); // samo če si spremenil desni beat, ker je on merilo 
        } else {
            leftBeat = actionedBeat;
            if(leftBeat > 1) {
                lBeatDigit.innerHTML = leftBeat;
            } else {
                lBeatDigit.innerHTML = '--';    // shranjeno je 1, prikazano je –;
            }
            setNotchCoordsNdDraw(LEFT);
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

function defineRotationParams() {
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
            } else {
                frameDurtn = 10;
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

function rotateMainHlpr(passdNotches, which, nowT) {

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
    
    // si zabeležimo, da izbrišemo čez čas, okoli 150ms;
    // zvoka trajata okoli 169 ms, morda je OK, če sveti približno toliko
    notchesResets.push([nowT + blinkDurtn, startX, startY, endX, endY]);
    
    // dodamo trigger za naslednji blink;
    // najprej njegov index;
    if (blinkIdx == passdNotchCoords.length - 1) passdNotches.nextBlinkIdx = 0;
    else passdNotches.nextBlinkIdx++;
    passdNotches.nextBlinkAngle = passdNotchCoords[passdNotches.nextBlinkIdx].angle // nato še njegov kot;
}

function rotate() {
    // izračunamo kot, kamor trenutno kaže kazalec;
    const nowT = Date.now();
    angle += (nowT - prevT) * revltnConst // delež kota 360'; če ne bi prej izračunal konstante, bi bilo tako: dAngle = (dT / revltnDurtn) * twoPI; dT = nowT - prevT;
    if(angle > twoPI) angle -= twoPI;
    prevT = nowT;
    let doR = false, doL = false; // doL, doR pomeni doLeft, doRight; gre na true, če se pri preverjanju zvoka ugotovi, da je izpolnjen pogoj za blinkanje (L/R);

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

    // najprej zvok;
    doSnd(notches.main, RIGHT);
    if(leftBeat > 1) doSnd(notches.left, LEFT); // če je levi beat == 1 je itak doL false, ni treba ločeno preverjat;
    
    // risanje utripanja;
    if(doR) rotateMainHlpr(notches.main, RIGHT, nowT);
    if(doL) rotateMainHlpr(notches.left, LEFT , nowT); // če je levi beat == 1 je itak doL false, ni treba ločeno preverjat;

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
    helper(notches.main.coords);    // desnega narišemo v vsakem primeru;
    if (leftBeat > 1) {     // levega pa pogojno - pri 1 ne izrišemo zareze, levi beat je neaktiven;
        helper(notches.left.coords);
    }

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

function setNotchCoordsNdDraw(WHICH) {    // ne samo izračuna oznake, ampak jih tudi izriše;
    
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

    // izračun lokacij oznak dob na krožnici;
    if (WHICH == RIGHT || WHICH == BOTH) {  // obe hkrati izračunamo samo pri zagonu programa;
        helper(mainBeat, notches.main.coords);
    }
    if ((WHICH == LEFT && leftBeat > 1) || WHICH == BOTH) { // pri 1 ne rabimo računat, levi beat je izklopljen - ni oznak, ni zvoka;
        helper(leftBeat, notches.left.coords);
    }

    // izris ozadja in s tem tudi oznak;
    drawDialAndIndicator();
}

function zvok(which) {
    if(which == RIGHT) {
        playSample(clickSmpls[clickDuos.selctd[0]].buffer); // 0 je za glevnega, desnega;
    } else playSample(clickSmpls[clickDuos.selctd[1]].buffer); // 1 je zvok za levi beat;
}

//  -  -  -  -   AudioContext  - - - - - -
// varianta funkcije getFile v enem kosu (ko je audioCtx že aktiven);
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

// varianta funkcije setupSamples v enem kosu (ko je audioCtx že aktiven)
async function setupSamples(paths) {
    const audioBuffers = [];
    for (const path of paths) {
        const sample = await getFile(path);
        audioBuffers.push(sample);
    }
    return audioBuffers;
}

async function setupSamplesPt1StpBfrz(/*paths*/) { // setup array buffers;
    
    for(let i = 0; i < 2; i++) {
        const bfr = await getFilePt1(clickSmpls[i].path);
        arrayBfrsTmp.push(bfr);
    }
    
    // originalna implmentacija z returnom; na isti način je bil narejen pt2;
    // const arrayBuffers = [];
    // for (const path of paths) {
    //     const bfr = await getFilePt1(path);
    //     arrayBuffers.push(bfr);
    // }
    // return arrayBuffers;
}

async function setupSamplesPt2() {  // naštima clickSmpls 0 in 1;
    
    for (let i = 0; i < 2; i++) {
        clickSmpls[i].buffer = await getFilePt2(arrayBfrsTmp[i]);;
    }
    console.log('audio buffers done');  // 2 ms rabi za ta postopek, če sta arraybufferja že narejena;
}

async function preLoadNext() {  // ko recimo izberemo dvojico zvokov z indeksom 1, se preloadajo že zvoki za dvojico zvokov z indeksom 2, da je pripravljeno;
    const toLoad = [];
    if(clickDuos.selctdDuoIdx < (clickDuos.catalog.length - 2)) {
        for(let i = 0; i < 2; i++) {
            const pathIdx = clickDuos.catalog[clickDuos.selctdDuoIdx + 1][i];
            if(clickSmpls[pathIdx].buffer == undefined) {
                toLoad.push(pathIdx);
                console.log('Preloadamo za idx:', clickDuos.selctdDuoIdx + 1, ', treba naloadat sample idx:', pathIdx);
            } else console.log('Preloadamo za idx:', clickDuos.selctdDuoIdx + 1, ', NI treba naloadat sampla idx:', pathIdx);
        }
    }

    // pribl. 10ms za naloadat 1 sample doma v Visual Studio Code;
    // pribl. 15ms za naloadat 2 sampla doma v Visual Studio Code;
    // od 20-140 ms/sample za naloadat z dejanskega spletnega mesta v brskalniku;
    if(toLoad.length > 0) for(const idx of toLoad) {  // prejme torej idx v clickSmpls, ki ga je treba naloadat;
        clickSmpls[idx].buffer = await getFile(clickSmpls[idx].path);
        console.log('Naloadano, čas:', Date.now());
    }
    
    if(!clickDuos.allLoaded) {
        let allLoadd = true;
        for (let i = 0; i < clickSmpls.length; i++) {
            if(clickSmpls[i].buffer == undefined) {
                allLoadd = false;
            }
        }
        if(allLoadd) {
            clickDuos.allLoaded = true;
            console.log('- - -  VSI NALOŽENI  - - -')
        }
    }
    console.log('- - - - -');
}

function perfrmDuoChg(nextIdx) {
    clickDuos.selctdDuoIdx = nextIdx;
    clickDuos.selctd = clickDuos.catalog[clickDuos.selctdDuoIdx];
    console.log('Nastavljamo izbiro; selctdIdx:', clickDuos.selctdDuoIdx, 'selected duo:', clickDuos.selctd);
}

function sampleClick() {
    console.log('sample click normal (after init)')
    const nextIdx = clickDuos.selctdDuoIdx == clickDuos.catalog.length - 1 ? 0 : clickDuos.selctdDuoIdx + 1;
    console.log('sample click; currentIdx:', clickDuos.selctdDuoIdx, 'nextIdx:', nextIdx);
    if(clickDuos.allLoaded) { // če so vsi že naloadani;
        // samo zamenjamo idx izbranega;
        perfrmDuoChg(nextIdx);
        console.log('- - (vsi naloženi) - - -');
    } else {
        const idxs = clickDuos.catalog[nextIdx] // array 2 idx-ov ki predstavljata položaj v clickSamples;
        // preklop na novi idx in preloadanje še naslednjega naredimo le, če sta sampla za novi idx že preloadana..
        // ..do nasprotnega primera bi lahko prišlo le, če je preloadanje za naslednji idx že bilo sproženo, a še ni končano!!.. 
        // ..če bi kdo prehitro klikal, bi se torej nova izbira ne izvedla in tudi naslednje preloadanje se ne bi sprožilo;
        if(clickSmpls[idxs[0]].buffer != undefined && clickSmpls[idxs[1]].buffer != undefined) {
            // najprej zamenjamo idx izbranega;
            perfrmDuoChg(nextIdx);
            // preloadamo naslednjega;
            console.log('Preloadanje naslednjega; začetek:', Date.now());
            preLoadNext();
        } else console.log(' -  -   prehitro si kliknil  -  -  -')
    }
}

function sampleClckB4Init() {
    // najprej dokončat loadanje idxov 0 in 1, kot da bi kliknil start, samo brez 
    setupSamplesPt2().then(() => {
        setListnrsAftrInit();   // poštimat listenerje;
        console.log('Začetek preloadanja, čas:', Date.now())
        preLoadNext().then(() => {
            sampleClick();
        });
    });
}

function playSample(audioBuffer) {    // to je način za predvajanje audia v Web audio (audioContext);
    const sample = audioCtx.createBufferSource();
    sample.buffer = audioBuffer;
    sample.connect(audioCtx.destination);
    sample.start(0); // ta start je kot play() v HTML 5;
}


//   -  -  -   IZVAJANJE  -  - 
if(initializeLayout()) {
    defineRotationParams();
    drawControls();
    setNotchCoordsNdDraw(BOTH);
    rWas = r;   // se koristi samo pri ne-mobile, ko resize; se mora shranit šele na tej točki, ne tekom definiranja dimenzij, ker se uporabi po definiranju dimenzij;
    
    //   -  -  -   POSLUŠALCI  -  -  vsaj en mora bit šele zdaj, ker je odvisen od stanja spremenljivke mobile;
    document.addEventListener('keydown', e => { atKeyPress(e.key) });
    foreCanv.addEventListener('click', touchDialB4SmplInit);
    canvRBeat.addEventListener('click', e => { beatCountCtrlOprtn(e) });
    canvLBeat.addEventListener('click', e => { beatCountCtrlOprtn(e) });
    canvPlayStop.addEventListener('click', playStopBtnOprtnB4SmplInit);
    tempoBeatsPMinLine.addEventListener('click', () => {atBpmLblClick(true)} );
    tempoBarsPMinLine.addEventListener('click', () => {atBpmLblClick(false)} );
    titleP.addEventListener('click', sampleClckB4Init);
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
