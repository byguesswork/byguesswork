'use strict';

// da bi najprej naredilo cel gib, šele nato računalo izvedljivost premika na novih koordinatah..
// .. ker morda skok diagonalno je možen tam, kjer skok navpično ni

const bckgndcnvs = document.getElementById('bckgnd-canvas');
const ctxBckgnd = bckgndcnvs.getContext('2d');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');       

const R = 'r';
const L = 'l';
const MAIN = 'main';
const TURN = 'turn';
const CLOUDS = 'clouds';


class Screen {
    static height = 420;
    static width = 600;
    static currScreen = 0;
    static endAnimCounter = 0; // se rabi za končno animacijo;

    static catalogue = {
        turf10_40 : {
            sx: 1,
            sy: 61,
            width: 40,
            height: 10
        },
        turf10_160 : {
            sx: 43,
            sy: 61,
            width: 160,
            height: 10
        },
        turfLevitating: {
            sx: 1,
            sy: 0,
            width: 40,
            height: 60
        }
    }

    static screens = [
        // 1 zaslon;
        {
            ovire: [
                {type: 'turfLevitating', x: 280, y: 40},
                {type: 'turfLevitating', x: 300, y: 160}, // orig 300 160
                {type: 'turfLevitating', x: 100, y: 100},
                {type: 'turfLevitating', x: 500, y: 220},
                {type: 'turfLevitating', x: 560, y: 220},
                {type: 'turfLevitating', x: 560, y: 20},
                {type: 'turfLevitating', x: 560, y: 85},
                {type: 'turfLevitating', x: 560, y: 150},
                {type: 'turfLevitating', x: 50, y: 100},
                {type: 'turfLevitating', x: -20, y: 40},
                {type: 'turfLevitating', x: -20, y: 140},
                {type: 'turfLevitating', x: -20, y: 240},
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
                {type: 'turf10_40', x: 470, y: 10},
            ],
            exits: {
                right: {
                    x: 600,
                    spritePos: {    // položaj, ki ga zavzame sprite na naslednjem ekranu, če uporabi ta izhod;
                        x: 0,
                        y: 280,
                        sx: 43
                    }
                },
                left: undefined,
            },
        },

        // 2. zaslon;
        {
            ovire: [
                {type: 'turfLevitating', x: 0, y: 220},
                {type: 'turfLevitating', x: 40, y: 220},
                {type: 'turfLevitating', x: 80, y: 220},
                {type: 'turfLevitating', x: 340, y: 260},
                {type: 'turfLevitating', x: 340, y: 170},
                {type: 'turfLevitating', x: 340, y: 80},
                {type: 'turfLevitating', x: 300, y: 80},
                {type: 'turfLevitating', x: 260, y: 80},
                {type: 'turfLevitating', x: 220, y: 80},
                {type: 'turfLevitating', x: 180, y: 80},
                {type: 'turfLevitating', x: 140, y: 80},
                {type: 'turfLevitating', x: 100, y: 80},
                {type: 'turfLevitating', x: 0, y: 30},
                {type: 'turfLevitating', x: 0, y: 125},
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
            ],
            exits: {
                right: undefined,
                left: {
                    x: -40,
                    spritePos: {    // položaj, ki ga zavzame sprite na naslednjem ekranu, če uporabi ta izhod;
                        x: 560,
                        y: 280,
                        sx: 85
                    }
                },
            },
        },
    ]

    static load() {
        const thisScreen = Screen.screens[Screen.currScreen];

        // izbrišemo ospredje;
        ctx.clearRect(0, 0, Screen.width, Screen.height);

        // naložimo ovire;
        ovire.length = 0;   // da izbrišeš vsebino;
        for(let i = 0; i < thisScreen.ovire.length; i++) {
            const type = thisScreen.ovire[i].type;
            ovire.push(new ScreenObj(thisScreen.ovire[i].x, thisScreen.ovire[i].y,
                Screen.catalogue[type].sx,
                Screen.catalogue[type].sy,
                Screen.catalogue[type].width,
                Screen.catalogue[type].height
            ))
        }

        // narišemo možička (položaj mu je vselej določen že predhodno);
        sprite.render(true);

        exits.right = thisScreen.exits.right;
        exits.left = thisScreen.exits.left;
    }

    static endAnimationPt2() {
        ctx.clearRect(390,170,200,100);
        Screen.endAnimCounter += 4;
        ctx.font = `${Screen.endAnimCounter}px serif`;
        ctx.strokeText('The End', 400, 180 + Screen.endAnimCounter)    // 48 končna
        if(Screen.endAnimCounter >= 48) {
            clearInterval(intervalIDs.endAnim);
        }
    }

    static endAnimationPt1() {
        ctx.clearRect(420, 170, 95, 175);
        ctx.drawImage(endAnimPics, (Screen.endAnimCounter % 10) * 96 + 1, 0, 94, 175, 420, 170, 94, 175);
        Screen.endAnimCounter++;
        if(Screen.endAnimCounter >= 40) {
            clearInterval(intervalIDs.endAnim);
            ctx.clearRect(420, 170, 95, 175);
            setTimeout(() => {
                Screen.endAnimCounter = 8; // velikost fonta;
                ctx.font = "8px serif";
                ctx.strokeText('The End', 400, 180 + Screen.endAnimCounter)    // 48 končna velikost fonta
                intervalIDs.endAnim = setInterval(Screen.endAnimationPt2, 60);
            }, 800);
        }
    }
}

class ScreenObj {

    constructor(xPos, yPos, sx, sy, w, h) {
        this.xPos = xPos;   // ta koordinata ima izhodišče spodaj levo
        this.yPos = yPos;   // ta koordinata ima izhodišče spodaj levo
        this.sx = sx,  // x koordinata na source sliki;
        this.sy = sy,   // y koordinata na source sliki;
        this.width = w;
        this.height = h;
        
        this.render(true);
    }

    render(toColor) {   // ali naj nariše v barvi ali v ne (če false, se izriše prozoren oz. se izbriše)
        if(toColor) {
            ctx.drawImage(assets, this.sx, this.sy, this.width, this.height, this.xPos, (Screen.height - this.yPos) - this.height, this.width, this.height)
            // console.log('vertFrams:', this.vertFrames, 'latSp:', this.latSpeed, 'vSp:', this.vertSpeed, 'x:', this.xPos, 'y:', this.yPos)  // da preverimo, kolko v višino je skočil;
        } else {
            ctx.clearRect(this.xPos, Screen.height - (this.yPos + this.height), this.width, this.height)
        }
    }
}

class Sprite extends ScreenObj {

    static maxVertSpeed = 20; // št. pikslov na frame;
    static maxVertFrames = 6; // kolko framov deluje neprekinjen pritisk tipke navzgor;
    static minVertFrames = 3;    // kolikšen je skok, če samo na kratko pritisneš navzgor; 
    static latMovtSpeedDef = 20;    // def kot definition;
    
    constructor(xPos, yPos, sx = 43) {
        super();
        // položaj in vir izrisa;
        this.xPos = xPos;   // ta koordinata ima izhodišče spodaj levo; kje na ekranu je sprite;
        this.yPos = yPos;   // ta koordinata ima izhodišče spodaj levo
        this.height = 60;
        this.width = 40;
        this.sx = sx;   // x koordinata slike sprajta na source sliki; sx v pomenu, kot ga ima v drawImage();
        this.sy = 0;   // y koordinata slike sprajta na source sliki; sy v pomenu, kot ga ima v drawImage(); je vedno 0;
        this.sxBase = 43; // ker ima sprajt več sličic, je tu shranjen sx začetne sličice, ostale se preračunajo iz te;
        // gibanje sprajta;
        this.vertSpeed = 0;
        this.vertFrames = 0; // koliko framov že poteka gibanje gor oz je že pritisnjen gumb za gor;
        this.upContinuslyPressd = false;    // če ne držiš gumba za gor, ampak ga samo na kratko pritisneš, je skok nižji;
        this.latSpeed = 0; // poz v desno, neg v levo;
    }
    
    place(xPos, yPos, sx = 43) {    // 43 - pogled v desno, 85 - v levo, 125 - naravnost v gledalca;
        this.xPos = xPos;   // ta koordinata ima izhodišče spodaj levo; kje na ekranu je sprite;
        this.yPos = yPos;   // ta koordinata ima izhodišče spodaj levo
        this.sx = sx;   // x koordinata slike sprajta na source sliki; sx v pomenu, kot ga ima v drawImage();
    }
    
    startInterval() {
        this.processChanges();
        intervalIDs.main = setInterval(() => {this.processChanges()}, 90); // 80 je normalno
        if(intervalIDs.turn != 0) { this.stopInterval(TURN); }
    }

    stopInterval(which) {
        clearInterval(intervalIDs[which]);
        intervalIDs[which] = 0;
    }

    upPressed() {
        if(this.vertSpeed == 0) {
            // console.log('- - - - -  gor - - - - ');
            this.vertSpeed = Sprite.maxVertSpeed;
            this.upContinuslyPressd = true;
            if(intervalIDs.main == 0) this.startInterval();
        }
    }

    upReleased() {
        if(this.vertSpeed > 0) {
            this.upContinuslyPressd = false;
        }
    }

    latPressed(which) {
        if(this.latSpeed == 0) {
            // console.log('- - - - -  vstran - - - - - ');
            if(which == R) {
                this.latSpeed = Sprite.latMovtSpeedDef;
                keyPressd.R = true;
            } else {
                this.latSpeed = -Sprite.latMovtSpeedDef;
                keyPressd.L = true;
            }
            if(intervalIDs.main == 0) this.startInterval();
        }
    }

    latReleased(which) {
        // console.log('- - - -  lat released - - - - - ');
        if(which == R) {
            if(this.latSpeed > 0) this.latSpeed = 0;
            keyPressd.R = false;
        } else {
            if(this.latSpeed < 0) this.latSpeed = 0;
            keyPressd.L = false;
        }
    }
    
    processVertCgh(speed, startYPos) {  // vrne true, če na koncu ugotovi, da smo zadeli oviro;
        // speed se rabi pri primerjavah (speed > 0 ) in spreminjanju this.yPos;
        // ko pa je treba pripisat novo vrednost hitrosti, jo pripišemo this.vertSpeed!!!;

        // potencialni nov vertikalni položaj;
            if(speed > 0) {
                if(this.vertFrames < Sprite.minVertFrames) {
                    this.vertFrames++;
                } else if(this.upContinuslyPressd) {
                    this.vertFrames++;  // ta vrednost je tolikera ponovitev dejanja;
                    if(this.vertFrames == Sprite.maxVertFrames) {
                        this.upContinuslyPressd = false // proxy za to, da bo to zadnji premik gor;
                    }
                } else {
                    // začnemo padat;
                    this.vertSpeed = -Sprite.maxVertSpeed; 
                    speed = -Sprite.maxVertSpeed;   // moramo tudi temu pripisat, ker spodaj je this.yPos += speed in speed mora tam imet pravo vrednost;
                }
                this.yPos += speed;
            } else {
                this.yPos += speed; // ki je že od prej negativen;
            }

            // preverjanje izvedljivosti potencialnega novega vertikalnega položaja;
            // najprej preverjanje prekoračenja po horizontali;
            const potntlObstructns = [];
    
            if(speed > 0) { // pri premiku navzgor;
                // preverjamo, če je zgornji rob sprajta (this.yPos + this.height) posegel čez spodnji rob kake ovire (ovira.yPos);
                const upprSpriteEdge = this.yPos + this.height;
                for (const ovira of ovire) {
                    if(upprSpriteEdge > ovira.yPos && (upprSpriteEdge - speed) <= ovira.yPos) { // tak vrstni red, da potencialno manj kalkulacij (eno odštevanje manj);
                        potntlObstructns.push(ovira);
                    }
                }
            } else {    // preverjanje za morebiten trk ob oviro (oporo) pri gibanju navzdol;
                for (const ovira of ovire) {
                    const oviraTopEdge = ovira.yPos + ovira.height;    // zgornji rob ovire;
                    if(startYPos >= oviraTopEdge && this.yPos < oviraTopEdge) {
                        potntlObstructns.push(ovira); // prekoračili smo po horizontali (spodnji rob sprajta skozi zgornji rob ovire);
                    }
                }
            }

            // če prekoračena horizontala, preverimo še, al se sprite in ovira prekrivata v vertikalni dimenziji, kar bi dejansko pomenilo prekoračenje;
            let obstclBordrBreachd = false;
            if(potntlObstructns.length > 0) {
                const rightEdgeX = this.xPos + this.width;
                let doBreak = false;
                for (const ovira of potntlObstructns) {
                    let x = this.xPos;
                    while (x < rightEdgeX) {
                        if(x >= ovira.xPos && x < (ovira.xPos + ovira.width)) {   // pomembno, da < (in ne <=), ker če ne se zaletiš v kot, mimo katerega palahko greš;
                            // zaznali smo oviro in to javimo;
                            obstclBordrBreachd = true;
                            x = rightEdgeX; // da končamo while;
                            doBreak = true; // da končamo tudi for-of;
                        }
                        x += 10;
                    }
                    if(doBreak) break;
                }
            }
            return obstclBordrBreachd;
    }

    chk4Support() {
        const potntlSupprt = [];
        let found = false;  // kot supportFound;
        
        // poiščemo kandidate za oporo (stvari, ki imajo zgornji rob na višini spodnjega roba sprajta);
        for (const element of ovire) {
            if((element.yPos + element.height) == this.yPos) {
                potntlSupprt.push(element);
            }
        }

        // preverimo kandidate, ali morda zares stojimo na katerem od njih in predstavlja oporo;
        if(potntlSupprt.length > 0) {
            const rightSideSupport = this.xPos + this.width - 20; // da čekiraš 10px desno (ker spodaj x = this.xPos + 10) od levega spodnjega oglišča sprajta in 10px levo od desnega oglišča;
            for (const candidate of potntlSupprt) {
                let x = this.xPos + 10;
                while (x <= rightSideSupport) {
                    if(x >= candidate.xPos && x <= (candidate.xPos + candidate.width)) {   // tuki pa mora bit <= (in ne <);
                        // potrdiliu smo, da stojimo na opori in brejknemo (vertSpeed je že 0,..
                        // ..ker vertikalni del stranskega premika med skokom je urejen na začetku provcesiranja vertikalnega gibanja in gre na 0 že tam;
                        x = rightSideSupport; // da končamo while;
                        found = true;
                    }
                    x += 10;
                }
                if(found) break; // brejknemo for zanko, da ne preiskujemo še drugih kandidatov;
            }
        }

        return found;
    }

    processLatChg(speed) {

        // potencialni nov lateralni položaj;
        this.xPos += speed;

        // preverjanje izvedljivosti potencialnega novega lateralnega položaja;
        // najprej preverjanje prekoračenja po vertikali
        const potntlObstructns = [];

        if(speed > 0) { // pri premiku v desno;
            // preverjamo, če je desni rob sprajta (this.xPos + this.width) posegel čez levi rob kake ovire (ovira.xPos, ker xPos je točka na levi);
            const xREdge = this.xPos + this.width;  // xREdge = x desnega roba;
            for (const ovira of ovire) {
                if((xREdge - speed) <= ovira.xPos && xREdge > ovira.xPos) { 
                    potntlObstructns.push(ovira);   // prekoračili smo po vertikali;
                }
            }
        } else {
            for (const ovira of ovire) {
                const oviraREdge = ovira.xPos + ovira.width;    // desni rob ovire;
                if((this.xPos + Math.abs(speed)) >= oviraREdge && this.xPos < oviraREdge) { // ker je hitrost tukaj negativna, rabimo absolutno;
                    potntlObstructns.push(ovira);   // prekoračili smo po vertikali;
                }
            }
        }

        // če prekoračena vertikala, preverimo še, al se prekriva tudi v horizontalni dimenziji;
        let obstacleBorderBreached = false;
        if(potntlObstructns.length > 0) {
            const upperY = this.yPos + this.height;
            let doBreak = false;
            for (const ovira of potntlObstructns) {
                let y = this.yPos;
                while (y < upperY) {
                    if(y >= ovira.yPos && y < (ovira.yPos + ovira.height)) {   // pomembno, da < (in ne <=), ker če ne se zaletiš v kot, ki bi ga lahko preskočil;
                        obstacleBorderBreached = true; // zaznali smo oviro in to javimo;
                        y = upperY; // da končamo while;
                        doBreak = true; // da kočamo tudi for-of;
                    }
                    y += 10;
                }
                if(doBreak) break; // ker smo našli oviro, v katero smo se zaleteli in premik ni mogoč;
            }
        }
        return obstacleBorderBreached;
    }

    processChanges() { // v smislu process the changes;

        if(this.vertSpeed != 0 || this.latSpeed != 0) { // to preverjanje je proxi za ugotovitev, da bo treba izbrisat sprajt; pred koncem te zanke ga je treba spet narisat;

            // najprej v vsakem primeru pobrišemo, kjer je bil (bo ostal) sprite;
            this.render(false);
    
            // procesiranje vertikalnega gibanja; 
            if(this.vertSpeed != 0) {
                
                // shranimo začetne vrednosti, če jih bo treba povrnit;
                const startYPos = this.yPos;
                const startVertFrames = this.vertFrames;
                const startUpContinuslyPressd = this.upContinuslyPressd;
    
                // processVertCgh vrne stanje obstacleBorderBreached; če true, premika ne moremo izvesti in moramo povrniti stanje kot pred poskusom premika;
                // če vrne false, pomeni, da je bil izveden premik skozi zrak na novo lokacijo in gibanje se še nadaljuje;
                if(this.processVertCgh(this.vertSpeed, startYPos)) {
                    // probamo s polovičnim premikom (proxy za to je polovična hitrost), a najprej povrnemo vrednosti;
                    this.yPos = startYPos;
                    this.vertFrames = startVertFrames;
                    this.upContinuslyPressd = startUpContinuslyPressd;
    
                    if(this.processVertCgh(this.vertSpeed / 2, startYPos)) {
                        // ne moremo izvest premika, povrnemo y-položaj in pozneje tudi azzeriramo ostale y vrednosti, ker smo naleteli na oviro (strop pri gibanju gor, oporo pri gibanju dol);
                        // console.log('vertikalna polovička neuspešna')
                        this.yPos = startYPos;
                    } else {
                        console.log('vertikalna polovička uspešna')
                    }
                    this.upContinuslyPressd = false;
                    this.vertFrames = 0;
                    if(this.vertSpeed < 0) {
                        this.vertSpeed = 0; // če si se gibal navzdol in našel oporo, se ustaviš;
                    } else this.vertSpeed = -Sprite.maxVertSpeed; // če si se gibal navzgor in naletel na oviro, začneš padat;
    
                } else {
                    // pri padanju navzdol preverimo, ali smo na doseženem položaju zadeli ob oporo in torej ustavimo padanje
                    // TODO - morda bi isto moralo naredit tudi pri gibanju navzgor;
                    if(this.vertSpeed < 0) {
                        if(this.chk4Support()) {
                            // najdena opora pri padanju navzdol, azzeriramo vrednosti vertikalnega gibanja;
                            console.log('pri padanju navzdol je bila najdena opora');
                            this.vertSpeed = 0;
                            this.vertFrames = 0;
                            this.upContinuslyPressd = false;
                        }
                    }
                }
    
                // padec v luknjo ...;
                if(this.yPos < -60) {
                    this.stopInterval(MAIN);
                    console.log('-  -  -  -  -  -  ')
                    console.log('-  -  - KONEC IGRE, daj F5 -  -  -  ')
                    console.log('-  -  -  -  -  -  ')
                }
            } 
            
            // procesiranje stranskega gibanja; NE SME bit na else, ker lahko imaš oba;
            if(this.latSpeed != 0) {
    
                // začetna X vrednost;
                const startXPos = this.xPos;
                let hozMovtCanDo = true;

                // processLatChg vrne stanje obstacleBorderBreached; če true, premika ne moremo izvesti in moramo povrniti stanje kot pred poskusom premika;
                // če vrne false, pomeni, da je bil izveden stranski premik na novo lokacijo in gibanje se še nadaljuje;
                if(this.processLatChg(this.latSpeed)) {
                    // probamo polovičen premik, najprej vrnemo začetno vrednost;
                    this.xPos = startXPos;
                    if(this.processLatChg(this.latSpeed / 2)) {
                        // torej tudi polovičnega premika ni mogoče izvest;
                        hozMovtCanDo = false;   // le v tem priemru gre ta na false;
                        this.xPos = startXPos;  // povrnemo začetni položaj, ker ni mogoče nikakor sprmeniti lateralnega položaja;
                    } else console.log('lateralna polovička USPELA');
                    // to pa je treba nastavit ne glede na to, al je polovička uspela, ali ne: nek rob smo pač našli in ne moremo več naprej;
                    this.latSpeed = 0;
                    this.upContinuslyPressd = false;    // proxy za to, da ne greš več navzgor (če si se zaletel, ne moreš več gor);
                }
                
                // če je stranski premik mogoč, preverimo še:
                if(hozMovtCanDo) {
    
                    // al smo morda že zapustili ekran;
                    if(exits.right != undefined && this.xPos >= exits.right.x) {
                        sprite.place(exits.right.spritePos.x, exits.right.spritePos.y, exits.right.spritePos.sx)
                        Screen.currScreen++;
                        Screen.load();
                        return;
                    } else if(exits.left != undefined && this.xPos <= exits.left.x) {
                        sprite.place(exits.left.spritePos.x, exits.left.spritePos.y, exits.left.spritePos.sx)
                        Screen.currScreen--;
                        Screen.load();
                        return;
                    } else if(this.xPos > 420 && Screen.currScreen == 1 ) {
                        // to je če si prišel do konca;
                        document.removeEventListener('keydown', keyDownHndlr);
                        this.stopInterval(MAIN);
                        this.latSpeed == 0;
                        this.render(true);
                        // začnemo animacijo;
                        setTimeout(() => {
                            intervalIDs.endAnim = setInterval(() => { Screen.endAnimationPt1() }, 90);
                        }, 500);
                        return;
                    } else {
    
                        // če nismo zapustili ekrana, preverimo, ali imamo na novem položaju oporo (tj. da nismo stopili v prazno);
                        if(this.yPos > 0 && this.vertSpeed == 0) {
                            if(!this.chk4Support()) {
                                this.vertSpeed = -Sprite.maxVertSpeed; // nismo našli opore, tj. stopili smo v prazno, sprožimo padec;
                                console.log('pri hoz preverjanju nismo našli opore, padamo')
                            }
                        }  
                    }
                }
            } // konec procesiranja lateralnega gibanja;
            
            // izbira sličice (v bistvu je odvisna od tega, ali drižiš katerega od smernih gumbov);
            if(keyPressd.R) { this.sx = this.sxBase }
            else if(keyPressd.L)  { this.sx = this.sxBase + 42 }
    
            // narišemo na novem/istem položaju;
            this.render(true);
        }

        // odločanje o ustavitvi intervala;
        // ta je zunaj delovne zanke, ker hitrosti lahko dosežejo 0 med gibanjem (ovira) ali pa zaradi izpustitve gumba za premikanje;
        if(this.latSpeed == 0 && this.vertSpeed == 0)  {
            this.stopInterval(MAIN);
            // komplikacija z zakasnjenim obračanjem;
            if(intervalIDs.turn == 0) {
                intervalIDs.turn = setTimeout(() => {
                    this.sx = this.sxBase + 84;
                    this.render(false);
                    this.render(true);
                    this.stopInterval(TURN);
                }, 300);
            }
        }

    }   // konec processChanges;
}       // konec klasa Sprajt;

function startClouds() {
    // shranit nebo za oblaki;
    cloudsStarts.skyBehindClouds = ctxBckgnd.getImageData(0, 30, Screen.width, clouds.height + 20);
    for (const cloud  of cloudsStarts.farther) {
        ctxBckgnd.drawImage(clouds, 280, 0, 193, 60, cloud, 77, 193, 60);
    }
    for (const cloud  of cloudsStarts.closer) {
        ctxBckgnd.drawImage(clouds, 0 , 0, 277, 87, cloud, 30, 277, 87);
    }
    intervalIDs.clouds = setInterval(doClouds, 420);
}

function doClouds() {
    // izrisat čisto nebo za oblaki;
    ctxBckgnd.putImageData(cloudsStarts.skyBehindClouds, 0, 30);
    intervalIDs.cloudsCounter++;
    // oddaljeni oblaki;
    if(cloudsStarts.farther.length > 0) {
        for (const cloud  of cloudsStarts.farther) {
            // tle bi moralo bit x:279 in w:194, ampak verjetno ker gre korak po 0,5, skoči za 0,5 nazaj (ali naprej) in pokaže črno črto pred ali po;
            const neki = cloud + intervalIDs.cloudsCounter * 0.6;   // ta števillka se pojavi še nekj; če je spremeniš tu, moraš še drugje;
            ctxBckgnd.drawImage(clouds, 280, 0, 193, 60, neki, 77, 193, 60);
        }
    }
    //bližnji oblaki
    if(cloudsStarts.closer.length > 0) {
        for (const cloud  of cloudsStarts.closer) {
            const neki = cloud + intervalIDs.cloudsCounter;
            ctxBckgnd.drawImage(clouds, 0 , 0, 277, 87, neki, 30, 277, 87);
        }
    }
    // čekiranje za odstranjevanje elementov;
    if(intervalIDs.cloudsCounter % 150 == 0) {
        if(cloudsStarts.closer.length > 0 && cloudsStarts.closer[cloudsStarts.closer.length - 1] + intervalIDs.cloudsCounter > Screen.width) {
            cloudsStarts.closer.pop();
        }
        if(cloudsStarts.farther.length > 0 && cloudsStarts.farther[cloudsStarts.farther.length - 1] + intervalIDs.cloudsCounter * 0.6 > Screen.width) {
            cloudsStarts.farther.pop();
        }
        console.log(cloudsStarts)
        if(cloudsStarts.farther.length == 0 && cloudsStarts.closer.length == 0) {
            clearInterval(intervalIDs.clouds);
            intervalIDs.clouds = 0;
        }
    }
}


//  -  -  -   IZVAJANJE -- -- --

bckgndcnvs.width = Screen.width;
bckgndcnvs.height = Screen.height;
canvas.width = Screen.width;
canvas.height = Screen.height;

document.addEventListener("DOMContentLoaded", positionCanvs);
document.addEventListener('keydown', keyDownHndlr);
document.addEventListener('keyup', keyUpHndlr);

const intervalIDs = {   // mora bit pred bckgndPics.onload, ker se tam rabi;
    main: 0,
    turn: 0,    // da se možiček obrne proti gledalcu, če ga X ms ne premikaš;
    clouds: 0,  // ID intervala za oblake (fiksen skozi cel zaslon);
    cloudsCounter: 0,   // števec, s katerim se oblaki premikajo naprej (se spreminja s časom);
    endAnim: 0, // ID za končno animacijo;
};

// loadanje ozadja;
const clouds = new Image(); // tu sta sliki oblakov; odvijajo se na canvasu ozadja; src določimo pozneje;
const cloudsStarts = {
    skyBehindClouds: undefined,
    farther: [-170, 220, 450],
    closer: [-270, 20, 470]
}

const bckgndPics = new Image(); // tu je slika pokrajine; prikazana je na canvasu ozadja;
bckgndPics.src = 'bckScr2.png';
bckgndPics.onload = function() {
    ctxBckgnd.drawImage(bckgndPics, 0, 0, 600, 420, 0, 0, 600, 420);
    clouds.src = 'cloud.png';
    clouds.onload = startClouds;
}

// loadanje ospredja;
const assets = new Image(); // src se naloada v handlerju positionCanvs();
const endAnimPics = new Image();    // to bi lahko spravil v assets ...;

const sprite = new Sprite(360, 10, 85); // orig: 500, 0 , 85
const ovire = [];
const exits = {
    right: undefined,
    left: undefined,
}
const keyPressd = {
    L: false,
    R: false,
}

function positionCanvs() {
    
    function helper(lesserWidth) {
        let newCenterWidth = lesserWidth - 24;  // 12 px placa L/D;
        if(newCenterWidth % 2 == 1) newCenterWidth--;   // da je sodo število;
        document.getElementsByClassName('center')[0].style.width = `${newCenterWidth}px`;
    
        const ratio = (newCenterWidth - 2) / Screen.width;  // -2, ker je treba odsštet border od canvasa, ki mora priti v center;
        const newWidth = ratio * Screen.width;
        const newHeight = ratio * Screen.height;
        bckgndcnvs.style.width = `${newWidth}px`;
        bckgndcnvs.style.height = `${newHeight}px`;
        // obenem nastavimo isto dimenzijo tudi kanvacu ospredja, čeprav je zdaj še skrit;
        canvas.style.width = `${newWidth}px`;
        canvas.style.height = `${newHeight}px`;
    }

    // preverjanje dimenzij, ali je morda treba zmanjšat canvas (pred tem pa centerwrapper);
    const lesserWidth = document.documentElement.clientWidth <= screen.width ? document.documentElement.clientWidth : screen.width;
    console.log('document.documentElement.clientWidth:', document.documentElement.clientWidth, 'screen.width:', screen.width, 'lesser', lesserWidth);
    if(lesserWidth < 624) { helper(lesserWidth) }
    
    // ker se zadeve pri spreminjanju velikosti lahko spremenijo (pojavi se kak drsnik), znova odčitamo in preverimo še enkrat;
    const newLesserWidth = document.documentElement.clientWidth <= screen.width ? document.documentElement.clientWidth : screen.width;
    console.log('document.documentElement.clientWidth:', document.documentElement.clientWidth, 'screen.width:', screen.width, 'lesser', newLesserWidth);
    if(newLesserWidth < lesserWidth) { helper(newLesserWidth) }
    console.log('širina canvasa:', bckgndcnvs.getBoundingClientRect().width - 2); // -2 ker rect upošteva tudi border, nas pa zanima canvas;

    // poravnamo delovni canvas s canvasom ozadja (da se prekrivata);
    const centerRect = document.getElementsByClassName('center')[0].getBoundingClientRect();
    const centerTop = centerRect.top;
    const centerLeft = centerRect.left;
    console.log('center top/left:', centerTop, centerLeft)
    const bckgndTop = bckgndcnvs.getBoundingClientRect().top;
    const bckgndLeft = bckgndcnvs.getBoundingClientRect().left;
    console.log('bckgndCanvas top/left:', bckgndTop, bckgndLeft)
    // ker je canvas absolute glede na center, moramo izračunat razliko (ne moremo mu določit top in left absolutno gledano, ampak relativno na center);
    const canvasTop = bckgndTop - centerTop;
    const canvasLeft = bckgndLeft - centerLeft; 
    canvas.style.display = 'unset';    // prej mora bit skrit, sicer vpliva na postavitev ozadnega canvasa, ki se potem premakne po premiku tega;
    canvas.style.top = `${canvasTop}px`;
    canvas.style.left = `${canvasLeft}px`;
    
    assets.src = 'sprites3.png';
    assets.onload = function() {
        // naložimo cel zaslon (ospredje);
        Screen.load(); // currScreen je po defaultu 0;
        // tle lahko leno nalagamo endAnim slikce;
        endAnimPics.src = 'sprites2.jpg';
    }
}

function keyDownHndlr(e) {
    // console.log(e)
    if(e.key == 'ArrowUp') {
        e.preventDefault();
        sprite.upPressed();
    } else if(e.key == 'ArrowRight') {
        e.preventDefault();
        sprite.latPressed(R);
    } else if(e.key == 'ArrowLeft') {
        e.preventDefault();
        sprite.latPressed(L);
    } else if(e.key == 'Escape') {
        if(intervalIDs.main != 0) { sprite.stopInterval(MAIN); }
    }
}

function keyUpHndlr(e) {
    if(e.key == 'ArrowUp') {
        sprite.upReleased();
    } else if(e.key == 'ArrowRight') {
        sprite.latReleased(R);
    } else if (e.key == 'ArrowLeft') {
        sprite.latReleased(L);
    }
}


