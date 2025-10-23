'use strict';

// da se pojavi copy to clipboard, ko da rezultat (in izgine ko daš reset ali se pojavi napaka ali kličeš spraznjenje polja za rezultat);

const btnAvgHexCalc = document.getElementById('btn_avg_hex_calc');
const inptAvgHex1 = document.getElementById('inpt_avg_hex_1');
const inptAvgHex2 = document.getElementById('inpt_avg_hex_2');
const avgHexInpt1ColrThumb = document.getElementById('avg_hx_inpt1_colr');
const avgHexInpt2ColrThumb = document.getElementById('avg_hx_inpt2_colr');
const avgHexResltOutput = document.getElementById('avg_hex_reslt_output');
const avgHexResltColrThumb = document.getElementById('avg_hx_reslt_colr');
const btnReset = document.getElementById('btn_reset');
const divAvgHexInfo = document.getElementById('avg_hex_info_icon');
const divJokerBckgnd = document.getElementById('joker_bckgnd');
const divJokerForegnd = document.getElementById('joker_foregnd');
const divJokerCloseIcon = document.getElementById('joker_close_icon');
const jokerContent = document.getElementById('joker_content');

btnAvgHexCalc.addEventListener('click', (e) => { avgHexValdteCalcBtn(e) });
document.addEventListener('keydown', (e) => { atKeyDown(e) });  // mora bit keydown, ker keypress ne zaznava Esc (in še kakšne druge tipke);
btnReset.addEventListener('click', () => { 
    avgHexClrResltFld();
    inptAvgHex1.focus();
});
divAvgHexInfo.addEventListener('click', avgHexInfoClick);
divJokerCloseIcon.addEventListener('click', retireJoker);

const resltBckgnd = '#bbbbbb';
const resltBckgndFault = '#c96a6aff';

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
        divAvgHexInfo.style.right = '32px';
        divAvgHexInfo.style.borderColor = 'whitesmoke'; //  da vzame isto kot color;
        divAvgHexInfo.style.color = 'whitesmoke';
        divAvgHexInfo.style.background = '#808080';
    }

     if(mobile) {
        divJokerForegnd.style.top = '120px';
        divAvgHexInfo.style.position = 'relative';
        divAvgHexInfo.style.justifySelf = 'end';
        divAvgHexInfo.style.marginRight = '8px';
        divAvgHexInfo.style.marginBottom = '12px';
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
    lastInteracted = document.activeElement;
    // console.log(e)
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

function avgHexChkInptFields(clicked, other) {
    
    function helper(which) {
        if(!avgHexChkIfEmpty(which.value)) {
            let hexVal = avgHexChkLgth(which.value);
            console.log(hexVal);
            if(hexVal !== false) {  // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
                if(avgHcChkCharsValid(hexVal)) {
                    return hexVal;
                } else {
                    avgHexResltError('Invalid characters. Allowed: 0-9, a-f, A-F');
                    return false;
                }
            } else {
                avgHexResltError('Input length not OK. Should be 2, 3 or 6 chars (see info icon)');
                return false;
            }
        } else {
            avgHexResltError('Input field is empty, enter some data.');
            return false;
        }
    }
    
    const isClickedInput1 = clicked == inptAvgHex1 ? true : false;  // to je pomembno, da pravi input obarvamo s pravo barvo pozneje;
    const clickedVal = helper(clicked);  // to dela preverjanja in iz 3-mestne naredi 6-mestno;
    if(clickedVal !== false) {  // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
        if(other.value.length != 0) {
            const otherVal = helper(other);
            if(otherVal !== false) {    // treba dat tako preverjanje, ker != najde tudi falsi rezultate, kot je 000000, ki pa je legitimen rezulat;
                if(clickedVal.length == otherVal.length) {
                    avgHexCalc(clickedVal, otherVal, isClickedInput1);
                } else avgHexResltError('The 2 entered values shall be of same length. Length of 3 counts as length of 6');
            } else {other.focus(); } // če je v drugi celici napaka (izpisana v helperju), se prestavimo tja;
        } else {
            other.focus();
            avgHexClrResltFld(); // da izbrišemo morebitni error v reslt fld;
        }
    } // elze nič, ker če je clicked false, čakamo, error je bil že izpisan;
}

function avgHexResltError(msg) {
    avgHexResltOutput.style.background = resltBckgndFault;
    avgHexResltOutput.innerHTML = msg;
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
    focused.focus();    // nazadnje obdelanemou vrnemo fokus, ker ob kliku na gumb dobi gumb fokus;
    avgHexClrResltFld();
    avgHexChkInptFields(focused, other);
    // ker obstaja možnost, da je eno polje prazno (do zdaj te je samo dalo vanj, ker taka je funkcionalnost, če pritisneš enter) ..
    // .. je treba še preverit za praznost katerega od polj;
    if(focused.value.length == 0 || other.value.length == 0) avgHexResltError('Input field is empty, enter some data.');
}

function avgHexCalc(firstHex, secondHex, isClickedInput1) {
    let reslt = '';
    for (let i = 0; 2 * i < firstHex.length; i++) {
        const firstDec = hex2dec2digits(firstHex.slice(2 * i, 2 * i + 2));
        const secondDec = hex2dec2digits(secondHex.slice(2 * i, 2 * i + 2));
        const midOfWayHex = decToHex((firstDec + secondDec) / 2);
        reslt += midOfWayHex;
        console.log(firstHex.slice(2 * i, 2 * i + 2), secondHex.slice(2 * i, 2 * i + 2), 'vmesna vrednost:', midOfWayHex);
    }
    avgHexResltOutput.innerHTML = reslt;
    if(reslt.length == 6) {
        avgHexResltColrThumb.style.background = `#${reslt}`;
        if(isClickedInput1) {
            avgHexInpt1ColrThumb.style.background = `#${firstHex}`;
            avgHexInpt2ColrThumb.style.background = `#${secondHex}`;
        } else {
            avgHexInpt2ColrThumb.style.background = `#${firstHex}`;
            avgHexInpt1ColrThumb.style.background = `#${secondHex}`;
        }
        avgHexShowColorThumbs();
    } else avgHexResltOutput.style.background = resltBckgnd;
    console.log('rezultat:', reslt);
    console.log('- - - - - -');
}

function avgHexClrResltFld() {
    avgHexResltOutput.style.background = resltBckgnd;
    avgHexResltOutput.innerHTML = '&nbsp;&nbsp;';
    avgHexHideColorThumbs();
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

function avgHexInfoClick() {
    const msg = `A utility that is handy when you want to know the hex value of the color just middle-of-way between 2 hex code RGB colors on the color wheel.
    <br><br>Acceptable characters are hex digits (0-9, a-f, A-F).<br>
    Values must be 2, 3 or 6 digits long. 3-digit &quot;f80&quot; is stretched to &quot;ff8800&quot;.
    <br><br>For pairs of colors that are on opposite sides of the color wheel, the result will be some shade of grey as the result is the 
    mathematical average of each component (R, G and B) and is found on midpoint of the straight line connecting the two colors.`;
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

initialize();