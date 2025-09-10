'use strict';

// v classes preveri to: // spodnji dve bi morda morali bit na if (this.segments[whichSegmnt].fillInfo.doFill) ker morda ni samoumevno, da ima krog barvo 
// trenutno se preverja, pri preverjaju ali naj gre v izris, le glede na levo/desno (if ((y / x) >= TELEANGLEFACTOR || (y / x) <= -TELEANGLEFACTOR))
    // bi bilo treba tudi glede na y / z (teleFctrY);
// zeleno stikalo na steklu stavbe, ki bi bilo vidno ob približanju
// dodat kšne opise v index.html (recimo za fuel: I like its simplicity, maybe you will too)

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
let isViewModeTele = true;  // to je prava spremenljivka, ki hrani, kateri pogled imamo, ko pa je tranzicija, pa tudi to, kateri je ciljni pogled tranzicije;
calcVertRadsFrmCentr();
console.log(wdth, hght, scrnMidPoint);
const viewModeTranstn = {
    active : false,
    cycleTime : 50,
    numCycles : 20,
    cycleNum : 0
}

infoSettgsContent.addEventListener('click', infoClicked);
infoSettgsOK.addEventListener('click', infoCloseClicked);

// šele po morebitni spremembi zaradi mobile umestimo zgornji okvir;
document.getElementById('mode').style.bottom = `${30 + controlsCanvas.getBoundingClientRect().height + 25}px`;   // 30 ker ima sklop pod njim bottom 30; 25 je arbitrarna meja med skopoma 
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

        if (!viewModeTranstn.active) {
            if (isViewModeTele) { // za linearno metodo (ne-tangensno, ne-fish eye);
                scrnPt.x = scrnMidPoint.x +  (teleFctrX * x / y) * scrnMidPoint.x;    // 3,24*x, ker pri tangensni metodi je tako (točka, ki je 3,24 dlje, kot je vstran, je na robu vidnega polja, če vidiš 0,3 radiana vstran); 
                scrnPt.y = scrnMidPoint.y +  (teleFctrY * -z / y) * scrnMidPoint.y;
            } else {    // če fish eye;
                // x (na zaslonu);
                scrnPt.x = scrnMidPoint.x +  Math.sin(Math.atan2(x, (y**2 + z**2 )**(1/2))) * fishFctrX;   // ta je bila izvirna ta delovna, tudi za teleangle;
                // y (na zaslonu);
                // /*1*/ scrnPt.y = scrnMidPoint.y +  Math.sin(Math.atan2(z, (y**2  + x**2 )**(1/2))) * fishFctrY;
                /*2*/ scrnPt.y = scrnMidPoint.y +  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * fishFctrY;  // ta je ta prava
                // /*3*/ scrnPt.y = scrnMidPoint.y -  Math.sin(Math.atan2(z, (y**2  + x**2 )**(1/2))) * fishFctrY;
                // /*4*/ scrnPt.y = scrnMidPoint.y -  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * fishFctrY;
            } 
        } else {    // če je TRANSITION;
            const ratio = viewModeTranstn.cycleNum / viewModeTranstn.numCycles;
            const scrnPtTeleX = scrnMidPoint.x +  (teleFctrX * x / y) * scrnMidPoint.x;
            const scrnPtTeleY = scrnMidPoint.y +  (teleFctrY * -z / y) * scrnMidPoint.y;
            const scrnPtFishX = scrnMidPoint.x +  Math.sin(Math.atan2(x, (y**2 + z**2 )**(1/2))) * fishFctrX;
            const scrnPtFishY = scrnMidPoint.y +  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * fishFctrY;
            if (!isViewModeTele) {   // če je cilj tranzicije FISHEYE
                scrnPt.x = scrnPtTeleX + ratio * (scrnPtFishX - scrnPtTeleX);
                scrnPt.y = scrnPtTeleY + ratio * (scrnPtFishY - scrnPtTeleY);
            } else {    // če je cilj tranzicije TELEANGLE
                scrnPt.x = scrnPtFishX + ratio * (scrnPtTeleX - scrnPtFishX);
                scrnPt.y = scrnPtFishY + ratio * (scrnPtTeleY - scrnPtFishY);
            }
        }
        return scrnPt;
    }

    // začetek dogajanja;
    const scrnPts = new Array();
    let startRoll = 0; // spremenljivka v katero shraniš, kjer si že iskal; predvidoma se poznejše točke najdejo v poznejših povezavah, zato;
    spacePoints.forEach((spcPt, i) => {
        // to spodaj je nek star opis, ki ne več velja, odkar se uporablja TELEANGLEFACTOR;
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
        if (constraints.allYNegAngular) {  // če je še true, probamo, al lahko postane false;
            if (!isViewModeTele) {
                if (y > 0) constraints.allYNegAngular = false;
            } else {    // torej če imamo teleangle; za zdaj gledamo samo y/x, z-ja ne gledamo, ker ni veliko visokih predmetov
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
            }
        } // else allYneg že false, ni več treba čekirat;

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
    const viewngAngle = isLandscapeMode == true ? activeViewer.angle : 0; // kot pod katerim gledamo; sever (y proti neskončno) == 0;

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

// - - - - - -  USTVARJANJE LANDSCAPE STVARI, KI BODO NA EKRANU - - - - - -
const cubes = [];
// navpične kocke;
cubes.push(new Cube(new SpacePoint(6, 20, 0), 4, [GLASS, GLASS, GLASS, undefined, 'grey', 'grey']))
for (let i = 4; i <= 16; i += 4) {
    cubes.push(new Cube(new SpacePoint(6, 20, i), 4, [GLASS, GLASS, 'grey']));
};
// vodoravne kocke;
for (let i = 10; i <= 42; i += 4) {
    cubes.push(new Cube(new SpacePoint(i, 20, 0), 4, [GLASS, undefined, 'grey']));
};
cubes.push(new Cube(new SpacePoint(46, 20, 0), 4, [GLASS, GLASS, undefined, GLASS, 'grey', 'grey']));

// kesonar;
const pickupTruckLndscp = new Pickup(new SpacePoint(5, 5, 0.4), '#a0a0a0');  // silver: #c0c0c0 ; grey: #808080
const othrPickupTruckLndscp = new Pickup(new SpacePoint(-9, 24, 0.4), Math.random() < 0.5 ? '#850e1e' : '#0f3477', 4.71); // modra: #0f3477 bordo : #850e1e

// rob ceste;
const lines = [];
// new Connection(new SpacePoint(-4, 0, 0), new SpacePoint(-4, 2000, 0));      // opazi, kako je line1 ravna in se ne ujema s segmentirano črto;
for(let i = 1; i <= 16; i++) {
    lines.push(new Connection(new SpacePoint(-4, (i - 1) * 4, 0), new SpacePoint(-4, i * 4, 0)));
    lines.push(new Connection(new SpacePoint(4, (i - 1) * 4, 0), new SpacePoint(4, i * 4, 0)));
    lines.push(new Connection(new SpacePoint(-4, -(i - 1) * 4, 0), new SpacePoint(-4, -i * 4, 0)));
    lines.push(new Connection(new SpacePoint(4, -(i - 1) * 4, 0), new SpacePoint(4, -i * 4, 0)));
}
for(let i = 1; i <= 4; i++) {
    lines.push(new Connection(new SpacePoint(-4, 64 + (i - 1) * 16, 0), new SpacePoint(-4, 64 + i * 16, 0)));
    lines.push(new Connection(new SpacePoint(4, 64 + (i - 1) * 16, 0), new SpacePoint(4, 64 + i * 16, 0)));
    lines.push(new Connection(new SpacePoint(-4, -64 - (i - 1) * 16, 0), new SpacePoint(-4, -64 - i * 16, 0)));
    lines.push(new Connection(new SpacePoint(4, -64 - (i - 1) * 16, 0), new SpacePoint(4, -64 - i * 16, 0)));
}
lines.push(new Connection(new SpacePoint(-4, 128, 0), new SpacePoint(-4, 2000, 0)));
lines.push(new Connection(new SpacePoint(4, 128, 0), new SpacePoint(4, 2000, 0)));
lines.push(new Connection(new SpacePoint(-4, -128, 0), new SpacePoint(-4, -2000, 0)));
lines.push(new Connection(new SpacePoint(4, -128, 0), new SpacePoint(4, -2000, 0)));

// črte na sredini ceste;
const dividingLines = [];
for (let i = -200; i <= 302; i += 10) {
    dividingLines.push(new OrtgnlRect(new SpacePoint(-0.1, i, 0), new SpacePoint(0.2, 3, 0), new FillInfo(true, 'white')));
};


function getLandscItems() {
    // sortiranje landObjectsov;
    landObjects.forEach(el => { // najprej vsakemu določima razdaljo do viewerja;
        el.spatlCentr.r = Thingy.calcSpatialRFromSpcPt(el.spatlCentr, activeViewer.posIn3D)
    })
    landObjects.sort((a, b) => b.spatlCentr.r - a.spatlCentr.r)   // to je vsa fora da objekte posortiraš od najbolj oddaljenega proti najbližjemu

    // združit
    activeItems = landscape.concat(landObjects);
}

// - - - - - -  DODAJANJE STVARI V KATALOGE  - - - - - -
// če gledaš pokrajino - definirana morata biti dva arraya, ki morta biti vsaj prazna; vsebinolandObjects pri premikanju gledalca sortiramo po oddaljenosti;
// DELOVNA VARIANTA 
const landscape = [...lines, ...dividingLines];
const landObjects = [...cubes, pickupTruckLndscp, othrPickupTruckLndscp];

// TESTNE VARIANTE;
// const landscape = [];
// const dividingLinesTest = [];
// for (let i = 10; i <= 100; i += 20) {
//     dividingLinesTest.push(new OrtgnlRect(new SpacePoint(-0.1, i, 0), new SpacePoint(0.2, 10, 0), new FillInfo(true, 'white')));
// };
// const landscape = [...dividingLinesTest];
// const landscape = [new OrtgnlCircle({x:-2, y:5, z:0}, 1, [true, false, false], new FillInfo(true, 'yellow'))];
// const landObjects = [];
// const landObjects = [pickupTruckLndscp];
// const landObjects = [new Cube(new SpacePoint(6, 20, 0), 4, [GLASS, GLASS, 'grey'])]

// USTVARJANJE IN PRIPRAVA ŠE ZA MODUL OBJECT_ROTATE
const pickupTruckRotate = new Pickup(new SpacePoint(1, 5, 0), 'red');
const objRotateItems = [pickupTruckRotate];


//  - - - - - -  USTVARJANJE GLEDALCEV (2: za pomikanje po pokrajini in za gledanje rotacije predmeta);
const landscapeViewer = new Viewer(0, -9, 1.75);   // na začetku ima gledalec privzeto spacePoint 0,-9,1.7 (kao visok 1,75 m), gleda naravnost vzdolž osi y, torej v {0,neskončno,1.7}, tj. kot 0;
if (mobile) landscapeViewer.posIn3D.x = 2.6;
// y == 9, da je pri normal view videt del avta

const obj2RotateViewer = new Viewer (0, 0, 1.75);

// štartamo v landscape mode;
let isLandscapeMode = true;
let activeViewer = landscapeViewer;
let activeItems;
getLandscItems();   // to napolni vsebino activeItems;

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

const lensBtns = document.getElementsByClassName('lens');
const modeBtns = document.getElementsByClassName('mode');

//   - - - - - -    listenerji
// tipke;
document.addEventListener('keydown', atKeyPress);
// besedilni gumbi;
lensBtns[0].addEventListener('click', lensBtnOprtn);
lensBtns[1].addEventListener('click', lensBtnOprtn);
modeBtns[0].addEventListener('click', modeBtnOprtn);
modeBtns[1].addEventListener('click', modeBtnOprtn);
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
    if (e.key == 'ArrowLeft') { moveViewer(LEFT) }
    else if (e.key == 'ArrowRight') { moveViewer(RIGHT);}
    else if (e.key == 'ArrowUp') { moveViewer(FORWARD) }  //e.code == 'KeyC'
    else if (e.key == 'ArrowDown') { moveViewer(BACK)  }
    else if (e.code == 'KeyU') { moveViewer(UP);}
    else if (e.code == 'KeyJ') { moveViewer(DOWN);}
    else if (e.code == 'KeyI') {
        if (isLandscapeMode) rotateViewer(ANTICLOCKW);
        else rotateObj(ANTICLOCKW);
    } else if (e.code == 'KeyO') {
        if (isLandscapeMode) rotateViewer(CLOCKW);
        else rotateObj(CLOCKW);
    } else if (e.code == 'KeyN') {
        if (lensBtns[0].classList.contains('unselected') 
            && !viewModeTranstn.active) {  // tako vrednost ima samo takrat, ko se izvaja prehod FISH <> TELEANGLE; da se ne sproži hkrati še en prehod;
            changeLens(false); 
        }
    } if (e.code == 'KeyF') {
        if (lensBtns[1].classList.contains('unselected') && !viewModeTranstn.active) { changeLens(true); }
    }
}

function moveViewer(toWhere){
    activeViewer.move(toWhere, activeViewer);
    // console.log(toDecPlace(activeViewer.posIn3D.x), toDecPlace(activeViewer.posIn3D.y), toDecPlace(activeViewer.posIn3D.z), 'kot:', toDecPlace(activeViewer.angle));
    if (isLandscapeMode) getLandscItems();  // da se določi, kateri predmeti so bližje in kateri dlje
    calcReltvSpcPtsAndDraw();
}

function rotateViewer(dir){
    activeViewer.rotate(dir);   // samo landscapeViewer pride sem;
    calcReltvSpcPtsAndDraw();
}

function rotateObj(dir){
    if (dir == CLOCKW) activeItems[0].rotate(true); // true za clockwise, sicer false;
        else activeItems[0].rotate(false);
    calcReltvSpcPtsAndDraw();
}

// - - - -  gumba FISH EYE/NARROW;
function changeLens(doFish){    // to lahko kličeš tudi s tipkami;
    lensBtns[0].classList.toggle('selected');
    lensBtns[1].classList.toggle('selected');
    lensBtns[0].classList.toggle('unselected');
    lensBtns[1].classList.toggle('unselected');
    if (doFish) { isViewModeTele = false; }
        else { isViewModeTele = true; }
    viewModeTranstn.active = true;   // to je sprožilec za izvajanje prehoda v spcPt2ScrnPt oz. calcScrnPts, po koncu prehoda se spet naštima prava vrednost;
    for (let i = 1; i <= viewModeTranstn.numCycles; i++) {  // akcija
        setTimeout(() => {
            viewModeTranstn.cycleNum = i;
            calcReltvSpcPtsAndDraw()
            if (i == viewModeTranstn.numCycles) {
                console.log('konc prehoda');
                viewModeTranstn.active = false;
            }
        }, i * viewModeTranstn.cycleTime)
    }
}

function lensBtnOprtn(evt){
    //  evt.target.parentElement čekiramo, ker lahko klikneš span comment znotraj gumba in v tem primeru je ta span target, zato moramo skočit na parent;
    if ((evt.target.classList.contains('unselected') || evt.target.parentElement.classList.contains('unselected')) 
        && !viewModeTranstn.active) { // tako vrednost ima samo takrat, ko se izvaja prehod FISH <> TELEANGLE; da se ne sproži hkrati še en prehod;
        if (lensBtns[0].classList.contains('selected')) {
            changeLens(true);
        } else changeLens(false);
    }
}

//  - - - - -  gumba LANDSCAPE/ROTATE;
function modeBtnOprtn(evt){
    if (evt.target.classList.contains('unselected')) {
        if (modeBtns[0].classList.contains('selected')) {
            changeMode(true);
        } else changeMode(false);
        modeBtns[0].classList.toggle('selected');
        modeBtns[1].classList.toggle('selected');
        modeBtns[0].classList.toggle('unselected');
        modeBtns[1].classList.toggle('unselected');
    }

    function changeMode(doRotate){
        if (doRotate) {
            activeItems = objRotateItems;
            activeViewer = obj2RotateViewer;
            isLandscapeMode = false;
        } else {
            activeItems = landscape.concat(landObjects);   // to nastavi activeItems na pravo stvar; ni treba getLandscItems, ker bi po nepotrebnem sortiralo;
            activeViewer = landscapeViewer;
            isLandscapeMode = true;
        }
        calcReltvSpcPtsAndDraw();
    }
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
    
    if (mouseOrTchPosOnCtrls.y < 50) {  // zgornja vrstica
        return whichBtnInRow(true);
    } else if (mouseOrTchPosOnCtrls.y > 55) {   // spodnja vrstica
        return whichBtnInRow(false);
    } else return INVALID;

    function whichBtnInRow(isUpper) {   // če true, zgornja vrstica, sicer spodnja;
        if (mouseOrTchPosOnCtrls.x < 105) { // leva polovica
            if (mouseOrTchPosOnCtrls.x < 49) {  // 1. četrtina;
                if (isUpper) return ANTICLOCKW;
                else return LEFT;
            } else if (mouseOrTchPosOnCtrls.x > 55) {   // 2. četrtina
                if (isUpper) return FORWARD;
                else return BACK;
            } else return INVALID;
        } else if (mouseOrTchPosOnCtrls.x > 111) { // desna polovica;
            if (mouseOrTchPosOnCtrls.x < 161) { // 3. četrtina;
                if (isUpper) return CLOCKW;
                else return RIGHT;
            } else if (mouseOrTchPosOnCtrls.x > 179) {  // 4. četrtina;
                if (isUpper) return UP;
                else return DOWN;
            } else return INVALID;
        } else return INVALID;
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
    if (isLandscapeMode) getLandscItems();
}

function desktopRotationHelper() {
    if (isLandscapeMode) rotateViewer(mouseOrTchPosOnCtrls.btn);
        else rotateObj(mouseOrTchPosOnCtrls.btn);
}
