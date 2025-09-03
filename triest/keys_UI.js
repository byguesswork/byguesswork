'use strict';

// tu je koda, ki je povezan z upravljanjem s tipkami oz. na splošno z delovanjem web variante 
// vključuje vso kodo za random


// ----------------     SELEKTORJI

const btnSubmitSize = document.getElementById('size-form-submit');
const btnsIntervalSpeed = document.querySelectorAll('.interval-speed');
const btnsKeyForGameDirection = document.querySelectorAll('.button-key');
const divGreenMode = document.getElementById('green-mode-div');
const inputPlayingFieldSize = document.querySelectorAll('.size-form-input');
const divBckgndGrid = document.getElementById('background-grid-div');
const labelsIntervalSpeed = document.querySelectorAll('.interval-speed-label');
const btnKeyRandomDirection = document.querySelector('.button-random');
const btnsRandomnessLevel = document.querySelectorAll('#randomness-level p');
const divRandomness = document.getElementById('randomness-level');
const overlayRandomnessDiv = document.getElementById('randomness-div-overlay');

// const labelsSteeringType = document.querySelectorAll('.steering-type-label');    // legacy, se ne uporablja
// const btnsSteeringType = document.querySelectorAll('.steering-type');            // legacy, se ne uporablja

let keyForMovementLeft = 'ArrowLeft';
let keyForMovementRight = 'ArrowRight';
let keyForFasterMvmtDown = 'ArrowDown';
let keyForRotation = 'ArrowUp';
const randomMode = {    // v initu se dodata še drugi propertyji, ki morajo bit ponastavljeni pred vsako igro, ti spodnji pa ne, se prenesejo v naslednje igre;
    isActive: false,
    level: 1,
    lowerThresholdFormsBtwnChngs: 4,    //  če spreminjaš vrednosti za to in še dve naslednji spremenljivki tukaj,..
    upperThresholdFormsBtwnChngs: 10,   //  .. jih spremeni tudi v tej funkciji: assignRandomnessLevelValues()
    oneToXOdds: 16,
};


//   -----------   FUNKCIJE

function assignGameDirectionKeys() {
    if (gameDirection.direction === 'down') {
        keyForMovementLeft = 'ArrowLeft';
        keyForMovementRight = 'ArrowRight';
        keyForFasterMvmtDown = 'ArrowDown';
        keyForRotation = 'ArrowUp';
        return;
    };
    if (gameDirection.direction === 'up') {
        keyForMovementLeft = 'ArrowRight';
        keyForMovementRight = 'ArrowLeft';
        keyForFasterMvmtDown = 'ArrowUp';
        keyForRotation = 'ArrowDown';
        return;
    };
    if (gameDirection.direction === 'left') {
        keyForMovementLeft = 'ArrowUp';
        keyForMovementRight = 'ArrowDown';
        keyForFasterMvmtDown = 'ArrowLeft';
        keyForRotation = 'ArrowRight';
        return;
    };
    if (gameDirection.direction === 'right') {
        keyForMovementLeft = 'ArrowDown';
        keyForMovementRight = 'ArrowUp';
        keyForFasterMvmtDown = 'ArrowRight';
        keyForRotation = 'ArrowLeft';
        return;
    };
}

function atKeyPress(e) {
    if (!controlsTemporarilyOff) {
        if (isAGameRunning && !isGamePaused) {
            if (e.key === keyForMovementLeft) { maneuver('left'); return };
            if (e.key === keyForMovementRight) { maneuver('right'); return };
            if (e.key === keyForFasterMvmtDown) {
                if (canFormMoveDownHuh()) moveForm('down');
                return;
            }
            if (e.key === keyForRotation || e.key === 'Enter') { rotate(); return };
            if (e.key === " " || e.code === 'ControlRight') { actionWhenSpacePressed(); return };
        };

        if (!isAGameRunning) {
            if (e.key === 'Enter') { startGame(); return; }
        };

        if (!isGamePaused) {
            if (e.code === 'KeyQ' || e.code === 'KeyW' || e.code === 'KeyE' || e.code === 'KeyR') {
                let pressed = (e.code).slice(-1);
                let whichOne, newDirection;

                // samo da pogruntaš, kateri btwn je bil pritisnjen
                btnsKeyForGameDirection.forEach((btn, i) => {
                    if (btn.textContent === pressed) {
                        whichOne = i;
                        newDirection = btn.value;
                    };
                });

                if (newDirection !== gameDirection.direction || randomMode.isActive) {     //  delaš karkoli, samo če si priklical smer, ki je drugačna od aktualne
                    //  najprej uredit barve gumbov, kar je neodvisno od same logike igre
                    btnsKeyForGameDirection.forEach((btn, i) => {
                        btn.classList.remove('button-key-selected');                    // vsakemu odvzameš klas
                        if (i === whichOne) btn.classList.add('button-key-selected');   // pravemu dodaš klas
                    });
                    removeRandom();
                    //  zdaj pa še logika in izvedba
                    resolveGameDirectionChoice(newDirection);
                };
                return;  // če nisi pritisnil tipke, ki pomeni drugačno smer kot je aktualna, potem nič, ampak tudi če si opravil menjavo smeri > return!;
            };

            if (e.code === 'KeyT') {
                if (!randomMode.isActive) toRandom(); return;  // če je T že izbran, še en pritisk ne naredi nič; pa tudi sicer > return;
            };
        }

        if (isAGameRunning) {
            if (e.key === 'Escape') {
                if (gameIntervalIsInMotion !== null) { // pri eksploziji gre na null, takrat ne sme biti možno pavzirat, sicer pride lahko do obrata pomena tipke zaradi asinhronosti
                    clearInt();
                    const frame = overlayStartGameBox.getBoundingClientRect();
                    labelPause.style.top = `${frame.top}px`;
                    labelPause.classList.toggle('hidden');
                    isGamePaused = true;
                } else if (isGamePaused) {
                    getBlocksMoving();
                    labelPause.classList.toggle('hidden');
                    isGamePaused = false;
                };
                return;
            }
        };

        if (e.code === 'KeyM') { bckgndGridBtnAction(); return };
        if (e.code === 'KeyG') { greenModeBtnAction(); return };
        if (randomMode.isActive) {
            if (e.code === 'KeyJ' || e.code === 'KeyK' || e.code === 'KeyL') {
                const pressedRandomLevel = (e.code).slice(-1);
                let whichRandomLevelKey, newRandomLevel;

                // samo da pogruntaš, kateri btwn je bil pritisnjen
                btnsRandomnessLevel.forEach((btn, i) => {
                    if (btn.dataset.shortcut === pressedRandomLevel) {
                        whichRandomLevelKey = i;
                        newRandomLevel = +btn.dataset.level;    // +, da se vsili pretvorba v številko, sicer je string
                    };
                });

                if (newRandomLevel !== randomMode.level) {     //  nadaljuješ, samo če si priklical level, ki je drugačen od aktualnega;
                    //  najprej uredit barve gumbov, kar je neodvisno od same logike igre
                    btnsRandomnessLevel.forEach((btn, i) => {
                        btn.classList.remove('selected');                               // vsakemu odvzameš klas
                        if (i === whichRandomLevelKey) btn.classList.add('selected');   // pravemu dodaš klas
                    });
                    //  zdaj pa še logika in izvedba
                    randomMode.level = newRandomLevel;
                    assignRandomnessLevelValues();
                };
            };
        }

    }
}

function submitSizeBtnOperation() {
    let inputedRows = inputPlayingFieldSize[0].value !== '' ? Number(inputPlayingFieldSize[0].value) : false;
    let inputedColumns = inputPlayingFieldSize[1].value !== '' ? Number(inputPlayingFieldSize[1].value) : false;

    // najprej preverit, ali sta morda oba prazen niz, v takem primeru ne naredi ničesar
    if (inputedRows === false && inputedColumns === false) { // ker gre za striktno primerjavo (===) vrednost 0, ki je sicer falsy, ni false
        return;
    };

    // preverjanje veljavnosti vnesenih vrednosti
    // skupne funkcionalnosti prikaza opozorila za nepravilno vneseno vrednost;
    const message = { en: '', sl: '' };
    function showAlert() {
        overlayDuringAlert.style.height = `${window.innerHeight}px`;
        overlayDuringAlert.style.width = `${window.innerWidth}px`;
        overlayDuringAlert.style.background = `linear-gradient(${Math.trunc(Math.random() * 360)}deg, #e66465, #9198e5)`;
        overlayDuringAlert.style.transition = 'opacity 0.6s';
        overlayDuringAlert.style.opacity = '80%';

        setTimeout(() => {
            alert(message[pageLang]);
            overlayDuringAlert.style.height = `1px`;
            overlayDuringAlert.style.width = `1px`;
            overlayDuringAlert.style.transition = 'opacity'; // ker trajanje transitiona ni definirano, ga ni
            overlayDuringAlert.style.opacity = '0%';
        }, 50);
    };

    // preverit, da ni nobena vnesena vrednost pod 8 in nad maxBlocks; če to spodaj, spremenit še 8x8
    if ((inputedRows !== false && (inputedRows < 8 || inputedRows > canvasSizeData.maxNrBlocksAlongLongerDimension))
        || (inputedColumns !== false && (inputedColumns < 8 || inputedColumns > canvasSizeData.maxNrBlocksAlongLongerDimension))) {
        message.en = `entered values must be numbers between 8 and ${canvasSizeData.maxNrBlocksAlongLongerDimension}`;
        message.sl = `vnesti moraš število med 8 in ${canvasSizeData.maxNrBlocksAlongLongerDimension}`;
        showAlert();
        return;
    }

    // za nadaljevanje preverjanja je nujno, da če kšne vrednosti nismo vnesli na novo, jo je treba pograbit iz stanja;
    if (!inputedRows) inputedRows = lastRow0based + 1;
    if (!inputedColumns) inputedColumns = lastColumn0Based + 1;

    // preverit, da je v novem paru vrednosti vsaj ena manjša ali enaka manjši dimenziji;
    if (inputedRows > canvasSizeData.maxNrBlocksAlongShorterDim && inputedColumns > canvasSizeData.maxNrBlocksAlongShorterDim) {
        message.en = `at least one of two dimensions must be less or equal to ${canvasSizeData.maxNrBlocksAlongShorterDim}`;
        message.sl = `vsaj ena od dimenzij mora biti manjša ali enaka ${canvasSizeData.maxNrBlocksAlongShorterDim}`;
        showAlert();
        return;
    }

    // na tem mestu je konec preverjanj veljavnosti vnesenih vrednosti;

    if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden'); // če je bil gameOver, da skrije label od game.over

    //  izračun, koliko bi znašala širina in višina canvasa pri želenih novih dimenzijah

    //  POMEMBNO: kanvas je kvadrat, ima enaki stranici; zato spodaj privzameta večjo od obeh, da se lahko noer spravi katra koli orientacija igralnega polja;

    // premislek na temo; spodaj je izračun privzetih mer igr. polja, ki je neto kvadrat 700*700px (z robom je bruto 702*702px)
    // po navpični osi:
    // zgornji buffer	30px	
    // igralna površina	642px	=16*blockSize+2    (2 je border)
    // spodnji buffer	28px
    // navpično: 30+642+28=700 px

    // po vodoravni osi:
    // levi buffer	    30	
    // igralna površina	402	=10*blockSize+2 (2 je border)
    // srednji buffer	35	
    // mini grid	    203	    (201 je širina, 2 je border)
    // desni buffer	    30	
    // vodoravno:       30+402+35+203+30

    //  preverit, al je število stolpcev večje od števila vrstic;..
    //  če tako, potem mora bit mini grid nad vertikalno (široko postavitvijo) in sledi drugačen izračun širine canvasa
    let neededCanvasHeight = inputedRows >= inputedColumns ? 30 + (inputedRows * blockSize + 2) + 28 : 30 + 203 + 35 + (inputedRows * blockSize + 2) + 30;
    let neededCanvasWidth = inputedRows >= inputedColumns ? 30 + (inputedColumns * blockSize + 2) + 35 + 203 + 30 : 30 + (inputedColumns * blockSize + 2) + 28;

    console.log(neededCanvasHeight, neededCanvasWidth);
    canvas.height = neededCanvasHeight >= neededCanvasWidth ? neededCanvasHeight : neededCanvasWidth;
    canvas.width = canvas.height;   // s tem je tudi že samodejno narisan canvas z novimi dimenzijami, sicer samo obroba in srednje sivo ozadje;
	if (window.innerHeight > 800 && (window.innerHeight-canvas.height > 60)) labelInvite.classList.remove('hidden'); else labelInvite.classList.add('hidden');

    //  preverjanje, al je morda treba zamaknit prikaz točk, high scores ... zaradi širine igralnega polja
    if (canvas.width !== canvasSizeData.canvasWidthWas) {
        divDesni.style.left = `${330 + canvas.width + 3}px`; // zakaj +3? 2 je za levi in desni border od canvasa, 1 pa da se ne prekriva z borderjem
        divDesni.style.height = `${canvas.height + 2}px`;

        //  od zdaj dalje nova, posodobljena vrednost canvasWidthWas
        canvasSizeData.canvasWidthWas = canvas.width;
    }

    // sledijo izračuni koordinat in velikosti za matriko 2x3: inputedRows vs inputedColumns (2 vrednosti) X canvasHeight vs Width (3 vrednosti)
    // naslednje vrednosti so enake za vseh 6 elementov matrike:
    mainGridLayoutsCoords.vertical.x = 30;
    mainGridLayoutsCoords.horizontal.x = 30;
    mainGridLayoutsCoords.vertical.l = inputedColumns * blockSize + 2;
    mainGridLayoutsCoords.vertical.h = inputedRows * blockSize + 2;
    mainGridLayoutsCoords.horizontal.l = inputedRows * blockSize + 2;
    mainGridLayoutsCoords.horizontal.h = inputedColumns * blockSize + 2;

    // zdaj pa še določitev elemetov, katerih vrednost je odvisna od položaja v matriki
    if (inputedRows >= inputedColumns) {
        // miniGrid.x je enak za vse 3 spodnje možnosti; .y pa za 2, ampak ga vseeno dam sem skupaj, za 3. pa popravim spodaj
        miniGridCoords.x = 30 + (inputedColumns * blockSize + 2) + 35; // levi bufer + igralno polje + vmesni buffer
        miniGridCoords.y = 30;

        if (neededCanvasHeight === neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 30;
            mainGridLayoutsCoords.horizontal.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je stolpcev 6 manj kot vrstic
        }

        if (neededCanvasHeight < neededCanvasWidth) {
            // vertical y pomakni za razliko med njima dol
            mainGridLayoutsCoords.vertical.y = 30 + (neededCanvasWidth - neededCanvasHeight);
            // horizontal y = vertical y + (h-l) 
            mainGridLayoutsCoords.horizontal.y = mainGridLayoutsCoords.vertical.y + (mainGridLayoutsCoords.vertical.h - mainGridLayoutsCoords.vertical.l);
        }

        if (neededCanvasHeight > neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 30;
            // horizontal y = vertical y + (h-l)
            mainGridLayoutsCoords.horizontal.y = mainGridLayoutsCoords.vertical.y + (mainGridLayoutsCoords.vertical.h - mainGridLayoutsCoords.vertical.l);

            // vertical y od miniGrida pomakni za razliko med njima dol
            miniGridCoords.y = 30 + (neededCanvasHeight - neededCanvasWidth);
        }
    }

    if (inputedRows < inputedColumns) {
        // miniGrid.x je enak za vse 3 spodnje možnosti; .y pa za 2, ampak ga vseeno dam sem skupaj, za 3. pa popravim spodaj
        miniGridCoords.x = 30 + (inputedRows * blockSize + 2) + 35; // levi bufer + igralno polje + vmesni buffer
        miniGridCoords.y = 30;

        if (neededCanvasHeight === neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je vrstic 6 manj kot stolpcev;
            mainGridLayoutsCoords.horizontal.y = 30;
        }

        if (neededCanvasHeight > neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 270;   // vedno je 240 razlike (270-30), ker potrebna širina in višina sta enaki le, če je vrstic 6 manj kot stolpcev;
            mainGridLayoutsCoords.horizontal.y = 30 + (neededCanvasHeight - neededCanvasWidth);
        }

        if (neededCanvasHeight < neededCanvasWidth) {
            mainGridLayoutsCoords.vertical.y = 270 + (neededCanvasWidth - neededCanvasHeight);
            mainGridLayoutsCoords.horizontal.y = 30;

            // vertical y od miniGrida pomakni za razliko med njima dol
            miniGridCoords.y = 30 + (neededCanvasWidth - neededCanvasHeight);
        }
    }

    if (inputPlayingFieldSize[0].value !== '') {
        inputPlayingFieldSize[0].placeholder = inputPlayingFieldSize[0].value;
        lastRow0based = inputPlayingFieldSize[0].placeholder - 1;
        mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];    // to bo treba uredit drugje, da bo upoštevalo tudi orientacijo
    };

    if (inputPlayingFieldSize[1].value !== '') {
        inputPlayingFieldSize[1].placeholder = inputPlayingFieldSize[1].value;
        lastColumn0Based = inputPlayingFieldSize[1].placeholder - 1;
        insertionColumn = inputedColumns % 2 === 0 ? (inputedColumns / 2) - 1 : (inputedColumns - 1) / 2;
        mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];    // to bo treba uredit drugje, da bo upoštevalo tudi orientacijo

    };

    standBy();                 //  to tudi nariše minigrid
    resolveEmptyMainGridAndBckgndGrid();
    drawDirectionArrow();
}

function colorSelectedMenuChoices(labelNodes, btn) {
    labelNodes.forEach(label => {
        if (label.htmlFor === btn.id) label.style.color = '#2ef82e'; else label.style.color = '#252525';
    });
    if (labelNodes[0].className === 'interval-speed-label') {
        intervalTypeShrinkingHuh = btnsIntervalSpeed[0].checked === true ? true : false;
    }
}

function colorSelectedMenuChoicesAtInit() {
    // tukaj mora barvanje preverit, al je btn === checked; pri listenerju ni tako, tam preverja, ko je nek button kliknjen
    btnsIntervalSpeed.forEach(btn => { if (btn.checked) colorSelectedMenuChoices(labelsIntervalSpeed, btn) });
    // btnsSteeringType.forEach(btn => { if (btn.checked) colorSelectedMenuChoices(labelsSteeringType, btn) });     // legacy, se ne uporablja
}

function btnsForChangeGameDirectionOperation(btn, evt) {
    // evt sem dal zgoraj noter samo zato, da je videt, da je event v priemru uporabe bind drugi parameter, ne prvi; prvi je podani argument (v tem primeru btn);
    if (!controlsTemporarilyOff && !isGamePaused) {
        let newDirection = btn.value;
        if (newDirection !== gameDirection.direction || randomMode.isActive) {
            // najprej uredit barve gumbov
            btnsKeyForGameDirection.forEach(btn => btn.classList.remove('button-key-selected'));
            btn.classList.add('button-key-selected');
            removeRandom();
            // logika izbire in urejanja nastavitev
            resolveGameDirectionChoice(newDirection);
        }
    }
    btn.blur();
}

function changeGameLayout(newLayout) {
    eraseMainGrid();
    gameDirection.layout = newLayout;
    mainGridCoords = mainGridLayoutsCoords[gameDirection.layout];
    resolveEmptyMainGridAndBckgndGrid();
}

function resolveGameDirectionChoice(newDirection) {
    if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden'); // če je bil gameOver, da skrije label od game.over
    const newLayout = (newDirection === 'right' || newDirection === 'left') ? 'horizontal' : 'vertical';
    if (newLayout !== gameDirection.layout) changeGameLayout(newLayout);  // if -> zamenjat layout in to tudi prikazat
    if (isAGameRunning) {   // če med igro -> zamenjat smer, na novo narisat board in prilagodit funkcionalnost igralnih tipk
        gameDirection.direction = newDirection;  // tale pripis vednosti bi lahko naredil tudi prej (pred klicem te funkcije), samo bi ga moral dvakrat, zato je tak način morda učinkovitejši
        redrawEntireCurrentBoard();
        drawForm();                 //  zakaj je treba še draw form poleg drawEntireBoard? ker padajoč form ni zabeležen na boardu!! 
        // ..ne moreš pa ga namesto tega (drawform) pred tem (drawEntire) imprintat, ker bi ga potem moral še odprintat (te funkcije pa nimam in tudi ni potrebe)
        assignGameDirectionKeys();
    } else {                                                  // če igra ni aktivna, zabeležimo novo smer igre + ...
        gameDirection.direction = newDirection;
        resolveEmptyMainGridAndBckgndGrid();
        drawDirectionArrow();
    }
}

function greenModeBtnAction() {
    if (divGreenMode.classList.contains('green-mode-btn-unselected')) {
        divGreenMode.classList.remove('green-mode-btn-unselected');
        divGreenMode.classList.add('green-mode-btn-selected');
        isGreenMode = true;
    } else {
        divGreenMode.classList.remove('green-mode-btn-selected');
        divGreenMode.classList.add('green-mode-btn-unselected');
        isGreenMode = false;
    }
    if (isAGameRunning) {
        redrawEntireCurrentBoard();
        drawForm();
    }
};

function bckgndGridBtnAction() {
    if (divBckgndGrid.classList.contains('background-grid-btn-unselected')) {
        divBckgndGrid.classList.remove('background-grid-btn-unselected');
        divBckgndGrid.classList.add('background-grid-btn-selected');
    } else {
        divBckgndGrid.classList.remove('background-grid-btn-selected');
        divBckgndGrid.classList.add('background-grid-btn-unselected');
    };
    if (!isAGameRunning) {
        if (!labelGameOver.classList.contains('hidden')) labelGameOver.classList.add('hidden'); // če je bil gameOver, da skrije label od game.over
        resolveEmptyMainGridAndBckgndGrid();
        drawDirectionArrow();
    } else {
        redrawEntireCurrentBoard();
        drawForm();
    };
};

function toRandom() {   // v keys_UI;
    randomMode.isActive = true;
    btnKeyRandomDirection.classList.add('button-random-selected');  //  gumb za random je treba označit
    toggleOverlay(overlayRandomnessDiv, divRandomness, 'hide');     //  pa prikazat možnosti za randomness
    btnsKeyForGameDirection.forEach(btn => btn.classList.remove('button-key-selected'));  // 4 smerne gumbe odznačit
}

function removeRandom() {   // v keys_UI;
    randomMode.isActive = false;
    randomMode.changeObligatory = false;  //  za vsak slučaj je treba umaknit, če skineš random ravno zatem, ko se je sprožil change obligatory, ki čaka na naslednji lik;
    btnKeyRandomDirection.classList.remove('button-random-selected');   //  gumb za random je treba odznačit
    toggleOverlay(overlayRandomnessDiv, divRandomness, 'display');      //  pa skrit podopcije od random
}

function assignRandomnessLevelValues() {
    if (randomMode.level === 1) {   // če spreminjaš vrednosti za level 1, moraš to enako spremenit tudi pri deklaraciji spremenljivke!;
        randomMode.lowerThresholdFormsBtwnChngs = 4;
        randomMode.upperThresholdFormsBtwnChngs = 10;
        randomMode.oneToXOdds = 16;
    };
    if (randomMode.level === 2) {
        randomMode.lowerThresholdFormsBtwnChngs = 3;
        randomMode.upperThresholdFormsBtwnChngs = 8;
        randomMode.oneToXOdds = 12;
        randomMode.oneToXOddsOfMidFallChange = 3;
    };
    if (randomMode.level === 3) {
        randomMode.lowerThresholdFormsBtwnChngs = 2;
        randomMode.upperThresholdFormsBtwnChngs = 5;
        randomMode.oneToXOdds = 6;
        randomMode.oneToXOddsOfMidFallChange = 1.5;
    }
}

function executeRandomDirectionChange(type) {
    //  posodobitev relevantnih vrednosti spremenljivk randomMode in gameStats;
    randomMode.lastChangeAtFallenFormNr = numberOfFallenForms;  // zabeležimo, kdaj je bla zadnja random menjava smeri;
    randomMode.nrOfDirctnChanges++;
    const insertee = {};
    insertee.changeAtFormNr = numberOfFallenForms;
    insertee.changeType = type;
    gamestats.randomDirectionChanges.push(insertee);    // samo za potrebe razvoja
    console.log(`${type} ${type === 'midair' ? ', in sicer' + (activeForm.notionalPos.row + 1) : ''}`)   //  da vidiš sproti

    //  določitev nove smeri;
    let directions = ['up', 'right', 'down', 'left'];
    directions.splice(directions.findIndex(curr => curr === gameDirection.direction), 1); // s tem skineš trenutno smer iz arraya;

    //  pri levelu 2 nekoliko preferiramo usmeritev navzdol (pri levelu 1 je to urejeno drugje, pri levelu 3 ni preferiranja);
    //  sicer, če je lihkar bil 'down', ga ne dodamo v nabor, sicer pa ja, da ga mal boostamo;
    if (randomMode.level === 2 && directions.includes('down')) directions.push('down');

    // v keys_UI;
    resolveGameDirectionChoice(directions[Math.trunc(Math.random() * directions.length)]);  // na random izbereš novo smer od preostalih in realiziraš;
}


//  ---------------     LISTENERJI

document.addEventListener('keydown', atKeyPress);
btnsIntervalSpeed.forEach(btn => btn.addEventListener('click', () => colorSelectedMenuChoices(labelsIntervalSpeed, btn)));
btnSubmitSize.addEventListener('mouseup', submitSizeBtnOperation);    // mouseup, ker se zgodi prej kot click (malo više je click na document)
btnsKeyForGameDirection.forEach(btn => btn.addEventListener('click', btnsForChangeGameDirectionOperation.bind(null, btn))); // null zato, ker na tem mestu se pričakuje this, vendar ga ne rabimo v tem primeru;
divGreenMode.addEventListener('click', () => { if (!controlsTemporarilyOff) greenModeBtnAction() });
divBckgndGrid.addEventListener('click', () => { if (!controlsTemporarilyOff) bckgndGridBtnAction() });

// spodnje samo zato, da onesposobiš tipko enter, ki bi sicer sprožila igro;
inputPlayingFieldSize.forEach(input => input.addEventListener('click', () => { controlsTemporarilyOff = true; }));
// spodnje je samo zato, da se spet vrne delovanje tipk, ki je bilo odvzeto ko klikneš v katero od polj za določanje velikosti;
document.addEventListener('click', () => {
    if (labelHighScoresInitials.classList.contains('hidden') // če je prikazano polje za vnos začetnic, klik zunaj tega polja ne sme dat controlsTempOff na false, ker če ne štala;
        && !isAGameRunning 
        && document.activeElement !== inputPlayingFieldSize[0] && document.activeElement !== inputPlayingFieldSize[1]) {
        controlsTemporarilyOff = false;
        inputPlayingFieldSize[0].value = '';    // da je spet viden placeholder
        inputPlayingFieldSize[1].value = '';
    };
});
btnKeyRandomDirection.addEventListener('click', () => {
    if (!controlsTemporarilyOff && !isGamePaused) {
        if (!randomMode.isActive) toRandom();
    };
    btnKeyRandomDirection.blur();
});
btnsRandomnessLevel.forEach(btn => btn.addEventListener('click', () => {
    if (!btn.classList.contains('selected')) {    // naredi nekaj, samo če si kliknil gumb za drugačen level, kot je trentno izbran;
        btnsRandomnessLevel.forEach(btn => btn.classList.remove('selected'));
        btn.classList.add('selected');
        randomMode.level = +btn.dataset.level;
        assignRandomnessLevelValues();
    }
}));


