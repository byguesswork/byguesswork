'use strict';

// flattener
// 4em, ko mobile
// da na začetku ni vrstice z rezultatom;
// da se pojavi copy to clipboard, ko da rezultat (in izgine ko daš reset ali se pojavi napaka ali kličeš spraznjenje polja za rezultat);

const btnAvgHexCalc = document.getElementById('btn_avg_hex_calc');
const inptAvgHex1 = document.getElementById('inpt_avg_hex_1');
const inptAvgHex2 = document.getElementById('inpt_avg_hex_2');
const inptAvgHexRatio = document.getElementById('inpt_avg_hex_ratio');
const avgHexInpt1ColrThumb = document.getElementById('avg_hx_inpt1_colr');  // thumb so una polja, kjer je not prikazana barva;
const avgHexInpt2ColrThumb = document.getElementById('avg_hx_inpt2_colr');
const avgHexResltOutput = document.getElementById('avg_hex_reslt_output');
const avgHexResltColrThumb = document.getElementById('avg_hx_reslt_colr');
const avgHexErrRow = document.getElementById('error_line');
const avgHexErrOutpt = document.getElementById('avg_hex_err_output');
const btnReset = document.getElementById('btn_reset');
const infoIcons = document.getElementsByClassName('info_icon_desktop');
const divAvgHexInfo = document.getElementById('avg_hex_info_icon');
const divTogglesInfo = document.getElementById('toggles_info_icon');
const divJokerBckgnd = document.getElementById('joker_bckgnd');
const divJokerForegnd = document.getElementById('joker_foregnd');
const divJokerCloseIcon = document.getElementById('joker_close_icon');
const jokerContent = document.getElementById('joker_content');


btnAvgHexCalc.addEventListener('click', (e) => { avgHexValdteCalcBtn(e) });
document.addEventListener('keydown', (e) => { atKeyDown(e) });  // mora bit keydown, ker keypress ne zaznava Esc (in še kakšne druge tipke);
btnReset.addEventListener('click', () => { 
    avgHexClrResltFld();
    avgHexhideErrRow();
    inptAvgHex1.focus();
});
divAvgHexInfo.addEventListener('click', avgHexInfoClick);
divTogglesInfo.addEventListener('click', togglesInfoClick);
divJokerCloseIcon.addEventListener('click', retireJoker);

let lastInteracted = null;
let mobile = false;
let divSigture, lesserHeight; // sigture in lesserHeight se bo rabilo, samo če bo mobile;
let mobileIntervalChecker = null;
let jokerOpen = false;
let width;

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
        for(let i = 0; i < infoIcons.length; i++) {
            infoIcons[i].classList.add('info_icon_mobile'); // to naredi, da se info krog premakne eno vrstico nad vsebino, da se ne prekriva;
        }
        document.getElementById('div_avg_hex').style.marginLeft = '24px';

        btnAvgHexCalc.style.marginLeft = '8px';
        btnAvgHexCalc.style.fontSize = '13px';

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
    if(document.activeElement == inptAvgHex1) lastInteracted = document.activeElement;
        else if(document.activeElement == inptAvgHex2) lastInteracted = document.activeElement; 
    if(e.code == 'Enter') {
        if(e.target == inptAvgHex1 || e.target == inptAvgHex2) {
            e.preventDefault(); // dam sem in ne prej, ker na gumbu Calculate mora vseeno delat; samo na teh dveh ne sme;
            let clicked, other;
            if (e.target == inptAvgHex1) {
                clicked = inptAvgHex1;
                other = inptAvgHex2;
            } else {
                clicked = inptAvgHex2;
                other = inptAvgHex1;
            }
            avgHexChkInptFields(clicked, other);
        }
    } else if (e.key == 'Escape' || e.code == 'Esc' || e.code == 'Escape' || e.key == 'Esc') {
        if(jokerOpen) retireJoker();
    }
}


//  -  -  -  -   Hex sensus stricto  -  -  -  -;
function avgHexChkInptFields(clicked, other) {
    
    function helper(which) {
        if(!avgHexChkIfEmpty(which.value)) {
            let hexVal = avgHexChkLgth(which.value);
            console.log(hexVal);
            if(hexVal !== false) {  // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
                if(avgHcChkCharsValid(hexVal)) {
                    return hexVal;
                } else {
                    avgHexOutputErrMsg('Invalid characters.<br>Allowed: 0-9, a-f, A-F');
                    if(!mobile) avgHxFlattnErrLine();
                    return false;
                }
            } else {
                avgHexOutputErrMsg('Input length not OK.<br>Should be 2, 3 or 6 chars (see info icon)');
                if(!mobile) avgHxFlattnErrLine();
                return false;
            }
        } else {
            avgHexOutputErrMsg('Input field is empty, enter some data.');
            return false;
        }
    }
    
    avgHexClrResltFld();
    avgHexhideErrRow();
    const isClickedInput1 = clicked == inptAvgHex1 ? true : false;  // to je pomembno, da pravi input obarvamo s pravo barvo pozneje;
    const clickedVal = helper(clicked);  // to dela preverjanja in iz 3-mestne naredi 6-mestno;
    if(clickedVal !== false) {  // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
        if(other.value.length != 0) {
            const otherVal = helper(other);
            if(otherVal !== false) {    // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
                if(clickedVal.length == otherVal.length) {
                    // da pošljemo vedno tako , da 1. argument pošilja podatek za 1. (gornji) input;
                    if(isClickedInput1) avgHexCalcNDisplay(clickedVal, otherVal);
                        else avgHexCalcNDisplay(otherVal, clickedVal);
                } else {
                    avgHexOutputErrMsg('The 2 inputs shall be of same length.<br>Length of 3 counts as length of 6');
                    if(!mobile) avgHxFlattnErrLine();
                }
            } else {other.focus(); } // če je v drugi celici napaka (izpisana v helperju), se prestavimo tja;
        } else {
            other.focus();
            avgHexhideErrRow(); // da izbrišemo morebitni error v reslt fld;
            // avgHexClrResltFld(); // včasih, ko je eno polje bilo za reslt in err, je bila ta vrstica;
        }
    } // elze nič, ker če je clicked false, čakamo, error je bil že izpisan;
}

function avgHexOutputErrMsg(msg) {
    avgHexErrRow.classList.remove('hidden');
    avgHexErrOutpt.innerHTML = msg;
}

function avgHxFlattnErrLine() {

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

function avgHexValdteCalcBtn(e) {
    e.preventDefault();
    let focused, other;
    if(lastInteracted == inptAvgHex1) {
        focused = inptAvgHex1;
        other = inptAvgHex2;
    } else {
        focused = inptAvgHex2;
        other = inptAvgHex1;
    }
    focused.focus();    // nazadnje obdelanemu vrnemo fokus, ker ob kliku na gumb dobi gumb fokus;
    avgHexChkInptFields(focused, other);
    // ker obstaja možnost, da je eno polje prazno (do zdaj te je samo dalo vanj, ker taka je funkcionalnost, če pritisneš enter) ..
    // .. je treba še preverit za praznost katerega od polj;
    if(focused.value.length == 0 || other.value.length == 0) avgHexOutputErrMsg('Input field is empty, enter some data.');
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
    if(inptAvgHexRatio.value == '') ratio = 0.5;
        else {
            ratio = Number(inptAvgHexRatio.value);
            if(ratio < 0 || ratio > 1) {
                ratio = 0.5;
                inptAvgHexRatio.value = '';
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
    avgHexResltOutput.innerHTML = reslt;

    // morebiten izris barv;
    if(reslt.length == 6) {
        avgHexInpt1ColrThumb.style.background = `#${firstHex}`;
        avgHexInpt2ColrThumb.style.background = `#${secondHex}`;
        avgHexResltColrThumb.style.background = `#${reslt}`;
        avgHexShowColorThumbs();
    }
    // console.log('rezultat:', reslt);
    console.log('- - - - - -');
}

function avgHexClrResltFld() {
    avgHexResltOutput.innerHTML = '&nbsp;&nbsp;';   // mora imet nbst, ker elemtn nima določene višine, brez nbsp bi se sesedel;
    avgHexHideColorThumbs();
}

function avgHexhideErrRow(){
    avgHexErrRow.classList.add('hidden');
}

function avgHexHideColorThumbs() {
    avgHexResltColrThumb.classList.add('hidden');
    avgHexInpt1ColrThumb.classList.add('hidden');
    avgHexInpt2ColrThumb.classList.add('hidden');
}

function avgHexShowColorThumbs() {
    avgHexResltColrThumb.classList.remove('hidden');
    avgHexInpt1ColrThumb.classList.remove('hidden');
    avgHexInpt2ColrThumb.classList.remove('hidden');
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
const inactive = new Toggle(inactiveDiv, undefined, true);
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
    const msg = `An exercise in creating a reusable class, in this case for creating and using toggles. 
    Two files (toggle.js and toggle.css, can be downloaded from this web page) need to be added to a html project, and such toggles
    are then available to use there.`;
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
