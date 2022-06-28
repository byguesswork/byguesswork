'use strict';


//      --------- še za naredit ---------
//  
//  dodat da escape prekine vlečenje
//  dodat da pri shift riše ravno črto
//  da bi se dalo naloadat sliko
//  dodat funkcionalnost Ctrl + Z tudi na dodajEventListenerNaClassAkcija
//  risanje grafov in sinusov z risanjem senc kvadratov, ko vlečeš
//  da prosto risanje riše s krogci, ne črticami
//  barvna paleta 6 x 3 (namesto 5 x 2)
//  dodaj, da se da spreminjat barvno paleto
//  popravit tie-fighterja, da gre zaokroženje iz osrednje krogle, ne iz kril
//  naredit random delovanje zvezdice (da ima včasiš še tak ali drugačen sij)
//  Fill bonus oz. napredno: dodaj referral, ko daš v toCheck, katerega ziher ni treba preverjat, ker je ta pač bil izvor za toCheck
//  da Ctrl+Z dela samo na kanvasu, ne pa tudi v vnosih poljih (širina vstice, zamenjava funkcije oz. načina risanja)
//  dodaj, da se da določit velikost pravokotnika/kvadrata/kroga in ga potem plasirat s klikom
//  naredit, da se raztegljive like vleče lahko na 3 razl. načine, dodat izbirnik za to (uporabnik izbere)
//  dodat risanje take zvezdice, kot jo ima paint
//  popravit warninge/issues v konsole
//  poišči NAREDIT, FIXME
//  dat listenerje za inpute v funkcije in jih klicat po postavitvi menija

//      -----------------           ---------------------------         ---------------------

//  za najt zadnje delo išči  t e m p, d e l o v i š č e  ali pa  c o n s o l e.log


// ODLOŽIŠČE ------------------------------

// konec ODLOŽIŠČA ------------------------


// selektorji
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 440;
canvas.height = window.innerHeight - 37;

const containerPaleta = document.getElementById('paleta');
const containerPaletaPolnila = document.getElementById('paleta-polnila');
const containerPaletteOverlay = document.getElementById('palette-overlay')
const containerShapeProperties = document.getElementById('shape-properties');
const containerBtnAkcija = document.getElementById('akcija-btn-container');

const btnPravokotnik = document.getElementById('pravokotnik');
const btnZaobljenPravokotnik = document.getElementById('zaobljen-pravokotnik');
const btnKvadrat = document.getElementById('kvadrat');
const btnKrog = document.getElementById('krog-iz-sredisca');
const btnKrogDotikalisce = document.getElementById('krog-iz-dotikalisca');
const btnRavnaCrta = document.getElementById('ravna-crta');
const btnZvezdica = document.getElementById('zvezdica');
const btnTieFighter = document.getElementById('tie-fighter');
const btnProstoRisanje = document.getElementById('prosto-risanje');
const btnPrelivnoBarvanje = document.getElementById('prelivno-barvanje');
let btnAkcija = document.getElementById('akcija');
// const btnGumb = document.getElementById('gumb');
const btnClearCanvasLight = document.getElementById('clear-canvas-light');
const btnClearCanvasDark = document.getElementById('clear-canvas-dark');

const inputDebelina = document.getElementById('debelina-vrednost');
const radioFillable = document.querySelectorAll('input[name="fillable"]');
const labelMouseX = document.getElementById('mouseXpos');
const labelMouseY = document.getElementById('mouseYpos');

// spremenljivke
const canvasFrame = canvas.getBoundingClientRect();
const canvasFrameLeft = canvasFrame.left;
const canvasFrameTop = canvasFrame.top;
let paletaFrame = containerPaleta.getBoundingClientRect();
let paletaFrameLeft = paletaFrame.left;
let paletaFrameTop = paletaFrame.top;
let paletaPolnilaFrame = containerPaletaPolnila.getBoundingClientRect();
let paletaPolnilaFrameLeft = paletaPolnilaFrame.left;
let paletaPolnilaFrameTop = paletaPolnilaFrame.top;
let inputX, inputY, inputWidth, inputHeight, inputCornerRadius, inputCircleRadius, inputX2, inputY2;
let mouseX, mouseY; //ta spremenljivka se uporablja tako na paleti kot na canvasu, ampak ni težava, ker ne more biti oboje hkrati
let mousePreviousXPos, mousePreviousYPos;
let mouseDownXpos, mouseDownYpos;
let mouseIsPressed = false, hasMouseUpFired = false;
let selectedShape = 'pravokotnik', prejsnjiSelectedShape = 'pravokotnik';
let lineWidth = 1, fillShape = 'ne', strokeStyleDuringDrag = 'white';
let savedImageAtMouseDown, staticBackgroundDuringDrag, isImageAlreadyLoaded = false;
let drawEventHistory = [], retrievedImageCtrlZ, ctrlZCount = 0;
let prelivnoBarvanjeVTeku = false;


const liki = [      // ko dodaš nov element, mu dodaj tudi (1) selektorsko spremenljivko (na vrhu) in pa (2) listener
    {
        name: 'pravokotnik',
        properties: [
            { id: 'x-value', text: 'X, zg.l. oglišče:', title: 'koordinata x zg.levega oglišča' },
            { id: 'y-value', text: 'Y, zg.l. oglišče:', title: 'koordinata y zg.levega oglišča' },
            { id: 'width', text: 'Širina:', title: 'širina v pikslih, merjeno na desno od danega oglišča' },
            { id: 'height', text: 'Višina:', title: 'višina v pikslih, merjeno NAVZDOL od danega oglišča' }]
    },
    {
        name: 'zaobljen-pravokotnik',
        properties: [
            { id: 'x-value', text: 'X, zg.l. oglišče:', title: 'koordinata x zg.levega oglišča' },
            { id: 'y-value', text: 'Y, zg.l. oglišče:', title: 'koordinata y zg.levega oglišča' },
            { id: 'width', text: 'Širina:', title: 'širina v pikslih, merjeno na desno od danega oglišča' },
            { id: 'height', text: 'Višina:', title: 'višina v pikslih, merjeno NAVZDOL od danega oglišča' },
            { id: 'corner-radius', text: 'Radij vogala:', title: 'polmer zaokroženja vogala pravokotnika, v pikslih' },]
    },
    {
        name: 'kvadrat',
        properties: [
            { id: 'x-value', text: 'X, zg.l. oglišče:', title: 'koordinata x zg.levega oglišča' },
            { id: 'y-value', text: 'Y, zg.l. oglišče:', title: 'koordinata y zg.levega oglišča' },
            { id: 'width', text: 'Širina=višina:', title: 'širina/višina v pikslih, merjeno na desno/mavzdol od danega oglišča' }
        ]
    },
    {
        name: 'krog-iz-sredisca',
        properties: [
            { id: 'x-value', text: 'X (središče):', title: 'koordinata x središča kroga' },
            { id: 'y-value', text: 'Y (središče):', title: 'koordinata y središča kroga' },
            { id: 'circle-radius', text: 'Polmer:', title: 'polmer kroga, v pikslih' }]
    },
    {
        name: 'krog-iz-dotikalisca',
        properties: [
            { id: 'x-value', text: 'X (središče):', title: 'koordinata x središča kroga' },
            { id: 'y-value', text: 'Y (središče):', title: 'koordinata y središča kroga' },
            { id: 'x2-value', text: 'X (dotikališče):', title: 'koordinata x dotikališča' },
            { id: 'y2-value', text: 'Y (dotikališče):', title: 'koordinata y dotikališča' },]
    },
    {
        name: 'ravna-crta',
        properties: [
            { id: 'x-value', text: 'X (1. točka):', title: 'koordinata x začetne točke' },
            { id: 'y-value', text: 'Y (1. točka):', title: 'koordinata y začetne točke' },
            { id: 'x2-value', text: 'X (2. točka):', title: 'koordinata x končne točke' },
            { id: 'y2-value', text: 'Y (2. točka):', title: 'koordinata y končne točke' },]
    },
    {
        name: 'zvezdica',
        properties: [{ id: 'corner-radius', text: 'Dolžina kraka:', title: 'dolžina kraka zvezdice v pikslih' }]
    },  // čeprav ima le eno vrstico lastnosti, mora biti array, sicer ne dela forEach
    {
        name: 'tie-fighter',
        properties: [{ id: 'width', text: 'Širina:', title: 'širina vesoljskega plovila' }]
    },
    {
        name: 'prosto-risanje',
        properties: undefined,
    },
    {
        name: 'prelivno-barvanje',
        properties: undefined,
    },
];

const strokePaletteSquare = {
    hover: {
        actual: 1,
        previous: 1
    },
    selected: {
        actual: 1,
        previous: 1
    }
}

const fillPaletteSquare = {
    hover: { actual: 1, previous: 1 },
    selected: { actual: 1, previous: 1 }
}

//                black,    white,     red,      green,      blue,      yellow,     orange,    brown,   nekavijola   violet
const paleta = ['#000000', '#ffffff', '#ff0000', '#008000', '#0000ff', '#ffff00', '#ffa500', '#a52a2a', '#a11af0', '#ee82ee'];

// funkcije

function pretvoriHexV255(niz) {
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

function ponastaviNaLikPravokotnik() {
    selectedShape = 'pravokotnik';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputX = document.getElementById('x-value');
    inputY = document.getElementById('y-value');
    inputWidth = document.getElementById('width');
    inputHeight = document.getElementById('height');
}

function prestaviClassSelectedInPostaviLastnostiLika() {
    //  zamenjaj class selected med prejšnjim in novim likom
    document.getElementById(prejsnjiSelectedShape).classList.remove('selected');
    document.getElementById(selectedShape).classList.add('selected');
    prejsnjiSelectedShape = selectedShape;

    // postavi lastnosti novega lika v vmesniku
    const lik = liki.find(function (curr) { return curr.name === selectedShape });
    let properties = lik.properties;
    containerShapeProperties.innerHTML = '';
    containerBtnAkcija.innerHTML = '';
    if (properties) {
        containerShapeProperties.insertAdjacentHTML('beforeend', ` <p class="properties-section-label" style="padding-bottom: 5px;">Lik lahko narišeš tudi tako, da spodaj vneseš
        podatke</p>`);
        properties.forEach(function (property) {
            const html = `
      <div class="one-property">
                    <label for="${property.id}" class="property-label" title="${property.title}">${property.text}</label>
                    <input id="${property.id}" type="number"><br>
                </div>`;
            containerShapeProperties.insertAdjacentHTML('beforeend', html);
        })
        containerBtnAkcija.insertAdjacentHTML('afterbegin', '<input id="akcija" type="submit" value="Nariši">')
        btnAkcija = document.getElementById('akcija');
        dodajEventListenerNaClassAkcija();
    }
    paletaFrame = containerPaleta.getBoundingClientRect();  // ker se vmesnik zamakne gor ali dol, moraš tudi dobit nov položaj palete, da pravilno odbira kvadratke
    paletaFrameLeft = paletaFrame.left;
    paletaFrameTop = paletaFrame.top;
    paletaPolnilaFrame = containerPaletaPolnila.getBoundingClientRect(); // enako za paleto polnila
    paletaPolnilaFrameLeft = paletaPolnilaFrame.left;
    paletaPolnilaFrameTop = paletaPolnilaFrame.top;
    containerPaletteOverlay.style['top'] = `${paletaPolnilaFrameTop}px`;
}

function getMousePosOnObject(e, left, top) {
    mouseX = e.clientX - left;
    mouseY = e.clientY - top;
}

function izracunajStevilkoKvadratka(e, frameLeftEdge, frameTopEdge) {
    getMousePosOnObject(e, frameLeftEdge, frameTopEdge);
    if (mouseX > 218) mouseX = mouseX - 5;    // HROŠČ: če vstopiš v prvo ali drugo vrsto z desne strani, namesto 5 vrne 6, namsto 10 vrne 11 ( v konzoli vrže error samo za primer z 11; primer s 6 pa vidiš, ko na kratko pobliske 6-ka, ko vstopiš v petko)
    let kvadratekFxInt = (mouseY < 44) ? Math.trunc((mouseX + 1) / 44) + 1 : Math.trunc((mouseX + 1) / 44) + 6;
    return kvadratekFxInt;
}

function spremeniDvaRobaKvadratkaPalete(kateraPaleta, stKvadratka, imeBarve, r1, r2) {
    let slog;
    let rob1 = `border${r1}`;
    let rob2 = `border${r2}`;
    if (imeBarve === 'siva') slog = '2px solid #808080';
    if (imeBarve === 'zelena') slog = '2px solid #9cfa9c';
    if (imeBarve === 'bela') slog = '2px solid white';
    if (imeBarve === 'rumena') slog = '2px solid yellow';
    if (imeBarve === 'plava') slog = '2px solid #07f2fa';
    document.querySelector(`.${kateraPaleta}.nr-${stKvadratka}`).style[rob1] = document.querySelector(`.${kateraPaleta}.nr-${stKvadratka}`).style[rob2] = slog;
}

function spremeniRoboveKvadratkaPalete(kateraPaleta, stKvadratka, imeBarve) {
    spremeniDvaRobaKvadratkaPalete(kateraPaleta, stKvadratka, imeBarve, 'Top', 'Right');
    spremeniDvaRobaKvadratkaPalete(kateraPaleta, stKvadratka, imeBarve, 'Bottom', 'Left');
}

function realise() {
    if (fillShape === 'ne') ctx.stroke(); else {
        if (mouseIsPressed) {
            ctx.fillStyle = `${paleta[fillPaletteSquare.selected.actual - 1]}40`;  //polprosojno polnilo pri vlečenju
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = paleta[fillPaletteSquare.selected.actual - 1];
        } else {     // pri kliku mouse ni pressed (se dejansko zgodi po stanju pressa), pri mouseup pa itak ni
            ctx.fill();
            ctx.stroke();
        }
    }
}

function popravekOstrine(v1, v2) {   // brez tega lihe debeline črte riše nejasno (1 px bolj debelo) oz z nepravo (bolj bledo) barvo
    v1 = v1 - 0.5;
    v2 = v2 - 0.5;
    return [v1, v2];
}

function narisiPravokotnik(x, y, w, h) {
    if (lineWidth % 2 === 1) [x, y] = popravekOstrine(x, y);
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    realise();
}

function drawRoundedRect(x, y, w, h, r = 20) {    // w= širina, h= višina, r= radij zaokroženja roba
    if (lineWidth % 2 === 1) [x, y] = popravekOstrine(x, y);
    ctx.beginPath();
    ctx.moveTo(x + r, y);       // začne zgoraj levo (na začetku ravnega dela) in gre na desno naokoli
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    realise();
}

function narisiKvadrat(x, y, w) {
    if (lineWidth % 2 === 1) [x, y] = popravekOstrine(x, y);
    ctx.beginPath();
    ctx.rect(x, y, w, w);
    realise();
}

function narisiKrog(x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    realise();
}

function narisiRavnoCrto(x1, y1, x2, y2) {
    if (lineWidth % 2 === 1) {  // popravek ostrine
        if (x1 === x2) [x1, x2] = popravekOstrine(x1, x2);
        if (y1 === y2) [y1, y2] = popravekOstrine(y1, y2);
    }
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function narisiTieFighter(x, y, w) {
    let h = 1.25 * w;
    let cornerR = 0.21 * w;
    let structuralWidth = 0.04 * w;
    let centerXvalue = x + w / 2;
    let centerYvalue = y + h / 2;
    drawRoundedRect(centerXvalue, centerYvalue, 0, 0, cornerR)
    narisiKrog(centerXvalue, centerYvalue, cornerR);
    narisiPravokotnik(x - structuralWidth / 2, y, structuralWidth, h);
    narisiPravokotnik(x + w - structuralWidth / 2, y, structuralWidth, h);
    narisiPravokotnik(x + structuralWidth / 2, y + h / 2 - structuralWidth / 2, w - structuralWidth, structuralWidth);
    drawRoundedRect(x + structuralWidth / 2, centerYvalue, w - structuralWidth, 0, cornerR * 2);
}

function prelivnoBarvanje() {

    // ne dela dobro pri prostem risanju debeline 1, ker lahko barva preskoči diagonalno
    // rešitev: da bi pri čekiranju malih gledalo samo 4 smeri, ne 8

    let prviPiksel = { x: mouseX, y: mouseY, data: ctx.getImageData(mouseX, mouseY, 1, 1).data };
    let ciljnaBarva = pretvoriHexV255(paleta[strokePaletteSquare.selected.actual - 1]);
    let toCheck = [], checked = [], pixelByPixelFill = { toCheck: [], checked: [] };

    console.log('klik na: ', mouseX, mouseY);

    function zafilaj(spremenljivka, zafilajX, zafilajY, smx, smy) {
        const zafilajObj = {};
        zafilajObj.x = zafilajX;
        zafilajObj.y = zafilajY;
        zafilajObj.smallX = smx;
        zafilajObj.smallY = smy;
        spremenljivka.push(zafilajObj);
    }

    function preveriArray(podanArray, x, y) {  // preveri, ali podani element (x, y) že obstaja v podanemArrayu; če torej podani element predstavlja novi element za array, vrne false
        let enakost = false;
        let števec = podanArray.length - 1;
        while (!enakost && števec >= 0) {
            if (podanArray[števec].x === x && podanArray[števec].y === y) enakost = true;
            števec--;
        }
        return enakost;
    }

    function checkPerimeter(passedInPixel) {
        let pixelPerimeterImg = ctx.getImageData(passedInPixel.x - 3, passedInPixel.y - 3, 7, 7), isPerimeterToBeChanged = true;

        let i = 0;
        while (i < 49 && isPerimeterToBeChanged) {
            for (let j = 0; j < 3; j++) {
                if (prviPiksel.data[j] !== pixelPerimeterImg.data[i * 4 + j]) isPerimeterToBeChanged = false;
            }
            i++
        }

        if (isPerimeterToBeChanged) {
            // zamenjat barvo celemu perimetru
            for (let i = 0; i < 49; i++) {
                for (let j = 0; j < 3; j++) pixelPerimeterImg.data[i * 4 + j] = ciljnaBarva[j];
            }

            ctx.putImageData(pixelPerimeterImg, passedInPixel.x - 3, passedInPixel.y - 3);

            // sejanje novih 4 semen za perimetre v toCheck, sicer pa samo malih koordinat za pixelbypixel čekiranje
            for (let i = -7; i < 10; i = i + 14) {
                if (!(passedInPixel.x + i < 4 || passedInPixel.x + i > ctx.canvas.width - 4)) { // perimeter levo in perimeter desno od ravnokar prebarvanega perimetra
                    if (!preveriArray(toCheck, passedInPixel.x + i, passedInPixel.y) && !preveriArray(checked, passedInPixel.x + i, passedInPixel.y)) zafilaj(toCheck, passedInPixel.x + i, passedInPixel.y, passedInPixel.x + 4 * i / 7, passedInPixel.y);
                } else /*if (!preveriArray(pixelByPixelFill.toCheck, passedInPixel.x + 4 * i / 7, passedInPixel.y)) */ pixelByPixelFill.toCheck.push({ x: passedInPixel.x + 4 * i / 7, y: passedInPixel.y });
                if (!(passedInPixel.y + i < 4 || passedInPixel.y + i > ctx.canvas.height - 4)) { // perimeter nad in perimeter pod ravnokar prebarvanim perimetrom
                    if (!preveriArray(toCheck, passedInPixel.x, passedInPixel.y + i) && !preveriArray(checked, passedInPixel.x, passedInPixel.y + i)) zafilaj(toCheck, passedInPixel.x, passedInPixel.y + i, passedInPixel.x, passedInPixel.y + 4 * i / 7);
                    // to preverjanje spodaj (za else) mislim da ni potrebno, da je na koncu isto število elementov v pixelByPixelFill.toCheck če imaš to preverjanje ali ne; po neki logiki se ne morejo podvajat
                } else /*if (!preveriArray(pixelByPixelFill.toCheck, passedInPixel.x, passedInPixel.y + 4 * i / 7)) */ pixelByPixelFill.toCheck.push({ x: passedInPixel.x, y: passedInPixel.y + 4 * i / 7 });
            }
        } else {
            pixelByPixelFill.toCheck.push({ x: toCheck[0].smallX, y: toCheck[0].smallY });
        }

        checked.push({ x: toCheck[0].x, y: toCheck[0].y });
        toCheck.shift();
        // if (toCheck.length === 0) {  //  samo za testne namene
        //     console.log(checked);
        //     console.log(pixelByPixelFill.toCheck);
        // }
    };   //    --  konc checkPerimeter --


    function checkPixelByPixel(passedInPixel) {
        let passedInPixelImg = ctx.getImageData(passedInPixel.x, passedInPixel.y, 1, 1), isSmallPerimeterToBeChanged = true;

        for (let j = 0; j < 3; j++) {
            if (prviPiksel.data[j] !== passedInPixelImg.data[j]) isSmallPerimeterToBeChanged = false;
        }

        // spodnji del sproti:
        // - preverja, al naj se vsak posamičen piksel v perimetru 3*3 spremeni (po for zanki);
        // - po potrebi sproti spremeni
        // - po porebi sproti seje semena
        if (isSmallPerimeterToBeChanged) {
            let smallPerimeterImg = ctx.getImageData(passedInPixel.x - 1, passedInPixel.y - 1, 3, 3);

            // trebalo bi še dodat preverjanje pri vsakem pikslu v for zankah, če je  .safe !== true; v takem primeru <1 spremenit v <=2 (in sorodno za vse 4)
            if (!(passedInPixel.x < 1 || passedInPixel.x > ctx.canvas.width - 1 || passedInPixel.y < 1 || passedInPixel.y > ctx.canvas.height - 1)) passedInPixel.safe = true;
            if (passedInPixel?.safe) {
                let n = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (smallPerimeterImg.data[n * 4 + 0] === prviPiksel.data[0] && smallPerimeterImg.data[n * 4 + 1] === prviPiksel.data[1] && smallPerimeterImg.data[n * 4 + 2] === prviPiksel.data[2]) {
                            for (let k = 0; k <= 2; k++) smallPerimeterImg.data[n * 4 + k] = ciljnaBarva[k];
                            if (n !== 4) pixelByPixelFill.toCheck.push({ x: passedInPixel.x + 2 * j, y: passedInPixel.y + 2 * i });
                        }
                        n++;
                    }
                }
                ctx.putImageData(smallPerimeterImg, passedInPixel.x - 1, passedInPixel.y - 1);
            }
        }
        pixelByPixelFill.toCheck.shift();
    }

    // to je preverjanje, ali je morebiti piksel, kamor klikneš, že iste barve, kot je želena barva; če je => abort;
    prelivnoBarvanjeVTeku = true;
    for (let i = 0; i < 3; i++) {
        if (prviPiksel.data[i] !== ciljnaBarva[i]) prelivnoBarvanjeVTeku = false;
    }

    if (prelivnoBarvanjeVTeku === false) {  // to je glavna akcija

        prelivnoBarvanjeVTeku = true;
        zafilaj(toCheck, mouseX, mouseY, mouseX, mouseY);

        //   --- --- to je glavna akcija za perimeter check
        while (toCheck.length > 0) {
            checkPerimeter(toCheck[0]);
        }

        //   --- --- to je glavna akcija za ta male čeke
        while (pixelByPixelFill.toCheck.length > 0) {
            checkPixelByPixel(pixelByPixelFill.toCheck[0]);
        }

        updateDrawEventHistory();
    }  // konec glavne akcije

    prelivnoBarvanjeVTeku = false;

}  // konec prelivno barvanje

function izracunajLik() {
    let x, y, w, h, r, cornerR;

    function pretvoriMousePosvXY() {
        if (selectedShape !== 'krog-iz-sredisca' && selectedShape !== 'krog-iz-dotikalisca') { // s tem najdeš x,y, ki predstavjata zgornjo levo točko, ne glede nato, kako si vlekel
            x = mouseDownXpos < mouseX ? mouseDownXpos : mouseX;
            y = mouseDownYpos < mouseY ? mouseDownYpos : mouseY;
            w = Math.abs(mouseDownXpos - mouseX);
            h = Math.abs(mouseDownYpos - mouseY);
        } else {    // če bi naredil isto transformacijo kot pri ne-krog, bi ne vedno izhajalo iz centra, kar pa sicer ni nujno slabo
            if (selectedShape === 'krog-iz-sredisca') { x = mouseDownXpos; y = mouseDownYpos; }
            else { x = mouseX; y = mouseY }
        }
    }

    function izracunajPolmerKroga() {
        let length = mouseX - mouseDownXpos;
        let height = mouseDownYpos - mouseY;
        r = Math.sqrt(length ** 2 + height ** 2)
    }

    function krog() {
        izracunajPolmerKroga();
        narisiKrog(x, y, r);
        if (mouseIsPressed) {  // za risanje rdeče puščice, ko vlečeš krog
            let kot, leviKot, desniKot;
            let krak = r / 7;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseX, mouseY);

            // za izračunat kot, in sicer kot od dotikalnice proti središču!
            kot = Math.atan2(mouseDownYpos - mouseY, mouseDownXpos - mouseX);
            // za izračunat kote krakov; imaš samo 3 primere: 
            // 1. če ima kot obeh krakov puščice isti predznak kot glavni kot 
            // + 2 primera, ko eden od krakov poseže na polovico koordinatnega sistema s koti nasprotnega predznaka od glavnega kota
            if (Math.abs(kot) <= 3 * Math.PI / 4) {
                leviKot = kot - Math.PI / 4;
                desniKot = kot + Math.PI / 4;
            } else {
                if (kot > 0) {
                    leviKot = kot - Math.PI / 4;
                    desniKot = -Math.PI + Math.PI / 4 - (Math.PI - kot);
                } else {
                    leviKot = Math.PI - Math.PI / 4 - (Math.PI - kot);
                    desniKot = kot + Math.PI / 4;
                }
            }
            // risnaj krakov puščice: sinus za y in cos za x
            // za narisat puščico na obodu
            narisiRavnoCrto(mouseX, mouseY, mouseX + Math.cos(leviKot) * krak, mouseY + Math.sin(leviKot) * krak);
            narisiRavnoCrto(mouseX, mouseY, mouseX + Math.cos(desniKot) * krak, mouseY + Math.sin(desniKot) * krak);

            // za narisat puščico iz središča kroga (samo zamenjaš predznak!! kot je sicer popolnoma isti)
            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - Math.cos(leviKot) * krak, mouseDownYpos - Math.sin(leviKot) * krak);
            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - Math.cos(desniKot) * krak, mouseDownYpos - Math.sin(desniKot) * krak);

            ctx.strokeStyle = strokeStyleDuringDrag;
            ctx.lineWidth = lineWidth;
        }
    }

    // like se lahko vleče na 3 načine:
    //  - samo v enem kvadrantu; v tem primeru lahko njegovo velikost določaš z vlečenjem navzdol ALI desno
    //  - v 2  kvadrantih; v tem primeru lahko vlečeš L ALI D od izhodišča, navzdol pa ne moreš, ker bi bil prehod iz kvadranta čuden
    //  - v 4 kvadrantih; v tem primeru lahko vlečeš samo po diagonali vsakega kvadranta, sicer so prehodi iz kvadrantov čudni

    if (selectedShape === 'ravna-crta')
        narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseX, mouseY);
    else {
        pretvoriMousePosvXY()

        switch (selectedShape) {
            case 'pravokotnik':
                narisiPravokotnik(x, y, w, h); break;
            case 'zaobljen-pravokotnik':
                cornerR = inputCornerRadius.value ? Number(inputCornerRadius.value) : 20;
                drawRoundedRect(x, y, w, h, cornerR); break;
            case 'kvadrat':
                let stranica = w > h ? h : w; // tukaj določiš, al rišeš na podlagi krajše ali daljše stranice
                if (mouseDownXpos <= mouseX) {
                    if (mouseDownYpos <= mouseY) {
                        narisiKvadrat(mouseDownXpos, mouseDownYpos, stranica);
                        if (mouseIsPressed) {
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + stranica, mouseDownYpos + stranica);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + stranica / 4, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos, mouseDownYpos + stranica / 4);
                            narisiRavnoCrto(mouseDownXpos + stranica, mouseDownYpos + stranica, mouseDownXpos + stranica * 3 / 4, mouseDownYpos + stranica);
                            narisiRavnoCrto(mouseDownXpos + stranica, mouseDownYpos + stranica, mouseDownXpos + stranica, mouseDownYpos + stranica * 3 / 4);
                            ctx.strokeStyle = strokeStyleDuringDrag;
                            ctx.lineWidth = lineWidth;
                        }
                    }
                    else {
                        narisiKvadrat(mouseDownXpos, mouseDownYpos - stranica, stranica);
                        if (mouseIsPressed) {
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + stranica, mouseDownYpos - stranica);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + stranica / 4, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos, mouseDownYpos - stranica / 4);
                            narisiRavnoCrto(mouseDownXpos + stranica, mouseDownYpos - stranica, mouseDownXpos + stranica * 3 / 4, mouseDownYpos - stranica);
                            narisiRavnoCrto(mouseDownXpos + stranica, mouseDownYpos - stranica, mouseDownXpos + stranica, mouseDownYpos - stranica * 3 / 4);
                            ctx.strokeStyle = strokeStyleDuringDrag;
                            ctx.lineWidth = lineWidth;
                        }
                    }
                } else {
                    if (mouseDownYpos <= mouseY) {
                        narisiKvadrat(mouseDownXpos - stranica, mouseDownYpos, stranica);
                        if (mouseIsPressed) {
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - stranica, mouseDownYpos + stranica);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - stranica / 4, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos, mouseDownYpos + stranica / 4);
                            narisiRavnoCrto(mouseDownXpos - stranica, mouseDownYpos + stranica, mouseDownXpos - stranica * 3 / 4, mouseDownYpos + stranica);
                            narisiRavnoCrto(mouseDownXpos - stranica, mouseDownYpos + stranica, mouseDownXpos - stranica, mouseDownYpos + stranica * 3 / 4);
                            ctx.strokeStyle = strokeStyleDuringDrag;
                            ctx.lineWidth = lineWidth;
                        }
                    }
                    else {
                        narisiKvadrat(mouseDownXpos - stranica, mouseDownYpos - stranica, stranica);
                        if (mouseIsPressed) {
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - stranica, mouseDownYpos - stranica);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - stranica / 4, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos, mouseDownYpos - stranica / 4);
                            narisiRavnoCrto(mouseDownXpos - stranica, mouseDownYpos - stranica, mouseDownXpos - stranica * 3 / 4, mouseDownYpos - stranica);
                            narisiRavnoCrto(mouseDownXpos - stranica, mouseDownYpos - stranica, mouseDownXpos - stranica, mouseDownYpos - stranica * 3 / 4);
                            ctx.strokeStyle = strokeStyleDuringDrag;
                            ctx.lineWidth = lineWidth;
                        }
                    }
                }; break;
            case 'krog-iz-sredisca':
                krog(); break;
            case 'krog-iz-dotikalisca':
                krog(); break;
            case 'tie-fighter':
                if (w > 1 || h > 1) {
                    if (!mouseIsPressed) hasMouseUpFired = true;
                    narisiTieFighter(x, mouseDownYpos, w);
                    if (mouseIsPressed) {
                        let l = w < 100 ? w * 0.3 : 30;
                        if (mouseDownXpos < mouseX) {
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + w, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + w * 0.1, mouseDownYpos - w * 0.1);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos + w * 0.1, mouseDownYpos + w * 0.1);
                            narisiRavnoCrto(mouseX, mouseDownYpos, mouseX - w * 0.1, mouseDownYpos - w * 0.1);
                            narisiRavnoCrto(mouseX, mouseDownYpos, mouseX - w * 0.1, mouseDownYpos + w * 0.1);
                            //v drugo smer
                            ctx.strokeStyle = 'darkred';
                            narisiRavnoCrto(mouseDownXpos - w * 0.05, mouseDownYpos, mouseDownXpos - w * 0.05 - l, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos - w * 0.05 - l, mouseDownYpos, mouseDownXpos - w * 0.05 - 0.8 * l, mouseDownYpos - l * 0.2);
                            narisiRavnoCrto(mouseDownXpos - w * 0.05 - l, mouseDownYpos, mouseDownXpos - w * 0.05 - 0.8 * l, mouseDownYpos + l * 0.2);
                            ctx.strokeStyle = strokeStyleDuringDrag;
                            ctx.lineWidth = lineWidth;
                        } else {
                            ctx.strokeStyle = 'red';
                            ctx.lineWidth = lineWidth % 2 === 0 ? lineWidth : lineWidth + 1;
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - w, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - w * 0.1, mouseDownYpos - w * 0.1);
                            narisiRavnoCrto(mouseDownXpos, mouseDownYpos, mouseDownXpos - w * 0.1, mouseDownYpos + w * 0.1);
                            narisiRavnoCrto(mouseX, mouseDownYpos, mouseX + w * 0.1, mouseDownYpos - w * 0.1);
                            narisiRavnoCrto(mouseX, mouseDownYpos, mouseX + w * 0.1, mouseDownYpos + w * 0.1);
                            //v drugo smer
                            ctx.strokeStyle = 'darkred';
                            narisiRavnoCrto(mouseDownXpos + w * 0.05, mouseDownYpos, mouseDownXpos + w * 0.05 + l, mouseDownYpos);
                            narisiRavnoCrto(mouseDownXpos + w * 0.05 + l, mouseDownYpos, mouseDownXpos + w * 0.05 + 0.8 * l, mouseDownYpos - l * 0.2);
                            narisiRavnoCrto(mouseDownXpos + w * 0.05 + l, mouseDownYpos, mouseDownXpos + w * 0.05 + 0.8 * l, mouseDownYpos + l * 0.2);
                            ctx.strokeStyle = strokeStyleDuringDrag;
                            ctx.lineWidth = lineWidth;
                        }
                    }
                }; break;
            case 'zvezdica':
                if (w > 1 || h > 1) {
                    let krak = w > h ? w : h;
                    if (!mouseIsPressed) hasMouseUpFired = true;
                    drawRoundedRect(mouseDownXpos, mouseDownYpos, 0, 0, krak);
                }; break;
        }
    } // tale je konc elsa, ki vsebuje vse like
}    // konec izracunajLik

function dodajEventListenerNaClassAkcija() {
    btnAkcija.addEventListener('click', function () {
        let x = Number(inputX.value);
        let y = Number(inputY.value);
        let w = Number(inputWidth.value);
        let h = Number(inputHeight.value);
        let cornerR, r, x2, y2;

        switch (selectedShape) {
            case 'pravokotnik':
                narisiPravokotnik(x, y, w, h); break;
            case 'zaobljen-pravokotnik':
                cornerR = Number(inputCornerRadius.value);
                drawRoundedRect(x, y, w, h, cornerR); break;
            case 'kvadrat':
                narisiKvadrat(x, y, w); break;
            case 'krog-iz-sredisca':
                r = Number(inputCircleRadius.value);
                narisiKrog(x, y, r); break;
            case 'krog-iz-dotikalisca':
                x2 = Number(inputX2.value);
                y2 = Number(inputY2.value);
                let length = x - x2;
                let height = y - y2;
                r = Math.sqrt(length ** 2 + height ** 2);
                narisiKrog(x, y, r); break;
            case 'ravna-crta':
                x2 = Number(inputX2.value);
                y2 = Number(inputY2.value);
                narisiRavnoCrto(x, y, x2, y2); break;
            case 'zvezdica':
                cornerR = inputCornerRadius.value ? Number(inputCornerRadius.value) : 20;
                drawRoundedRect(mouseX, mouseY, 0, 0, cornerR);
                break;
        }
    })
}

function updateDrawEventHistory() {
    if (ctrlZCount === 0) {
        if (drawEventHistory.length < 20) drawEventHistory.push(canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream"))
        else {
            drawEventHistory.shift();
            drawEventHistory.push(canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream"));
        }
    } else {
        for (let i = 1; i <= ctrlZCount; i++) {
            drawEventHistory.pop();
        }
        ctrlZCount = 0;
        drawEventHistory.push(canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream"));
    }
}

function clearCanvas(barva) {
    ctx.fillStyle = barva;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = paleta[fillPaletteSquare.selected.actual - 1];
    strokeStyleDuringDrag = barva === '#313131' ? 'white' : '#9cfa9c';

    // to je zato ker če ne bi morda prikazalo zadnjo sliko ob prvem kliku
    savedImageAtMouseDown = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    staticBackgroundDuringDrag = new Image();
    staticBackgroundDuringDrag.src = savedImageAtMouseDown;
    staticBackgroundDuringDrag.onload = function () {
        ctx.drawImage(staticBackgroundDuringDrag, 0, 0);
    }

    // to je, da se ponastavi funkcionalnost Ctrl + Z
    drawEventHistory = new Array();
    drawEventHistory.push(savedImageAtMouseDown);
    ctrlZCount = 0;
}

// konec deklaracij funkcij

// -----------------------------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------------------------------

// način delovanja - event listenerji

btnPravokotnik.addEventListener('click', function () {
    ponastaviNaLikPravokotnik();
})

btnZaobljenPravokotnik.addEventListener('click', function () {
    selectedShape = 'zaobljen-pravokotnik';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputX = document.getElementById('x-value');
    inputY = document.getElementById('y-value');
    inputWidth = document.getElementById('width');
    inputHeight = document.getElementById('height');
    inputCornerRadius = document.getElementById('corner-radius');
})

btnKvadrat.addEventListener('click', function () {
    selectedShape = 'kvadrat';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputX = document.getElementById('x-value');
    inputY = document.getElementById('y-value');
    inputWidth = document.getElementById('width');
})

btnKrog.addEventListener('click', function () {
    selectedShape = 'krog-iz-sredisca';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputX = document.getElementById('x-value');
    inputY = document.getElementById('y-value');
    inputCircleRadius = document.getElementById('circle-radius');
})

btnKrogDotikalisce.addEventListener('click', function () {
    selectedShape = 'krog-iz-dotikalisca';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputX = document.getElementById('x-value');
    inputY = document.getElementById('y-value');
    inputX2 = document.getElementById('x2-value');
    inputY2 = document.getElementById('y2-value');
})

btnRavnaCrta.addEventListener('click', function () {
    selectedShape = 'ravna-crta';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputX = document.getElementById('x-value');
    inputY = document.getElementById('y-value');
    inputX2 = document.getElementById('x2-value');
    inputY2 = document.getElementById('y2-value');
})

btnZvezdica.addEventListener('click', function () {
    selectedShape = 'zvezdica';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputCornerRadius = document.getElementById('corner-radius');
});

btnTieFighter.addEventListener('click', function () {
    selectedShape = 'tie-fighter';
    prestaviClassSelectedInPostaviLastnostiLika();
    inputWidth = document.getElementById('width');
})

btnProstoRisanje.addEventListener('click', function () {
    selectedShape = 'prosto-risanje';
    prestaviClassSelectedInPostaviLastnostiLika();
})

btnPrelivnoBarvanje.addEventListener('click', function () {
    selectedShape = 'prelivno-barvanje';
    prestaviClassSelectedInPostaviLastnostiLika();
})

// za paleto poteze 

containerPaleta.addEventListener('mouseenter', function (e) {
    strokePaletteSquare.hover.actual = izracunajStevilkoKvadratka(e, paletaFrameLeft, paletaFrameTop);
    spremeniDvaRobaKvadratkaPalete('crta', strokePaletteSquare.selected.actual, 'siva', 'Right', 'Top');
    spremeniDvaRobaKvadratkaPalete('crta', strokePaletteSquare.hover.actual, 'zelena', 'Right', 'Top');
    strokePaletteSquare.hover.previous = strokePaletteSquare.hover.actual;
})

containerPaleta.addEventListener('mousemove', function (e) {
    strokePaletteSquare.hover.actual = izracunajStevilkoKvadratka(e, paletaFrameLeft, paletaFrameTop);
    if (strokePaletteSquare.hover.actual !== strokePaletteSquare.hover.previous) {
        spremeniDvaRobaKvadratkaPalete('crta', strokePaletteSquare.hover.previous, 'siva', 'Right', 'Top');
        spremeniDvaRobaKvadratkaPalete('crta', strokePaletteSquare.hover.actual, 'zelena', 'Right', 'Top');
        strokePaletteSquare.hover.previous = strokePaletteSquare.hover.actual;
    }
})

containerPaleta.addEventListener('click', function () {
    strokePaletteSquare.selected.actual = strokePaletteSquare.hover.actual;
    spremeniRoboveKvadratkaPalete('crta', strokePaletteSquare.selected.actual, 'bela');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 150, 'crta', strokePaletteSquare.selected.actual, 'zelena', 'Top', 'Right');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 200, 'crta', strokePaletteSquare.selected.actual, 'siva', 'Top', 'Right');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 300, 'crta', strokePaletteSquare.selected.actual, 'zelena', 'Bottom', 'Left');
    if (strokePaletteSquare.selected.previous !== strokePaletteSquare.selected.actual) spremeniRoboveKvadratkaPalete('crta', strokePaletteSquare.selected.previous, 'siva');
    strokePaletteSquare.selected.previous = strokePaletteSquare.selected.actual;
    ctx.strokeStyle = paleta[strokePaletteSquare.selected.actual - 1];  // stroke
})

containerPaleta.addEventListener('mouseleave', function () {
    spremeniDvaRobaKvadratkaPalete('crta', strokePaletteSquare.hover.actual, 'siva', 'Top', 'Right');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 200, 'crta', strokePaletteSquare.selected.actual, 'zelena', 'Top', 'Right')
})

inputDebelina.addEventListener('change', function () {
    lineWidth = Number(inputDebelina.value);
    ctx.lineWidth = lineWidth;
})

// za paleto poteze - KONEC

// za paleto polnila

containerPaletaPolnila.addEventListener('mouseenter', function (e) {
    fillPaletteSquare.hover.actual = izracunajStevilkoKvadratka(e, paletaPolnilaFrameLeft, paletaPolnilaFrameTop);
    spremeniDvaRobaKvadratkaPalete('polnilo', fillPaletteSquare.selected.actual, 'siva', 'Right', 'Top');
    spremeniDvaRobaKvadratkaPalete('polnilo', fillPaletteSquare.hover.actual, 'plava', 'Right', 'Top');
    fillPaletteSquare.hover.previous = fillPaletteSquare.hover.actual;
})

containerPaletaPolnila.addEventListener('mousemove', function (e) {
    fillPaletteSquare.hover.actual = izracunajStevilkoKvadratka(e, paletaPolnilaFrameLeft, paletaPolnilaFrameTop);
    if (fillPaletteSquare.hover.actual !== fillPaletteSquare.hover.previous) {
        spremeniDvaRobaKvadratkaPalete('polnilo', fillPaletteSquare.hover.previous, 'siva', 'Right', 'Top');
        spremeniDvaRobaKvadratkaPalete('polnilo', fillPaletteSquare.hover.actual, 'plava', 'Right', 'Top');
        fillPaletteSquare.hover.previous = fillPaletteSquare.hover.actual;
    }
})

containerPaletaPolnila.addEventListener('click', function () {
    fillPaletteSquare.selected.actual = fillPaletteSquare.hover.actual;
    spremeniRoboveKvadratkaPalete('polnilo', fillPaletteSquare.selected.actual, 'bela');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 150, 'polnilo', fillPaletteSquare.selected.actual, 'plava', 'Top', 'Right');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 200, 'polnilo', fillPaletteSquare.selected.actual, 'siva', 'Top', 'Right');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 300, 'polnilo', fillPaletteSquare.selected.actual, 'plava', 'Bottom', 'Left');
    if (fillPaletteSquare.selected.previous !== fillPaletteSquare.selected.actual) spremeniRoboveKvadratkaPalete('polnilo', fillPaletteSquare.selected.previous, 'siva');
    fillPaletteSquare.selected.previous = fillPaletteSquare.selected.actual;
    ctx.fillStyle = paleta[fillPaletteSquare.selected.actual - 1];   //  fill
})

containerPaletaPolnila.addEventListener('mouseleave', function () {
    spremeniDvaRobaKvadratkaPalete('polnilo', fillPaletteSquare.hover.actual, 'siva', 'Top', 'Right');
    setTimeout(spremeniDvaRobaKvadratkaPalete, 200, 'polnilo', fillPaletteSquare.selected.actual, 'plava', 'Top', 'Right')
})

// za paleto polnila    - KONEC

// -- addEventListener za izbirnik polnilo da ali ne
radioFillable.forEach(function (curr) {
    curr.addEventListener('change', function (e) {
        fillShape = e.target.value;
        if (fillShape === 'da') {
            containerPaletteOverlay.style['width'] = '1px';
            containerPaletteOverlay.style['height'] = '1px';
        } else {
            containerPaletteOverlay.style['width'] = '224px';
            containerPaletteOverlay.style['height'] = '92px';
        }
    })
})


// gumb za testne namene; dodaj not preverjanje, prikaz kake funkcionalnosti (conslo.log, ...) ko moraš kaj testirat
// btnGumb.addEventListener('click', function () {

// })

//listener v obliki funkcije
function download() {     // v bistvu je to kot listener, samo da ga sproži pritisk na <a> v HTML-ju, ne pa listener v JS
    let download = document.getElementById("save-pic");
    let image = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
    // če bi funkcija imela argument (recimo e), bi spodaj lahko bilo: e.target.href=image;
    download.setAttribute("href", image);
}

btnClearCanvasLight.addEventListener('click', function () {
    clearCanvas('snow');
})

btnClearCanvasDark.addEventListener('click', function () {
    clearCanvas('#313131');
})

document.addEventListener('keydown', function (e) {    //  za funkcionalnosti Ctrl + Z  in Ctrl + Y
    if (e.ctrlKey && e.key === 'z') {       //  za funkcionalnost Ctrl + Z
        if (drawEventHistory.length - ctrlZCount >= 2) {
            ctrlZCount++;
            retrievedImageCtrlZ = new Image();
            retrievedImageCtrlZ.src = drawEventHistory[drawEventHistory.length - (1 + ctrlZCount)];
            retrievedImageCtrlZ.onload = function () {
                ctx.drawImage(retrievedImageCtrlZ, 0, 0);
            }
        }
    }

    if (e.ctrlKey && e.key === 'y') {     //  za funkcionalnost Ctrl + Y
        if (ctrlZCount > 0) {
            retrievedImageCtrlZ = new Image();
            retrievedImageCtrlZ.src = drawEventHistory[drawEventHistory.length - ctrlZCount];
            retrievedImageCtrlZ.onload = function () {
                ctx.drawImage(retrievedImageCtrlZ, 0, 0);
            }
            ctrlZCount--;
        }
    }
})

//       -----------   canvas   ----------------

canvas.addEventListener('mousedown', function () {
    mouseDownXpos = mouseX;
    mouseDownYpos = mouseY;
    mouseIsPressed = true;
    mousePreviousXPos = mouseX;
    mousePreviousYPos = mouseY;

    savedImageAtMouseDown = canvas.toDataURL("image/png", 1.0).replace("image/png", "image/octet-stream");
})

canvas.addEventListener('mousemove', function (e) {
    getMousePosOnObject(e, canvasFrameLeft, canvasFrameTop)
    labelMouseX.textContent = Math.round(mouseX);
    labelMouseY.textContent = Math.round(mouseY);

    if (mouseIsPressed) {
        if (selectedShape === 'prosto-risanje') {
            ctx.beginPath();
            ctx.moveTo(mousePreviousXPos, mousePreviousYPos);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
            mousePreviousXPos = mouseX;
            mousePreviousYPos = mouseY;
        } else {
            if (!isImageAlreadyLoaded) {
                staticBackgroundDuringDrag = new Image();
                staticBackgroundDuringDrag.src = savedImageAtMouseDown;
                staticBackgroundDuringDrag.onload = function () {
                    // mouseispressed se še enkrat preverja, ker je onload asinhron (ko se dokonča, morda ni več pressed)
                    if (mouseIsPressed) {
                        ctx.drawImage(staticBackgroundDuringDrag, 0, 0);
                        ctx.strokeStyle = strokeStyleDuringDrag;
                        isImageAlreadyLoaded = true;
                    }
                }
            } else {
                ctx.drawImage(staticBackgroundDuringDrag, 0, 0);
                izracunajLik();
            }
        }
    }
})

canvas.addEventListener('mouseup', function () {
    // če ni drawImage, potem čudno riše robove, z nekakšno polovično barvo
    // če ni pogoja s spremembo položaja, potem to počne tudi pri kliku in izbriše predzadnji klik
    // če kaj ni ločeno obdelano pri mouseup,  je treba dat v pogoj poleg prostega risanja;

    // Q: a ne bi moral if stavek z drawImage spodaj preverjat tudi za isimagealready loaded?

    mouseIsPressed = false;  // to je prvo, ker to je bistvo mouseup-a!!; prve stvari prvo, tiste, zaradi katerih je sploh fora tukaj
    if (selectedShape !== 'prosto-risanje') {
        if (mouseDownXpos !== mouseX || mouseDownYpos !== mouseY) ctx.drawImage(staticBackgroundDuringDrag, 0, 0);  //to se mora zalaufat, samo ČE NI klik, dodaj funkcionalnost    
        ctx.strokeStyle = paleta[strokePaletteSquare.selected.actual - 1];
        isImageAlreadyLoaded = false;
        izracunajLik();
    }
    if (mouseDownXpos !== mouseX || mouseDownYpos !== mouseY) updateDrawEventHistory(); // zato ker če ne pri istem dogodku naredi 2 sliki, enkrat namreč še pri kliku
})

canvas.addEventListener('click', function () {
    if (selectedShape === 'zvezdica') {
        if (!hasMouseUpFired) {
            let cornerR = inputCornerRadius.value ? Number(inputCornerRadius.value) : 20;
            drawRoundedRect(mouseX, mouseY, 0, 0, cornerR);
            updateDrawEventHistory();
        } else hasMouseUpFired = false;
    } else if (selectedShape === 'tie-fighter') {
        if (!hasMouseUpFired) {
            let width = inputWidth.value ? Number(inputWidth.value) : 40;
            narisiTieFighter(mouseX, mouseY, width);
            updateDrawEventHistory();
        } else hasMouseUpFired = false;
    } else if (selectedShape === 'prosto-risanje' && mouseDownXpos === mouseX && mouseDownYpos === mouseY) {
        ctx.beginPath;
        ctx.moveTo(mouseX - 1, mouseY);
        ctx.lineTo(mouseX, mouseY);
        ctx.stroke();
        updateDrawEventHistory();
    } else if (selectedShape === 'prelivno-barvanje') {
        if (prelivnoBarvanjeVTeku === false) prelivnoBarvanje();
    }
})

canvas.addEventListener('mouseleave', function () {
    labelMouseX.textContent = '_ _ _';
    labelMouseY.textContent = '_ _ _';
})

// konec event listenerjev


//  izvajanje
//  to je obenem tudi init, ki sicer ni pozneje nikoli več klican, zato ni v ločeni funkciji

if (screen.width < 900 || screen.height < 690) { // to načeloma skensla moblce, ne pa tudi laptopov
    document.body.style.background = '#808080';
    document.body.innerHTML = '<p style="padding-left: 20px;"><br><a href="../index.html" title="back to By Guesswork"><img src="../images/home2.PNG" alt="home"></a><br><br>This program is not fond of small screens.<br>They make it look bad.<br><br>Please revisit this page when viewing<br>on a regular desktop or laptop monitor.<br>Min required size: 900 x 755px<br><br>Warmly welcome!</p>';
}
else {

    if (window.innerHeight < 750) { // če je innerHeight manjši kot nekaj, zožaj zadeve (potrebno pri kakih laptopih) 
        let [...collect] = document.getElementsByTagName('p');
        collect.forEach(element => element.style.fontSize = '12px');
        collect = document.querySelectorAll('.menu-choice');
        collect.forEach(el => el.style.padding = '2px 0 1px 25px');
        document.getElementById('br').innerHTML = '<br>';
        const navodila = document.getElementById('navodila');
        const newString = navodila.innerHTML.replace('<br>', ';');
        navodila.innerHTML = newString;
    }

    ponastaviNaLikPravokotnik();
    inputDebelina.value = 1;
    spremeniRoboveKvadratkaPalete('crta', 1, 'zelena');
    spremeniRoboveKvadratkaPalete('polnilo', 1, 'plava');
    containerPaletteOverlay.style['left'] = `${paletaPolnilaFrameLeft}px`;
    containerPaletteOverlay.style['top'] = `${paletaPolnilaFrameTop}px`;
    clearCanvas('#313131');
}
