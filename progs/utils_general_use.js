'use strict';

// splošna datoteka z uporabnimi funkcijami, ki se lahko uporabijo v kateremkoli programu;

function isMobile() {
    if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
        return true;
    } else {
        return false;
    }
}

function getLang() {     // lahko vrne le eno od teh 3 vrednosti: en (privzeto), sl, it;
    let langStr = 'en';

    function helper(found) {
        // najprej iščemo sl;
        if (found == 'sl' || found == 'sl-si' || found == 'sl-SI' || found == 'si') langStr = 'sl';
        else {  // sicer probamo še z it; drugih za zdaj ne;
            if(found.slice(0, 2) == 'it') langStr = 'it';
        }
    }

    if (navigator.language != undefined) {
        const found = navigator.language;
        console.log('najden navigator.language:', found);
        helper(found);
    } else if (navigator.userLanguage != undefined) {
        const found = navigator.userLanguage;
        console.log('najden navigator.userLanguage:', found);
        helper(found);
    };
    return langStr;
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

function hex2dec2digits(niz) {  // prejme string z 2-mestno hex številko (obvezno, ker ni preverjanja tukaj) in vrne razpon 0-255;
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

function rangeAngle(angle){  // put angle within the logical range; treba še dodat zanko, ker kaj če je kot 10 PI
    if (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    else if (angle <= - 2 * Math.PI) angle += 2 * Math.PI;
    return angle;
}

function toDecPlace(num, numDecs = 2){  // numDecs = number of decimal places;
    if (typeof num != "number") {
        console.log('!! W - toDecPlace: NaN passed into function');
        return undefined;
    }
    return Math.trunc(num * 10**numDecs)/(10**numDecs);
}

// vrne vrednost kota v radianih; podaš vrednost kota v stopinjah (pozitivna vrednost);
// offset (v stopinjah) pove za koliko je odmaknjen ničti kot sistema, iz katerega podajaš vrednost v stopinjah, od izhodiščnega kot = 0, ki kaže vodoravno desno (urni kazalec = pozitivno);
// recimo, če podaš -90 (stopinj) pomeni, da v izhodiščnem sistemu gleda kot 0 navpično navzgor;
function degToRad(angle, offset = 0) {
    let kot = angle + offset;
    if (kot < 0) {
        kot = kot + 360;
    } else if (kot > 360) kot = kot - 360;
    kot = (kot / 360) * 2 * Math.PI;
    return kot;
}

// function radToDeg(angleInRad) {  // za nardit;
//     return angleInDeg;
// }