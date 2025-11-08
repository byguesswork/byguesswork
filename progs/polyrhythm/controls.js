'use strict';

function drawControls() {
    drawBeatCount(BOTH);
    drawPlayBtn(); // gumb za štart/ustavi;
    drawTempo();    // območje za tempo;
}

function drawBeatCount(which, upper, lower) {

    // podat tri atribute:
    // which: LEFT, RIGHT, BOTH - katera stan
    // upper: (neobvezen) al je puščica za gor na tej strani aktivna; (samo pri Left/RIGHT)
    // lower: (neobvezen) al je puščica za dol na tej strani aktivna;   (samo pri Left/RIGHT)

    // levo število dob
    if(which == BOTH || which == LEFT) {
        // kroga
        // zgornji krog;
        if(which == BOTH || upper) ctxLBeat.fillStyle = btnColorShaded;
            else ctxLBeat.fillStyle = btnColorShadedDarkr;
        ctxLBeat.beginPath();
        ctxLBeat.arc(30, 30, 30, 0, 2 * Math.PI);
        ctxLBeat.fill();
        // spodnji krog;
        if(which == BOTH || lower) ctxLBeat.fillStyle = btnColorShaded;
            else ctxLBeat.fillStyle = btnColorShadedDarkr;
        ctxLBeat.beginPath();
        ctxLBeat.arc(30, 106, 30, 0, 2 * Math.PI);
        ctxLBeat.fill();
    
        // puščici;
        //zgornja;
        if(which == BOTH || upper) ctxLBeat.fillStyle = btnColor;
            else ctxLBeat.fillStyle = btnColorShadedDarkrCentr;
        ctxLBeat.beginPath();
        ctxLBeat.moveTo(30, 10);
        ctxLBeat.lineTo(47.3, 40);
        ctxLBeat.lineTo(12.7, 40);
        ctxLBeat.fill();
    
        // spodnja
        if(which == BOTH || lower) ctxLBeat.fillStyle = btnColor;
            else ctxLBeat.fillStyle = btnColorShadedDarkrCentr;
        ctxLBeat.beginPath();
        ctxLBeat.moveTo(30, 126);
        ctxLBeat.lineTo(47.3, 96);
        ctxLBeat.lineTo(12.7, 96);
        ctxLBeat.fill();
    }


 // levo število dob
    if(which == BOTH || which == RIGHT) {
        // kroga
        // zgornji krog;
        if(which == BOTH || upper) ctxRBeat.fillStyle = btnColorShaded;
            else ctxRBeat.fillStyle = btnColorShadedDarkr;
        ctxRBeat.beginPath();
        ctxRBeat.arc(30, 30, 30, 0, 2 * Math.PI);
        ctxRBeat.fill();
        // spodnji krog;
        if(which == BOTH || lower) ctxRBeat.fillStyle = btnColorShaded;
            else ctxRBeat.fillStyle = btnColorShadedDarkr;
        ctxRBeat.beginPath();
        ctxRBeat.arc(30, 106, 30, 0, 2 * Math.PI);
        ctxRBeat.fill();
    
        // puščici;
        //zgornja;
        if(which == BOTH || upper) ctxRBeat.fillStyle = btnColor;
            else ctxRBeat.fillStyle = btnColorShadedDarkrCentr;
        ctxRBeat.beginPath();
        ctxRBeat.moveTo(30, 10);
        ctxRBeat.lineTo(47.3, 40);
        ctxRBeat.lineTo(12.7, 40);
        ctxRBeat.fill();
    
        // spodnja
        if(which == BOTH || lower) ctxRBeat.fillStyle = btnColor;
            else ctxRBeat.fillStyle = btnColorShadedDarkrCentr;
        ctxRBeat.beginPath();
        ctxRBeat.moveTo(30, 126);
        ctxRBeat.lineTo(47.3, 96);
        ctxRBeat.lineTo(12.7, 96);
        ctxRBeat.fill();
    }
}

function resetPlayStopCanv() {
    canvPlayStop.height = 0;
    canvPlayStop.height = 108;  // ena pojavitev je tudi v .js;
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

function drawStopBtn() {
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
        ctxPlayStop.lineTo(65, 43);
        ctxPlayStop.lineTo(65, 93);
        ctxPlayStop.lineTo(15, 93);
    } else {
        ctxPlayStop.moveTo(12, 33);
        ctxPlayStop.lineTo(48, 33);
        ctxPlayStop.lineTo(48, 70);
        ctxPlayStop.lineTo(12, 70);
    }
    ctxPlayStop.fill();
    // legacy, ko je bila še ikona za pavzo;
    // ctxPlayStop.beginPath();
    // if(!mobile) {
    //     ctxPlayStop.moveTo(15, 43);
    //     ctxPlayStop.lineTo(35, 43);
    //     ctxPlayStop.lineTo(35, 93);
    //     ctxPlayStop.lineTo(15, 93);
    // } else {
    //     ctxPlayStop.moveTo(12, 33);
    //     ctxPlayStop.lineTo(27, 33);
    //     ctxPlayStop.lineTo(27, 70);
    //     ctxPlayStop.lineTo(12, 70);
    // }
    // ctxPlayStop.fill();

    // ctxPlayStop.beginPath();
    // if(!mobile) {
    //     ctxPlayStop.moveTo(45, 43);
    //     ctxPlayStop.lineTo(65, 43);
    //     ctxPlayStop.lineTo(65, 93);
    //     ctxPlayStop.lineTo(45, 93);
    // } else {
    //     ctxPlayStop.moveTo(33, 33);
    //     ctxPlayStop.lineTo(49, 33);
    //     ctxPlayStop.lineTo(49, 70);
    //     ctxPlayStop.lineTo(33, 70);
    // }
    // ctxPlayStop.fill();
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

function touchDial(e) {
    if(isRotating == null) {
        if(evalClick(e)) {
             if(azzerato) {
                e.stopImmediatePropagation();
                startRotating();    // če je zaustavljeno in tudi ponastavljen kazalec (kar je tudi stanje ob odprtju appa), zaženeš; 
            } else {
                e.stopImmediatePropagation();
                azzerareAfterStop();  // če je zaustavljeno, prvi klik ponastavi številčnico;
            }
        }
    }
}

function evalClick(e) {
    // merimo klik, zato je lahko ista procedura za mobile/!mobile; če bi merili premik, bi rabili ločit, tako pa ne;
    let reslt = false;
    const tchX = e.clientX - foreCanvRect.left;
    const tchY = e.clientY - foreCanvRect.top;
    const rr = ((tchX - crclX)**2 + (tchY - crclY)**2)**(0.5);
    if(rr <= r + 5) reslt = true;
    return reslt;
}

function touchDialB4SmplInit(e) {
    if(evalClick(e)) {
        setupSamplesPt2(arrayBfrs).then((response) => { // za videt je podobna playStopBtnOprtnB4SmplInit(), ampak ni ista!!;
            // uredit zvoke;
            audioSmpls = response;
            // zagnat;
            startRotating();
            // uredit listenerje;
            setListnrsAftrInit();
        });
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
            if(tempoIntrvlChckr == null) { 
                tempo(true);
                tempoIntrvlChckr = setInterval(tempo, 70, true); 
            }
        } else if(reslt == TEMPO_DOWN){
            if(tempoIntrvlChckr == null) {
                tempo(false);
                tempoIntrvlChckr = setInterval(tempo, 70, false);
            }
        }
    }
}

function mouseMoveOprtn(e) {
    if (mousePressIsValid) {
        const reslt = detrmnMousPosOnTempoCnvs(e);
        if (reslt != mouseOrTchPosOnTempo.btn) {
            invldteTempoClick();
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

function tempo(up){
    if(up) {bpm++;}
        else {bpm--;}
    defineRevltnDurtn();
    updBpmDisp();
}

async function updBpmDisp(){
    displayTempo.innerHTML = bpm;
}

// info btn&co
function infoClick() {
    const msg = `A polyrhythm metronome.<br><br>
    Right value determines beat marks on the outside of the dial, left value determines the beat shown by the marks on
    the inside of the circle. Possible values: 2-12.
    <br><br>The &quot;Beats per minute&quot; setting affects the speed of the beat count on the right,
    ie. the speed with which the indicator visits the marks on the outside of the circle.
    <br><br><br><span style="font-size:12px;">Metronome sounds by Ludwig Peter Müller (December 2020).
    Used under the license &quot;Creative Commons CC0 1.0 Universal&quot; extended by the author.</span>
    <br><br><br><span style="font-size:12px;">Ivo Makuc, 2025</span>
    <br><span style="font-size:12px;">byguesswork@gmail.com</span>`;
    
    // test
    // raiseJoker(testMsg);
    // !test
    
    raiseJoker(msg);
}

function raiseJoker(msg) {
    jokerOpen = true;
    if(isRotating) {
        clearInterval(isRotating);
        isRotating = null;
        wasRunngB4Joker = true;
    } 
    divJokerBckgnd.classList.remove('hidden');
    divJokerForegnd.classList.remove('hidden');
    // v primeru da gre za horizWarning (special al ne special), spodnjo ukaz ne deluje, ..
    // kr ga prekliče divJokerCloseIcon.style.display = 'none' ker je bolj specifičen (style vs class specificity);
    divJokerCloseIcon.classList.remove('hidden');   
    jokerContent.innerHTML = msg;
}

function retireJoker() {
    jokerOpen = false;
    divJokerBckgnd.classList.add('hidden');
    divJokerForegnd.classList.add('hidden');
    divJokerCloseIcon.classList.add('hidden');
    jokerContent.innerHTML = '';
    if(wasRunngB4Joker) {
        wasRunngB4Joker = false;
        prevT = Date.now(); // da gre kazalec od tam naperj, kjer si ga ustail;
        isRotating = setInterval(rotate, frameDurtn);
    }
}
