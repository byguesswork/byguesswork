'use strict';

function drawControlsIcons() {
    controlsCanvas.height = 103;    // moralo bi bit 102, krogi bi morali bit y--;
    controlsCanvas.width = 228;

    // narisat kroge;
    controlsCtx.strokeStyle = '#c0ffa7';
    controlsCtx.fillStyle = '#c0ffa7';
    for (let i = 1;i <= 4; i++) {
        controlsCtx.beginPath();
        const pad = i == 4 ? 12 : 0;
        controlsCtx.arc((i - 1) * 56 + 24 + pad, 25, 24, 0, 2 * Math.PI);
        controlsCtx.arc((i - 1) * 56 + 24 + pad, 79, 24, 0, 2 * Math.PI);
        controlsCtx.fill();
    }

    // narisat krivulje v krogih;
    controlsCtx.lineWidth = 2;
    controlsCtx.strokeStyle = '#313131';
    controlsCtx.beginPath();
    
    // spodnji levi gumb (ZA LEVO);
    controlsCtx.moveTo(37, 78); // sredina: 25, 79
    controlsCtx.lineTo(13, 78);
    controlsCtx.lineTo(21, 70);
    controlsCtx.moveTo(37, 79);
    controlsCtx.lineTo(13, 79);
    controlsCtx.lineTo(21, 87);
    
    // spodnji desni gumb (ZA DESNO);
    controlsCtx.moveTo(123, 78); // serdina: 135
    controlsCtx.lineTo(147, 78);
    controlsCtx.lineTo(139, 70);
    controlsCtx.moveTo(123, 79);
    controlsCtx.lineTo(147, 79);
    controlsCtx.lineTo(139, 87);
    
    // zgornji srednji (ZA NAPREJ)
    controlsCtx.moveTo(79, 36); // sredina 56 + 24, 25
    controlsCtx.lineTo(79, 12);
    controlsCtx.lineTo(72, 20);
    controlsCtx.moveTo(80, 36);
    controlsCtx.lineTo(80, 12);
    controlsCtx.lineTo(88, 20);
    
    // spodnji srednji (ZA NAZAJ)
    controlsCtx.moveTo(79, 67); // sredina 56+24, 79
    controlsCtx.lineTo(79, 91);
    controlsCtx.lineTo(72, 83);
    controlsCtx.moveTo(80, 67);
    controlsCtx.lineTo(80, 91);
    controlsCtx.lineTo(88, 83);
    
    // zgornji desni gumb (ZA VRTENJE V DESNO);
    controlsCtx.moveTo(136, 37);
    controlsCtx.arc(136, 25, 12, 1.57, 6);
    controlsCtx.moveTo(136 + 11.52 + 1, 25 - 3.36);    // 11,52 in 3, 31 sta sin in cos kota 0,283, kolikor ostane od 6 do 2Pi; + 1 je prilagoditev na osi x (določoena od oka glede na to, kar sem videl na sliki);
    controlsCtx.lineTo(136 + 11.52, 25 - 3.36 - 11.31);    // 11,31 je hipotenuza kvadrata s stranico 8, kolikor sta zavihka pri ravnih puščicah;
    controlsCtx.moveTo(136 + 11.52 + 1, 25 - 3.36);
    controlsCtx.lineTo(136 + 11.52 - 10 + 1, 25 - 3.36 - 2);   // -10 in -2 sta bila določena od oka;

    // zgornji levi gumb (ZA VRTENJE V LEVO); središče: 30, 25
    controlsCtx.moveTo(11, 22); // tu je vrh puščice
    controlsCtx.arc(24, 25, 12, 3.42, 7.85);
    controlsCtx.moveTo(11, 22);    // 11,52 in 3, 31 sta sin in cos kota 0,283, kolikor ostane od 6 do 2Pi; + 1 je prilagoditev na osi x (določoena od oka glede na to, kar sem videl na sliki);
    controlsCtx.lineTo(13, 22 - 11.3);    // 11,31 je hipotenuza kvadrata s stranico 8, kolikor sta zavihka pri ravnih puščicah;
    controlsCtx.moveTo(11, 22);
    controlsCtx.lineTo(12 + 10, 22 - 2);   // -10 in -2 sta bila določena od oka;
    
    // gumb za dvig;
    controlsCtx.moveTo(203, 33);
    controlsCtx.lineTo(203, 13);
    controlsCtx.lineTo(195, 21);
    controlsCtx.moveTo(204, 33);
    controlsCtx.lineTo(204, 13);
    controlsCtx.lineTo(212, 21);
    controlsCtx.moveTo(192, 33);
    controlsCtx.lineTo(214, 33);

    // gumb za potop;
    controlsCtx.moveTo(203, 72);
    controlsCtx.lineTo(203, 92);
    controlsCtx.lineTo(195, 84);
    controlsCtx.moveTo(204, 72);
    controlsCtx.lineTo(204, 92);
    controlsCtx.lineTo(212, 84);
    controlsCtx.moveTo(192, 72);
    controlsCtx.lineTo(214, 72);

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
    // controlsCtx.moveTo(0, 54);
    // controlsCtx.lineTo(250, 54);
    // // je tik zunaj canvasa, ni videt
    // controlsCtx.moveTo(0, 104);
    // controlsCtx.lineTo(250, 104);
    
    // // navpične
    // controlsCtx.moveTo(1, 0);
    // controlsCtx.lineTo(1, 119);
    // controlsCtx.moveTo(49, 0);
    // controlsCtx.lineTo(49, 119);
    // controlsCtx.moveTo(55, 0);
    // controlsCtx.lineTo(55, 119);
    // controlsCtx.moveTo(105, 0);
    // controlsCtx.lineTo(105, 119);
    // controlsCtx.moveTo(111, 0);
    // controlsCtx.lineTo(111, 119);
    // controlsCtx.moveTo(161, 0);
    // controlsCtx.lineTo(161, 119);
    // controlsCtx.moveTo(179, 0);
    // controlsCtx.lineTo(179, 119);
    // // je tik zunaj canvasa, je ni videt;
    // controlsCtx.moveTo(229, 0);
    // controlsCtx.lineTo(229, 119);

    // controlsCtx.stroke();

    // na zgornji strani canvasa je 1 px odveč (je aktiven, pa bi moral bit neaktiven)
    // spodnja, desna in leva stran so odrezane točno;

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

