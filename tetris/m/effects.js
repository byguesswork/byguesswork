'use strict';

function curtainRenderer(x) {
    const factor = blockSize / 40; // ker izvirno je miniGrid mišljen za velikost 40;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo((x - 70) * factor > 0 ? (x - 70) * factor + miniGridCoords.x : miniGridCoords.x, miniGridCoords.y); // ta dva sicer pogledta ven iz okvirja miniGrid-a
    ctx.lineTo((x - 70) * factor > 0 ? (x - 70) * factor + miniGridCoords.x : miniGridCoords.x, 199 * factor + miniGridCoords.y);
    ctx.lineTo(60 * factor + (x - 70) * factor + miniGridCoords.x, 199 * factor + miniGridCoords.y);
    ctx.lineTo(87 * factor + (x - 70) * factor + miniGridCoords.x, 130 * factor + miniGridCoords.y);
    ctx.lineTo(100 * factor + (x - 70) * factor + miniGridCoords.x, 70* factor + miniGridCoords.y);
    ctx.lineTo(100 * factor + (x - 70) * factor + miniGridCoords.x, miniGridCoords.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(200 * factor + (70 - x) * factor < 200 * factor ? 199 * factor + (70 - x) * factor + miniGridCoords.x : 199 * factor + miniGridCoords.x, miniGridCoords.y);
    ctx.lineTo(200 * factor + (70 - x) * factor < 200 * factor ? 199 * factor + (70 - x) * factor + miniGridCoords.x : 199 * factor + miniGridCoords.x, 199 * factor + miniGridCoords.y);
    ctx.lineTo(140 * factor + (70 - x) * factor + miniGridCoords.x, 199 * factor + miniGridCoords.y);
    ctx.lineTo(113 * factor + (70 - x) * factor + miniGridCoords.x, 130 * factor + miniGridCoords.y);
    ctx.lineTo(100 * factor + (70 - x) * factor + miniGridCoords.x, 70 * factor + miniGridCoords.y);
    ctx.lineTo(100 * factor + (70 - x) * factor + miniGridCoords.x, miniGridCoords.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function curtainInMiniGridStaticClosed() {
    clearMiniGrid();
    ctx.strokeStyle = 'red';
    ctx.fillStyle = '#571010';
    curtainRenderer(70);
}

function curtainInMiniGridOpening() {
    for (let i = 7; i >= 1; i--) {
        setTimeout(() => {
            clearMiniGrid();
            showNextFormInMiniGrid();
            ctx.strokeStyle = 'red';
            ctx.fillStyle = '#571010';
            curtainRenderer(10 * i);
        }, 120 * (8 - i))
    };
}

function curtainInMiniGridClosing() {      //  za naredit: dodat par rdečih navpičnih črt na zavese
    ctx.strokeStyle = 'red';
    ctx.fillStyle = '#571010';

    for (let i = 1; i <= 7; i++) {
        setTimeout(() => curtainRenderer(10 * i), 120 * i)
    };

    // ta premaknjen gib zavese pri koncu zapiranja zavese (ki seže onkraj ravnotežnega položaja)
    setTimeout(() => {
        const factor = blockSize / 40; // ker izvirno je miniGrid mišljen za velikost 40;
        ctx.beginPath();
        ctx.moveTo(miniGridCoords.x, miniGridCoords.y);
        ctx.lineTo(miniGridCoords.x, 199 * factor + miniGridCoords.y);
        ctx.lineTo(75 * factor + miniGridCoords.x, 199 * factor + miniGridCoords.y);   // x+15
        ctx.lineTo(94 * factor + miniGridCoords.x, 130 * factor + miniGridCoords.y);   // x+7
        ctx.lineTo(100 * factor + miniGridCoords.x, 70 * factor + miniGridCoords.y);
        ctx.lineTo(100 * factor + miniGridCoords.x, miniGridCoords.y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(199 * factor + miniGridCoords.x, miniGridCoords.y);
        ctx.lineTo(199 * factor + miniGridCoords.x, 199 * factor + miniGridCoords.y);
        ctx.lineTo(125 * factor + miniGridCoords.x, 199 * factor + miniGridCoords.y);
        ctx.lineTo(106 * factor + miniGridCoords.x, 130 * factor + miniGridCoords.y);
        ctx.lineTo(100 * factor + miniGridCoords.x, 70 * factor + miniGridCoords.y);
        ctx.lineTo(100 * factor + miniGridCoords.x, miniGridCoords.y);
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }, 960);

    setTimeout(curtainInMiniGridStaticClosed, 1200);
}

function effectDoubleTrouble() {  // izvirno async;

    clearInt();

    function doAnimation(background, color1, color2, delay) {
        setTimeout(() => {
            contentJoker2.className = 'fx';
            contentJoker2.style.background = background;
            //                                     tale box-sizing spodaj je ena major zadeva
            contentJoker2.innerHTML = `
            <div style="background:grey;height:100%;box-sizing: border-box">
            <p style="color:${color1}"><br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DOUBLE</p>
            <p style="color:${color2}">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;TROUBLE</p><br> 
            </div>
            `}, delay)
    }

    contentJoker2.classList.remove('hidden');
    doAnimation('yellow', 'grey', 'grey', 0);
    doAnimation('#ebeb27', 'white', 'grey', 100);   // bilo: #d8d834
    doAnimation('#d3b946', '#c9c8c8', 'grey', 350); // bilo: #b9b967
    doAnimation('#b89561', '#b3b1b1', 'white', 600);
    doAnimation('grey', 'grey', '#c9c8c8', 900);
    doAnimation('grey', 'grey', 'grey', 1200);
    setTimeout(() => {
        contentJoker2.style.background = '';    // je treba odstranit style, ker je bil določen programatično in to preglasi nastavitev iz css-a (in potem je game over okno sivo, ker je tukaj bilo nazadnje določeno sivo);
        contentJoker2.classList.add('hidden');
        refreshCurrentScore();
        insertOnTopAndStartInt();
    }, 1300);
}

function effectTripple() {  // izvirno async (v webu);
    contentJoker2.className = 'fx';
    contentJoker2.style.paddingLeft = '60px';
    contentJoker2.style.width = '250px';            // ti dve vrstici sta zato, da se uni možičk pomakne bolj desno
    contentJoker2.classList.remove('hidden');

    contentJoker2.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II]&nbsp;&nbsp;&nbsp;I^^<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;IIIIIII&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;&nbsp;&nbsp;</p>    
        `;

    setTimeout(() => {
        contentJoker2.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II]&nbsp;&nbsp;&nbsp;&nbsp;I^^<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;IIIIIII&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;__&nbsp;&nbsp;</p>
        `
    }, 200);

    setTimeout(() => {
        contentJoker2.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II]&nbsp;&nbsp;&nbsp;I^^<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;&nbsp;&nbsp;</p>
        `
    }, 400);

    //  obrat, nazaj
    setTimeout(() => {
        contentJoker2.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^^I&nbsp;&nbsp;&nbsp;[II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
        `
    }, 700);

    setTimeout(() => {
        contentJoker2.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;&nbsp;^^I&nbsp;&nbsp;&nbsp;[II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</p>
        `
    }, 900);

    setTimeout(() => {
        contentJoker2.innerHTML = `
        <p style="font-family: 'Courier New', Courier, monospace; font-size:small">&nbsp;^^I&nbsp;&nbsp;&nbsp;[II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;IIIIIIIIIIII&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;III&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I__&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;II&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;IIIIIII&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;I&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;__I&nbsp;&nbsp;&nbsp;</p>
        `
    }, 1100);

    setTimeout(() => {
        contentJoker2.style.paddingLeft = '20px';
        contentJoker2.style.width = '290px';
    }, 1350);

    function doAnimation(size, color, delay) {
        setTimeout(() => {
            contentJoker2.innerHTML = `
        <p style="font-size: ${size}px; text-align: center; color: ${color}; padding-right:100px">3x</p>`;
        }, delay);
    };

    doAnimation(100, 'white', 1350);
    doAnimation(120, 'yellow', 1450);
    doAnimation(150, '#24f708', 1550);
    doAnimation(150, '#41ce2f', 1650);
    doAnimation(150, '#59ad4e', 1750);
    doAnimation(150, '#6c9766', 1850);

    setTimeout(() => {
        contentJoker2.innerHTML = ``;
        contentJoker2.classList.add('hidden');
        contentJoker2.style = '';   // je treba odstanit style, ker programatično nastavljen style preglasi pozneje nastavljen style iz CSS (ki je nastavljen na klasu, ne na elementu);
        refreshCurrentScore();
        insertOnTopAndStartInt();
    }, 1950);
}

function effectQuad() { // izvirno async (v webu);
    contentJoker2.className = 'fx';
    contentJoker2.innerHTML = '';
    contentJoker2.classList.remove('hidden');
    contentJoker2.style.background = 'yellow';

    setTimeout(() => contentJoker2.style.background = 'white', 40);
    setTimeout(() => contentJoker2.style.background = '#808080', 90);

    function doStyling(color1, color2, color3, colorBackground, colorFont, delay) {
        setTimeout(() => {
            contentJoker2.style.background = `${color1}`;
            contentJoker2.innerHTML = `
           <div style="background:${color2};height:100%;box-sizing: border-box;padding:20px">
               <div style="background:${color3};height:100%;box-sizing: border-box;padding:20px">
                   <div style="background:${colorBackground};height:100%;box-sizing: border-box;padding:20px">
						<p style="font-size:50px;color:${colorFont}">QUAD!</p>
                   </div
               </div
           </div`;
        }, delay);
    }

    doStyling('red', 'orange', 'yellow', 'grey', 'white', 100);
    doStyling('#b10202', '#af7303', '#b6b602', 'grey', 'white', 600);
    doStyling('#6d0202', '#704902', '#757502', 'grey', '#757502', 900);
    doStyling('#410101', '#3d2801', '#3d3d01', 'grey', '#505050', 1200);
    doStyling('grey', 'grey', 'grey', 'grey', '#505050', 1450);
    setTimeout(() => {
        contentJoker2.classList.add('hidden');
        contentJoker2.style = '';   // je treba odstanit style, ker programatično nastavljen style preglasi pozneje nastavljen style iz CSS (ki je nastavljen na klasu, ne na elementu);
        refreshCurrentScore();
        insertOnTopAndStartInt();
    }, 1500);
}