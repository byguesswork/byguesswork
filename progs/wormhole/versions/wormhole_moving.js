'use strict';

// krogi/obroči in ring/circle uporabljam sinonimno;

const canvas = document.getElementById('canvas');
const drawingCtx = canvas.getContext('2d');
const kotDataDiv = document.getElementById('kot');
const dxDataDiv = document.getElementById('dx');

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
for (let i = Data.numLengths; i >= 0.82; i -= 0.06) {
    // const v = Math.trunc(2*Math.atan2(0.5, i) * 10000) / 10000; // 10000/10000 je za zaokroženje na 4 decim.
    const v = 2*Math.atan2(0.5, i);
    if (v <= 1) Data.ratios.push(v);
        else break;
}
Data.numRatios = Data.ratios.length;
Data.stepsInIntrvl = Math.floor(Data.numRatios / Data.numRings);  // če je +0, je vsako tolko več obročev, kot n tukaj; če je +1, jih je vsake tolko manj kot definitano tukaj;
Data.stepsPerUnit = Math.floor(Data.numRatios/Data.numLengths);
Data.shareOf1StepIn1Unit = 1/Data.stepsPerUnit;

// na koliko korakov bo vstavljen nov obroč;
let currStepInIntrvl = 0;    // števec korakov; dela od 1 do n (ni zero-based), tukaj damo 0, ker se ža na začetku zanke posodobi;
const pauseDuration = 25;

// urejanje podatka, da veš, kdaj vstaviti vidnejši obroč;
const prominentOne = Data.numRings > 5 ? Data.numRings - 3 : Data.numRings; // na vsake klko gre vidnejši?
let currRingInProminentRLoop = 1; // to se preverja takrat, ko ga vstavljaš; skratka, pomani številko tistega, ki bo naslednji vstavljen;


//   - - - - - - -   FUNKCIJE   - - - - - - - - - - - - -   

function pauseInSecs(pauseDuration) {   // za pavziranje, premor; ni treba async, ker je v htmlju, v script, navedeno type = module;
    return new Promise(function (resolve) {setTimeout(resolve, pauseDuration)})
}

function gBack(){
    isRunning = false;
    window.location.replace("../wormholing.html");
}

function atKeyPress(e) {
    if (e.key === 'Escape') {
        if (isRunning) {
            isRunning = false;
            you.destroyControls();
            console.log('izvajanje je bilo true, zdaj je false');
        }
    } else if (e.key === 'b') { 
        gBack();
    } else if  (e.key === 'B') { 
        gBack();
    }
}

//   - - - - - - -   LISTENERJI   - - - - - - - - - - - - - 

document.addEventListener('keydown', atKeyPress);

//   - - - - - - -   IZVAJANJE    - - - - - - - - - - - - - 

// console.log(Data.ratios);
console.log('num ratios:', Data.numRatios, ' rings:', Data.numRings, ' steps/ring:', Data.stepsInIntrvl);
console.log('steps per unit:', Data.stepsPerUnit, 'Share of step in unit:', Data.shareOf1StepIn1Unit.toFixed(3));
console.log('x:', Ring.x, ' y:', Ring.y, ' r:', Ring.r.toFixed(0));

const rings = [];
let stepCounter = 0;    // absolutni števec korakov, šteje do neskončno;
let ringCounter = 0;    // absolutni števec obročev, šteje do neskončno;
const you = new You();    // ha
Ring.meet(you);
let isRunning = true;   // al se koda izvaja ali ne (al se krogi premikajo al ne)

while (isRunning) {

    // povečamo števce;
    stepCounter++;
    if (currStepInIntrvl < Data.stepsInIntrvl) {
        currStepInIntrvl++; 
    }   else currStepInIntrvl = 1;
    
    // če je treba, vstavimo nov obroč na začetek
    // tu se morda pojavi ideja, da bi dodal pogoj, da št. oboročev v arrayu ne sme že biti enako max številu, če želimo povečati, ..
    //.. ampak potem se zgodi, da pride med dvema obročema nenavadno velik interval; raje ob vedno enakem intervalu;
    if (currStepInIntrvl == 1) {

        // console.log('- - - - Nov obroč vstavljen na pozicijo 0 - - -')
        // console.log('- - - -    - - -    - - -    - - -    - - -')
        
        ringCounter++;  // šteje, koliko obročev je bilo ustvarjenih sploh, ni 0b;
        // vstavimo nov obroč na prvo mesto;
        rings.unshift(new Ring(ringCounter, currRingInProminentRLoop == 1 ? true : false /*, changesLog */)); // -1, ker mu takoj povečamo na 0, uporablja se namreč idx;
        
        // uredimo števec za določanje debelega obroča, da bo pripravljen za naslednji obroč, ki bo ustvarjen;
        if (currRingInProminentRLoop == prominentOne) { // če smo trenutno vstavili zadnji obroč zanke, ki določa vstavitev vidnega obroča;
            currRingInProminentRLoop = 1;    // ponastavimo na 1 (da bomo naslednjič vstavili drugačnega);
        }   else currRingInProminentRLoop++; // sicer povečamo števec za določanje debelega obroča;

    }

    // posodobimo podatke obročev (prikaz poti, brez upoštevanja gibanja gledalca);
    // obroč [0] je uni , k je na sredini, rišemo pa od length-1 proti 0, torej od zunaj proti sredini, kakor gre pogled in razvoj;
    for (let i = rings.length - 1; i >= 0; i--) {
       rings[i].update();
    }
    
    // posodobimo podatke, povezane s pogledom gledalca;
    kotDataDiv.innerHTML = you.update().toFixed(2);
    dxDataDiv.innerHTML = Ring.dxAbstrct.toFixed(2);

    // izbrišemo polje; brišemo šele tik pred risanjem, da ni črnega ekrana vmes (če morebiti vmesni izračuni trajali dolgo);
    drawingCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // obroč [0] je uni , k je na sredini (najmanjši), rišemo pa od length-1 proti 0, torej od največjega proti najmanjšemu, kakor gre pogled in razvoj;
    // risanje
    for (let i = rings.length - 1; i >= 0; i--) {
        rings[i].draw(drawingCtx, i);
    }
    await pauseInSecs(pauseDuration);
    
    // če se je zadnji obroč izpel, ga odstranimo; šele zdaj, ker sicer ga ne bi narisali;
    if (rings[rings.length - 1].currRatioIdx == Data.numRatios - 1) {   // numRatios-1, ker je currRatio zero-based;
        rings.pop();
    }
    
}

