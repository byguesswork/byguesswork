'use strict';

// tabela vrednosti sinusa in kosinusa (90' v 6 korakih; osnovna lateralna sprememba: 5)
// 1	    5	    0
// 0,95	    4,75	0,25
// 0,85	    4,25	0,75
// 0,7	    3,5	    1,5
// 0,5	    2,5	    2,5
// 0,25	    1	    4

// a se y in yForZ razlikujeta v calcReltvSpcPtsAndDraw > helper ???
// morda zdaj vozi nekoliko hitreje ker se premakne za delta x, y in z vendar vsi trije emd sabo niso uskaljeni, ampak samo x in y in ločeno z in y;
// zdaj bi bilo treba čekirat tudi za to, ali je nekaj nad z (tako kot se preverja, al je nekaj za y == 0) ker če ne ko delaš looping, ti pred tabo izrisuje stvari, ki jih imaš za hrbtom;
// odstranit event listenerje, ko ESC
// tam kjer je y / x) >= TELEANGLEFACTOR bi moralo merit na dočino hipotenuze ()

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
        
        // ne dela dobro, bi rablo mal več testiranja, zato damo namesto tega kar reload;
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

// function chkOnOrientationChgd(){    // trenutno se ne uproablja, ker ne deluje dobro;
//     // console.log('widthWas:', clientWidthWas, 'width is:', document.documentElement.clientWidth, 'interval:', orientationChkIsInMotion);
//     if (document.documentElement.clientWidth != clientWidthWas) {
//         clearInterval(orientationChkIsInMotion);
//         orientationChkIsInMotion = null;
//         initScrn();
//         calcVertRadsFrmCentr();
//         calcReltvSpcPtsAndDraw();
//     }
// }

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
        //  - - NA RAVNI TOČKE  - - ;
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


//  - - NA RAVNI CELEGA KATALOGA PREDMETOV  - - ;
function calcReltvSpcPtsAndDraw(){ // calculate relative spacePoints, tj. od viewerja do predmetov; dela na ravni celega kataloga predmetov;
    
    // helper funkcije;

    //  - - NA RAVNI TOČKE  - - ;
    function helper(spcPt, item2Draw, constraints) {    // dela na ravni točke segmenta;
        // najprej x in y (kar tako, ni posebne logike ali namena za to);
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

        // še za z;
        z = spcPt.z - viewPoint.z;  // z in y relativiziramo;
        let yForZ = spcPt.y - viewPoint.y;
        r = (z**2 + yForZ**2)**(0.5);

        // izračun relativnega ploskovnega z in y, če gledalec ne gleda pod kotom 0 (sicer ta del ni potreben);
        if (viewngClimbAngle != 0) {
            if (yForZ > 0) {
                climbAngle = Math.asin(z/r) - viewngClimbAngle;   // pri izračunu kota, pod katerim gledamo neko točko, je treba upoštevati, kam je usmerjen pogled gledalva (viewAngle);
            } else if (yForZ < 0) {
                climbAngle = Math.PI - Math.asin(z/r) - viewngClimbAngle;
            } else if (yForZ == 0) {
                if (z < 0) climbAngle = 1.5 * Math.PI - viewngClimbAngle;
                else climbAngle = 0.5 * Math.PI - viewngClimbAngle;
            }
            
            //zdaj, ko smo dobili relativni kot, lahko izračunamo pripadajoči x in y (prostorske) relativne točke, ki bo izrisana;
            z = r * Math.sin(climbAngle);
        }

        // preverjanje SAMO PO DIMENZIJI Y ! !, ali naj gre točka (in posledično segment) v izris; false > gre v izris, privzeto je true;
        // (tako preverjanje bi moralo bit tudi za dimenzijo z);
        if (constraints.allYNegAngular) {   // če je še true, probamo, al lahko postane false;
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
        } // else allYNeg je že false, ni več treba čekirat;

        // zabeleženje točke (v vsakem primeru, ne glede na true/false pri allYNegAngular, ker recimo ti zadnja točka lahko da false in sproži izris)
        item2Draw.push(new SpacePoint(x, y, z));    // to je številka 3 spodaj (item2Draw.push(new SpacePoint(x, y, spcPt.z - viewPoint.z)););
        
        // rezultati testov preračunov zaslonskih koordinat - 
        // 1-1 prenizko; 1-2 OK   !!; 1-3 ni ok; 1-4 previsoko;
        // 2-1 previsoko; 2-2 na spodnji strani; 2-3 OK!!; 2-4 prenizko;
        // 3-1 previsoko; 3-2 spodaj; 3-3 OK !!; 3-4 prenizko;
        // 4-1 prenizko; 4-2 OK; 4-3 spodaj; 4-4 previsoko;

        // Prva cifra pomeni kalkulacijo y v spcPt2ScrnPt oz. v calcScreenPts, ki so šle takole:
                // y (na zaslonu);
                // /*1*/ scrnPt.y = scrnMidPoint.y +  Math.sin(Math.atan2(z, (y**2  + x**2 )**(1/2))) * fishFctrY;
                // /*2*/ scrnPt.y = scrnMidPoint.y +  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * fishFctrY;  // ta je ta prava
                // /*3*/ scrnPt.y = scrnMidPoint.y -  Math.sin(Math.atan2(z, (y**2  + x**2 )**(1/2))) * fishFctrY;
                // /*4*/ scrnPt.y = scrnMidPoint.y -  Math.sin(Math.atan2(-z, (y**2  + x**2 )**(1/2))) * fishFctrY;

        // druga cifra pomeni eno od teh:
        // /*1*/ item2Draw.push(new SpacePoint(x, y, spcPt.z + viewPoint.z));
        // /*2*/ item2Draw.push(new SpacePoint(x, y, -spcPt.z + viewPoint.z));
        // /*3*/ item2Draw.push(new SpacePoint(x, y, spcPt.z - viewPoint.z));
        // /*4*/ item2Draw.push(new SpacePoint(x, y, -spcPt.z - viewPoint.z));

        
    }

    // začetek dogajanja;
    let x, y, z, r, angle, climbAngle;   // prvi kot je horizontalni (narašča desno od naravnost), drugi vertikalni (narašča navpično gor od naravnost);

    // ker bomo na koncu risali, moramo na začetku vse izbrisat;
    clearCanvas();

    // določimo izhodišče pogleda in kot; slednje je odvisno od tega al landscape ali objRotate;
    const viewPoint = activeViewer.posIn3D;   // točka, iz katere gledamo;
    const viewngAngle = activeViewer.angle; // horizontalni kot pod katerim gledamo; sever (y proti neskončno) == 0; narašča na desno;
    const viewngClimbAngle = activeViewer.climbAngle; // vertikalni kot; sever (y proti neskončno) == 0; narašča navzgor;

    // - -  NA RAVNI POSAMIČNIH PREDMETOV KATALOGA PREDMETOV  - - ;
    activeItems.forEach(item => {
        // preslikava prostorskih točk na dvodimenzionalno ravnino, ..
        // ..toda ne navpično ravnino, kot je monitor, ampak vodoravno (x rase proti desno, y raste stran od gledalca);
        // kot pogleda je zelo pomemben; risanja ne moreš izvajat brez preračunavanja kota, tudi če je kot == 0,..
        // .. ker če imaš zadevo za hrbtom, tudi če gledaš direkt proti S (kot == 0), zadeve ne smeš izrisat, ker je ne moreš videt;
        

        // - -  NA RAVNI SEGMENTA  - - ;
        function oneLoop(segIdx) {   // prejme index segmenta; dela na ravni segmenta
            const item2Draw = new Array();   // item2Draw je nov objekt, da ne spreminjamo dejanskih koordinat teles v prostoru (telesa ostajajo na istih točkah),..
                                    // ..ampak da dobimo relativne koordinate glede na gledišče, ki jih podamo v item.draw;
            const constraints = {   // mora bit objekt, ker se pošlje kot argument in če bi bilo primitive, bi tamkajšnja sprememba ne veljala tu zunaj;
                allYNegAngular : true,  // beleži, ali so vse y koordinate nekega predmeta negativne, tj. gledalcu za hrbtom; če tako, ničesar ne izrišemo, ker gre le za zrcalno sliko, ki je za hrbtom;
                right : false,  // pri teleangle beleži, al je vsaj ena točka zunaj vidnega polja desno od vidnega polja;
                left : false    // isto za levo; če so vse negativne in imamo negativne (zunaj) tako levo kot desno, moramo stvar vseeno narisat, ker je treba narisat to, kar je vmes!!;
            }

            item.segments[segIdx].spcPts.forEach((spcPt) => {
                //  - - NA RAVNI TOČKE  - - ;
                helper(spcPt, item2Draw, constraints) 
            })

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
        
        // - -  NA RAVNI SEGMENTA  - - ;
        // v prvi pasaži narišemo tiste segmente, ki se narišejo vedno (BASE/undefined, lahko barvne ploskev ali samo orisi);
        for (let k = 0; k < item.segments.length; k++) {
            if (item.strokeOpacity != '00'){
                if (item.segments[k].fillInfo.typ != PROXIMAL) {
                    if (item.segments[k].fillInfo.typ != BASPROX) {
                        oneLoop(k); // če ni ne PROXIMAL ne BASPROX, gre v izris (je torej ali (base/undefined) ploskev ali pa element orisa);
                    } else {    // če je BASPROX, se je treba odločit, al ga narisat zdaj (se obnaša kot BASE), al ga zadržat za poznejše risanje (kot PROXIMAL);
                        if (isCloser(item.segments[k].fillInfo)) {
                            closerProxmls.push(k);   // ta BASPROX se obnaša kot potrjen PROXIMAL, zabeležimo; PAZI, gre direkt v closerProxmls, ne v remaining;
                        } else {
                            oneLoop(k); // ta BASPROX se obnaša kot BASE ploskEv in gre zdaj v izris;
                        }
                    }
                } else { remaining.push(k); }   // če je segment PROXIMAL, ga zabeležimo za naslednjo pasažo;
            } // else console.log('prosojno, ne delamo izračuna niti izrišemo'); // če je poteza prosojna, je brezveze sploh računat ...;
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
const activeViewer = new Viewer(0, -10, 0);

// ustvarjanje obročev
let activeItems;
let loops = [];

if (Math.random() < 0.5) {
    loops.push(new OrtgnlCircle(new SpacePoint(0, 80, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 100, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(2, 120, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(5, 140, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(10, 160, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(15, 180, 3), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(18, 200, 7), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(20, 220, 10), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(18, 240, 13), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(15, 260, 15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(13, 280, 15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(11, 300, 15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(10, 320, 15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(10, 340, 15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(10, 360, 15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(8, 380, 14), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(5, 400, 10), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 420, 5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-4, 440, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-2, 460, -5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(2, 480, -10), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(5, 500, -15), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(5, 520, -13), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(5, 540, -9), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(7, 560, -5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(10, 580, -3), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(14, 600, -2), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(18, 620, -1), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(23, 640, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(24, 660, 1), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(25, 680, 4), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(25, 700, 9), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(25, 720, 14), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(24, 740, 16), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(23, 760, 17), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(21, 780, 16), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(17, 800, 14), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(13, 820, 12), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(9, 840, 9), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(6, 860, 6), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(3, 880, 4), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(1, 900, 2), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 920, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 940, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 960, 0), 5, [true, false], new FillInfo(false)));
} else {
    loops.push(new OrtgnlCircle(new SpacePoint(0, 80, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 100, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 120, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-2, 140, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-5, 160, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-9, 180, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-14, 200, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-17, 220, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-19, 240, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-17, 260, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-14, 280, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-9, 300, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-5, 320, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-2, 340, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 360, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 380, -1), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 400, -5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 420, -7), 5, [true, false], new FillInfo(false)));    // 1
    loops.push(new OrtgnlCircle(new SpacePoint(-0.25, 440, -9,75), 5, [true, false], new FillInfo(false))); // ,95
    loops.push(new OrtgnlCircle(new SpacePoint(-1, 460, -14), 5, [true, false], new FillInfo(false)));  // ,85
    loops.push(new OrtgnlCircle(new SpacePoint(-2.5, 480, -17.5), 5, [true, false], new FillInfo(false)));  //,7
    loops.push(new OrtgnlCircle(new SpacePoint(-5, 500, -20), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-9, 520, -21), 5, [true, false], new FillInfo(false))); // ,25 konec gibanja dol levo
    loops.push(new OrtgnlCircle(new SpacePoint(-14, 540, -21), 5, [true, false], new FillInfo(false))); // 1
    loops.push(new OrtgnlCircle(new SpacePoint(-18,75, 560, -20.75), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-23, 580, -20), 5, [true, false], new FillInfo(false))); // ,85
    loops.push(new OrtgnlCircle(new SpacePoint(-26,5, 600, -18.5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-29, 620, -16), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-30, 640, -12), 5, [true, false], new FillInfo(false))); // ,25 konec gibanja gor levo
    loops.push(new OrtgnlCircle(new SpacePoint(-30, 660, -7), 5, [true, false], new FillInfo(false))); // 1
    loops.push(new OrtgnlCircle(new SpacePoint(-29.75, 680, -2.25), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-29, 700, 2), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-27.5, 720, 5.5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-25, 740, 8), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-21, 760, 9), 5, [true, false], new FillInfo(false))); // ,25 konec gibanja gor desno
    loops.push(new OrtgnlCircle(new SpacePoint(-16, 780, 9), 5, [true, false], new FillInfo(false))); // 1
    loops.push(new OrtgnlCircle(new SpacePoint(-11,25, 800, 8.75), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-7, 820, 8), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-3,5, 840, 6.5), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(-1, 860, 4), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 880, 0), 5, [true, false], new FillInfo(false))); // 0,25 konec gibanja dol desno
    loops.push(new OrtgnlCircle(new SpacePoint(0, 900, 0), 5, [true, false], new FillInfo(false)));
    loops.push(new OrtgnlCircle(new SpacePoint(0, 920, 0), 5, [true, false], new FillInfo(false)));
}
activeItems = [...loops];

const xOffst = mobile ? -5 : 0;
const zOffst = mobile ? 6 : 0;
activeItems.push(new LetterS(new SpacePoint(6 + xOffst, 60, 0 + zOffst), new FillInfo(true, BASE, '#ffffff')));
activeItems.push(new LetterT(new SpacePoint(8.2 + xOffst, 60, 0 + zOffst), new FillInfo(true, BASE, '#ffffff')));
activeItems.push(new LetterA(new SpacePoint(10.4 + xOffst, 60, 0 + zOffst), new FillInfo(true, BASE, '#ffffff')));
activeItems.push(new LetterR(new SpacePoint(12.6 + xOffst, 60, 0 + zOffst), new FillInfo(true, BASE, '#ffffff')));
activeItems.push(new LetterT(new SpacePoint(14.8 + xOffst, 60, 0 + zOffst), new FillInfo(true, BASE, '#ffffff')));

let yay = [];
let spcPtOfLast = loops[loops.length - 1].objSpcPts[0];
yay.push(new LetterY(new SpacePoint(spcPtOfLast.x + 0.55, spcPtOfLast.y + 7, spcPtOfLast.z + 1.2), new FillInfo(true, BASE, '#ffffff')));
yay.push(new LetterA(new SpacePoint(spcPtOfLast.x + 2.75, spcPtOfLast.y + 7, spcPtOfLast.z + 1.2), new FillInfo(true, BASE, '#ffffff')));
yay.push(new LetterY(new SpacePoint(spcPtOfLast.x + 4.95, spcPtOfLast.y + 7, spcPtOfLast.z + 1.2), new FillInfo(true, BASE, '#ffffff')));
yay.push(new LetterExclamationPt(new SpacePoint(spcPtOfLast.x + 7.15, spcPtOfLast.y + 7, spcPtOfLast.z + 1.2), new FillInfo(true, BASE, '#ffffff')));
activeItems = [...activeItems, ...yay]

// določimo novo vrednost spcPtOfLast, tokrat za vse elemente;
spcPtOfLast = activeItems[activeItems.length - 1].objSpcPts[0];

//  - - - - - - - - - - - - - - - - -  AKCIJA  - - - - - - - - - - - - - - - - - - - - -

let intervalChecker = null; // glavna zadeva, ki dela tik tak, da teče igra;
let isRunning = true;   // ali se igra izvaja oz. ali je ekran aktiven/odziven; z ESC gre na false in ni mogoče več zagnati, teba osvežit stran;
let mousePressIsValid = false;  // če true, pove, da je dotik v teku in da je na veljavnem mestu;
let steeringKeyIsPressd = false;
let steeringKeys = {
    left : false,
    right : false,
    keyDown : false,
    keyUp : false
};
let mouseOrTchPosOnCtrls = {
    x : 0,
    y : 0,
    btn : ''    // ta bi prazna lahko služila namesto mousePressIsValid, zdaj je to v bistvu podvojeno;
};

const distToBlck = 255; // pri kateri oddaljenosti od možička je krog že prosojen/neviden;
const fadeForYay = 128;

// začetni izris izbranega kataloga;
updLoopsShapes()
calcReltvSpcPtsAndDraw(); 

// gremo!
intervalChecker = setInterval(updtViewer, 30);

// - - - -  CONTROLS  - - - - - -

const FORWARD = "f";
const KEYUP = 'ku';
const KEYDOWN = 'kd';
const RIGHT = 'r';
const LEFT = 'l';
const CLIMB = 'c';
const DIVE = 'd';
const INVALID = 'inv';  // neveljaven klik
const ESC = 'esc'; // signal, da si pritisnil tipko esc;
const TILL_END = 'tillEnd'; // signal, da si prišel do konca igre;


//   - - - - - -    listenerji
// tipke;
document.addEventListener('keydown', atKeyDown);
document.addEventListener('keyup', atKeyUp);

// grafični gumbi;
if (!mobile) {  // če miška;
    // poslušalci za ikone krmiljenja;
    controlsCanvas.addEventListener('mousedown', (e) => {mouseDownOprtn(e)});
    controlsCanvas.addEventListener('mouseleave', (e) => {mouseLeaveOprtn(e)});
    controlsCanvas.addEventListener('mouseup', (e) => {mouseUpOprtn(e)});
    controlsCanvas.addEventListener('mousemove', (e) => {mouseMoveOprtn(e)});

    // poslušalci za drugo (info panel);
    infoSettgsContent.addEventListener('click', infoClicked);
    infoSettgsOK.addEventListener('click', infoCloseClicked);
} else { // če mobile (touch);
    controlsCanvas.addEventListener('touchstart', (e) => {touchStartOprtn(e)}, {passive : false});
    controlsCanvas.addEventListener('touchmove', (e) => {touchMoveOprtn(e)}, {passive : false});
    controlsCanvas.addEventListener('touchend', (e) => {touchEndOprtn(e)}, {passive : false});
}

//  - - - - - -    funkcije
function atKeyDown(e){
    if (e.key == 'ArrowLeft') { 
        steeringKeys.left = true;
        steeringKeyIsPressd = true; 
    } else if (e.key == 'ArrowRight') { 
        steeringKeys.right = true;
        steeringKeyIsPressd = true;
    } else if (e.key == 'ArrowUp') {
        steeringKeys.keyUp = true;
        steeringKeyIsPressd = true;
    } else if (e.key == 'ArrowDown') {
        steeringKeys.keyDown = true;
        steeringKeyIsPressd = true;
    } else if (e.key === 'Escape') {
        if (intervalChecker != null) {
            gameOver(ESC);
        }
    }
}

function atKeyUp(e) {
    if (intervalChecker != null) {
        if (e.key == 'ArrowLeft') { 
            steeringKeys.left = false;
            // če so tudi ostali false, mora it na false tudi steerinKeyIsPressd kontrolnik;
            if (!steeringKeys.right && !steeringKeys.keyUp && !steeringKeys.keyDown) steeringKeyIsPressd = false; 
        } else if (e.key == 'ArrowRight') { 
            steeringKeys.right = false;
            if (!steeringKeys.left && !steeringKeys.keyUp && !steeringKeys.keyDown) steeringKeyIsPressd = false; 
        } else if (e.key == 'ArrowUp') {
            steeringKeys.keyUp = false;
            if (!steeringKeys.left && !steeringKeys.right && !steeringKeys.keyDown) steeringKeyIsPressd = false; 
        } else if (e.key == 'ArrowDown') {
            steeringKeys.keyDown = false;
            if (!steeringKeys.left && !steeringKeys.right && !steeringKeys.keyUp) steeringKeyIsPressd = false; 
        }
    }
}

function updtViewer() { // glavna reč, da se reč dogaja, vezano na interval;
    rotateViewer(); // spremenimo kote/položaj, če pritisnjena kšna smerna tipka;
    activeViewer.move(FORWARD); // gas naprej v izračunani smeri - samo izračun;
    if (activeViewer.posIn3D.y > spcPtOfLast.y + 20) { // 20 m po YAY! je konc
        console.log(' - -  KONEC - -');
        gameOver(TILL_END);
    }
    if(activeViewer.someCounter % 10 == 0) {
        updLoopsShapes();
    }
    calcReltvSpcPtsAndDraw();   // izris
}


function rotateViewer(){
    if (mousePressIsValid || steeringKeyIsPressd) {
        let left = false, right = false, sideways = false;
        if (mouseOrTchPosOnCtrls.btn == LEFT || steeringKeys.left) {
            left = true;
            sideways = true;
        }
        if (mouseOrTchPosOnCtrls.btn == RIGHT || steeringKeys.right) {
            right = true;
            sideways = true;
        }
        if (sideways) {
            if (left && right) { /* do nuthn, če oba hkrati; */ }
            else if (left) { activeViewer.rotate(LEFT) }
            else { activeViewer.rotate(RIGHT) }
        }

        let keyUp = false, keyDown = false, climbDive = false;
        if (mouseOrTchPosOnCtrls.btn == KEYUP || steeringKeys.keyUp) {
            keyUp = true;
            climbDive = true;
        }
        if (mouseOrTchPosOnCtrls.btn == KEYDOWN || steeringKeys.keyDown) {
            keyDown = true;
            climbDive = true;
        }
        if (climbDive) {
            if (keyDown && keyUp) { /* do nuthn, če oba hkrati; */ }
            else if (keyDown) { activeViewer.rotate(CLIMB) }
            else { activeViewer.rotate(DIVE) }
        }
    }
}

function updLoopsShapes() {
    loops.forEach(loop => {
        let diff = Thingy.calcSpatialRFromSpcPt(loop.objSpcPts[0], activeViewer.posIn3D);
        // širina črte;
        // če fiksna
            // do nuthn, ker je že nastavljena;
        
        // će variabilno;
        // začnemo pri 2 (tako je verjetno nastavljeno v clasu), ker će začneš z 1 ali 1,5, je ful videt prehode na večje;
        if (diff <= 80) loop.lineWidth = 2.5;
        else if (diff <= 60) loop.lineWidth = 3;
        else if (diff <= 40) loop.lineWidth = 4;

        // neprosojnost;
        diff = diff - 30;   // -30 je zato, da je pri razdalji 30 barva že ff (polna);
        if (diff < 0) diff = 0;
        if (diff > distToBlck) diff = distToBlck;
        diff = Math.floor(255 - diff / (distToBlck / 255));
        loop.strokeOpacity = '' + decToHex(diff);
    })
    yay.forEach(ltr => {
        let diff = Thingy.calcSpatialRFromSpcPt(ltr.objSpcPts[0], activeViewer.posIn3D);

        // neprosojnost;
        diff = diff - 30;   // -30 je zato, da je pri razdalji 30 barva že ff (polna);
        if (diff < 0) diff = 0;
        if (diff > fadeForYay) diff = fadeForYay;
        diff = Math.floor(255 - diff / (fadeForYay / 255));
        ltr.strokeOpacity = '' + decToHex(diff);
    })
}

function stopTicker() {
    clearInterval(intervalChecker);
    intervalChecker = null;
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
    }
}

function mouseMoveOprtn(e) {
    if (mousePressIsValid) {
        const reslt = determineMousPosOnCtrlsCnvs(e);
        if (reslt != mouseOrTchPosOnCtrls.btn) {
            invldteCtrlsClick();
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
        if (mouseOrTchPosOnCtrls.y > 49 && mouseOrTchPosOnCtrls.y < 98) return LEFT;
        else return INVALID;
    } else if (mouseOrTchPosOnCtrls.x < 98) { // srednja tretjina; gumba za gor in dol
        if (mouseOrTchPosOnCtrls.y < 50 ) return KEYUP;
        else if (mouseOrTchPosOnCtrls.y > 97 ) return KEYDOWN;
        else return INVALID;
    } else {    // zdej že vemo da smo na zadnji, desni tretjini;
        if (mouseOrTchPosOnCtrls.y > 49 && mouseOrTchPosOnCtrls.y < 98) return RIGHT; 
        else return INVALID;
    }

}

function invldteCtrlsClick() {
    mousePressIsValid = false;
    mouseOrTchPosOnCtrls.btn = '';
}

