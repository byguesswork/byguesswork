'use strict';

function drawControls() {
    // levo število dob
    // krog
    ctxLBeat.fillStyle = btnColor;
    ctxLBeat.beginPath();
    ctxLBeat.arc(30, 30, 30, 0, 2 * Math.PI);
    ctxLBeat.arc(30, 106, 30, 0, 2 * Math.PI);
    ctxLBeat.fill();

    // puščici;
    ctxLBeat.fillStyle = bckgndColor;
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
    ctxRBeat.fillStyle = btnColor;
    ctxRBeat.beginPath();
    ctxRBeat.arc(30, 30, 30, 0, 2 * Math.PI);
    ctxRBeat.arc(30, 106, 30, 0, 2 * Math.PI);
    ctxRBeat.fill();

    ctxRBeat.fillStyle = bckgndColor;
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

    // štart/ustavi
    drawPlayBtn();
}

function resetPlayStopCanv() {
    canvPlayStop.height = 0;
    canvPlayStop.height = 136;
    ctxPlayStop.fillStyle = btnColor;
    ctxPlayStop.strokeStyle = btnColorShaded;
    ctxPlayStop.lineWidth = 1.5;
}

function drawPlayBtn () {
    resetPlayStopCanv();
    
    ctxPlayStop.beginPath();
    ctxPlayStop.moveTo(0, 28);
    ctxPlayStop.lineTo(80, 28);
    ctxPlayStop.lineTo(80, 108);
    ctxPlayStop.lineTo(0, 108);
    ctxPlayStop.lineTo(0, 28);
    ctxPlayStop.stroke();
    ctxPlayStop.beginPath();
    ctxPlayStop.moveTo(10, 38);
    ctxPlayStop.lineTo(70, 68);
    ctxPlayStop.lineTo(10, 98);
    ctxPlayStop.fill();
}

function drawPauseBtn() {
    resetPlayStopCanv();

    ctxPlayStop.beginPath();
    ctxPlayStop.moveTo(0, 28);
    ctxPlayStop.lineTo(80, 28);
    ctxPlayStop.lineTo(80, 108);
    ctxPlayStop.lineTo(0, 108);
    ctxPlayStop.lineTo(0, 28);
    ctxPlayStop.stroke();

    ctxPlayStop.beginPath();
    ctxPlayStop.moveTo(15, 43);
    ctxPlayStop.lineTo(35, 43);
    ctxPlayStop.lineTo(35, 93);
    ctxPlayStop.lineTo(15, 93);
    ctxPlayStop.fill();

    ctxPlayStop.beginPath();
    ctxPlayStop.moveTo(45, 43);
    ctxPlayStop.lineTo(65, 43);
    ctxPlayStop.lineTo(65, 93);
    ctxPlayStop.lineTo(45, 93);
    ctxPlayStop.fill();
}