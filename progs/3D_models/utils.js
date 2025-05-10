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