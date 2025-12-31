'use strict';


// tetris popravit linke
// tetris naredit, da je no click
// oblaki već njih
// konec igre
// mal pavze pred animPt2


//  -  -  -  -  -  -  -  
const bckgndcnvs = document.getElementById('bckgnd-canvas');
const ctxBckgnd = bckgndcnvs.getContext('2d');
const canvas2 = document.getElementById('canvas2');
const ctx2 = canvas2.getContext('2d');       

const R = 'r';
const L = 'l';
const MAIN = 'main';
const TURN = 'turn';


class Screen {
    static height = 420;
    static width = 600;
    static currScreen = 0;
    static counter = 0; // se rabi za končno animacijo;

    static screens = [
        // 1 zaslon;
        {
            ovire: [
                {x: 280, y: 40},
                {x: 300, y: 160},
                {x: 100, y: 100},
                {x: 500, y: 220},
                {x: 560, y: 220},
                {x: 560, y: 0},
                {x: 560, y: 80},
                {x: 560, y: 140},
                {x: 50, y: 100},
                {x: -20, y: 40},
                {x: -20, y: 140},
                {x: -20, y: 240},
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
                {x: 0, y: 220},
                {x: 40, y: 220},
                {x: 80, y: 220},
                {x: 340, y: 260},
                {x: 340, y: 170},
                {x: 340, y: 80},
                {x: 300, y: 80},
                {x: 260, y: 80},
                {x: 220, y: 80},
                {x: 180, y: 80},
                {x: 140, y: 80},
                {x: 100, y: 80},
                {x: 0, y: 30},
                {x: 0, y: 125},
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
        ctx2.clearRect(0, 0, Screen.width, Screen.height);

        // naložimo ovire;
        ovire.length = 0;   // da izbrišeš vsebino;
        for(let i = 0; i < thisScreen.ovire.length; i++) {
            ovire.push(new ScreenObj(thisScreen.ovire[i].x, thisScreen.ovire[i].y))
        }

        // narišemo možička (položaj mu je vselej določen že predhodno);
        sprite.render(true);

        exits.right = thisScreen.exits.right;
        exits.left = thisScreen.exits.left;
    }

    static endAnimationPt2() {
        ctx2.clearRect(390,170,200,100);
        Screen.counter += 4;
        ctx2.font = `${Screen.counter}px serif`;
        ctx2.strokeText('The End', 400, 180 + Screen.counter)    // 48 končna
        if(Screen.counter >= 48) {
            clearInterval(intervalIDs.endAnim);
        }
    }

    static endAnimationPt1() {
        ctx2.clearRect(420, 170, 95, 175);
        ctx2.drawImage(endAnimPics, (Screen.counter % 10) * 96 + 1, 0, 94, 175, 420, 170, 94, 175);
        Screen.counter++;
        if(Screen.counter >= 40) {
            clearInterval(intervalIDs.endAnim);
            ctx2.clearRect(420, 170, 95, 175);
            setTimeout(() => {
                Screen.counter = 8; // velikost fonta;
                ctx2.font = "8px serif";
                ctx2.strokeText('The End', 400, 180 + Screen.counter)    // 48 končna velikost fonta
                intervalIDs.endAnim = setInterval(Screen.endAnimationPt2, 60);
            }, 800);
        }
    }
}

class ScreenObj {

    constructor(xPos, yPos, sx = 1, sy = 0) {
        this.xPos = xPos;   // ta koordinata ima izhodišče spodaj levo
        this.yPos = yPos;   // ta koordinata ima izhodišče spodaj levo
        this.sx = sx,  // x koordinata na source sliki;
        this.sy = sy,   // y koordinata na source sliki;
        this.height = 60;
        this.width = 40;
        
        this.render(true);
    }

    render(toColor) {   // ali naj nariše v barvi ali v ne (če false, se izriše prozoren oz. se izbriše)
        if(toColor) {
            ctx2.drawImage(assets, this.sx, this.sy, this.width, this.height, this.xPos, (Screen.height - this.yPos) - this.height, this.width, this.height)
            // console.log('vert frames:', this.vertFrames, this.yPos)  // da preverimo, kolko v višino je skočil;
        } else {
            ctx2.clearRect(this.xPos, Screen.height - (this.yPos + this.height), this.width, this.height)
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
            if(which == R) this.latSpeed = Sprite.latMovtSpeedDef;
                else this.latSpeed = -Sprite.latMovtSpeedDef;
            if(intervalIDs.main == 0) this.startInterval();
        }
    }

    latReleased(which) {
        if(which == R) {
            if(this.latSpeed > 0) this.latSpeed = 0;
        } else {
            if(this.latSpeed < 0) this.latSpeed = 0;
        }
    }
    
    processChanges() { // v smislu process the changes;

        // najprej v vsakem primeru pobrišemo, kjer je bil (bo ostal) sprite; bis e dalo izboljšat, da se ta korak ne bi izvajal, ampak vprašanje, al se procesno izplača;
        this.render(false);
        let exited = false;

        // procesiranje vertikalnega gibanja; 
        if(this.vertSpeed != 0) {
            
            const startYPos = this.yPos;  // shranimo začetno vrednost, če jo bo treba povrnit;

            // potencialni nov vertikalni položaj;
            if(this.vertSpeed > 0) {
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
                }
                this.yPos += this.vertSpeed;
            } else {
                this.yPos += this.vertSpeed; // ki je že od prej negativen;
                if(this.yPos <= 0) {
                    if(this.yPos < 0) this.yPos = 0;
                    this.vertFrames = 0;
                    this.vertSpeed = 0;
                }
            }

            // preverjanje izvedljivosti potencialnega novega vertikalnega položaja;
            // najprej preverjanje prekoračenja po horizontali;
            const potntlObstructns = [];
            let isDownwards = true; // ali smo na oviro naleteli pri gibanju navzdol;
    
            if(this.vertSpeed > 0) { // pri premiku navzgor;
                // preverjamo, če je zgornji rob sprajta (this.yPos + this.height) posegel čez spodnji rob kake ovire (ovira.yPos);
                const upprSpriteEdge = this.yPos + this.height;
                for (const ovira of ovire) {
                    if(upprSpriteEdge > ovira.yPos && (upprSpriteEdge - Sprite.maxVertSpeed) <= ovira.yPos) { // tak vrstni red, da potencialno manj kalkulacij (eno odštevanje manj);
                        potntlObstructns.push(ovira);
                        isDownwards = false;
                    }
                }
            } else {    // preverjanje za morebiten trk ob oviro pri gibanju navzdol;
                for (const ovira of ovire) {
                    const oviraTopEdge = ovira.yPos + ovira.height;    // zgornji rob ovire;
                    if(startYPos >= oviraTopEdge && this.yPos < oviraTopEdge) {
                        potntlObstructns.push(ovira); // prekoračili smo po horizontali (spodnji rob sprajta skozi zgornji rob ovire);
                    }
                }
            }

            // če prekoračena horizontala, preverimo še, al se sprite in ovira prekrivata v vertikalni dimenziji, kar bi dejansko pomenilo prekoračenje;
            if(potntlObstructns.length > 0) {
                const rightEdgeX = this.xPos + this.width;
                let doBreak = false;
                for (const ovira of potntlObstructns) {
                    let x = this.xPos;
                    while (x < rightEdgeX) {
                        if(x >= ovira.xPos && x < (ovira.xPos + ovira.width)) {   // pomembno, da < (in ne <=), ker če ne se zaletiš v kot, mimo katerega palahko greš;
                            // ne moremo izvest premika, povrnemo y-položaj in azzeriramo ostale y vrednosti, ker smo nasedli;
                            this.yPos = startYPos;
                            this.upContinuslyPressd = false;
                            this.vertFrames = 0;
                            if(isDownwards) this.vertSpeed = 0; // če si se gibal navzdol in našel oporo, se ustaviš;
                                else this.vertSpeed = -Sprite.maxVertSpeed; // če si se gibal navzgor in naletel na oviro, začneš padat;
                            x = rightEdgeX; // da končamo while;
                            doBreak = true; // da kočamo tudi for-of;
                        }
                        x += 10;
                    }
                    if(doBreak) break;
                }
            }
        }

        // procesiranje stranskega gibanja;
        if(this.latSpeed != 0) {

            // začetna X vrednost;
            const startXPos = this.xPos;

            // potencialni nov lateralni položaj;
            this.xPos += this.latSpeed;

            // preverjanje izvedljivosti potencialnega novega lateralnega položaja;
            let hozMovtCanDo = true;
            // najprej preverjanje prekoračenja po vertikali
            const potntlObstructns = [];
    
            if(this.latSpeed > 0) { // pri premiku v desno;
                // preverjamo, če je desni rob sprajta (this.xPos + this.width) posegel čez levi rob kake ovire (ovira.xPos, ker xPos je točka na levi);
                const xREdge = this.xPos + this.width;  // xREdge = x desnega roba;
                for (const ovira of ovire) {
                    if((xREdge - Sprite.latMovtSpeedDef) <= ovira.xPos && xREdge > ovira.xPos) { 
                        potntlObstructns.push(ovira);   // prekoračili smo po vertikali;
                    }
                }
            } else {
                for (const ovira of ovire) {
                    const oviraREdge = ovira.xPos + ovira.width;    // desni rob ovire;
                    if((this.xPos + Sprite.latMovtSpeedDef) >= oviraREdge && this.xPos < oviraREdge) {
                        potntlObstructns.push(ovira);   // prekoračili smo po vertikali;
                    }
                }
            }

            // če prekoračena vertikala, preverimo še, al se prekriva tudi v horizontalni dimenziji;
            if(potntlObstructns.length > 0) {
                const upperY = this.yPos + this.height;
                let doBreak = false;
                for (const ovira of potntlObstructns) {
                    let y = this.yPos;
                    while (y < upperY) {
                        if(y >= ovira.yPos && y < (ovira.yPos + ovira.height)) {   // pomembno, da < (in ne <=), ker če ne se zaletiš v kot, ki bi ga lahko preskočil;
                            hozMovtCanDo = false;
                            this.xPos = startXPos; // ne moremo izvest premika;
                            this.latSpeed = 0;
                            this.upContinuslyPressd = false;    // proxy za to, da ne greš več navzgor (če si se zaletel, ne moreš več gor);
                            y = upperY; // da končamo while;
                            doBreak = true; // da kočamo tudi for-of;
                        }
                        y += 10;
                    }
                    if(doBreak) break; // ker smo našli oviro, v katero smo se zaleteli in premik ni mogoč;
                }
            }

            // če je stranski premik mogoč, preverimo še:
            if(hozMovtCanDo) {

                // al smo morda že zapustili ekran;
                if(exits.right != undefined && this.xPos >= exits.right.x) {
                    sprite.place(exits.right.spritePos.x, exits.right.spritePos.y, exits.right.spritePos.sx)
                    Screen.currScreen++;
                    Screen.load();
                    exited = true;
                } else if(exits.left != undefined && this.xPos <= exits.left.x) {
                    sprite.place(exits.left.spritePos.x, exits.left.spritePos.y, exits.left.spritePos.sx)
                    Screen.currScreen--;
                    Screen.load();
                    exited = true;
                } else if(this.xPos > 420 && Screen.currScreen == 1 ) {
                    // to je če si priššel do konca;
                    exited = true; // proxy da ne procesira več te metode;
                    document.removeEventListener('keydown', keyDownHndlr);
                    this.stopInterval(MAIN);
                    this.latSpeed == 0;
                    this.render(true);
                    // začnemo animacijo;
                    setTimeout(() => {
                        intervalIDs.endAnim = setInterval(() => { Screen.endAnimationPt1() }, 90);
                    }, 500);
                } else {

                    // če nismo zapustili ekrana, preverimo, ali imamo na novem položaju oporo (tj. da nismo stopili v prazno);
                    if(this.yPos > 0 && this.vertSpeed == 0) {
    
                        // poiščemo, ali obstajajo stvari, ki imajo zgornji rob na višini spodnjega roba sprajta;
                        const potntlSupprt = [];
        
                        for (const element of ovire) {
                            if((element.yPos + element.height) == this.yPos) {
                                potntlSupprt.push(element);
                            }
                        }
        
                        if(potntlSupprt.length > 0) {
            
                            // iščemo oporo;
                            const rightSideSupport = this.xPos + this.width - 20; // da čekiraš 10px desno (ker spodaj x = this.xPos + 10) od levega spodnjega oglišča sprajta in 10px levo od desnega oglišča;
                            let found = false;
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
                            if(!found) this.vertSpeed = -Sprite.maxVertSpeed; // noben kandidat za oporo ni zares opora, pademo;
                        } else this.vertSpeed = -Sprite.maxVertSpeed; // nismo dobili kandidata za predmet, ki bi lahko nudil talno oporo sprajtu;
                    }  
                }
            }
        } // konec procesiranja leteralnega gibanja;
        
        if(!exited) {
            // izbira sličice + odločanje o ustavitvi intervala;
            if(this.latSpeed > 0) { this.sx = this.sxBase }
            else if(this.latSpeed < 0)  { this.sx = this.sxBase + 42 }
            else if(this.latSpeed == 0 && this.vertSpeed == 0)  {
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
    
            // narišemo na novem/istem položaju;
            this.render(true);
        }

    }   // konec processChanges;
}       // konec klasa Sprajt;

function startClouds() {
    // shranit nebo za oblaki;
    behindClouds = ctxBckgnd.getImageData(0, 30, Screen.width, clouds.height + 30);
    for (const cloud  of cloudsStarts.farther) {
        ctxBckgnd.drawImage(clouds, 280, 0, 193, 60, cloud, 87, 193, 60);
    }
    for (const cloud  of cloudsStarts.closer) {
        ctxBckgnd.drawImage(clouds, 0 , 0, 277, 87, cloud, 30, 277, 87);
    }
    intervalIDs.clouds = setInterval(doClouds, 420);
}

function doClouds() {
    // izrisat čisto nebo za oblaki;
    ctxBckgnd.putImageData(behindClouds, 0, 30);
    intervalIDs.cloudsCounter++;
    // oddaljeni oblaki;
    if(cloudsStarts.farther.length > 0) {
        for (const cloud  of cloudsStarts.farther) {
            // tle bi moralo bit x:279 in w:194, ampak verjetno ker gre korak po 0,5, skoči za 0,5 nazaj (ali naprej) in pokaže črno črto pred ali po;
            const neki = cloud + intervalIDs.cloudsCounter * 0.7;
            ctxBckgnd.drawImage(clouds, 280, 0, 193, 60, neki, 87, 193, 60);
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
        if(cloudsStarts.farther.length > 0 && cloudsStarts.farther[cloudsStarts.farther.length - 1] + intervalIDs.cloudsCounter * 0.7 > Screen.width) {
            cloudsStarts.farther.pop();
        }
        console.log(cloudsStarts)
        if(cloudsStarts.farther.length == 0 && cloudsStarts.closer.length == 0) {
            clearInterval(intervalIDs.clouds);
        }
    }
}


//  -  -  -   IZVAJANJE -- -- --

document.addEventListener("DOMContentLoaded", positionCanvs);
document.addEventListener('keydown', keyDownHndlr);
document.addEventListener('keyup', keyUpHndlr);

bckgndcnvs.width = Screen.width;
bckgndcnvs.height = Screen.height;
canvas2.width = Screen.width;
canvas2.height = Screen.height;

const intervalIDs = {   // mora bit pred bckgndPics.onload, ker se tam rabi;
    main: 0,
    turn: 0,    // da se možiček obrne proti gledalcu, če ga X ms ne premikaš;
    clouds: 0,  // ID intervala za oblake (fiksen skozi cel zaslon);
    cloudsCounter: 0,   // števec, s katerim se oblaki premikajo naprej (se spreminja s časom);
    endAnim: 0, // ID za končno animacijo;
};

const bckgndPics = new Image();
bckgndPics.src = 'bckScr2.png';
const clouds = new Image();
let behindClouds;
const cloudsStarts = {
    farther: [-170, 220, 450],
    closer: [-270, 20, 470]
}
bckgndPics.onload = function() {
    ctxBckgnd.drawImage(bckgndPics, 0, 0, 600, 420, 0, 0, 600, 420);
    clouds.src = 'cloud.png';
    clouds.onload = startClouds;
}

const assets = new Image();
assets.src = 'sprites3.png';
let endAnimPics = new Image();

const sprite = new Sprite(500, 0, 85);
const ovire = [];
const exits = {
    right: undefined,
    left: undefined,
}


function positionCanvs() {
    // poravnamo delovni canvas s sanvasom ozadja;
    let left = bckgndcnvs.getBoundingClientRect().left;
    let top = bckgndcnvs.getBoundingClientRect().top;
    canvas2.style.display = 'unset';    // prej mora bit skrit, sicer vpliva na postavitev ozadnega canvasa, ki se potem premakne po premiku tega;
    canvas2.style.top = `${top}px`;
    canvas2.style.left = `${left}px`;
    
    assets.onload = function() {
        // naložimo cel zaslon (ospredje);
        Screen.load(); // currScreen je po defaultu 0;
        // tle lahko leno nalagamo endAnim slikec;
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


