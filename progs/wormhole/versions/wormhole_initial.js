'use strict';

// krogi/obroči in ring/circle uporabljam sinonimno;

const canvas = document.getElementById('canvas');
const drawingCtx = canvas.getContext('2d');

canvas.height = window.innerHeight - 3; // če ni -3 dobi skrolbar, morda zato, ker ima canvas rob = 1
canvas.width = window.innerWidth - 3;
drawingCtx.fillStyle = Data.bckgndColor;

// začetne dimenzije kroga;
let x, y, r;
if (canvas.width % 2 == 1) x = (canvas.width + 1) / 2;
    else x = canvas.width / 2;
if (canvas.height % 2 == 1) y = (canvas.height + 1) / 2;
    else y = canvas.height / 2;
r = (x ** 2 + y ** 2) ** (1/2);
Ring.setXYR(x, y, r);

// za programatično: 
// for (let i = 12; i >= 0.82; i -= 0.04) {
//     const v = Math.trunc((2*Math.atan2(0.5, i) - 0.045) * 10000) / 10000; // 10000/10000 je za zaokroženje na 4 decim.
//     if (v <= 1) Data.ratios.push(v);
//         else break;
// }
Data.numRatios = Data.ratios.length;
Data.stepsInIntrvl = Math.floor(Data.numRatios / Data.numRings);  // če je +0, je vsako tolko več obročev, kot n tukaj; če je +1, jih je vsake tolko manj kot definitano tukaj;
console.log(Data.ratios, Data.numRatios);

const rings = [];
// štetje ustvarjenih obročev, da veš, kdaj narediti temnega oz. tistega druge barve, tj vsak numRings - 1;
let currRingInRingLoop = 1; // to se preverja takrat, ko ga vstavljaš; skratka, pomani številko tistega, ki bo naslednji vstavljen;

// na koliko korakov bo vstavljen nov obroč;
let currStepInIntrvl = 0;    // števec korakov; dela od 1 do n (ni zero-based), tukaj damo 0, ker se ža na začetku zanke posodobi;
let isRunning = true;   // al se koda izvaja ali ne (al se krogi premikajo al ne)
const pauseDuration = 30;

let stepCounter = 0;    // absolutni števec korakov, šteje do neskončno;
let ringCounter = 0;    // absolutni števec obročev, šteje do neskončno;

//   - - - - - - -   FUNKCIJE   - - - - - - - - - - - - -   

function pauseInSecs(pauseDuration) {   // za pavziranje, premor; ni treba async, ker je v htmlju, v script, navedeno type = module;
    return new Promise(function (resolve) {setTimeout(resolve, pauseDuration)})
}

function atKeyPress(e) {
    if (e.key === 'Escape') {
        if (isRunning) {
            isRunning = false;
            console.log('izvajanje je bilo true, zdaj je false');
        } else {
            isRunning = true;
            console.log('izvajanje je bilo false, zdaj je true');
        }
    }
}

//   - - - - - - -   LISTENERJI   - - - - - - - - - - - - - 

document.addEventListener('keydown', atKeyPress);

//   - - - - - - -   IZVAJANJE    - - - - - - - - - - - - - 

console.log('num ratios:', Data.numRatios, ' rings:', Data.numRings, ' steps/ring:', Data.stepsInIntrvl);
console.log('x:', Ring.x, ' y:', Ring.y, ' r:', Ring.r);

let newAngle = false;    // taka komplikacija, ker si me ne da sporočat spremembe kota, ki bi sama lahko bila trigger;
let bump = 0;
let changesLog = [];
while (isRunning) {

    // povečamo števce;
    if (currStepInIntrvl < Data.stepsInIntrvl) {
        currStepInIntrvl++; 
    }   else currStepInIntrvl = 1;
    
    // zdaj v bistvu deluje tako, da pošiljamo noter absoluten kot, ne pa spremembo;
    // zato je treba ločeno pošiljat noter še trigger, da se sploh ve, da je prišlo do spremembe;
    
    if (stepCounter == 90) {    // tole izrazit v obročih, da ti niti ni treba razmišljat ...
        newAngle = true;
        bump = 0.25;
        console.log('bump');
    }
    if (stepCounter == 180) {
        newAngle = true;
        bump = -0.25;
        console.log('bump2');
    }
    if (stepCounter == 285) {
        newAngle = true;
        bump = 0.00;
        console.log('bump3');
    }

    // če je treba, vstavimo nov obroč na začetek
    // tu se morda pojavi ideja, da bi dodal pogoj, da št. oboročev v arrayu ne sme že biti enako max številu, če želimo povečati, ..
    //.. ampak potem se zgodi, da pride med dvema obročema nenavadno velik interval; raje ob vedno enakem intervalu;
    if (currStepInIntrvl == 1) {

        // console.log('- - - - Nov obroč vstavljen na pozicijo 0 - - -')
        // console.log('- - - -    - - -    - - -    - - -    - - -')
        
        ringCounter++;  // šteje, koliko obročev je bilo ustvarjenih sploh, ni 0b;
        // vstavimo nov obroč na prvo mesto;
        rings.unshift(new Ring(ringCounter, currRingInRingLoop == 1 ? true : false, changesLog)); // -1, ker mu takoj povečamo na 0, uporablja se namreč idx;
        
        // uredimo števec za določanje debelega obroča, da bo pripravljen za naslednji obroč, ki bo ustvarjen;
        if (currRingInRingLoop == Data.numRings - 3) { // če smo trenutno vstavili zadnji obroč (primer: 5. obroč, če je vseh obročev 6)
            currRingInRingLoop = 1;    // ponastavimo na 1 (da bomo naslednjič vstavili drugačnega);
        }   else currRingInRingLoop++; // sicer povečamo števec za določanje debelega obroča;

    }

    // vsakemu obroču povečamu currRatio;
    // obroč [0] je uni , k je na sredini, rišemo pa od length-1 proti 0, torej od zunaj proti sredini, kakor gre pogled in razvoj;
    for (let i = rings.length - 1; i >= 0; i--) {

        if (i == 0 && newAngle && currStepInIntrvl == 1) {    // pogoj currentStepinIntrvl je zato, ker če ne bi nek obstoječi obroč kar skočil na nov položaj; nov obr. mora dobit nov položaj;
            // če bump;
            console.log('akcija od bump')
            changesLog = rings[i].update(bump, true, ringCounter);
            newAngle = false;
        } else changesLog = rings[i].update(0, false, ringCounter);
        // console.log('i:',i, ' ringCounter:', ringCounter, 'ringNr:', rings[i].ringNr, changesLog);
        // console.log('-')
    }
    
    // izbrišemo polje; brišemo šele tik pred risanjem, da ni črnega ekrana vmes (če morebiti vmesni izračuni trajali dolgo);
    drawingCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // obroč [0] je uni , k je na sredini, rišemo pa od length-1 proti 0, torej od zunaj proti sredini, kakor gre pogled in razvoj;
    // risanje
    for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].draw(drawingCtx, i);
    }
    await pauseInSecs(pauseDuration);
    
    // če se je zadnji obroč izpel, ga odstranimo; šele zdaj, ker sicer ga ne bi narisali;
    if (rings[rings.length - 1].currRatioIdx == Data.numRatios - 1) {   // numRatios-1, ker je currRatio zero-based;
        rings.pop();
    }
    
    stepCounter++;
    
}


// odložišče: 

// zadnji obroč mora biti že OK, ko pa predzadnji začne svojo pot, mora do trenutka, ko postane zadnji, spraviti svoj kot na 0, da gleda naravnost in na sredini;    
// else if ((i == rings.length - 2 && rings[i].vAngle != 0 && currStepInIntrvl == 2) || setAlltoTrue) { // zakaj 2? da najprej nariše tudi že ta najmanjšega, ker če ne je sam narisan na sredini, medtem, ko se ostali še normalizirajo;
//     changesLog = rings[i].update(i, pkg);
//     setAlltoTrue = true;
//     console.log('normalize');

// } 


