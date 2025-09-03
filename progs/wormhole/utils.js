'use strict';

function rangeAngle(angle){  // put angle within the logical range;
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

function interpolateToYAbvZero(x1, y1, x2, y2){ // x1, in y1 sta koordinato točke, ki ima neg. y in jo želimo interpolirat na poz.y glede na x1,y1;
    let targetY, ratio;
    if (y2 > 0.3) targetY = 0.3;
        else if (y2 > 0.01) targetY = 0.01;
            else targetY = 0;
    ratio = (targetY - y1) / (y2 - y1);
    const targetX = x1 + (x2 - x1) * ratio;
    return([targetX, targetY]); // ta x in y nista koordinati screenPointa, ampak spacePointa!!!
}

function checkLang(){   // deluje samo za SL in EN;
    let checkLangStr = 'en';
    if (navigator.language != '') {
        checkLangStr = navigator.language;
    } else if (navigator.userLanguage != '') {
        checkLangStr = navigator.userLanguage;
    };
    if (checkLangStr == 'sl' || checkLangStr == 'sl-si' || checkLangStr == 'sl-SI' || checkLangStr == 'si') {
        return 'sl' 
    } else return 'en';
}

//  - - -  MEHANIZEM ZA SORTIRANJE, sicer neuporabljen  - - -

        // const rs = [];
        // for (let k = 0; k < orbitals.length; k++) {
        //     const srfceCtrXY = Thingy.calcPlanarCtr(spunItem.segments[orbitals[k][0]].spcPts); // oneLoop prejme index segmenta, zato orbitals[k];
        //     const rSrfceCtr = Thingy.calcPlanarRFromSpcPt(srfceCtrXY, viewPoint)
        //     rs.push(rSrfceCtr);
        //     orbitals[k][1] = rSrfceCtr;
        // }
        // rs.sort();
        // const sortdIdxs = [];
        // for (let k = 0; k < orbitals.length; k++) {
        //     sortdIdxs.push(orbitals.findIndex(curr => { return curr[1] == rs[k] })) 
        // }
        // for (let k = orbitals.length - 1; k >= 0; k--) {
        //     oneLoop(orbitals[sortdIdxs[k]][0]); 
        // }

        // for (let k = 0; k < orbitals.length; k++) {
        //     oneLoop(orbitals[k][0]);
        // }



// za "versions" datoteke
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
