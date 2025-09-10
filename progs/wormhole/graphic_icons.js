'use strict';

function drawControlsIcons() {
    controlsCanvas.height = 146;
    controlsCanvas.width = 146;

    // narisat kroge;
    controlsCtx.strokeStyle = '#c0ffa7';
    controlsCtx.fillStyle = '#c0ffa7';

    // kroga za dol in gor
    controlsCtx.beginPath();
    controlsCtx.arc(25 + 48, 25, 24, 0, 2 * Math.PI);
    controlsCtx.arc(25 + 48, 25 + 48 + 48, 24, 0, 2 * Math.PI);
    controlsCtx.fill();

    // kroga za levo /desno;
    controlsCtx.beginPath();
    controlsCtx.arc(25, 73, 24, 0, 2 * Math.PI);
    controlsCtx.arc(25+48+48, 73, 24, 0, 2 * Math.PI);
    controlsCtx.fill();


    // narisat krivulje v krogih;
    controlsCtx.lineWidth = 2;
    controlsCtx.strokeStyle = '#313131';
    controlsCtx.beginPath();
    
    // levi gumb (ZA LEVO);
    controlsCtx.moveTo(37, 72); // sredina 25, 73
    controlsCtx.lineTo(13, 72);
    controlsCtx.lineTo(21, 64);
    controlsCtx.moveTo(37, 73);
    controlsCtx.lineTo(13, 73);
    controlsCtx.lineTo(21, 81);
    
    // desni gumb (ZA DESNO);
    controlsCtx.moveTo(109, 72); // sredina 121, 73
    controlsCtx.lineTo(133, 72);
    controlsCtx.lineTo(125, 64);
    controlsCtx.moveTo(109, 73);
    controlsCtx.lineTo(133, 73);
    controlsCtx.lineTo(125, 81);
    
    // zgornji gumb (ZA DOL)
    controlsCtx.moveTo(72, 36); // sredina 25+48, 25
    controlsCtx.lineTo(72, 12);
    controlsCtx.lineTo(65, 20);
    controlsCtx.moveTo(73, 36);
    controlsCtx.lineTo(73, 12);
    controlsCtx.lineTo(81, 20);
    
    // spodnji gumb (ZA GOR)
    controlsCtx.moveTo(72, 109); // sredina 25+48, 25+96 
    controlsCtx.lineTo(72, 133);
    controlsCtx.lineTo(65, 125);
    controlsCtx.moveTo(73, 109);
    controlsCtx.lineTo(73, 133);
    controlsCtx.lineTo(81, 125);
    
    controlsCtx.stroke();


    // - - - - - - -   samo za test - - - - - - -
    // controlsCtx.strokeStyle = 'white';
    // controlsCtx.lineWidth = 1;
    
    // controlsCtx.beginPath();

    // // vodoravne;
    // controlsCtx.moveTo(0, 1);
    // controlsCtx.lineTo(250, 1);
    // controlsCtx.moveTo(0, 50);
    // controlsCtx.lineTo(250, 50);
    // controlsCtx.moveTo(0, 98);
    // controlsCtx.lineTo(250, 98);
    // controlsCtx.moveTo(0, 145);
    // controlsCtx.lineTo(250, 145);
    
    // // navpične
    // controlsCtx.moveTo(1, 0);
    // controlsCtx.lineTo(1, 148);
    // controlsCtx.moveTo(49, 0);
    // controlsCtx.lineTo(49, 148);
    // controlsCtx.moveTo(98, 0);
    // controlsCtx.lineTo(98, 148);
    // controlsCtx.moveTo(145, 0);
    // controlsCtx.lineTo(145, 148);

    // controlsCtx.stroke();
    // !test


}

function infoClicked() {
    if (!isInfoSettingsOpen) {   // zaradi pogoja isInfo... listener ne deluje, ko je okvir odprt, zato ga ni treba odstranjevat;
        isInfoSettingsOpen = true;
        infoSettgs.className = 'info_settings_open';
        infoSettgsContent.className = 'info_settings_content_open';
        if (lang === 'en') {
            infoSettgsContent.innerHTML = `Instructions<br><br><div style="font-size:0.9em;"><strong>Yaw left/right/climb/dive:</strong> Use arrow keys (or icons below)<br><p class="interstit">&nbsp;</p>
            <strong>Stop movement:</strong> ESC<br><br>`;
            infoSettgsOK.innerHTML = 'OK';
        } else {
            infoSettgsContent.innerHTML = `Navodila<br><br><div style="font-size:0.9em;"><strong>Odklon levo/desno/dviganje/spuščanje:</strong> smerne tipke (ali kliknite ustrezno ikono spodaj)<br><p class="interstit">&nbsp;</p>
            <strong>Konec:</strong> ESC<br><br>`;
            infoSettgsOK.innerHTML = 'V redu';
        }
        infoSettgsOK.className = 'align-right';

        if (isRunning) stopTicker();

        // listener za nasprotno dejanje je spodaj;
    }
}

function infoCloseClicked() {
    isInfoSettingsOpen = false;
    infoSettgs.className = 'info_settings_closed';
    infoSettgsContent.className = 'info_settings_content_closed';
    infoSettgsContent.innerHTML = 'i';
    infoSettgsOK.className = 'hidden';  // skrijemo gumb;

    // zaženemo
    if (isRunning) intervalChecker = setInterval(updtViewer, 30);
}

function gameOver(why) {

    infoSettgs.className = 'info_settings_open';
    infoSettgsContent.className = 'info_settings_content_open';
    
    stopTicker();
    isRunning = false;
    
    if (why == ESC) {
        if (lang === 'en') {
            infoSettgsContent.innerHTML = `KEY ESC PRESSED<br><br><div style="font-size:0.9em;"><strong>Game interrupted:</strong> Reload page (F5) to restart<br><p class="interstit">&nbsp;</p>`;
            infoSettgsOK.innerHTML = ''; // prazno, nič ne napišemo;
        } else {
            infoSettgsContent.innerHTML = `PRITISNJENA JE BILA TIPKA ESC<br><br><div style="font-size:0.9em;"><strong>Igra prekinjena:</strong> če želite še enkrat začeti, znova naložite stran (F5).<br><p class="interstit">&nbsp;</p>`;
            infoSettgsOK.innerHTML = ''; // prazno, nič ne napišemo;
        }
    } else if (why == TILL_END) {
        let addOn = ' F5';
        if (mobile) {
            infoSettgs.style.left = '20px';
            infoSettgs.style.right = '10px';
            addOn = '';
        }
        if (lang === 'en') {
            infoSettgsContent.innerHTML = `CONGRATS!<br><br><div style="font-size:0.9em;"><strong>End of wormhole reached:</strong> Reload page${addOn} to restart<br><p class="interstit">&nbsp;</p>`;
            infoSettgsOK.innerHTML = ''; // prazno, nič ne napišemo;
        } else {
            infoSettgsContent.innerHTML = `UH, KONEC ČRVINE!<br><br><div style="font-size:0.9em;"><strong>Prišli ste do konca:</strong> če želite še enkrat začeti, znova naložite stran${addOn}.<br><p class="interstit">&nbsp;</p>`;
            infoSettgsOK.innerHTML = ''; // prazno, nič ne napišemo;
        }
    }
}
