function percOf60(lowerBoundary, value) {
    return (value - lowerBoundary) / 60;
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
    if (niz.length != 2) {
        console.log('predolg ali prekratek niz poslan v hex2dec2digits; niz mora biti dolg točno 2 znaka in predstavljati mora hex vrednost');
        return
    }
    let h1 = niz.slice(0, 1);
    let h2 = niz.slice(1);
    let verHex = [h1, h2];
    verHex.forEach(function (val, i) {
        if (val === 'a') verHex[i] = 10; else
            if (val === 'b') verHex[i] = 11; else
                if (val === 'c') verHex[i] = 12; else
                    if (val === 'd') verHex[i] = 13; else
                        if (val === 'e') verHex[i] = 14; else
                            if (val === 'f') verHex[i] = 15;
    })
    verHex.forEach(function (val, i) {
        verHex[i] = Number(val);
    })
    let ver255 = verHex[0] * 16 + verHex[1];
    return ver255;
}

// prejme šestmestno rgb vrednost (brez #) in javi kot, pri čemer rdeča (ff0000) ima kot 0;
// trenutno dela samo na čistih, žarečih barvah (vrsta ff0000), na bledih ali temnih barvah (vrsta aabbcc) še ne dela;
function calcAngleFromRGB(rgbString) {
    if (rgbString.length != 6) {
        console.log('predolg ali prekratek niz poslan v calcAngleFromRGB');
        return
    }
    compR = rgbString.slice(0, 2);
    compG = rgbString.slice(2, 4);
    compB = rgbString.slice(-2);
    let angle = 0;

    // 3 120-stopinjska območja, (pri čemer še ni jasno , katera meja je všteta, katera ne)
    if (compB === '00') { // to delaš 0-120;
        if (compR === 'ff') {   // to delaš od 0-60; G NARAŠČA; obe meji vključeni
            let dec = hex2dec2digits(compG);
            let perc = dec / 255;
            angle = perc * 60;
        } else {    // to delaš od 60+ do 120; R PADA; spodnja meja ni vključena, vendar potem treba zaokrožit vsa na 1 decimalkoM
            let dec = hex2dec2digits(compR);
            let perc = 1 - dec / 255;
            angle = 60 + perc * 60;
        }
    } else if (compR === '00') {    // tle se dela od 120+ do 240 (120 tu ne gre, ker ga pograbi že prva varianta)
        if (compG === 'ff') {   // tle se dela 120+ do 180; B narašča;
            let dec = hex2dec2digits(compB);
            let perc = dec / 255;
            angle = 120 + perc * 60;
        } else {    // tle se dela 180+ do 240; G pada
            let dec = hex2dec2digits(compG);
            let perc = 1 - dec / 255;
            angle = 180 + perc * 60;
        }
    } else if (compG === '00') { // tle od 240+ do 360-;  360/0 ne more bit tle, ker ga pograbi že prvi if;
        if (compB === 'ff') {   // tle od 240+ do 300; // 240 ne more bit tle, ker je že bil prej, pro CompR === 00;
            let dec = hex2dec2digits(compR);
            let perc = dec / 255;
            angle = 240 + perc * 60;
        } else {    // tle pokrije od 300+ do 360- ; 360/0 ne more bit tle, ker ga pograbi že prvi if;
            let dec = hex2dec2digits(compB);
            let perc = 1 - dec / 255;
            angle = 300 + perc * 60;
        }
    }
    return angle;
}


function pretvoriHexV255(niz) {     // iz Risarja; očitno se poda noter niz z # na začetku, ker je dolčina 7 (slice(6))
    let r1 = niz.slice(1, 2);
    let r2 = niz.slice(2, 3);
    let g1 = niz.slice(3, 4);
    let g2 = niz.slice(4, 5);
    let b1 = niz.slice(5, 6);
    let b2 = niz.slice(6);
    let verHex = [r1, r2, g1, g2, b1, b2];
    verHex.forEach(function (val, i) {
        if (val === 'a') verHex[i] = 10; else
            if (val === 'b') verHex[i] = 11; else
                if (val === 'c') verHex[i] = 12; else
                    if (val === 'd') verHex[i] = 13; else
                        if (val === 'e') verHex[i] = 14; else
                            if (val === 'f') verHex[i] = 15;
    })
    verHex.forEach(function (val, i) {
        verHex[i] = Number(val);
    })
    let ver255 = [];
    for (let i = 0; i < 3; i++) {
        ver255[i] = verHex[0] * 16 + verHex[1];
        verHex.shift();
        verHex.shift();
    };
    return ver255;
};

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