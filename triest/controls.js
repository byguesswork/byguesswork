'use strict';

function drawControls() {
    // levo število dob
    // krog
    ctxLBeat.fillStyle = btnColorShaded;
    ctxLBeat.beginPath();
    ctxLBeat.arc(30, 30, 30, 0, 2 * Math.PI);
    ctxLBeat.arc(30, 106, 30, 0, 2 * Math.PI);
    ctxLBeat.fill();

    // puščici;
    ctxLBeat.fillStyle = btnColor;
    ctxLBeat.beginPath();
    ctxLBeat.moveTo(30, 10);
    ctxLBeat.lineTo(47.3, 40);
    ctxLBeat.lineTo(12.7, 40);
    ctxLBeat.fill();

    ctxLBeat.beginPath();
    ctxLBeat.moveTo(30, 126);
    ctxLBeat.lineTo(47.3, 96);
    ctxLBeat.lineTo(12.7, 96);
    ctxLBeat.fill();

    // desno število dob;
    ctxRBeat.fillStyle = digitColrShaded;
    ctxRBeat.beginPath();
    ctxRBeat.arc(30, 30, 30, 0, 2 * Math.PI);
    ctxRBeat.arc(30, 106, 30, 0, 2 * Math.PI);
    ctxRBeat.fill();

    ctxRBeat.fillStyle = btnColor;
    ctxRBeat.beginPath();
    ctxRBeat.moveTo(30, 10);
    ctxRBeat.lineTo(47.3, 40);
    ctxRBeat.lineTo(12.7, 40);
    ctxRBeat.fill();

    ctxRBeat.beginPath();
    ctxRBeat.moveTo(30, 126);
    ctxRBeat.lineTo(47.3, 96);
    ctxRBeat.lineTo(12.7, 96);
    ctxRBeat.fill();

    drawPlayBtn(); // gumb za štart/ustavi;
    drawTempo();    // območje za tempo;
}

function resetPlayStopCanv() {
    canvPlayStop.height = 0;
    canvPlayStop.height = 136;
    ctxPlayStop.fillStyle = btnColor;
    ctxPlayStop.strokeStyle = digitColrShaded;
    ctxPlayStop.lineWidth = 1.5;
}

function drawPlayBtn () {
    resetPlayStopCanv();
    
    // okvir;
    ctxPlayStop.beginPath();
    if(!mobile) {
        ctxPlayStop.moveTo(0, 28);
        ctxPlayStop.lineTo(80, 28);
        ctxPlayStop.lineTo(80, 108);
        ctxPlayStop.lineTo(0, 108);
        ctxPlayStop.lineTo(0, 28);
    } else {
        ctxPlayStop.moveTo(0, 21);
        ctxPlayStop.lineTo(60, 21);
        ctxPlayStop.lineTo(60, 81);
        ctxPlayStop.lineTo(0, 81);
        ctxPlayStop.lineTo(0, 21);
    }
    ctxPlayStop.stroke();

    // puščica;
    ctxPlayStop.beginPath();
    if(!mobile) {
        ctxPlayStop.moveTo(12, 38);
        ctxPlayStop.lineTo(70, 68);
        ctxPlayStop.lineTo(12, 98);
    } else {
        ctxPlayStop.moveTo(9, 28.5);
        ctxPlayStop.lineTo(52, 51);
        ctxPlayStop.lineTo(9, 74);
    }
    ctxPlayStop.fill();
}

function drawPauseBtn() {
    resetPlayStopCanv();

    ctxPlayStop.beginPath();
     if(!mobile) {
        ctxPlayStop.moveTo(0, 28);
        ctxPlayStop.lineTo(80, 28);
        ctxPlayStop.lineTo(80, 108);
        ctxPlayStop.lineTo(0, 108);
        ctxPlayStop.lineTo(0, 28);
    } else {
        ctxPlayStop.moveTo(0, 21);
        ctxPlayStop.lineTo(60, 21);
        ctxPlayStop.lineTo(60, 81);
        ctxPlayStop.lineTo(0, 81);
        ctxPlayStop.lineTo(0, 21);
    }
    ctxPlayStop.stroke();

    ctxPlayStop.beginPath();
    if(!mobile) {
        ctxPlayStop.moveTo(15, 43);
        ctxPlayStop.lineTo(35, 43);
        ctxPlayStop.lineTo(35, 93);
        ctxPlayStop.lineTo(15, 93);
    } else {
        ctxPlayStop.moveTo(12, 33);
        ctxPlayStop.lineTo(27, 33);
        ctxPlayStop.lineTo(27, 70);
        ctxPlayStop.lineTo(12, 70);
    }
    ctxPlayStop.fill();

    ctxPlayStop.beginPath();
    if(!mobile) {
        ctxPlayStop.moveTo(45, 43);
        ctxPlayStop.lineTo(65, 43);
        ctxPlayStop.lineTo(65, 93);
        ctxPlayStop.lineTo(45, 93);
    } else {
        ctxPlayStop.moveTo(33, 33);
        ctxPlayStop.lineTo(49, 33);
        ctxPlayStop.lineTo(49, 70);
        ctxPlayStop.lineTo(33, 70);
    }
    ctxPlayStop.fill();
}

function drawTempo() {
    // kroga;
    ctxTempo.fillStyle = btnColorShaded;
    ctxTempo.beginPath();
    ctxTempo.arc(24, 24, 24, 0, 2 * Math.PI);
    ctxTempo.arc(24, 84, 24, 0, 2 * Math.PI);
    ctxTempo.fill();

    // puščici;
    ctxTempo.fillStyle = btnColor;
    ctxTempo.beginPath();
    ctxTempo.moveTo(24, 8);
    ctxTempo.lineTo(37.8, 32);
    ctxTempo.lineTo(10.2, 32);
    ctxTempo.fill();

    ctxTempo.beginPath();
    ctxTempo.moveTo(10.2, 76);
    ctxTempo.lineTo(37.8, 76);
    ctxTempo.lineTo(24, 100);
    ctxTempo.fill();

    displayTempo.innerHTML = bpm;

}


//  -  -  če mobile  -  -  -  -  -  - 

function touchStartOprtn(e) {
    if (!mousePressIsValid) {   // to naj bi bilo zato, da za zdaj je mogoče le en dotik naenkrat;
        mouseDownOprtn(e);  // lahko uporabimo isto funkcijo;
    } else {
        // za zdaj še ne podpira več dotikov hkrati;
        // je pa trenutno tako, da se izvirno gibanje ustavi, ko takneš še nekaj drugega; se mi zdi
    }
}

function touchEndOprtn(e) {
    e.preventDefault();
    mouseUpOprtn(); // lahko uporabimo isto funkcijo;
}

function touchMoveOprtn(e) {
    e.preventDefault();
    if (e.changedTouches[0].clientX < tempoCnvsRect.left || e.changedTouches[0].clientX > tempoCnvsRect.right
        || e.changedTouches[0].clientY < tempoCnvsRect.top || e.changedTouches[0].clientY > tempoCnvsRect.bottom) {
        // if (mousePressIsValid) console.log('invalidated, ker zdrsnil s controls');
        invldteTempoClick();
    } else {
        mouseMoveOprtn(e);   // lahko uporabimo kar od miši;
    }
}


// - -  če miška     - - - - - - - - - - - - 
function mouseDownOprtn(e){
    const reslt = detrmnMousPosOnTempoCnvs(e);
    if (reslt == INVALID) {
        invldteTempoClick();
    } else {
        mousePressIsValid = true;
        mouseOrTchPosOnTempo.btn = reslt;
        if (reslt == TEMPO_UP) {
            tempoIntrvlChckr = setInterval(tempoUp, 50);
        } else if(reslt == TEMPO_DOWN){
            tempoIntrvlChckr = setInterval(tempoDown, 50);
        }
    }
}

function mouseMoveOprtn(e) {
    if (mousePressIsValid) {
        const reslt = detrmnMousPosOnTempoCnvs(e);
        if (reslt != mouseOrTchPosOnTempo.btn) {
            invldteTempoClick();
            // console.log('invalidated pri premiku z gumba')
        }
    }
}

function mouseUpOprtn() {
    if (mousePressIsValid) invldteTempoClick();
}

function mouseLeaveOprtn() {
    if (mousePressIsValid) invldteTempoClick();
}

function detrmnMousPosOnTempoCnvs(e) {
    console.log(e);
    if (!mobile) {
        mouseOrTchPosOnTempo.x = e.clientX - tempoCnvsRect.left;
        mouseOrTchPosOnTempo.y = e.clientY - tempoCnvsRect.top;
    } else {
        mouseOrTchPosOnTempo.x = e.changedTouches[0].clientX - tempoCnvsRect.left;
        mouseOrTchPosOnTempo.y = e.changedTouches[0].clientY - tempoCnvsRect.top;
    }
    
    if (mouseOrTchPosOnTempo.y < 48) {  // tempo gor;
        return TEMPO_UP;
    } else if (mouseOrTchPosOnTempo.y > 60) {   // tempo dol
        return TEMPO_DOWN;
    } else return INVALID;
}

function invldteTempoClick() {
    mousePressIsValid = false;
    clearInterval(tempoIntrvlChckr);
    tempoIntrvlChckr = null;
}

function tempoUp(){
    bpm++;
    displayTempo.innerHTML = bpm;
    console.log(bpm)
}

function tempoDown() {
    bpm--;
    displayTempo.innerHTML = bpm;
     console.log(bpm)
}
