'use strict';

function rangeAngle(angle){  // put angle within the logical range;
    if (angle >= 2 * Math.PI) angle -= 2 * Math.PI;
    else if (angle <= - 2 * Math.PI) angle += 2 * Math.PI;
    return angle;
}

function toDecPlace(num, numDecs = 2){  // numDecs = number of decimal places;
    return Math.trunc(num * 10**numDecs)/(10**numDecs);
}
