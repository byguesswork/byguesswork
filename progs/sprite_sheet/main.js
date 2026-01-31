'use strict';

// da bi najprej naredilo cel gib, šele nato računalo izvedljivost premika na novih koordinatah..
// .. ker morda skok diagonalno je možen tam, kjer skok navpično ni

const ver = '9';
document.getElementById('ver').insertAdjacentText('beforeend', ver);

// v9 flypod, skok na 5 (prej 6 turnov), popravki startMainInterval, popravki izračuna ovira/support, razni popravki, premaknil intervalLen v sprite, ;
// v8 dodal kliker za ver; klasi, shark
// v7 odpravil bug touch

// 3 canvasi;
const bckgndcnvs = document.getElementById('bckgnd_canvas');
const ctxBckgnd = bckgndcnvs.getContext('2d');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');     
const ctrlsCnvs = document.getElementById('ctrls_canvas');
const ctrlsCtx = ctrlsCnvs.getContext('2d');

bckgndcnvs.width = GameScreen.width;
bckgndcnvs.height = GameScreen.height;
canvas.width = GameScreen.width;
canvas.height = GameScreen.height;
ctrlsCnvs.width = 172;
ctrlsCnvs.height = 131;

// konstante; 
const MAIN = 'main'; // interval identifier;
const TURN = 'turn';    // interval ID za obrat možička (turn) proti gledalcu;
const LEFT = 'left';
const RIGHT = 'right';
const STRAIGHT = 'straight';    // pogled naravnost proti gledalcu;
const UP = 'up';
const INVALID = 'invld';

// const test = document.getElementById('test');   // za morebitne testne namene;


//  -  -  -   IZVAJANJE -- -- --

const mobile = isMobile();
const navigatorLang = getLang();

const bckgndAssets = new Image(); // tu je slika pokrajine in oblakov; prikazano je na canvasu ozadja;
const assets = new Image(); // src se naloada v handlerju positionCanvs();

let sprite;


// -  -  -  POSLUŠALCI  -- -- --

document.addEventListener("DOMContentLoaded", positionCanvs);
document.getElementById('click_4_ver').addEventListener('click',() => {document.getElementById('ver').style.display = 'block'});
if(!mobile) {
    document.addEventListener('keydown', keyDownHndlr);
    document.addEventListener('keyup', keyUpHndlr);
} else {
    bckgndcnvs.style.marginTop = '40px';
    document.getElementById('controls_div').style.display = 'block';    // da postane viden, prej: none;
    ctrlsCnvs.addEventListener('touchstart', touchStartHndlr, {passive : false});
    ctrlsCnvs.addEventListener('touchend', touchEndHndlr, {passive : false});
    ctrlsCnvs.addEventListener('touchmove', touchMoveHndlr, {passive : false});
    ctrlsCnvs.addEventListener('touchcancel', touchCancelHndlr, {passive : false});
    for (const element of document.getElementsByClassName('hide-if-mobile')) {
        element.style.display = 'none';
    }
}

const intervalIDs = {   // mora bit pred bckgndAssets.onload, ker se tam rabi;
    main: 0,
    turn: 0,    // da se možiček obrne proti gledalcu, če ga X ms ne premikaš;
};
const ctrlPressd = {
    left: false,
    right: false,
    up: false,
};
const tchIDs = {
    left: -1,
    right: -1,
    up: -1
}
const tchPosOnCtrls = {
    x: 0,
    y: 0,
};
const contrlsCnvsRect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
}


// -  -  -  -  -  HENDLERJI -  -  -  -  

function positionCanvs() {
    
    function helper(lesserWidth) {
        let newCenterWidth = lesserWidth - 24;  // 12 px placa L/D;
        if(newCenterWidth % 2 == 1) newCenterWidth--;   // da je sodo število;
        document.getElementsByClassName('center')[0].style.width = `${newCenterWidth}px`;
    
        const ratio = (newCenterWidth - 2) / GameScreen.width;  // -2, ker je treba odsštet border od canvasa, ki mora priti v center;
        const newWidth = ratio * GameScreen.width;
        const newHeight = ratio * GameScreen.height;
        bckgndcnvs.style.width = `${newWidth}px`;
        bckgndcnvs.style.height = `${newHeight}px`;
        // obenem nastavimo isto dimenzijo tudi kanvacu ospredja, čeprav je zdaj še skrit;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }

    // preverjanje dimenzij, ali je morda treba zmanjšat canvas (pred tem pa centerwrapper);
    const lesserWidth = document.documentElement.clientWidth <= screen.width ? document.documentElement.clientWidth : screen.width;
    console.log('document.documentElement.clientWidth:', document.documentElement.clientWidth, 'screen.width:', screen.width, 'lesser', lesserWidth);
    if(lesserWidth < 624) { helper(lesserWidth) }
    
    // ker se zadeve pri spreminjanju velikosti lahko spremenijo (pojavi se kak drsnik), znova odčitamo in preverimo še enkrat;
    const newLesserWidth = document.documentElement.clientWidth <= screen.width ? document.documentElement.clientWidth : screen.width;
    console.log('document.documentElement.clientWidth:', document.documentElement.clientWidth, 'screen.width:', screen.width, 'lesser', newLesserWidth);
    if(newLesserWidth < lesserWidth) { helper(newLesserWidth) }
    console.log('širina canvasa:', bckgndcnvs.getBoundingClientRect().width - 2); // -2 ker rect upošteva tudi border, nas pa zanima canvas;

    // poravnamo delovni canvas s canvasom ozadja (da se prekrivata);
    const centerRect = document.getElementsByClassName('center')[0].getBoundingClientRect();
    const centerTop = centerRect.top;
    const centerLeft = centerRect.left;
    console.log('center top/left:', centerTop, centerLeft)
    const bckgndTop = bckgndcnvs.getBoundingClientRect().top;
    const bckgndLeft = bckgndcnvs.getBoundingClientRect().left;
    console.log('bckgndCanvas top/left:', bckgndTop, bckgndLeft)
    // ker je canvas absolute glede na center, moramo izračunat razliko (ne moremo mu določit top in left absolutno gledano, ampak relativno na center);
    const canvasTop = bckgndTop - centerTop;
    const canvasLeft = bckgndLeft - centerLeft; 
    canvas.style.display = 'unset';    // prej mora bit skrit, sicer vpliva na postavitev ozadnega canvasa, ki se potem premakne po premiku tega;
    canvas.style.top = `${canvasTop}px`;
    canvas.style.left = `${canvasLeft}px`;
    
    // loadanje sheet-a ozadja;
    bckgndAssets.src = 'bckgnd_assets.png';
    bckgndAssets.onload = function() {
        
        // loadanje sheet-a ospredja;
        assets.src = 'assets.png';
        assets.onload = function() {
            
            // naložimo vse podatke v classe;
            GameScreen.bckgnd = new Background(ctxBckgnd, bckgndAssets);
            ScreenObj.meetData(ctx, assets, GameScreen.height);
            const intrvlLen = mobile ? 120 : 95;

            sprite = new Sprite(360, 10, Sprite.look.left, intrvlLen);
    // začetni:        Sprite(360, 10    - left
    // 4 (idx 3, shark)  Sprite(0, 70        - right
    // 5 pod               Sprite(0, 300 
            
            GameScreen.meetData(ctx, sprite);
            // naložimo cel zaslon (ospredje); po defaultu 0;
            GameScreen.load(); //  <--  za TESTIRANJE: TU  DAŠ ŠTEVILKO ZASLONA; NA KATEREM ŽELIŠ ZAČETI test; 

            if(mobile) {
                drawControlsIcons();    // narišemo gumbe, če mobile;
                contrlsCnvsRect.left = ctrlsCnvs.getBoundingClientRect().left;
                contrlsCnvsRect.top = ctrlsCnvs.getBoundingClientRect().top;
                contrlsCnvsRect.right = ctrlsCnvs.getBoundingClientRect().right;
                contrlsCnvsRect.bottom = ctrlsCnvs.getBoundingClientRect().bottom;
            }
        }
    }
}

function keyDownHndlr(e) {
    // console.log(e)
    if(e.key == 'ArrowUp') {
        e.preventDefault();
        sprite.upPressed();
    } else if(e.key == 'ArrowRight') {
        e.preventDefault();
        sprite.latPressed(RIGHT);
    } else if(e.key == 'ArrowLeft') {
        e.preventDefault();
        sprite.latPressed(LEFT);
    }
    // ta je ločeno, ni v elsu, ker če ne je ne zazna;
    if(e.key == 'Escape') {
        sprite.stopIntervalAndListnrs();
        GameScreen.gameAborted();
        console.log('esc')
    }
}

function keyUpHndlr(e) {
    if(e.key == 'ArrowUp') {
        sprite.upReleased();
    } else if(e.key == 'ArrowRight') {
        sprite.latReleased(RIGHT);
    } else if (e.key == 'ArrowLeft') {
        sprite.latReleased(LEFT);
    }
}

function detrmnTchPosOnCtrlsCnvs(chgdTch) {
    tchPosOnCtrls.x = chgdTch.clientX - contrlsCnvsRect.left;
    tchPosOnCtrls.y = chgdTch.clientY - contrlsCnvsRect.top;
    let reslt = INVALID;    // lahko pa se v nadaljevanju spremeni;
    
    // console.log(tchPosOnCtrls.x, tchPosOnCtrls.y);
    if (tchPosOnCtrls.y < 62) {  // zgornja vrstica
        whichBtnInRow(true);
    } else if (tchPosOnCtrls.y > 70) {   // spodnja vrstica
        whichBtnInRow(false);
    }
    // console.log(tchPosOnCtrls.x, tchPosOnCtrls.y, reslt);
    return reslt;

    function whichBtnInRow(isUpper) {   // če true, zgornja vrstica, sicer spodnja;
        if (isUpper) {
            if (tchPosOnCtrls.x > 55 && tchPosOnCtrls.x < 117) {
                reslt = UP;
            }
        } else {    // spodnja vrstica, tj. L/D;
            if (tchPosOnCtrls.x < 61) {
                reslt = LEFT;
            } else if (tchPosOnCtrls.x > 109) {
                reslt = RIGHT;
            }
        }
    }
}

function touchStartHndlr(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const which = detrmnTchPosOnCtrlsCnvs(e.changedTouches[i]);
        // console.log('chgdTchs[', i, ']:', which);
        if(which != INVALID && ctrlPressd[which] == false) { // POMEMBNO: to pomeni, da je treba ctrlPressd[which] in tchIDs[which] hkrati nastavit, pozneje tudi hkrati nevtralizirati !!!
            tchIDs[which] = e.changedTouches[i].identifier;
            if(which == UP) sprite.upPressed(); // tu se tudi nastavi ctrlPressd[UP];
            else sprite.latPressed(which); // tu se tudi nastavi ctrlPressd[which];
            // console.log(tchIDs[which]);
        }
    }
}

function touchEndHndlr(e) {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const which = detrmnTchPosOnCtrlsCnvs(e.changedTouches[i]);
        // console.log('chgdTchs[', i, ']:', which);
        if(which != INVALID && ctrlPressd[which] == true) {
            tchIDs[which] = -1;
            if(which == UP) sprite.upReleased(); // tu se tudi nastavi ctrlPressd[UP];
            else sprite.latReleased(which); // tu se tudi nastavi ctrlPressd[which];
            // console.log(tchIDs[which])
        }
    }
}

function touchCancelHndlr(e) {
    e.preventDefault();
    console.log('tch -- C A N C E L -- , chgdTchs.len = ', e.changedTouches.length);
    // kr skenslamo vse povprek;
    if(tchIDs.up != -1) {
        tchIDs.up = -1;
        sprite.upReleased();
    }
    if(tchIDs.left != -1) {
        tchIDs.left = -1;
        sprite.latReleased(LEFT);
    }
    if(tchIDs.right != -1) {
        tchIDs.right = -1;
        sprite.latReleased(RIGHT);
    }
}

function touchMoveHndlr(e) {    // ta je pomemben le, če se z gumba pomakneš na INVALID (če torej zapustiš nek gumb);
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
        const which = detrmnTchPosOnCtrlsCnvs(e.changedTouches[i]);
        // console.log('chgdTchs[', i, ']:', which);
        if(which == INVALID) {
            const id = e.changedTouches[i].identifier;
            if(id == tchIDs.up) {
                tchIDs.up = -1;
                sprite.upReleased(); // tu se tudi nastavi ctrlPressd[UP];
            } else if(id == tchIDs.right) {
                tchIDs.right = -1;
                sprite.latReleased(RIGHT);
            } else if(id == tchIDs.left) {
                tchIDs.left = -1;
                sprite.latReleased(LEFT);
            }
        }
    }
}

//  -  -  -  -  -   izris krmilja  -  -  -  -  ;
function drawControlsIcons() {

    // narisat kroge;
    ctrlsCtx.strokeStyle = '#c0ffa7';
    ctrlsCtx.fillStyle = '#c0ffa7';
    for (let i = 1;i <= 3; i++) {
        ctrlsCtx.beginPath();
        const y = i % 2 == 0 ? 31 : 101; 
        ctrlsCtx.arc((i - 1) * 56 + 30, y, 30, 0, 2 * Math.PI);
        ctrlsCtx.fill();
    }

    // narisat krivulje v krogih;
    ctrlsCtx.lineWidth = 2;
    ctrlsCtx.strokeStyle = '#313131';
    ctrlsCtx.beginPath();
    
    // spodnji levi gumb (ZA LEVO);
    ctrlsCtx.moveTo(43, 100); // sredina: 25, 95
    ctrlsCtx.lineTo(19, 100);
    ctrlsCtx.lineTo(27, 92);
    ctrlsCtx.moveTo(43, 101);
    ctrlsCtx.lineTo(19, 101);
    ctrlsCtx.lineTo(28, 109);
    // izvirno:
    //  ctrlsCtx.moveTo(37, 78); // sredina: 25, 103
    // ctrlsCtx.lineTo(13, 78);
    // ctrlsCtx.lineTo(21, 70);
    // ctrlsCtx.moveTo(37, 79);
    // ctrlsCtx.lineTo(13, 79);
    // ctrlsCtx.lineTo(21, 87);
    
    // spodnji desni gumb (ZA DESNO);
    ctrlsCtx.moveTo(129, 100); // sredina: 135
    ctrlsCtx.lineTo(153, 100);
    ctrlsCtx.lineTo(145, 92);
    ctrlsCtx.moveTo(129, 101);
    ctrlsCtx.lineTo(153, 101);
    ctrlsCtx.lineTo(145, 109);
    
    // zgornji srednji (ZA GOR)
    ctrlsCtx.moveTo(85, 42); // sredina 56 + 24, 25
    ctrlsCtx.lineTo(85, 18);
    ctrlsCtx.lineTo(78, 26);
    ctrlsCtx.moveTo(86, 42);
    ctrlsCtx.lineTo(86, 18);
    ctrlsCtx.lineTo(94, 26);
    
    ctrlsCtx.stroke();
}
