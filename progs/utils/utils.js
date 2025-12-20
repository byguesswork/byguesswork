'use strict';

// Mobile 5em - prav zares daj tako
// Je font res manjsi ko mobile?, ni videt
// Kako je v mobile postavljen joker, zavesa ne pokrije vsega ko gledas i za toggle
    // Uporabit fixed, al je ze?
// morda na nek način še prikaz v tileih, če vneseš le 2 cifri, recimo da bi bila polja neke barve (črna?) in samo menjaš prosojnost glede na sifro;
// da se pojavi copy to clipboard, ko da rezultat (in izgine ko daš reset ali se pojavi napaka ali kličeš spraznjenje polja za rezultat);

const avgHexHandles = {
    calc_btn: document.getElementById('btn_avg_hex_calc'),
    value1_input: document.getElementById('inpt_avg_hex_1'),
    value2_input: document.getElementById('inpt_avg_hex_2'),
    ratio_input: document.getElementById('inpt_avg_hex_ratio'),
    color1_tile: document.getElementById('avg_hx_inpt1_colr'), // tile so una polja, kjer je not prikazana barva;
    color2_tile: document.getElementById('avg_hx_inpt2_colr'),
    reslt_row: document.getElementById('reslt_row'),
    reslt_outputSpan: document.getElementById('avg_hex_reslt_output'),
    colorResult_tile: document.getElementById('avg_hx_reslt_colr'),
    err_tableRow: document.getElementById('error_line'),
    err_output: document.getElementById('avg_hex_err_output'),
    reset_btn: document.getElementById('btn_reset'),
    infoIcon_div: document.getElementById('avg_hex_info_icon'),
}
const infoIcons = document.getElementsByClassName('info_icon_desktop');
const divTogglesInfo = document.getElementById('toggles_info_icon');
const divJokerBckgnd = document.getElementById('joker_bckgnd');
const divJokerForegnd = document.getElementById('joker_foregnd');
const divJokerCloseIcon = document.getElementById('joker_close_icon');
const jokerContent = document.getElementById('joker_content');

avgHexHandles.calc_btn.addEventListener('click', (e) => { 
    e.preventDefault();
    avgHexValdteCalcBtn(e) 
});
document.addEventListener('keydown', (e) => { atKeyDown(e) });  // mora bit keydown, ker keypress ne zaznava Esc (in še kakšne druge tipke);
avgHexHandles.reset_btn.addEventListener('click', () => { 
    avgHexClrResltFldNTile();    
    // vnosni polji input1 in 2 se samodejno počistita, ker ima gumb reset nastavljeno type=reset, prav tako se s tem  počisti ratio polje;
    disactvteInputTiles();  // ploščici z barvo pri inputuh 1 in 2 pa je treba ročno ponastaviti;
    avgHexhideErrRow();
    avgHexHandles.value1_input.focus();
});
avgHexHandles.infoIcon_div.addEventListener('click', avgHexInfoClick);
divTogglesInfo.addEventListener('click', togglesInfoClick);
divJokerCloseIcon.addEventListener('click', retireJoker);

const avgHex = {
    lastInteractdInput: undefined, // tisto input polje, v katerm si (nazadnje bil);
    otherThanIntrctd: undefined,    // tisto input polje, ki ni lastInteractdInput;
    isResltRowShown: false,
    isAreColrTilesShwn: false,
    inactveTileBckgnd: `linear-gradient(to top right,
             #bbbbbb 0%,
             #bbbbbb calc(50% - 0.8px),
             #555555 50%,
             #bbbbbb calc(50% + 0.8px),
             #bbbbbb 100%)`,
    inactveTileBordrColr: '#555555',
    activeTileBordrColr: '#404040',
}
let mobile = false;
let divSigture, lesserHeight; // sigture in lesserHeight se bo rabilo, samo če bo mobile;
let mobileIntervalChecker = null;
let jokerOpen = false;
let width;


//   -  -  -  -  -   FUNKCIJE  -  -  -  
function initialize() {
    check4mobile();
    defineDimensions();
}

function check4mobile() {
    if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
        console.log('mobile');
        mobile = true;
        divSigture = document.getElementById('sigture');
    
        screen.orientation.addEventListener("change", mobileHorizontalAdjstmts );
    }
}

function defineDimensions() {
   
    width = document.documentElement.clientWidth < window.innerWidth ? document.documentElement.clientWidth : window.innerWidth;
    if(screen.width < width) width = screen.width;
    if(width > 400) {
        divJokerForegnd.style.left = `${width * 0.2}px`;
        divJokerForegnd.style.right = `${width * 0.2}px`;
    } else {
        divJokerForegnd.style.left = '40px';
        divJokerForegnd.style.right = '40px';
    }
    if(width < 900) { 
        for(let i = 0; i < infoIcons.length; i++) {
            infoIcons[i].classList.add('info_icon_white'); // to naredi info krog bel (prej zelen);
        }
    }

     if(mobile) {
        divJokerForegnd.style.top = '120px';
        document.getElementById('utilities_title_section').style.marginLeft = '24px';
        for(let i = 0; i < infoIcons.length; i++) {
            infoIcons[i].classList.add('info_icon_mobile'); // to naredi, da se info krog premakne eno vrstico nad vsebino, da se ne prekriva;
        }
        const utilDivs = document.getElementsByClassName('util_div');
        for(let i = 0; i < utilDivs.length; i++) {
            utilDivs[i].style.marginLeft = '20px'; //24
        }

        avgHexHandles.calc_btn.style.marginLeft = '8px';
        avgHexHandles.calc_btn.style.fontSize = '13px';

        document.getElementsByTagName('form')[0].style.fontSize = '15px';

        mobileHorizontalAdjstmts();
    }
}

function mobileHorizontalAdjstmts() {
    if(mobileIntervalChecker == null) {
        mobileIntervalChecker = setInterval(mobileHozAdjstmsDo, 100);
    }
}

function mobileHozAdjstmsDo() {

    lesserHeight = document.documentElement.clientHeight < screen.height ? document.documentElement.clientHeight : screen.height;
    console.log('element', document.documentElement.clientHeight, ', skrin hajt: ', screen.height, ', lesserH:', lesserHeight);
    console.log('bodyHght:', document.documentElement.getBoundingClientRect().height, 'signatureHght: ', divSigture.getBoundingClientRect().height);

    if((document.documentElement.getBoundingClientRect().height + divSigture.getBoundingClientRect().height) > lesserHeight) {
        divSigture.style.position = 'static';   // druzga ni treba urejat, ker mikro položaj je urejen s padingom in ta je tudi vštet v višino ..
        // .. (bottom, ki je del positiona, ni vštat v višino, tisto bi moral ločeno prištet, če bi uporabljal!!);
    } else {
        divSigture.style.position = 'absolute';
    }

    clearInterval(mobileIntervalChecker);
    mobileIntervalChecker = null;
}

function atKeyDown(e) {
    if(document.activeElement == avgHexHandles.value1_input) {
        avgHex.lastInteractdInput = avgHexHandles.value1_input;
        avgHex.otherThanIntrctd = avgHexHandles.value2_input;
    } else if(document.activeElement == avgHexHandles.value2_input) {
        avgHex.lastInteractdInput = avgHexHandles.value2_input;
        avgHex.otherThanIntrctd = avgHexHandles.value1_input;
    }
    if(e.code == 'Enter') {
        if(e.target == avgHexHandles.value1_input || e.target == avgHexHandles.value2_input) {
            e.preventDefault(); // dam sem in ne prej, ker na gumbu Calculate mora vseeno delat; samo na teh dveh ne sme;
            avgHexChkInptFieldsNCalc();
        }
    } else if (e.key == 'Escape' || e.code == 'Esc' || e.code == 'Escape' || e.key == 'Esc') {
        if(jokerOpen) retireJoker();
    }
}


//  -  -  -  -   Hex sensus stricto  -  -  -  -;
function avgHexChkInptFieldsNCalc() {

    // preverja po vrstnem redu: najprej avgHex.lastInteractdInput, potem ta drugi, ni pa važno, al je lastInteractdInput input1 ali input2 (slednje je važno pri izračunu rezultata);
    
    function helper2(which) {
        if(which == avgHexHandles.value1_input) disactvteTile(avgHexHandles.color1_tile);
            else disactvteTile(avgHexHandles.color2_tile);
    }

    function helper(which) {
        if(!avgHexChkIfEmpty(which.value)) {
            let hexVal = avgHexChkLgth(which.value);
            if(hexVal !== false) {  // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
                if(avgHcChkCharsValid(hexVal)) {
                    return hexVal;
                } else {
                    avgHexOutputErrMsg('Invalid characters.<br>Allowed: 0-9, a-f, A-F');
                    helper2(which);
                    return false;
                }
            } else {
                avgHexOutputErrMsg('Input length not OK.<br>Should be 2, 3 or 6 chars (see info icon)');
                helper2(which);
                return false;
            }
        } else {
            avgHexOutputErrMsg('Input field is empty, enter some data.');
            helper2(which);
            return false;
        }
    }
    
    avgHexClrResltFldNTile();
    avgHexhideErrRow();
    let informCalcValidator = false;    // če je to true, obvestimo avgHexValdteCalcBtn, da je prvo polje imelo error, da potem ne preverja še drugega polja;
        // ker če ne je tako, da prvo polje odkrije recimo "Invalid characters", ampak če je drugo prazno, se prikaže error "input field is empty", kar je mal zavajajoče;
        const lastIntractdInptVal = helper(avgHex.lastInteractdInput);  // to dela preverjanja in iz 3-mestne naredi 6-mestno;
        if(lastIntractdInptVal !== false) {  // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
            if(avgHex.otherThanIntrctd.value.length != 0) {
                const otherVal = helper(avgHex.otherThanIntrctd);
                if(otherVal !== false) {    // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
                    if(lastIntractdInptVal.length == otherVal.length) {
                    // da pošljemo vedno tako , da 1. argument pošilja podatek za 1. (gornji) input;
                    if(avgHex.lastInteractdInput == avgHexHandles.value1_input) {
                        avgHexCalcNDisplay(lastIntractdInptVal, otherVal);
                    } else {
                        avgHexCalcNDisplay(otherVal, lastIntractdInptVal);
                    }
                } else {
                    avgHexOutputErrMsg('The 2 inputs shall be of same length.<br>Length of 3 counts as length of 6');
                }
            } else {avgHex.otherThanIntrctd.focus(); } // če je v drugi celici napaka (izpisana v helperju), se prestavimo tja;
        } else {
            avgHex.otherThanIntrctd.focus();
            avgHexhideErrRow(); // da izbrišemo morebitni error v reslt fld;
        }
    } else informCalcValidator = true;
    return informCalcValidator; // to vrednost bere/rabi samo avgHexValdteCalcBtn, opisano zgoraj, zakaj; glej tudi dotično fx;
}

function avgHexOutputErrMsg(msg) {
    avgHexHandles.err_tableRow.classList.remove('hidden');
    avgHexHandles.err_output.innerHTML = msg;
}

function avgHexChkIfEmpty(passdStr) {
    if (passdStr.length == 0) return true;
        else return false;
}

function avgHexChkLgth(passdStr) {
    if (passdStr.length == 2 || passdStr.length == 6) {
        return passdStr;
    } else if (passdStr.length == 3) {
        let newStr = passdStr[0];
        newStr += passdStr[0];
        for(let i = 1; i <= 2; i++) {
            newStr += passdStr[i];
            newStr += passdStr[i];            
        }
        return newStr;
    } else {
        return false;
    }
}

function avgHcChkCharsValid(passdStr) {
    let reslt = true;
    const bench = ['0', '1','2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'A', 'B', 'C', 'D', 'E', 'F'];
    for(let i = 0; i < passdStr.length; i++) {
        if(bench.indexOf(passdStr[i]) == -1 ) reslt = false;
    }
    return reslt;
}

// rabi se samo za klik na gumb Calculate;
function avgHexValdteCalcBtn(e) {   // za enter se ne rabi, ker nima veze, da ti izpiše error, ko na prvem polju stisneš enter, samo prestavi te v drugega;
    // nazadnje obdelanemu vrnemo fokus, ker ob kliku na gumb dobi gumb fokus;
    avgHex.lastInteractdInput.focus();
    const firstFieldFailed = avgHexChkInptFieldsNCalc();
    // ker obstaja možnost, da je eno polje prazno (do zdaj te je samo dalo vanj, ker taka je funkcionalnost pri avgHexChkInptFieldsNCalc(), ..
    // .. saj ob pristisku na enter (tudi uporablja avgHexChkInpt...) te samo prestavi v naslednje polje), je treba še preverit za praznost drugega polja;
    if(!firstFieldFailed && (avgHex.lastInteractdInput.value.length == 0 || avgHex.otherThanIntrctd.value.length == 0)) {
        avgHexOutputErrMsg('Input field is empty, enter some data.');
        console.log('poseben primer');
    };
}

// za rabo v ozadju, v kodi
function avgHexCalc(firstHex, secondHex, ratio) {
    // oba hexa morata biti 6-mestna in veljavna, ratio mora bit med 0 in 1; ni preverjanja za napake;
    
    // izračuni;
    let reslt = ''; // ker je to string, se bojo spodaj številke samodejno spremenile v besedilo;
    for (let i = 0; 2 * i < firstHex.length; i++) { // ker imata oba isto dolžino (predhodno preverjanje), prverjamo tu samo enega;
        const firstDec = hex2dec2digits(firstHex.slice(2 * i, 2 * i + 2));
        const secondDec = hex2dec2digits(secondHex.slice(2 * i, 2 * i + 2));
        let midOfWayHex;
        midOfWayHex = decToHex(firstDec + (secondDec - firstDec) * ratio);
        reslt += midOfWayHex;   // ker je to string se rezultati dodajajo v string;
    }
    return reslt;
}

function avgHexCalcNDisplay(firstHex, secondHex) {
    // ratio
    let ratio;
    if(avgHexHandles.ratio_input.value == '') ratio = 0.5;
        else {
            ratio = Number(avgHexHandles.ratio_input.value);
            if(ratio < 0 || ratio > 1) {
                ratio = 0.5;
                avgHexHandles.ratio_input.value = '';
            }
        }
    // console.log(ratio);
    
    // izračuni;
    let reslt = ''; // ker je to string, se bojo spodaj številke samodejno spremenile v besedilo;
    for (let i = 0; 2 * i < firstHex.length; i++) { // ker imata oba isto dolžino (predhodno preverjanje), prverjamo tu samo enega;
        const firstDec = hex2dec2digits(firstHex.slice(2 * i, 2 * i + 2));
        const secondDec = hex2dec2digits(secondHex.slice(2 * i, 2 * i + 2));
        let midOfWayHex;
        midOfWayHex = decToHex(firstDec + (secondDec - firstDec) * ratio);
        // midOfWayHex = decToHex((firstDec + secondDec) / 2);
        reslt += midOfWayHex;   // ker je to string se rezultati dodajajo v string;
        // console.log(firstHex.slice(2 * i, 2 * i + 2), secondHex.slice(2 * i, 2 * i + 2), 'vmesna vrednost:', midOfWayHex);
    }
    if(!avgHex.isResltRowShown) {
        avgHexHandles.reslt_row.classList.remove('hidden');
        avgHex.isResltRowShown = true;
    }
    avgHexHandles.reslt_outputSpan.innerHTML = reslt;

    // morebiten izris barv;
    if(reslt.length == 6) {
        renderColorTile(avgHexHandles.color1_tile, "#" + firstHex);
        renderColorTile(avgHexHandles.color2_tile, `#${secondHex}`);
        renderColorTile(avgHexHandles.colorResult_tile, `#${reslt}`);
        
        // to se izvede samo enkrat;
        if(!avgHex.isAreColrTilesShwn) {
            avgHexShowColorTiles();
            avgHex.isAreColrTilesShwn = true;
        }
    }
    // console.log('rezultat:', reslt);
    console.log('- - - - - -');
}

function renderColorTile(tile, colr) {
    tile.style.borderColor = avgHex.activeTileBordrColr;
    tile.style.background = colr;
}

function avgHexClrResltFldNTile() {
    avgHexHandles.reslt_outputSpan.innerHTML = '&nbsp;&nbsp;';   // mora imet nbsp, ker elemnt nima določene višine, brez nbsp bi se sesedel;
    disactvteTile(avgHexHandles.colorResult_tile);
}

function disactvteInputTiles() {    // to je mišljeno disactivate color tiles of inputs (input1 in input2)
    disactvteTile(avgHexHandles.color1_tile);
    disactvteTile(avgHexHandles.color2_tile);
}

function disactvteTile(tile) {  // to je mišljeno, da uno ploščico, kjer je not prikazana barva, izrišeš kot neaktivno, tj sivo in prečrtano;
    tile.style.borderColor = avgHex.inactveTileBordrColr;
    tile.style.background = avgHex.inactveTileBckgnd;
}

function avgHexhideErrRow(){
    avgHexHandles.err_tableRow.classList.add('hidden');
}

function avgHexShowColorTiles() {   // ta se izvede samo enkrat;
    avgHexHandles.colorResult_tile.classList.remove('hidden');
    avgHexHandles.color1_tile.classList.remove('hidden');
    avgHexHandles.color2_tile.classList.remove('hidden');
}

function decToHex(num) {    // prejet mora število od 0-255;
    let quot = Math.floor(num / 16);
    if (quot > 9) switch (quot) {
        case (10): quot = 'a'; break;
        case (11): quot = 'b'; break;
        case (12): quot = 'c'; break;
        case (13): quot = 'd'; break;
        case (14): quot = 'e'; break;
        case (15): quot = 'f'; break;
    }
    let rem = Math.floor(num % 16);
    if (rem > 9) switch (rem) {
        case (10): rem = 'a'; break;
        case (11): rem = 'b'; break;
        case (12): rem = 'c'; break;
        case (13): rem = 'd'; break;
        case (14): rem = 'e'; break;
        case (15): rem = 'f'; break;
    }
    return `${quot}${rem}`;
}

function hex2dec2digits(niz) {  // prejme 2-mestni hex niz in vrne razpon 0-255;
    // if (niz.length != 2) {   // trenutno to preverjanje ni potrebno, ker sem pošilja samo, če je dvomestno (in ima le hex znake);
    //     console.log('predolg ali prekratek niz poslan v hex2dec2digits; niz mora biti dolg točno 2 znaka in predstavljati mora hex vrednost');
    //     return
    // }
    let verHex = [niz[0], niz[1]];  // na nizu (stringu) ni mogoče zagnat forEach, zato v array;
    verHex.forEach(function (val, i) {
        if (val === 'a' || val == 'A') verHex[i] = 10; else
            if (val === 'b' || val == 'B') verHex[i] = 11; else
                if (val === 'c' || val == 'C') verHex[i] = 12; else
                    if (val === 'd' || val == 'D') verHex[i] = 13; else
                        if (val === 'e' || val == 'E') verHex[i] = 14; else
                            if (val === 'f' || val == 'F') verHex[i] = 15;
        else verHex[i] = Number(verHex[i]); // za številke od 0-9, ki so do sedaj zapisane kot znaki;
    })
    let ver255 = verHex[0] * 16 + verHex[1];
    return ver255;
}
//  -  -  -  -   end Hex sensus stricto  -  -  -  -;


//  - - - - -  toggles sensus stricto;
const regularDiv = document.getElementById('regular');
const masterDiv = document.getElementById('master');
const sub1Div = document.getElementById('sub1');
const sub2Div = document.getElementById('sub2');
const sub3Div = document.getElementById('sub3');
const inactiveDiv = document.getElementById('inactive');
const inactive2Div = document.getElementById('inactive2');
const regular2Div = document.getElementById('regular2');

const regular = new Toggle(regularDiv, null, null);
const master = new Toggle(masterDiv, 'On');
const sub1 = new Toggle(sub1Div, master, true);
const sub2 = new Toggle(sub2Div, master);
const sub3 = new Toggle(sub3Div, false, master);
const inactive = new Toggle(inactiveDiv, true);
const inactive2 = new Toggle(inactive2Div, 'ON', true);
const regular2 = new Toggle(regular2Div, 'on');

//  -  -  -  -  -   end toggles  -  -  -  -;


//  -  -  -  -  -  -  PRIKAZ info -  -  -  -  ;
function avgHexInfoClick() {
    const msg = `A utility with which to calculate the hex value of a color some way between 2 hex code RGB colors on the color wheel.
    <br><br>For hex color inputs, acceptable characters are hex digits (0-9, a-f, A-F).<br>
    Values must be 2, 3 or 6 digits long. 3-digit &quot;f80&quot; is stretched to &quot;ff8800&quot;.
    <br><br>By default the color just middle-of-way between the 2 given colors is output (ratio = 0.5).
    A ratio between 0 and 1 can be selected, meaning the point where the result sits on the way from input 1 to input 2.
    Ratio values outside valid range default to 0.5`;
    raiseJoker(msg);
}

function togglesInfoClick() {
    const msg = `An exercise in creating a reusable class, in this case for creating and using toggles.<br><br>
    By adding two files that can be saved/downloaded from this web page to a html project, all is ready to use such toggles
    (the 2 files are toggle_class.js and toggle.css; info on use method in toggle_class.js).`;
    raiseJoker(msg);
}

function raiseJoker(msg) {
    jokerOpen = true;
    divJokerBckgnd.style.top = '0px';
    divJokerBckgnd.style.bottom = '0px';
    divJokerBckgnd.style.left = '0px';
    divJokerBckgnd.style.right = '0px';
    divJokerForegnd.classList.remove('hidden');
    divJokerCloseIcon.classList.remove('hidden');
    jokerContent.innerHTML = msg;
}

function retireJoker() {
    jokerOpen = false;
    divJokerBckgnd.style.top = 'auto';
    divJokerBckgnd.style.bottom = 'auto';
    divJokerBckgnd.style.left = 'auto';
    divJokerBckgnd.style.right = 'auto';
    divJokerForegnd.classList.add('hidden');
    divJokerCloseIcon.classList.add('hidden');
    jokerContent.innerHTML = '';
}
//  -  -  -  -  -  -  end PRIKAZ  -  -  -  -  ;

//  -  -  -  -  -  IZVAJANJE  -  -  -  -  -;
initialize();
