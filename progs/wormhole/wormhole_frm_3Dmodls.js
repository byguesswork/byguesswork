'use strict';

// tam kjer je y / x) >= TELEANGLEFACTOR bi moralo merit na dočino hipotenuze ()
// ortgnl circle 4 točke nardit

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const controlsCanvas = document.getElementById('controls_canvas');
const controlsCtx = controlsCanvas.getContext('2d');
const infoSettgs = document.getElementById('info_settings');
    const infoSettgsContent = document.getElementById('info_settings_content');
    const infoSettgsOK = document.getElementById('info_settings_OK');
const joker = document.getElementById('joker');

const bckgndColr = '#4e4e4c';
const lineColor = '#f0fff0';
let wdth, hght, clientWidthWas;   // "was" se imenuje zato, ker se uporablja tudi v eni funkciji, kjer je pomembno, da je "was", sicer pa predstavlja tudi stanje "is";
let orientationChkIsInMotion = null;
let isInfoSettingsOpen = false;
const lang = checkLang();
const contrlsCnvsRect = {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0
}
const scrnMidPoint = {
    x: 0, 
    y: 0
};

initScrn();
drawControlsIcons();

// najprej preverimo za mobilca, ker to lahko spremeni postavitev;
let mobile = false;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
    console.log('mobile');
    mobile = true;
    const spans2remv = [...document.getElementsByClassName('not_if_mobile')];
    spans2remv.forEach(el => el.classList.add('hidden'));

    screen.orientation.addEventListener("change", () => {
        
        // ne dela dobro, bi rablo mal več testiranja, damo kar reload
        // orientationChkIsInMotion = setInterval(chkOnOrientationChgd, 50);
        location.reload();
    });

    // če je mobile, ni info linka, ker ni kaj razlagat o tipkah;
    infoSettgs.classList.add('hidden');
}

// koti; ekran od leve do desne je 3.0 radiana (malo manj kot 180', kao oponaša vidno polje človeka), pomeni da je scrnMidPoint.x = 1.5 (ali tam nekje); zdaj izračunamo še, kolikšen kot je lahko po vertikali 
const FISHEYEANGLE = Math.PI / 2;    // to podaja kot, ker pri FISHEYE se točke računajo s koti;
let TELEANGLEFACTOR = 3.24;  // to sta empirično pridobljeni vrednosti, pri katerih za točko na robu zaslona..
//                                             ..velja naslednje: x * faktor = y, če je vidni kot od sredine do roba 0,2 radiana (tele, mob pokončno) ali 0,3 rad (tele, desktop/mob-ležeče);
if (mobile) {
    TELEANGLEFACTOR = 5;
    if (screen.orientation.type.includes('landscape')) TELEANGLEFACTOR = 4.1;
}
const hrzRadsFrmCentr = FISHEYEANGLE;  // ta se itak ne spreminja, ker se hrzRads... rabi samo pri FISHEYE in itak trenutno se stran ponovno naloži ob spremembi postavitve zaslona na mobile;
let vertRadsFrmCentr, fishFctrX, fishFctrY, teleFctrX, teleFctrY;
calcVertRadsFrmCentr();
console.log(wdth, hght, scrnMidPoint);

infoSettgsContent.addEventListener('click', infoClicked);
infoSettgsOK.addEventListener('click', infoCloseClicked);

if (document.readyState == 'loading') { //.. in preberemo koordinate controlsRecta;
    document.addEventListener("DOMContentLoaded", readCntrlsCnvsRect);  // domcontent loaded je lahko "complete" ali pa "interactive";
} else {
    readCntrlsCnvsRect();
}


//  - - - -   FUNKCIJE   - - - -

function readCntrlsCnvsRect() {
    contrlsCnvsRect.left = controlsCanvas.getBoundingClientRect().left;
    contrlsCnvsRect.top = controlsCanvas.getBoundingClientRect().top;
    contrlsCnvsRect.right = controlsCanvas.getBoundingClientRect().right;
    contrlsCnvsRect.bottom = controlsCanvas.getBoundingClientRect().bottom;
    console.log('rect:', contrlsCnvsRect.left, contrlsCnvsRect.top)
}

function chkOnOrientationChgd(){    // trenutno se ne uproablja, ker ne deluje dobro;
    // console.log('widthWas:', clientWidthWas, 'width is:', document.documentElement.clientWidth, 'interval:', orientationChkIsInMotion);
    if (document.documentElement.clientWidth != clientWidthWas) {
        clearInterval(orientationChkIsInMotion);
        orientationChkIsInMotion = null;
        initScrn();
        calcVertRadsFrmCentr();
        calcReltvSpcPtsAndDraw();
    }
}

function initScrn(){
    clientWidthWas = document.documentElement.clientWidth; // da bomo pozneje lahko preverjali orietn change na mobilcu;
    
    wdth = clientWidthWas - 5; // -5 , da ni skrolbara; prej je bilo window.innerWidth, ampak ni ok, vsaj višina ne, prevelika pride;
    hght = document.documentElement.clientHeight - 5;
    scrnMidPoint.x = wdth % 2 == 0 ? wdth / 2 : wdth / 2 + 0.5;
    scrnMidPoint.y = hght % 2 == 0 ? hght / 2 : hght / 2 + 0.5;
    
    Thingy.meetCtx(ctx);
    canvas.height = hght;
    canvas.width = wdth;
    ctx.lineWidth = 1;
    ctx.strokeStyle = lineColor;
}

function calcVertRadsFrmCentr(){    // kliče se samo ob nalaganju strani (se je tudi ob sprmeewmbi orientacije, ampak tisto se začasno ne uporablja);
    
    // za FISHEYE;
    let drawableYHeightHalved;

    // hrzRadsFrmCentr in vertRadsFrmCentr sta samo začasna proxija, potrebna za izračun fishFctrX in fishFctrY, kar se uporablja samo pri FISHEYE
    vertRadsFrmCentr = toDecPlace((scrnMidPoint.y / scrnMidPoint.x) * hrzRadsFrmCentr, 4);
    drawableYHeightHalved = scrnMidPoint.y;
    
    if (vertRadsFrmCentr >= Math.PI / 2) {   // to se lahko zgodi pri pokočni postavitvi in fishEye;
        vertRadsFrmCentr = hrzRadsFrmCentr;
        drawableYHeightHalved = scrnMidPoint.x; // da je slika enaka v širino in višino, ker že po širini zajame 180', višina pa je še višja;
    }

    console.log('vertRads@fisheye:', vertRadsFrmCentr)
    fishFctrX = scrnMidPoint.x / Math.sin(hrzRadsFrmCentr);   // fishFctrX in Y sta edina delovno uporabna podatka za FISHE, ostali do tle so bili le pomožni;
    fishFctrY = drawableYHeightHalved / Math.sin(vertRadsFrmCentr);

    // za TELEANGLE (linearna, ne-tangensna, ne-fish eye metoda);
    teleFctrX = TELEANGLEFACTOR;
    teleFctrY = TELEANGLEFACTOR * scrnMidPoint.x/scrnMidPoint.y;    // tu ni omejitve navzgor, oz. ni težava pri mob pokončno, pač vidiš več neba;

    // skratka, izračun točk zs FISHEYE temelji na kotih, izračun točk za TELEANGLE pa na koeficientu x/y;
}  

function clearCanvas() {
    ctx.lineWidth = 1;
    ctx.strokeStyle = bckgndColr;
    ctx.fillStyle = bckgndColr;
    ctx.beginPath();
    ctx.rect(1, 1, wdth, hght);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = lineColor;
}

function calcScreenPts(spacePoints, connctnsRange) {   // prejme relativne koordinate! (na ravni segmenta), položaj viewerja mora torej biti že odštet;

    // i - index v arrayu spacePoints
    // j - index v arrayu s povezavami
    function chk4Intrpolate(i, j){    // to samo interpolira x in y od SpacePointa (ne ScreenPointa!!!) in vrne x in y SpacePointa!;
        if (connctnsRange[j][0] == i) { // spcPt[i] se uporablja kot začetni element črte, ki jo opredeljuje connsAlt[j]; 
            if (spacePoints[connctnsRange[j][1]].y > 0) {
                startRoll = j;   // zabeležimo, da smo tle že našli, ker vsako točko interpoliramo samo enkrat, kljub temu da morda sodeluje v več povezavah;
                // console.log('negativna točka je prva točka povezave in jo lahko interpoliramo - BREAK')
                return interpolateToYAbvZero(spacePoints[connctnsRange[j][0]].x, spacePoints[connctnsRange[j][0]].y,
                    spacePoints[connctnsRange[j][1]].x, spacePoints[connctnsRange[j][1]].y);
            } else {
                // console.log('negativna točka je prva točka povezave, ampak tudi druga je negativna;')
                return false;
            }
        } else if (connctnsRange[j][1] == i) {   // spcPt[i] se uporablja kot končni element črte, ki jo opredeljuje connsAlt[j]; 
            if (spacePoints[connctnsRange[j][0]].y > 0) {
                startRoll = j;   // zabeležimo, da smo tle že našli, ker vsako točko interpoliramo samo enkrat, kljub temu da morda sodeluje v več povezavah;
                // console.log('negativna točka je končna točka povezave in jo lahko interpoliramo - BREAK')
                return interpolateToYAbvZero(spacePoints[connctnsRange[j][1]].x, spacePoints[connctnsRange[j][1]].y,
                    spacePoints[connctnsRange[j][0]].x, spacePoints[connctnsRange[j][0]].y);
            } else {
                // console.log('negativna točka je druga točka povezave, ampak tudi prva je negativna;')
                return false;
            }
        } else {
            return false;
        }
    }

    function spcPt2ScrnPt(x, y, z) {    // dela na ravni točke, ne segmenta ali predmeta;
        const scrnPt = new ScreenPoint();

        scrnPt.x = scrnMidPoint.x +  (teleFctrX * x / y) * scrnMidPoint.x;    // 3,24*x, ker pri tangensni metodi je tako (točka, ki je 3,24 dlje, kot je vstran, je na robu vidnega polja, če vidiš 0,3 radiana vstran); 
        scrnPt.y = scrnMidPoint.y +  (teleFctrY * -z / y) * scrnMidPoint.y;
        return scrnPt;
    }

    // začetek dogajanja;
    const scrnPts = new Array();
    let startRoll = 0; // spremenljivka v katero shraniš, kjer si že iskal; predvidoma se poznejše točke najdejo v poznejših povezavah, zato;
    spacePoints.forEach((spcPt, i) => {
        // glavna logika je Math.atan2(offset(od navpičnice, vodoravnice), razdalja do tja);
        // računanje hipotenuze služi upoštevanju tega, da če je neka stvar visoko, je v bistvu tudi oddaljena;
        // tudi če ozkokotni pogled prikažeš cel (s faktorjem 0,2) ni čisto nič drugačen od fish eye; spreminjanje kota torej ne reši ukrivljenosti, bo treba druga metoda;
        
        if (spcPt.y > 0) {   // neproblematična varianta, tj. če imaš stvar pred sabo;
            scrnPts.push(spcPt2ScrnPt(spcPt.x, spcPt.y, spcPt.z));
        } else {    // če prideš v else, je bil podan tudi connctnsRange;
            // najst, kje v connctnsRange je taka točka (y < 0 in ima povezavo, na osnovi katere ga je mogoče interpolirati);
            let found = false;
            for (let j = startRoll; j < connctnsRange.length; j++) {
                const retrndValue = chk4Intrpolate(i, j); // če je mogoče interpolirati negativni y, vrne novi x in y koordinati spacePointa (space, ne screen) v arrayu;
                if (typeof retrndValue == 'object') {
                    found = true;
                    scrnPts.push(spcPt2ScrnPt(retrndValue[0], retrndValue[1], spcPt.z));    // frmSpcPtT... vrne array, ki ima na prvam mestu x, nato y;
                    break;
                }
            }
            if (startRoll > 0 && !found) for (let j = 0; j < startRoll; j++) {  // reroll in iskanje od začetka, če ni bilo najdeno pri koncu arraya povezav;
                const retrndValue = chk4Intrpolate(i, j);
                if (typeof retrndValue == 'object') {
                    found = true;
                    scrnPts.push(spcPt2ScrnPt(retrndValue[0], retrndValue[1], spcPt.z));
                    break;
                }
            }
            if (!found) scrnPts.push(new ScreenPoint(undefined, undefined));
        }
    });
    
    return scrnPts;
}


function calcReltvSpcPtsAndDraw(){ // calculate relative spacePoints, tj. od viewerja do predmetov; dela na ravni celega kataloga predmetov;
    
    // helper funkcije;

    function helper(spcPt, item2Draw, constraints) {    // dela na ravni točke segmenta;
        x = spcPt.x - viewPoint.x;  // x in y relativiziramo;
        y = spcPt.y - viewPoint.y;
        r = (x**2 + y**2)**(0.5);
        
        // izračun relativnega ploskovnega x in y, če gledalec ne gleda pod kotom 0 (sicer ta del ni potreben);
        if (viewngAngle != 0) {
            if (y > 0) {
                angle = Math.asin(x/r) - viewngAngle;   // pri izračunu kota, pod katerim gledamo neko točko, je treba upoštevati, kam je usmerjen pogled gledalva (viewAngle);
            } else if (y < 0) {
                angle = Math.PI - Math.asin(x/r) - viewngAngle;
            } else if (y == 0) {
                if (x < 0) angle = 1.5 * Math.PI - viewngAngle;
                else angle = 0.5 * Math.PI - viewngAngle;
            }
            
            //zdaj, ko smo dobili relativni kot, lahko izračunamo pripadajoči x in y (prostorske) relativne točke, ki bo izrisana;
            x = r * Math.sin(angle);
            y = r * Math.cos(angle);
        }

        // preverjanje, ali naj gre točka (in posledično segment) v izris; false > gre v izris, privzeto je true;
        if ((y / x) >= TELEANGLEFACTOR || (y / x) <= -TELEANGLEFACTOR) {    // izvedba z Math.abs bi bila krajša v kodi a morda počasnejša v izvedbi;
            constraints.allYNegAngular = false;
        } else {    // moramo zabeležit, na kateri strani vidnega polja se točke segmenta pojavljajo zunaj vidnega polja, ker če se na obeh, je to poseben primer;
            if ((y / x) >= 0) { // zdaj že vemo, da nismo ne levo od negativne meje ne desno od pozitivne in je pomembna samo še meja 0;
                // constraints.right = true; // tu bi lahko samo to zabeležli, lahko pa gremo korak dlje in že delamo na allYNeg;
                if (constraints.left) {
                    constraints.allYNegAngular = false; // če že imamo od prej left in zdaj bi itak dodali še right, lahko kar zabeležimo allYNeg;
                } else constraints.right = true;
            } else {
                // constraints.left = true; // tu bi lahko samo to zabeležli, lahko pa gremo korak dlje in že delamo na allYNeg;
                if (constraints.right) {
                    constraints.allYNegAngular = false; // če že imamo od prej right in zdaj bi itak dodali še left, lahko kar zabeležimo allYNeg;
                } else constraints.left = true;
            }
        }

        // zabeleženje točke (v vsakem primeru, ne glede na true/false pri allYNegAngular, ker recimo ti zadnja točka lahko da false in sproži izris)
        item2Draw.push(new SpacePoint(x, y, spcPt.z - viewPoint.z));    // to je številka 3 spodaj;
        
        // rezultati testov preračunov zaslonskih koordinat - Prva cifra pomeni kalkulacijo y v spcPt2ScrnPt oz. v calcScreenPts;:
        // /*1*/ item2Draw.push(new SpacePoint(x, y, spcPt.z + viewPoint.z));
        // /*2*/ item2Draw.push(new SpacePoint(x, y, -spcPt.z + viewPoint.z));
        // /*3*/ item2Draw.push(new SpacePoint(x, y, spcPt.z - viewPoint.z));
        // /*4*/ item2Draw.push(new SpacePoint(x, y, -spcPt.z - viewPoint.z));

        // 1-1 prenizko; 1-2 OK   !!; 1-3 ni ok; 1-4 previsoko;
        // 2-1 previsoko; 2-2 na spodnji strani; 2-3 OK!!; 2-4 prenizko;
        // 3-1 previsoko; 3-2 spodaj; 3-3 OK !!; 3-4 prenizko;
        // 4-1 prenizko; 4-2 OK; 4-3 spodaj; 4-4 previsoko;
    }

    // začetek dogajanja;
    let x, y, r, angle;

    // ker bomo na koncu risali, moramo na začetku vse izbrisat;
    clearCanvas();

    // določimo izhodišče pogleda in kot; slednje je odvisno od tega al landscape ali objRotate;
    const viewPoint = activeViewer.posIn3D;   // točka, iz katere gledamo;
    const viewngAngle = activeViewer.angle; // kot pod katerim gledamo; sever (y proti neskončno) == 0;

    activeItems.forEach(item => {
        // preslikava prostorskih točk na dvodimenzionalno ravnino, ..
        // ..toda ne navpično ravnino, kot je monitor, ampak vodoravno (x rase proti desno, y raste stran od gledalca);
        // kot pogleda je zelo pomemben; risanja ne moreš izvajat brez preračunavanja kota, tudi če je kot == 0,..
        // .. ker če imaš zadevo za hrbtom, tudi če gledaš direkt proti S (kot == 0), zadeve ne smeš izrisat, ker je ne moreš videt;
        
        function oneLoop(segIdx) {   // prejme index segmenta; dela na ravni segmenta
            const item2Draw = new Array();   // item2Draw je nov objekt, da ne spreminjamo dejanskih koordinat teles v prostoru (telesa ostajajo na istih točkah),..
                                    // ..ampak da dobimo relativne koordinate glede na gledišče, ki jih podamo v item.draw;
            const constraints = {   // mora bit objekt, ker se pošlje kot argument in če bi bilo primitive, bi tamkajšnja sprememba ne veljala tu zunaj;
                allYNegAngular : true,  // beleži, ali so vse y koordinate nekega predmeta negativne, tj. gledalcu za hrbtom; če tako, ničesar ne izrišemo, ker gre le za zrcalno sliko, ki je za hrbtom;
                right : false,  // pri teleangle beleži, al je vsaj ena točka zunaj vidnega polja desno od vidnega polja;
                left : false    // isto za levo; če so vse negativne in imamo negativne (zunaj) tako levo kot desno, moramo stvar vseeno narisat, ker je treba narisat to, kar je vmes!!;
            }

            item.segments[segIdx].spcPts.forEach((spcPt) => { helper(spcPt, item2Draw, constraints) })

            if (!constraints.allYNegAngular) {  // če so vse prostorske y-koordinate segmenta (ali predmeta, če je iz samo enega seg.) negativne, je segm v celoti za hrbtom gledalca in ga ne rišemo;
                item.draw(calcScreenPts(item2Draw, item.segments[segIdx].connsAlt), segIdx);
                // izrisanih++;
                // če je kakšna y-koordinata prostorske točke negativna, je treba komplicirat, interpolirat y, da ni negativen, ampak to se zgodi v calcScrnPts;
                // (kajti zaradi kotnih preračunov se lahko stvari, ki jih imaš za hrbtom, narišejo pred tamo, zato je treba negativne y skenalsat pred kotnimi prer.); 
            } // else console.log('segment za hrbtom')  // else do nuthn, ker so vse koordinate segmenta negativne in ga ne rišemo;
            // console.log('- - -  konec segmenta - - -')
        }
        
        function isCloser(sgmtFillInfo){    // ime: is Proximal SpcPt Closer Than Distal SpcPt;
            // izračunamo dolžino daljic do središča ploskve in do referenčne distalne točke (oboje prostorsko) in če je distalna daljša od središčne, segment gledamo od zunaj;
            const rSrfcSptlCtr = Thingy.calcSpatialRFromSpcPt(sgmtFillInfo.spatialCtr, viewPoint);
            const rSrfcDistlSptlCtr = Thingy.calcSpatialRFromSpcPt(sgmtFillInfo.distlSptlCtr, viewPoint);
            if (rSrfcSptlCtr < rSrfcDistlSptlCtr) { return true; }
                else return false;
        }

        // začetek dogajanja;
        const remaining = [], closerProxmls = []; // sem shranimo indexe ploskev tipa PROXIMAL, ki bodo izrisane, toda pozneje;
        // let izrisanih = 0; bila samo za testne namene, kao števec, koliko segmetnov je bilo izrisanih pri predmetu;
        
        // v prvi pasaži narišemo tiste segmente, ki se narišejo vedno (BASE/undefined, lahko barvne ploskev ali samo orisi);
        for (let k = 0; k < item.segments.length; k++) {
            if (item.segments[k].fillInfo.typ != PROXIMAL) {
                if (item.segments[k].fillInfo.typ != BASPROX) {
                    oneLoop(k); // če ni ne PROXIMAL ne BASPROX, gre v izris (je torej ali (base/undefined) ploskev ali pa element orisa);
                } else {    // če je BASPROX, se je treba odločit, al ga narisat zdaj (se obnaša kot BASE), al ga zadržat za poznejše risanje (kot PROXIMAL);
                    if (isCloser(item.segments[k].fillInfo)) {
                        closerProxmls.push(k);   // ta BASPROX se obnaša kot potrjen PROXIMAL, zabeležimo; PAZI, gre direkt v closerProxmls, ne v remaining;
                    } else {
                        oneLoop(k); // ta BASPROX se obnaša kot BASE plosekv in gre zdaj v izris;
                    }
                }
            } else { remaining.push(k); }   // če je segment PROXIMAL, ga zabeležimo za naslednjo pasažo;
        } 
        
        if (remaining.length > 0) { // v remaining so samo PROXIMAL, ki pa še niso bili preverjeni;
            for (let k = 0; k < remaining.length; k++) {
                if (isCloser(item.segments[remaining[k]].fillInfo)) {
                    closerProxmls.push(remaining[k]);   // če na PROXIMAL gledamo z zunanje strani predmeta (če je njegovo središče bližje od distalne točke), ga shranimo za izris;
                    // shranit pa moramo remaining[k] in ne k, ker oneLoop prejme index segmenta (ne index izvedenega arraya remaining);
                } // else console.log('neizpolnjen proximal segment') //  else do nuth, ker ta PROXIMAL ne sme biti narisan, ker nanj ne gledamo od zunaj
            }
        }
        
        if (closerProxmls.length > 0) {
            closerProxmls.sort((a, b) => a-b);  // sortiramo po vrsti! da so enak vrstni red, kot so navedeni v objektu;
            for (let k = 0; k < closerProxmls.length; k++) {
                oneLoop(closerProxmls[k]);
            }
        }
        // console.log('konc predmeta, izrisanih:', izrisanih)
    })
}


//  - - - - - - - - - - - - - - - - -  PRIPRAVA  - - - - - - - - - - - - - - - - - - - - -

//  - - - - - -  USTVARJANJE GLEDALCA;
const activeViewer = new Viewer(0, -9, 0);

// ustvarjanje obročev
let activeItems = [];
for (let index = 1; index < 40; index++) {
    activeItems.push(new OrtgnlCircle(new SpacePoint(0, 20 * index, 0), 5, [true, false], new FillInfo(false)))
}

//  - - - - - - - - - - - - - - - - -  AKCIJA  - - - - - - - - - - - - - - - - - - - - -
calcReltvSpcPtsAndDraw();   // začetni izris izbranega kataloga;

let mousePressIsValid = false;  // če true, pove, da je dotik v teku in da je na veljavnem mestu;
let intervalChecker = null;
let mouseOrTchPosOnCtrls = {
    x : 0,
    y : 0,
    btn : 'none'
}

// - - - -  CONTROLS  - - - - - -

const LEFT = 'l';
const RIGHT = "r";
const FORWARD = "c";    // izvirno je bilo closer
const BACK = 'f';       // izvirno je bilo far
const UP = 'u';
const DOWN = 'd';
const CLOCKW = 'cw';
const ANTICLOCKW = 'acw';
const INVALID = 'inv';  // neveljaven klik


//   - - - - - -    listenerji
// tipke;
document.addEventListener('keydown', atKeyPress);
// grafični gumbi;
if (!mobile) {  // poslušalci za ikone krmiljenja če miška;
    controlsCanvas.addEventListener('mousedown', (e) => {mouseDownOprtn(e)});
    controlsCanvas.addEventListener('mouseleave', (e) => {mouseLeaveOprtn(e)});
    controlsCanvas.addEventListener('mouseup', (e) => {mouseUpOprtn(e)});
    controlsCanvas.addEventListener('mousemove', (e) => {mouseMoveOprtn(e)});
} else {
    controlsCanvas.addEventListener('touchstart', (e) => {touchStartOprtn(e)}, {passive : false});
    controlsCanvas.addEventListener('touchmove', (e) => {touchMoveOprtn(e)}, {passive : false});
    controlsCanvas.addEventListener('touchend', (e) => {touchEndOprtn(e)}, {passive : false});
}

//  - - - - - -    funkcije
function atKeyPress(e){
    if (e.key == 'ArrowLeft') { rotateViewer(ANTICLOCKW) }
    else if (e.key == 'ArrowRight') { rotateViewer(CLOCKW);}
    else if (e.key == 'ArrowUp') { moveViewer(FORWARD) }  //e.code == 'KeyC'
    else if (e.key == 'ArrowDown') { moveViewer(BACK)  }
}

function moveViewer(toWhere){
    activeViewer.move(toWhere, activeViewer);
    calcReltvSpcPtsAndDraw();
}

function rotateViewer(dir){
    activeViewer.rotate(dir);
    calcReltvSpcPtsAndDraw();
}


//  - -  grafične ikone za premikanje;      - - - - - - -
// če mobile

function touchStartOprtn(e) {
    if (!mousePressIsValid) {   // to naj bi bilo zato, da za zdaj je mogoče le en dotik naenkrat;
        mouseDownOprtn(e);  // lahko uporabimo isto funkcijo;
    } else {
        // za zdaj še ne podpira več dotikov hkrati;
        // je pa trenutno tako, da se izvirno gibanje ustavi, ko takneš še nekaj drugega; se mi zdi

        // joker.classList.remove('hidden');
        // joker.innerHTML = "second touch";
        // setTimeout(() => { joker.classList.add('hidden'); }, 1000);
    }
}

function touchEndOprtn(e) {
    e.preventDefault();
    mouseUpOprtn(); // lahko uporabimo isto funkcijo;
}

function touchMoveOprtn(e) {
    e.preventDefault();
    if (e.changedTouches[0].clientX < contrlsCnvsRect.left || e.changedTouches[0].clientX > contrlsCnvsRect.right
        || e.changedTouches[0].clientY < contrlsCnvsRect.top || e.changedTouches[0].clientY > contrlsCnvsRect.bottom) {
        // if (mousePressIsValid) console.log('invalidated, ker zdrsnil s controls');
        invldteCtrlsClick();
    } else {
        mouseMoveOprtn(e);   // lahko uporabimo kar od miši;
    }
}

// - -  če miška     - - - - - - - - - - - - 
function mouseDownOprtn(e){
    const reslt = determineMousPosOnCtrlsCnvs(e);
    if (reslt == INVALID) {
        invldteCtrlsClick();
    } else {
        mousePressIsValid = true;
        mouseOrTchPosOnCtrls.btn = reslt;
        if (reslt != CLOCKW && reslt != ANTICLOCKW) {
            desktopMovingHelper();
            if (reslt == FORWARD || reslt == BACK) intervalChecker = setInterval(desktopMovingHelper, 30);
            else if (reslt == LEFT || reslt == RIGHT) intervalChecker = setInterval(desktopMovingHelper, 45);
            else intervalChecker = setInterval(desktopMovingHelper, 55);
        } else {
            desktopRotationHelper();
            intervalChecker = setInterval(desktopRotationHelper, 50);
        }
    }
}

function mouseMoveOprtn(e) {
    if (mousePressIsValid) {
        const reslt = determineMousPosOnCtrlsCnvs(e);
        if (reslt != mouseOrTchPosOnCtrls.btn) {
            invldteCtrlsClick();
            // console.log('invalidated pri premiku z gumba')
        }
    }
}

function mouseUpOprtn() {
    if (mousePressIsValid) invldteCtrlsClick();
}

function mouseLeaveOprtn() {
    if (mousePressIsValid) invldteCtrlsClick();
}

function determineMousPosOnCtrlsCnvs(e) {
    if (!mobile) {
        mouseOrTchPosOnCtrls.x = e.clientX - contrlsCnvsRect.left;
        mouseOrTchPosOnCtrls.y = e.clientY - contrlsCnvsRect.top;
    } else {
        mouseOrTchPosOnCtrls.x = e.changedTouches[0].clientX - contrlsCnvsRect.left;
        mouseOrTchPosOnCtrls.y = e.changedTouches[0].clientY - contrlsCnvsRect.top;
    }
    
    if (mouseOrTchPosOnCtrls.x < 49) { // prva tretjina, gumb za levo
        if (mouseOrTchPosOnCtrls.y > 49 && mouseOrTchPosOnCtrls.y < 98) return ANTICLOCKW;
        else return INVALID;
    } else if (mouseOrTchPosOnCtrls.x < 98) { // srednja tretjina; gumba za gor in dol
        if (mouseOrTchPosOnCtrls.y < 50 ) return FORWARD;
        else if (mouseOrTchPosOnCtrls.y > 97 ) return BACK;
        else return INVALID;
    } else {    // zdej že vemo da smo na zadnji, desni tretjini;
        if (mouseOrTchPosOnCtrls.y > 49 && mouseOrTchPosOnCtrls.y < 98) return CLOCKW; 
        else return INVALID;
    }

}

function invldteCtrlsClick() {
    mousePressIsValid = false;
    if (intervalChecker != null) {
        clearInterval(intervalChecker);
        intervalChecker = null;
    }
}

function desktopMovingHelper() {
    moveViewer(mouseOrTchPosOnCtrls.btn);
}

function desktopRotationHelper() {
    rotateViewer(mouseOrTchPosOnCtrls.btn);
}
