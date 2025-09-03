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
    controlsCtx.strokeStyle = /*'#313131'*/ 'red';
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
    controlsCtx.strokeStyle = 'white';
    controlsCtx.lineWidth = 1;
    
    controlsCtx.beginPath();

    // vodoravne;
    controlsCtx.moveTo(0, 1);
    controlsCtx.lineTo(250, 1);
    controlsCtx.moveTo(0, 50);
    controlsCtx.lineTo(250, 50);
    controlsCtx.moveTo(0, 98);
    controlsCtx.lineTo(250, 98);
    controlsCtx.moveTo(0, 145);
    controlsCtx.lineTo(250, 145);
    
    // navpične
    controlsCtx.moveTo(1, 0);
    controlsCtx.lineTo(1, 148);
    controlsCtx.moveTo(49, 0);
    controlsCtx.lineTo(49, 148);
    controlsCtx.moveTo(98, 0);
    controlsCtx.lineTo(98, 148);
    controlsCtx.moveTo(145, 0);
    controlsCtx.lineTo(145, 148);

    controlsCtx.stroke();
    // !test


}

function infoClicked() {
    if (!isInfoSettingsOpen) {   // zaradi pogoja isInfo... listener ne deluje, ko je okvir odprt, zato ga ni treba odstranjevat;
        isInfoSettingsOpen = true;
        infoSettgs.className = 'info_settings_open';
        infoSettgsContent.className = 'info_settings_content_open';
        if (lang === 'en') {
            infoSettgsContent.innerHTML = `Instructions<br><br><div style="font-size:0.9em;"><strong>Move left/right/forward/back:</strong> Use arrow keys (or icons below)<br><p class="interstit">&nbsp;</p>
            <strong>Rotate left/right:</strong> I / O (or use icons below)<br><p class="interstit">&nbsp;</p>
            <strong>Up/down:</strong> U / J (you get the drill)<br><br>`;
            infoSettgsOK.innerHTML = 'OK';
        } else {
            infoSettgsContent.innerHTML = `Navodila<br><br><div style="font-size:0.9em;"><strong>Premik levo/desno/naprej/nazaj:</strong> smerne tipke (ali kliknite ustrezno ikono spodaj)<br><p class="interstit">&nbsp;</p>
            <strong>Obračanje levo/desno:</strong> I / O (ali kliknite ustrezno ikono spodaj)<br><p class="interstit">&nbsp;</p>
            <strong>Gor/dol:</strong> U / J (bla bla bla ...)<br><br>`;
            infoSettgsOK.innerHTML = 'V redu';
        }
        infoSettgsOK.className = 'align-right';

        // listener za nasprotno dejanje je spodaj;
    }
}

function infoCloseClicked() {
    isInfoSettingsOpen = false;
    infoSettgs.className = 'info_settings_closed';
    infoSettgsContent.className = 'info_settings_content_closed';
    infoSettgsContent.innerHTML = 'i';
    infoSettgsOK.className = 'hidden';  // skrijemo gumb;
}

