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

//   - - - - - - -   FUNKCIJE   - - - - - - - - - - - - -   

function pauseInSecs(pauseDuration) {   // za pavziranje, premor; ni treba async, ker je v htmlju, v script, navedeno type = module;
    return new Promise(function (resolve) {setTimeout(resolve, pauseDuration)})
}

function gBack(){
    isRunning = false;
    window.location.replace("wormholing.html");
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

console.log('x:', Ring.x, ' y:', Ring.y, ' r:', Ring.r.toFixed(0));

const rings = [];
const you = new You();    // ha
Ring.meet(you);
let isRunning = true;   // al se koda izvaja ali ne (al se krogi premikajo al ne)
const pauseDuration = 30;

Ring.main = Data.numRings - 1;
Ring.leader = 1;
rings.push(new Ring(true));  // obroč na [0] je tisti, ki je najbliže gledalcu;
// urejanje podatka, da veš, kdaj vstaviti vidnejši obroč;
let currRingInProminentRLoop = 2; // to se preverja takrat, ko ga vstavljaš; pomeni številko tistega, ki bo naslednji vstavljen; začnemo z 2, ker smo pravkar dodali prominent obroč (ki je imel št. 1);
const prominentOne = 5 // na vsake kolko gre vidnejši; tj 5;
let insertNewRing = false;  // kontrolna spremenljivka, ki sproži dodajanje novega obroča;

while (isRunning) {

    // posodobimo položaj gledalca (in prikazane povezane podatke);
    kotDataDiv.innerHTML = you.update().toFixed(2);
    dxDataDiv.innerHTML = you.dx.toFixed(2);

    // posodobitev podatkov obročev;
    // najprej shranimo procesno spremenljivko;
    let numLengthsPrior = Ring.main;  // kolko celih dolžin je PRED tem obročem;

    // obvezno od 0 gor, ker ničti določi neke vrednosti, ki se uporabijo pri naslednjih;
    for (let i = 0; i <= rings.length - 1; i++) {
        rings[i].update(i);
    }

    // preverjanje, al je treba vnest nov obroč;
    // odseki (lengths) so <= gornja meja in > spodnja meja, zadnji je torej od (Data.numRings - 1 + 0,00000000001) do Data.numRings;
    // ampak so sestavljeni (odseki) iz main + leader, tako da polna oddaljenost (numRings, dejmo rečt 15) je enako 14,00 + 1,00;
    if (Ring.main < numLengthsPrior) {  /* če je prešel iz enega odseka v bližnjega; */
        insertNewRing = true;
        if (Ring.main < 0) Ring.main++;
        console.log('v naslednji ods.');
    } else if (Ring.leader == 0 && Ring.main == numLengthsPrior) {  // če je prešel točno na ničto točko odseka (prej je torej bil lih malo bolj oddaljen);
        insertNewRing = true;
        if (Ring.main == 0) Ring.leader = 1;    // main ostane 0, ampak vsi obroči se oddaljijo za 1, ker se je leader povečal za 1;
        console.log('modulo je 0');
    }
    
    // če je treba, vstavimo nov obroč / odstranimo odvečnega
    if (insertNewRing) {
        insertNewRing = false;
        if (rings.length == Data.numRings) {    // primer, če že imamo array z največjim št. obročev;
            rings.shift(); // odstranimo 0-ti obroč
        }
        // na konec (če je array že poln, je to na idx numRings - 1, sicer pa pač na konec) dodamo nov obroč;
        rings.push(new Ring (currRingInProminentRLoop == 1 ? true : false))
        // console.log(rings.length);
    
        // uredimo števec za določanje debelega obroča, da bo pripravljen za naslednji obroč, ki bo ustvarjen;
        if (currRingInProminentRLoop >= prominentOne) { // če smo trenutno vstavili zadnji obroč zanke, ki določa vstavitev vidnega obroča;
            currRingInProminentRLoop = 1;    // ponastavimo na 1 (da bomo naslednjič vstavili drugačnega);
        }   else currRingInProminentRLoop++; // sicer povečamo števec za določanje debelega obroča;

    }

    // izbrišemo polje; brišemo šele tik pred risanjem, da ni črnega ekrana vmes (če morebiti vmesni izračuni trajali dolgo);
    drawingCtx.fillRect(0, 0, canvas.width, canvas.height);
    
    // testno - črta na sredini ekrana za orientacijo;
    drawingCtx.beginPath();
    drawingCtx.moveTo(Ring.x, 0);
    drawingCtx.lineTo(Ring.x, Ring.y);
    drawingCtx.stroke();

    // risanje
    // obroč [0] je uni, k je zunaj (največji, najbliže gledalcu), rišemo pa trenutno od length-1 proti 0;
    // const testAa = [];
    for (let i = rings.length - 1; i >= 0; i--) {
        // testno
        if (i == rings.length - 1) {
            Ring.testXs = new Array;
        }

        // dejanska stvar
        rings[i].draw(drawingCtx, i);
        
        // testAa.push(rings[i].distance);

        // testno
        if(i == 0) {
            drawingCtx.beginPath();
            drawingCtx.moveTo(Ring.testXs[0], 800);
            for (let j = 1; j <= rings.length - 1; j++) {
                drawingCtx.lineTo(Ring.testXs[j], 800 - 10 * j);
            }
            drawingCtx.stroke();

        }
    }
    // console.log(testAa);
    await pauseInSecs(pauseDuration);
    
}

