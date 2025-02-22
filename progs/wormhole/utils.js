
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
