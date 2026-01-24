'use strict';

class ScreenObj {

    static #ctx;
    static #assets;
    static #screenH; // screen height;

    constructor(xPos, yPos, sx, sy, w, h, drawAtInstantiation = true) {
        this.xPos = xPos;   // ta koordinata ima izhodišče spodaj levo
        this.yPos = yPos;   // ta koordinata ima izhodišče spodaj levo
        this.sx = sx,  // x koordinata na source sliki;
        this.sy = sy,   // y koordinata na source sliki;
        this.width = w;
        this.height = h;
        
        if(drawAtInstantiation) this.render(true);
    }

    static meetData(ctx, assets, screenH) {
        ScreenObj.#ctx = ctx;
        ScreenObj.#assets = assets;
        ScreenObj.#screenH = screenH;
    }

    render(visible) {   // ali naj nariše viden ali ne (če false, se izriše prozoren oz. se izbriše)
        if(visible) {
            ScreenObj.#ctx.drawImage(ScreenObj.#assets, this.sx, this.sy, this.width, this.height, this.xPos, (ScreenObj.#screenH - this.yPos) - this.height, this.width, this.height)
            // console.log('vertFrams:', this.vertFrames, 'latSp:', this.latSpeed, 'vSp:', this.vertSpeed, 'x:', this.xPos, 'y:', this.yPos)  // da preverimo, kolko v višino je skočil;
        } else {
            ScreenObj.#ctx.clearRect(this.xPos, ScreenObj.#screenH - (this.yPos + this.height), this.width, this.height)
        }
    }
}



class Sprite extends ScreenObj {

    static maxVertSpeed = 20; // št. pikslov na frame;
    static maxVertFrames = 6; // kolko framov deluje neprekinjen pritisk tipke navzgor;
    static minVertFrames = 3;    // kolikšen je skok, če samo na kratko pritisneš navzgor; 
    static latMovtSpeedDef = 20;    // def kot definition;

    // vrednosti za sx za spritesheet
    static look = {
        left: 85,
        right: 43,
        straight: 127,
    }
    
    constructor(xPos, yPos, sx = Sprite.look.right) {
        super(xPos, yPos, sx, 0, 40, 60, false);    // mora bit false, ker ko kličemo new Sprite (kot je trenutno) je to pred nalaganjem img-jev, ki so vir izrisa;
            // ima tudi this.sx, .sy, .width (40), .height (60), določeno s super zgoraj;
        // gibanje sprajta;
        this.vertSpeed = 0; // v px; število pikslov, koliko se sprajt premakne navzgor (poz)/navzdol (neg) v enem turnu;
        this.vertFrames = 0; // koliko framov že poteka gibanje gor oz je že pritisnjen gumb za gor;
        this.upContinuslyPressd = false;    // če ne držiš gumba za gor, ampak ga samo na kratko pritisneš, je skok nižji;
        this.xAtStartJmp = 0;   // za odločanje o tem, al se je lik zaletel med skokom;
        this.latSpeed = 0; // poz v desno, neg v levo; št. pikslov (px), klikor se sprajt premakne L/D v enem turnu;
        this.specialCase = false;
    }
    
    meetScreen(screen) {
        this.screen = screen;   // prejme class GameScreen;
    }

    place(xPos, yPos, sx = Sprite.look.right) {
        this.xPos = xPos;   // ta koordinata ima izhodišče spodaj levo; kje na ekranu je sprite;
        this.yPos = yPos;   // ta koordinata ima izhodišče spodaj levo
        this.sx = sx;   // x koordinata slike sprajta na source sliki; sx v pomenu, kot ga ima v drawImage();
    }
    
    startInterval(/*who*/) {
        // console.log(who); // koristno za debuganje
        this.processChanges();
        intervalIDs.main = setInterval(() => {this.processChanges()}, intrvlLen); // 90 je normalno za desktop;
        if(intervalIDs.turn != 0) { this.stopInterval(TURN); }
    }

    stopInterval(which) {
        clearInterval(intervalIDs[which]);
        intervalIDs[which] = 0;
    }

    stopMvmtAndInterval() { // se rabi pri prehodu na drug zaslon;
        this.latSpeed = 0;
        this.vertSpeed = 0;
        this.vertFrames = 0;
        this.upContinuslyPressd = false;
        if(intervalIDs.main != 0) this.stopInterval(MAIN);
    }

    stopListeners() {
        if(!mobile) document.removeEventListener('keydown', keyDownHndlr);
        else {
            ctrlsCnvs.removeEventListener('touchstart', touchStartHndlr, {passive : false});
            ctrlsCnvs.removeEventListener('touchend', touchEndHndlr, {passive : false});
            ctrlsCnvs.removeEventListener('touchmove', touchMoveHndlr, {passive : false});
        }
    }

    stopIntervalAndListnrs(){ // se rabi pri game over (padec v luknjo ...) ali če prideš do konca;
        this.stopListeners();
        this.stopInterval(MAIN);
    }

    upPressed() {
        ctrlPressd.up = true;
        if(this.vertSpeed == 0) {
            this.vertSpeed = Sprite.maxVertSpeed;
            this.upContinuslyPressd = true;
            if(intervalIDs.main == 0) this.startInterval(/*'up'*/);
        }
    }

    upReleased() {
        ctrlPressd.up = false;
        if(this.vertSpeed > 0) {
            this.upContinuslyPressd = false;
        }
    }

    latPressed(which) {
        ctrlPressd[which] = true;
        if(this.latSpeed == 0) {    
            this.latSpeed = which == RIGHT ? Sprite.latMovtSpeedDef : -Sprite.latMovtSpeedDef;
            if(intervalIDs.main == 0) this.startInterval(/* which */);
        }
    }

    latReleased(which) {
        ctrlPressd[which] = false;
        this.latSpeed = 0;
    }
    
    processVertCgh(speed, startYPos) {  // vrne false, če na koncu ugotovi, da smo zadeli oviro (false kot premik ni mogoč);
        // speed se rabi pri primerjavah (speed > 0 ) in spreminjanju this.yPos;
        // ko pa je treba pripisat novo vrednost hitrosti, jo pripišemo this.vertSpeed!!!;

        // potencialni nov vertikalni položaj;
        if(speed > 0) {
            if(this.vertFrames < Sprite.minVertFrames) {
                this.vertFrames++;
                if(this.vertFrames == 1) {
                    this.xAtStartJmp = this.xPos;   // zabeležimo si, kje je bil lik, ko se je skok začel; zadošča, če vrednost pripisujem izključno tu, ker je itak vezano na frames, ki je urejana;
                }
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
        }
        this.yPos += speed; // hitrost je lahko poz ali neg (to če že padamo al če smo začeli padat), v vsakem primeru jo prištejemo;

        // preverjanje izvedljivosti potencialnega novega vertikalnega položaja;
        // najprej preverjanje prekoračenja po horizontali;
        const potntlObstructns = [];

        if(speed > 0) { // pri premiku navzgor;
            // preverjamo, če je zgornji rob sprajta (this.yPos + this.height) posegel čez spodnji rob kake ovire (ovira.yPos);
            const upprSpriteEdge = this.yPos + this.height;
            for (const ovira of this.screen.currScreen.items_static) {
                if(upprSpriteEdge > ovira.yPos && (upprSpriteEdge - speed) <= ovira.yPos) { // tak vrstni red, da potencialno manj kalkulacij (eno odštevanje manj);
                    potntlObstructns.push(ovira);
                }
            }
        } else {    // preverjanje za morebiten trk ob oviro (oporo) pri gibanju navzdol;
            for (const ovira of this.screen.currScreen.items_static) {
                const oviraTopEdge = ovira.yPos + ovira.height;    // zgornji rob ovire;
                if(startYPos >= oviraTopEdge && this.yPos < oviraTopEdge) {
                    potntlObstructns.push(ovira); // prekoračili smo po horizontali (spodnji rob sprajta skozi zgornji rob ovire);
                }
            }
        }

        // če prekoračena horizontala, preverimo še, al se sprite in ovira prekrivata v vertikalni dimenziji, kar bi dejansko pomenilo prekoračenje;
        if(potntlObstructns.length > 0) {
            const rightEdgeX = this.xPos + this.width;
            for (const ovira of potntlObstructns) {
                let x = this.xPos;
                while (x < rightEdgeX) {
                    if(x >= ovira.xPos && x < (ovira.xPos + ovira.width)) {   // pomembno, da < (in ne <=), ker če ne se zaletiš v kot, mimo katerega palahko greš;
                        return false;  // zaznali smo oviro in javimo, da premik ni mogoč (false);
                    }
                    x += 10;
                }
            }
        }
        return true;
    }

    chk4Support() {
        const potntlSupprt = [];
        
        // poiščemo kandidate za oporo (stvari, ki imajo zgornji rob na višini spodnjega roba sprajta);
        for (const element of this.screen.currScreen.items_static) {
            if((element.yPos + element.height) == this.yPos) {
                potntlSupprt.push(element);
            }
        }

        // preverimo kandidate, ali morda zares stojimo na katerem od njih in predstavlja oporo;
        if(potntlSupprt.length > 0) {
            const rightSideSupport = this.xPos + this.width - 10; // da čekiraš 10px desno (ker spodaj x = this.xPos + 10) od levega spodnjega oglišča sprajta in 10px levo od desnega oglišča;
            for (const candidate of potntlSupprt) {
                let x = this.xPos + 10;
                while (x <= rightSideSupport) {
                    if(x >= candidate.xPos && x <= (candidate.xPos + candidate.width)) {   // tuki pa mora bit <= (in ne <);
                        // potrdiliu smo, da stojimo na opori in returnamo (vertSpeed je že 0,..
                        // ..ker vertikalni del stranskega premika med skokom je urejen na začetku provcesiranja vertikalnega gibanja in gre na 0 že tam;
                        return true;
                    }
                    x += 10;
                }
            }
        }
        return false;
    }

    processLatChg(speed, startXPos) { // dela 2 stvari: splošne preračune, na koncu pa vrne, al je tak premik mogoč;

        // potencialni nov lateralni položaj;
        this.xPos += speed;

        // preverjanje izvedljivosti potencialnega novega lateralnega položaja;
        // najprej preverjanje prekoračenja po vertikali
        const potntlObstructns = [];

        if(speed > 0) { // pri premiku v desno;
            // preverjamo, če je desni rob sprajta (this.xPos + this.width) posegel čez levi rob kake ovire (ovira.xPos, ker xPos je točka na levi);
            const xREdge = this.xPos + this.width;  // xREdge = x desnega roba sprajta;
            for (const ovira of this.screen.currScreen.items_static) {
                if(startXPos <= ovira.xPos && xREdge > ovira.xPos) { 
                    potntlObstructns.push(ovira);   // prekoračili smo po vertikali;
                }
            }
        } else {
            for (const ovira of this.screen.currScreen.items_static) {
                const oviraREdge = ovira.xPos + ovira.width;    // desni rob ovire;
                if(startXPos >= oviraREdge && this.xPos < oviraREdge) {
                    potntlObstructns.push(ovira);   // prekoračili smo po vertikali;
                }
            }
        }

        // če prekoračena vertikala, preverimo še, al se prekriva tudi v horizontalni dimenziji;
        if(potntlObstructns.length > 0) {
            const upperY = this.yPos + this.height;
            for (const ovira of potntlObstructns) {
                let y = this.yPos;
                while (y < upperY) {
                    if(y >= ovira.yPos && y < (ovira.yPos + ovira.height)) {   // pomembno, da < (in ne <=), ker če ne se zaletiš v kot, ki bi ga lahko preskočil;
                        return false; // zaznali smo oviro in to javimo (false kot premika ni mogoče izvesti);
                    }
                    y += 10;
                }
            }
        }
        return true;
    }

    processChanges() { // v smislu process the changes;

        // console.log('vFrms:', this.vertFrames, 'contPr', this.upContinuslyPressd, 'vSp', this.vertSpeed, 'lSp', this.latSpeed, /* 'x:', this.xPos, */ 'y:', this.yPos, 'ID', intervalIDs.main);

        if(this.vertSpeed != 0 || this.latSpeed != 0) { // to preverjanje je proxi za ugotovitev, da bo treba izbrisat sprajt; pred koncem te zanke ga je treba spet narisat;

            // najprej v vsakem primeru pobrišemo, kjer je bil (bo ostal) sprite;
            this.render(false);
    
            // procesiranje vertikalnega gibanja; 
            if(this.vertSpeed != 0) {
                
                // shranimo začetne vrednosti, če jih bo treba povrnit;
                const startYPos = this.yPos;
                const startVertFrames = this.vertFrames;
                const startUpContinuslyPressd = this.upContinuslyPressd;
    
                // processVertCgh izvede vertikalni premik in vrne false, če premika ne moremo izvesti in moramo povrniti stanje kot pred poskusom premika;
                // če vrne true, pomeni, da je bil izveden premik skozi zrak na novo lokacijo in gibanje se še nadaljuje;
                if(!this.processVertCgh(this.vertSpeed, startYPos)) {
                    // probamo s polovičnim premikom (proxy za to je polovična hitrost), a najprej povrnemo vrednosti;
                    this.yPos = startYPos;
                    this.vertFrames = startVertFrames;
                    this.upContinuslyPressd = startUpContinuslyPressd;
    
                    if(!this.processVertCgh(this.vertSpeed / 2, startYPos)) {
                        // ne moremo izvest premika, povrnemo y-položaj in pozneje tudi azzeriramo ostale y vrednosti, ker smo naleteli na oviro (strop pri gibanju gor, oporo pri gibanju dol);
                        this.yPos = startYPos;
                    }
                    // te pa moramo, ko enkrat začnemo iskat polovičko, naredit, ne glede na to, al je polovička uspela ali ne;
                    this.upContinuslyPressd = false;
                    this.vertFrames = 0;
                    if(this.vertSpeed < 0) {
                        this.vertSpeed = 0; // če si se gibal navzdol in našel oporo, se ustaviš;
                    } else this.vertSpeed = -Sprite.maxVertSpeed; // če si se gibal navzgor in naletel na oviro, začneš padat;
    
                } else {
                    // pri padanju navzdol preverimo, ali smo na doseženem položaju zadeli ob oporo in torej ustavimo padanje
                    if(this.vertSpeed < 0) {
                        if(this.chk4Support()) {
                            // najdena opora pri padanju navzdol, azzeriramo vrednosti vertikalnega gibanja;
                            this.vertSpeed = 0;
                            this.vertFrames = 0;
                            this.upContinuslyPressd = false;
                        }
                    }
                }
            } 
            
            // procesiranje stranskega gibanja; NE SME bit na else, ker lahko imaš oba;
            if(this.latSpeed != 0) {
    
                // začetna X vrednost;
                const startXPos = this.xPos;
                let hozMovtCanDo = true;

                // processLatChg izvede premik in vrne false, če premika ne moremo izvesti in moramo povrniti stanje kot pred poskusom premika;
                // če vrne true, pomeni, da je bil izveden stranski premik na novo lokacijo in gibanje se še nadaljuje;
                if(!this.processLatChg(this.latSpeed, startXPos)) {
                    // probamo polovičen premik, najprej vrnemo začetno vrednost;
                    this.xPos = startXPos;
                    if(!this.processLatChg(this.latSpeed / 2, startXPos)) {
                        // torej tudi polovičnega premika ni mogoče izvest;
                        hozMovtCanDo = false;   // le v tem priemru gre ta na false;
                        this.xPos = startXPos;  // povrnemo začetni položaj, ker ni mogoče nikakor sprmeniti lateralnega položaja;
                    }
                    // to pa je treba nastavit ne glede na to, al je polovička uspela, ali ne: nek rob smo pač našli in ne moremo več naprej;
                    this.latSpeed = 0;
                    if(this.xPos != this.xAtStartJmp) {
                        this.upContinuslyPressd = false;    // proxy za to, da ne greš več navzgor (če si se zaletel med skokom, ne moreš več gor);
                    } else {
                        // skačeš navpično na mestu (si na istem x-u kot si bil ob začetku skoka), postavljen ob oviro in ne ustavimo skoka navzgor;
                    }
                }
                
                // če je stranski premik mogoč, preverimo še:
                if(hozMovtCanDo) {
    
                    // al smo morda že zapustili ekran;
                    const exits = this.screen.currScreen.exits;
                    if(exits.right != undefined && this.xPos >= exits.right.x) {
                        this.stopMvmtAndInterval();
                        this.place(exits.right.spritePos.x, exits.right.spritePos.y, Sprite.look[exits.right.spritePos.sx])
                        this.screen.getNewsSpriteExited(RIGHT);
                        return;
                    } else if(exits.left != undefined && this.xPos <= exits.left.x) {
                        this.stopMvmtAndInterval();
                        this.place(exits.left.spritePos.x, exits.left.spritePos.y, Sprite.look[exits.left.spritePos.sx])
                        this.screen.getNewsSpriteExited(LEFT);
                        return;
                    } else if(this.xPos > 440 && this.screen.currScreenIdx == 4 ) {
                        
                        // - - - PRIŠEL SI DO KONCA  - - - -;
                        this.stopIntervalAndListnrs();
                        this.render(true);
                        this.screen.gameFinished();
                        return;
                    } else {
                        // če nismo zapustili ekrana, preverimo, ali imamo na novem položaju oporo (tj. da nismo stopili v prazno);
                        if(this.yPos > 0 && this.vertSpeed == 0) {
                            if(!this.chk4Support()) {
                                this.vertSpeed = -Sprite.maxVertSpeed; // nismo našli opore, tj. stopili smo v prazno, sprožimo padec;
                            }
                        }  
                    }

                }
            } // konec procesiranja lateralnega gibanja;

            // special cases; (shark)
            if(this.screen.currScreenIdx == 3) {
                if(this.specialCase) {
                    if(this.latSpeed != 0) this.latSpeed = 0; // če ni že od prej, damo zdaj;
                    if(this.yPos <= 20) {
                        this.stopInterval(MAIN);
                        this.render(false);
                    } else this.render(true);
                    this.screen.getNewsSharkAction(this.xPos, this.yPos);
                    return;
                }
                if(this.vertSpeed < 0) {
                    if((this.xPos >= 200 && this.xPos <= 300 && this.yPos <= 220) || (this.xPos >= 380 && this.xPos <= 520 && this.yPos <= 240)) {
                        this.stopListeners();
                        this.sx = Sprite.look.straight;
                        intrvlLen = 160; // upočasnimo čas;
                        this.specialCase = true;
                        this.screen.getNewsSharkAction(this.xPos, this.yPos);
                        this.render(true);
                        return;
                    }
                }
            }
            
            // izbira sličice možička;
            // najprej je odvisna od smeri gibanja L/D;
            if(this.latSpeed > 0) {
                this.sx = Sprite.look.right; 
            } else if(this.latSpeed < 0) {
                this.sx = Sprite.look.left;
            } else { // če pa se ne giba L/D pa od pristka gumbov;
                if(ctrlPressd.right && ctrlPressd.left) this.sx = Sprite.look.straight; // če držiš pritisnjena oba hkrati, te gleda naravnost;
                else if(ctrlPressd.right) this.sx = Sprite.look.right;
                else if(ctrlPressd.left) this.sx = Sprite.look.left;
            }
    
            // narišemo na novem/istem položaju;
            this.render(true);
        }

        // preverjamo ali so gumbi pritisnjeni in ustrezno ukrepamo;
        // to je zato, ker od prej, če si lateralno zaleten v neko oviro, imaš latSpeed == 0, čeprav imaš pritisnjen gumb za vstran, in če recimo skočiš, ne upošteva gumba za vstran;
        // zakaj to tukaj? ker če ne bi zdaj, bi se spodaj ustavil interval; tako ohranimo interval živ in tukaj nastavljene vrednosti so prečekeirajo v naslednjem krogu;
        // zakaj ne čekirat v keydown? ker če držiš gor in potem pritisneš še v desno, se sproža samo zadnji pritisnjen (morda odvisno od OS-a),..
        // v tem primeru uni za v desno, kljub temu da je za gor še vedno pritisnjen (ni se še sprožil keyup za gumb gor);
        // zato moraš čekirat boolean, ki ga sam urejaš;
        if(this.latSpeed == 0) {
            if(ctrlPressd.right && !ctrlPressd.left) this.latSpeed = Sprite.latMovtSpeedDef; // nastavimo hitrost in če smo zaleteni, bo itak spodaj dalo na 0, če pa gremo v skok, bo lahok šlo tudi lateralno;
            else if(ctrlPressd.left && !ctrlPressd.right) this.latSpeed = -Sprite.latMovtSpeedDef;
        } // isto za gumb gor;
        if(this.vertSpeed == 0 && ctrlPressd.up) {
            this.vertSpeed = Sprite.maxVertSpeed;
            this.upContinuslyPressd = true;
        }

        // odločanje o ustavitvi intervala;
        // ta je zunaj delovne zanke, ker hitrosti lahko dosežejo 0 med gibanjem (ovira) ali pa zaradi izpustitve gumba za premikanje;
        if(this.latSpeed == 0 && this.vertSpeed == 0)  {
            this.stopInterval(MAIN);
            // komplikacija z zakasnjenim obračanjem;
            if(intervalIDs.turn == 0) {
                intervalIDs.turn = setTimeout(() => {
                    this.sx = Sprite.look.straight;
                    this.render(false);
                    this.render(true);
                    this.stopInterval(TURN);
                }, 300);
            }
        }
    }   // konec processChanges;
}       // konec klasa Sprajt;