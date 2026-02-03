'use strict';


class GameScreen {
    // konstante
    static #SHARK = 'shark';
    static #FLYPOD = 'flypod';

    static ctx;
    static endAnimPics = new Image();
    static height = 420;
    static width = 600;
    static bckgnd;
    static currScreenIdx;  // tu bo shranjen idx trenutnega zaslona;
    static currScreen;  // tu bo shranjen objekt trenutnega zaslona;
    static sprite;
    static intervals = {
        bckgnd : {  // standarden interval za premikanje stvari na zalonu: oblaki in določeni animirani elementi ospredja (sprajt ima svojega);
            ID : 0,
        },
        bespoke : {
            ID : [],
            delay : []    // samo preventivno nastavljena default vrednost;
        },
    }
    static endGame = false;

    static scrItemsCatlg = {    // catalagoue of screen items;
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
        },
        sand: {
            sx: 204,
            sy: 61,
            width: 40,
            height: 10
        },
    }

    static itemsPresenceDefs = {    // seznam predmetov, ki so prisotni na posameznem zaslonu;
        0: {    // 1.zaslon (idx 0);
            static: [   // definicije statičnih ovir (predmetov na splošno); to niso operativni podatki, ampak definicije zanje;
                {type: 'turfLevitating', x: -20, y: 40},
                {type: 'turfLevitating', x: -20, y: 140},
                {type: 'turfLevitating', x: -20, y: 240},

                // za 6
                // {type: 'turfLevitating', x: 50, y: 100},
                // {type: 'turfLevitating', x: 100, y: 100},

                // za 5
                {type: 'turfLevitating', x: 60, y: 100},
                {type: 'turfLevitating', x: 120, y: 100},

                {type: 'turfLevitating', x: 280, y: 30},
                {type: 'turfLevitating', x: 300, y: 160},

                // za 5
                {type: 'turfLevitating', x: 460, y: 220},
                {type: 'turfLevitating', x: 510, y: 220},

                // za 6;
                // {type: 'turfLevitating', x: 500, y: 220},

                {type: 'turfLevitating', x: 560, y: 220},
                {type: 'turfLevitating', x: 560, y: 20},
                {type: 'turfLevitating', x: 560, y: 85},
                {type: 'turfLevitating', x: 560, y: 150},
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
                {type: 'turf10_40', x: 470, y: 10},
            ],
            animtd: [], // sem pridejo animirani elementi ospredja na zaslonu, recimo Shark;
        },
        1: {
            static: [
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
                {type: 'turfLevitating', x: -10, y: 30},
                {type: 'turfLevitating', x: -10, y: 125},
                {type: 'turfLevitating', x: 560, y: 10},
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
            ],
            animtd: [],
        },
        // 2: {    // 3. zaslon (idx 2);    // kot originalno, ko sem razvijal;
        //     static: [
        //         {type: 'turf10_160', x: 0, y: 0},
        //         {type: 'turf10_160', x: 160, y: 0},
        //         {type: 'turf10_160', x: 320, y: 0},
        //         {type: 'turf10_160', x: 480, y: 0},
        //         {type: 'turfLevitating', x: 0, y: 20},
        //         {type: 'turfLevitating', x: 560, y: 0},
        //         {type: 'turfLevitating', x: 480, y: 80},
        //         {type: 'turfLevitating', x: 380, y: 160},
        //         {type: 'turfLevitating', x: 200, y: 220},
        //         {type: 'turfLevitating', x: 0, y: 240},
        //     ],
        //     animtd: [
                // {type: GameScreen.#SHARK, x: 170, y: 0, boundryL: 50, boundryR: 350},
        //     ],
        // },
        2: {    // 3. zaslon (idx 2);
            static: [   // shark zaprt;
                {type: 'sand', x: 0, y: 0},
                {type: 'sand', x: 40, y: 0},
                {type: 'sand', x: 80, y: 0},
                {type: 'sand', x: 120, y: 0},
                {type: 'turfLevitating', x: 0, y: 10},
                {type: 'turfLevitating', x: 80, y: 80},
                {type: 'sand', x: 160, y: 0},
                {type: 'turfLevitating', x: 160, y: 50},
                {type: 'turfLevitating', x: 160, y: 140},
                {type: 'turfLevitating', x: 220, y: 170},
                {type: 'turfLevitating', x: 280, y: 200},
                {type: 'turfLevitating', x: 340, y: 220},
                {type: 'turfLevitating', x: 400, y: 230},
                {type: 'turfLevitating', x: 460, y: 240},
                {type: 'turfLevitating', x: 460, y: 160},
                {type: 'turfLevitating', x: 500, y: 80},
                {type: 'turfLevitating', x: 540, y: 20},
                {type: 'turfLevitating', x: 580, y: 170},
                {type: 'turfLevitating', x: 580, y: 250},
                {type: 'turfLevitating', x: 580, y: 350},
                {type: 'turfLevitating', x: 590, y: 20},
            ],
            animtd: [
                {type: GameScreen.#SHARK, x: 350, y: 0, boundryL: 200, boundryR: 600, addToStatics: false, bespokeIntID: false},
            ],
        },
        3: {    // 4. zaslon (idx 3);
            static: [   // shark live;
                {type: 'sand', x: 0, y: 0},
                {type: 'sand', x: 40, y: 0},
                {type: 'sand', x: 80, y: 0},
                {type: 'sand', x: 120, y: 0},
                {type: 'turfLevitating', x: 0, y: 10},
                {type: 'turfLevitating', x: 80, y: 80},
                {type: 'sand', x: 160, y: 0},
                {type: 'turfLevitating', x: 160, y: 50},
                {type: 'turfLevitating', x: 160, y: 140},

                // za 5;
                {type: 'turfLevitating', x: 320, y: 200},
                {type: 'turfLevitating', x: 360, y: 220},
                // ! za 5;

                // za 6
                // {type: 'turfLevitating', x: 340, y: 220},
                // ! za 6
                // {type: 'turfLevitating', x: 580, y: 170},
                {type: 'turfLevitating', x: 560, y: 240},
            ],
            animtd: [
                {type: GameScreen.#SHARK, x: 350, y: 0, boundryL: 200, boundryR: 600, addToStatics: false, bespokeIntID: false},
            ],
        },
        4: {    // 5. zaslon (idx 4);
            static: [   // pod
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
                {type: 'turfLevitating', x: 0, y: 240},
                {type: 'turfLevitating', x: 0, y: -20},
                {type: 'turfLevitating', x: -20, y: 45},
                {type: 'turfLevitating', x: -20, y: 110},
                {type: 'turfLevitating', x: -20, y: 175},
                {type: 'turfLevitating', x: 60, y: 200},
                {type: 'turfLevitating', x: 140, y: 120},
                {type: 'turfLevitating', x: 80, y: 70},
                {type: 'turfLevitating', x: 260, y: 280},
                {type: 'turfLevitating', x: 420, y: -10},
                {type: 'turfLevitating', x: 520, y: 80},
                {type: 'turfLevitating', x: 560, y: 240},
                {type: 'turfLevitating', x: 580, y: -20},
                {type: 'turfLevitating', x: 580, y: 45},
                {type: 'turfLevitating', x: 580, y: 110},
                {type: 'turfLevitating', x: 580, y: 175},
            ],
            animtd: [
                {type: GameScreen.#FLYPOD, x: 360, y: 241, boundryL: 140, boundryR: 460, addToStatics: true, bespokeIntID: false},
            ],
        },
        5: {
            static: [   // 3 podi
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
                {type: 'turfLevitating', x: 0, y: 180},
                {type: 'turfLevitating', x: 0, y: 40},
                {type: 'turfLevitating', x: 40, y: 140},
                {type: 'turfLevitating', x: 320, y: -20},
                {type: 'turfLevitating', x: 560, y: 240},
                {type: 'turfLevitating', x: 580, y: 20},
                {type: 'turfLevitating', x: 580, y: 90},
                {type: 'turfLevitating', x: 580, y: 160},
                // {type: 'turfLevitating', x: 380, y: 130},
                // {type: 'turfLevitating', x: 580, y: 40},
            ],
            animtd: [
                {type: GameScreen.#FLYPOD, x: 360, y: 301, boundryL: 320, boundryR: 540, addToStatics: true, bespokeIntID: true, delay: 200},
                {type: GameScreen.#FLYPOD, x: 100, y: 241, boundryL: 80, boundryR: 240, addToStatics: true, bespokeIntID: true, delay: 600},
                {type: GameScreen.#FLYPOD, x: 200, y: 101, boundryL: -100, boundryR: 300, addToStatics: true, bespokeIntID: false},
                // {type: GameScreen.#FLYPOD, x: 360, y: 301, boundryL: 100, boundryR: 580, addToStatics: true, bespokeIntID: true, delay: 600},
            ],
        },
        6: {    // 7. zaslon
            static: [   // na tem zaslonu je trenutno konec po stopnicah navzdol;
                {type: 'turf10_160', x: 0, y: 0},
                {type: 'turf10_160', x: 160, y: 0},
                {type: 'turf10_160', x: 320, y: 0},
                {type: 'turf10_160', x: 480, y: 0},
                {type: 'turfLevitating', x: 0, y: 240},
                {type: 'turfLevitating', x: 60, y: 200},
                {type: 'turfLevitating', x: 120, y: 160},
                {type: 'turfLevitating', x: 180, y: 120},
                {type: 'turfLevitating', x: 240, y: 80},
                {type: 'turfLevitating', x: 300, y: 40},
            ],
            animtd: [],
        },
        // 7: {
        //     static: [   // samo za vajo za pod
        //         {type: 'turf10_160', x: 0, y: 0},
        //         {type: 'turf10_160', x: 160, y: 0},
        //         {type: 'turf10_160', x: 320, y: 0},
        //         {type: 'turf10_160', x: 480, y: 0},
        //     ],
        //     animtd: [
        //         // {type: GameScreen.#FLYPOD, x: 360, y: 101, boundryL: 200, boundryR: 580, addToStatics: true, bespokeIntID: false},
        //         // {type: GameScreen.#FLYPOD, x: 360, y: 241, boundryL: 100, boundryR: 580, addToStatics: true, bespokeIntID: true, delay: 600},
        //     ],
        // },
        
        
    }

    
    static screensCatalogue = [
        
        {   // 1. zaslon (idx 0);
            
            // podatki;
            exits: {
                right: {
                    x: 600, // položaj (xPos), ki ga mora doseči sprajt na aktualnem zaslonu, da se šteje, da ga je zapustil;
                    spritePos: {    // položaj, ki ga zavzame sprite na naslednjem ekranu, če uporabi ta izhod;
                        x: 0, y: 280, sx: 'right'
                    }
                },
                left: undefined,
            },
            bckgndIdx: 0,
            
            // obstajajo še drugi propertiji objekta, ampak se ustvarijo v load();
        },
        {   // 2. zaslon;
            exits: {
                right: {
                    x: 600,
                    spritePos: { x: 0, y: 70, sx: 'right' }
                },
                left: {
                    x: -40,
                    spritePos: { x: 560, y: 280, sx: 'left' }
                },
            },
            bckgndIdx: 1,
        },
        {   // 3. zaslon (idx 2);
            exits: {
                right: {
                    x: 600,
                    spritePos: { x: 0, y: 70, sx: 'right' }
                },
                left: {
                    x: -40,
                    spritePos: { x: 560, y: 70, sx: 'left' }
                },
            },
            bckgndIdx: 2,
        },
        {   // 4. zaslon (idx 3);
            exits: {
                right: {
                    x: 600,
                    spritePos: { x: 0, y: 300, sx: 'right' }
                },
                left: {
                    x: -40,
                    spritePos: { x: 560, y: 80, sx: 'left' }
                },
            },
            bckgndIdx: 2,
        },
        {   // 5. zaslon (idx 4);
            exits: {
                left: {
                    x: -40,
                    spritePos: { x: 560, y: 300, sx: 'left' }
                },
                right: {
                    x: 600,
                    spritePos: { x: 0, y: 240, sx: 'right' }
                },
            },
            bckgndIdx: 0,
        },
        {   // 6. zaslon (idx 5);
            exits: {
                left: {
                    x: -40,
                    spritePos: { x: 560, y: 300, sx: 'left' }
                },
                right: {
                    x: 600,
                    spritePos: { x: 0, y: 300, sx: 'right' }
                },
            },
            bckgndIdx: 0,
        },
        {   // 7. zaslon (idx 6);   
            exits: {    // tle je konc po stopnicah navzdol
                right: undefined,
                left: {
                    x: -40,
                    spritePos: { x: 560, y: 300, sx: 'left' }
                },
            },
            bckgndIdx: 0,
        },

        // samo za vajo ! !
        {   // 7. zaslon (idx 6);   samo za vajo za pod
            exits: {
                right: {
                    x: 600,
                    spritePos: { x: 300, y: 10, sx: 'right' }
                },
                left: undefined,
            },
            bckgndIdx: 0,
        },
        
        
    ]

    static meetData(ctx, sprite) {
        this.ctx = ctx;
        this.sprite = sprite;
        // tudi obvestimo screen o samem sebi;
        this.sprite.meetScreen(this);
    }

    static load(scrIdx = 0) {
        this.currScreenIdx = scrIdx;
        this.currScreen = this.screensCatalogue[this.currScreenIdx];

        // izbrišemo ospredje;
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // izris ozadja;
        this.bckgnd.drawBckgnd(this.currScreen.bckgndIdx);
        this.bckgnd.drawClouds();
        
        // če še niso, naložimo ovire iz definicij (obenem se tudi izrišejo);
        if(this.currScreen.items_static == undefined) {    // ta služi kot proxi za vse vrste ovir, ker zaslon brez statičnih ovir ne more bit;
            // ustvarimo prazne propertije (nekateri se bodo pozneje popolnili, morda ne vsi za vsak objekt);
            this.currScreen.items_static = [];  // operativni seznam statičnih ovir, ki so del ospredja;
            this.currScreen.items_animtd = [];  // operativni seznam animiranih ovir, ki so del ospredja;
            this.currScreen.intervals = {
                bckgnd : [],    // animirani elementi (posamični items_animtd), katerih animacija je pripopana intervalu ozadja (za oblake);
                bespoke: []     // animirani elementi (arrayi items_animtd), katerih animacija ima lasten interval (neodvisen od intervala animacije oblakov);
            };

            const ovireDef = this.itemsPresenceDefs[this.currScreenIdx];
            for(let i = 0; i < ovireDef.static.length; i++) {
                const type = ovireDef.static[i].type;
                this.currScreen.items_static.push(new ScreenObj(ovireDef.static[i].x, ovireDef.static[i].y,
                    this.scrItemsCatlg[type].sx,
                    this.scrItemsCatlg[type].sy,
                    this.scrItemsCatlg[type].width,
                    this.scrItemsCatlg[type].height
                ))
            }
            
            if(ovireDef.animtd.length > 0) {
                for (const element of ovireDef.animtd) {
                    let animatedElem;
                    if(element.type == GameScreen.#SHARK) {
                        animatedElem = new Shark(element.x, element.y, element.boundryL, element.boundryR);
                    } else if(element.type == GameScreen.#FLYPOD) {
                        animatedElem = new FlyPod(element.x, element.y, true, element.boundryL, element.boundryR, this.sprite);
                    }
                    this.currScreen.items_animtd.push(animatedElem);
                    if(element.addToStatics) this.currScreen.items_static.push(animatedElem);
                    if(element.bespokeIntID) {
                        // najprej pogruntat, al že obstaja tak delay;
                        let i = -1;
                        const bespokeDelays = this.intervals.bespoke.delay;
                        if(bespokeDelays.length > 0) {
                            for (let j = 0; j < bespokeDelays.length; j++) {
                                if(bespokeDelays[j] == element.delay) {
                                    i = j; break;
                                }
                            }
                        }
                        // POMEMBNO: arraya this.intervals.bespoke.delay (vrednosti delayev) in this.currScreen.intervals.bespoke (objekti z istim delayem)..
                        // ..morata imeti isto dolžino in vsak njihov član na istem indeksu (vsak član je array), mora tudi imet isto dolžino;
                        if(i == -1) {   // takega arraya še ni;
                            const thisDelay = [];   // sem not grejo objekti, ki imajo tak bespoke delay; pravo ime bi bilo membersWithThisDelayy;
                            thisDelay.push(animatedElem); // da ga damo v array, pa četudi bo morda vedno imel le enega člana;
                            this.currScreen.intervals.bespoke.push(thisDelay);  // array objektov s tem delayem damo v glavni array bespokov;
                            bespokeDelays.push(element.delay);  // vrednost delaya damo v array vrednoti delayev;
                        } else {    // dodamo ta nov element k obstoječi zbirki objektov s tem delayem;
                            this.currScreen.intervals.bespoke[i].push(animatedElem); // delaya pa ni treba nikamor dodat, ker že obstaja zabeležen od prej;
                        }
                    } else this.currScreen.intervals.bckgnd.push(animatedElem);
                }
            }
                
        } else {    // sicer jih samo izrišemo;
            for (const element of this.currScreen.items_static) {
                element.render(true);
            }
            if(this.currScreen.items_animtd.length > 0) {
                for (const element of this.currScreen.items_animtd) {
                    element.processChanges();
                }
            }
        }
        
        // zagon premikanja zadev na zaslonu (setInterval oz tu imenovani tickerji);
        // standarden interval, ki se obvezno izvaja (oblaki in morebitne animirane zadeve v ospredju);
        this.intervals.bckgnd.ID = setInterval(this.runBckgndTicker.bind(this), 1000);

        // morebitni intervali po meri;
        const currScreenBespoke = this.currScreen.intervals.bespoke;
        if(currScreenBespoke.length > 0) {
            for (let i = 0; i < currScreenBespoke.length; i++) {
                this.intervals.bespoke.ID[i] = setInterval(this.runBespokeTickers.bind(this), this.intervals.bespoke.delay[i], currScreenBespoke[i]);
            }
        }

        // narišemo možička (položaj mu je vselej določen že predhodno);
        this.sprite.render(true);
    }

    static runBckgndTicker() {
        if(this.bckgnd.moveClouds()) this.stopAllTickers();
        if(this.currScreen.intervals.bckgnd.length > 0) {
            for (const element of this.currScreen.intervals.bckgnd) element.processChanges();
        }
    }

    static runBespokeTickers(passdArr) {
        for (const element of passdArr) {
            element.processChanges();
        }
    }

    static stopAllTickers() {
        // standardni interval (samo eden, ni v arrayu; zagotovo teče);
        clearInterval(this.intervals.bckgnd.ID);
        this.intervals.bckgnd.ID = 0;
        
        // morebitni posebni interval(i) (lahko jih je več, vedno so v arrayu);
        if(this.intervals.bespoke.ID.length > 0) {
            for (let i = 0; i < this.intervals.bespoke.ID.length; i++) {
                if(this.intervals.bespoke.ID[i] != 0) {
                    clearInterval(this.intervals.bespoke.ID[i]);
                    this.intervals.bespoke.ID[i] = 0;
                }
            }
        }
    }

    static getNewsSpriteExited(where) {
        this.stopAllTickers();
        const idx = where == 'right' ? this.currScreenIdx + 1 : this.currScreenIdx - 1;
        this.load(idx);
    }

    static getNewsSharkAction(xPos, yPos) {
        if(!this.endGame) {
            this.endGame = true;
            this.currScreen.items_animtd[0].startEndGame(xPos);
        }

        if(yPos <= 120 && yPos > 40) {
            if(yPos >= 100) {
                this.currScreen.items_animtd[0].menuSign.xPos = xPos >= 520 ? 450 : xPos - 50;   // da se znak pravilno postavi;
                this.currScreen.items_animtd[0].sharkPic.xPos = xPos;   // da se šark pravilno postavi;
            }
            this.currScreen.items_animtd[0].showSharkPic();
        }

        if(yPos <= 40) {
            this.currScreen.items_animtd[0].showMenuSign();
            setTimeout(this.gameOverSign.bind(this), 1500);
        }
    }

    static gameOverSign() {
        this.ctx.font = "60px serif";
        this.ctx.fillText('Game Over', 60, 90);
        this.ctx.font = "24px serif";
        this.ctx.fillText('Refresh page to try again', 70, 124);
        console.log('-  -  - KONEC IGRE, daj F5 -  -  -  ', Date.now())
    }

    static gameCompleted() {
        this.endAnimPics.src = 'sprites2.jpg';
        this.endAnimPics.onload = function() {
            setTimeout(() => {
                for(let i = 0; i <= 40; i++) {
                    setTimeout(() => { GameScreen.endAnimationPt1(i) }, 90 * i)
                }
            }, 800);
        }
    }

    static gameAborted() {
        this.ctx.font = "40px serif";
        this.ctx.fillText('Game Aborted', 60, 90);
        this.ctx.font = "20px serif";
        this.ctx.fillText('(Escape key pressed)', 65, 110);
        this.ctx.font = "24px serif";
        this.ctx.fillText('Refresh page to restart', 65, 144);
        console.log('-  -  - KONEC IGRE, daj F5 -  -  -  ', Date.now())

    }

    static endAnimationPt1(i) {
        this.ctx.clearRect(420, 170, 95, 175);
        this.ctx.drawImage(this.endAnimPics, (i % 10) * 96 + 1, 0, 94, 175, 420, 160, 94, 175);
        if(i >= 40) {
            this.ctx.clearRect(420, 160, 95, 175);
            this.sprite.render(true);
            setTimeout(() => {
                this.ctx.font = "8px serif"; // končna velikost fonta bo 48;
                this.ctx.strokeText('The End', 400, 180 + 8);
                for(let j = 12; j <= 48; j = j + 4) {   // 12, ker se font povečuje po 4, pred tem pa je bil 8;
                    setTimeout( () => { this.endAnimationPt2(j) }, 15 * j )   // setInterval bi bil 60ms, ampak ker je j po 4, moramo delit s 4;
                }
            }, 1000);
        }
    }

    static endAnimationPt2(i) {
        this.ctx.clearRect(390,170,200,100);
        this.ctx.font = `${i}px serif`;
        if(!mobile) this.ctx.strokeText('The End', 400, 180 + i);
            else this.ctx.fillText('The End', 400, 180 + i)  // će mobile je fill, ker se na majhnem zaslonu sicer slabo vidi;
        if(i >= 48) {
            this.sprite.render(true);
        }
    }
}


class Background {

    static #farX = 1.2; // koeficient za izračun premikanja za oddaljene oblake; 
    static #nearX = 2;  // koeficient za izračun premikanja za bližnje oblake;

    #ctx;
    #assets;
    #clouds;
    #currBckgndIdx;
    #currSkyBhnd;

    static bckgndsCatalogue = {
        0: {
            sx: 0,
            sy: 0
        },
        1: {
            sx: 602,
            sy: 0
        },
        2: {
            sx: 1204,
            sy: 0
        },
    };

    constructor(ctx, assets) {
        this.#ctx = ctx;
        this.#assets = assets;
        this.skiesBhndClouds = {
            0: undefined,   // index je vezan na index ozadja, ne ekrana;
            1: undefined,
        }
        this.#currBckgndIdx = undefined;
        this.#currSkyBhnd;   // tle se shrani nebo za oblaki;
        this.#clouds = {
            starts: {
                farther: [-170, 220, 450],
                closer: [-270, 20, 470]
            },
            mvmtCountr: 0,
        }
    }

    drawBckgnd(bckgndIdx) {
        if(this.#currBckgndIdx == undefined || this.#currBckgndIdx != bckgndIdx) {
            this.#currBckgndIdx = bckgndIdx;
            const currBckgndDef = Background.bckgndsCatalogue[this.#currBckgndIdx];
            this.#ctx.drawImage(this.#assets, currBckgndDef.sx, currBckgndDef.sy, 600, 420, 0, 0, 600, 420);
            // shranimo ozadje za oblaki
            if(this.skiesBhndClouds[this.#currBckgndIdx] == undefined) {
                this.skiesBhndClouds[this.#currBckgndIdx] = this.#ctx.getImageData(0, 30, GameScreen.width, 107);
            }
            this.#currSkyBhnd = this.skiesBhndClouds[this.#currBckgndIdx];
        }
    }

    drawClouds() {
        // najprej oddaljeni oblaki;
        if(this.#clouds.starts.farther.length > 0) {
            for (const cloud of this.#clouds.starts.farther) {
                // tle bi moralo bit x:279 in w:194, ampak verjetno ker gre korak po 0,5 (ko je bilo tako), skoči za 0,5 nazaj (ali naprej) in pokaže črno črto pred ali po;
                const neki = cloud + this.#clouds.mvmtCountr * Background.#farX;  // izvirno (pri 420 ms): 0.6; rabi se pri prehodu zaslona (pri štartu je drugi seštevanec 0 in ne bi rabil tega preračuna);
                this.#ctx.drawImage(this.#assets, 280, 422, 193, 60, neki, 77, 193, 60);
            }
        }
        //bližnji oblaki
        if(this.#clouds.starts.closer.length > 0) {
            for (const cloud of this.#clouds.starts.closer) {
                const neki = cloud + this.#clouds.mvmtCountr * Background.#nearX;    // izvirno (pri 420 ms): 1 (torej brez); ob zagonu igre je ta preračun odvečen;
                this.#ctx.drawImage(this.#assets, 0 , 422, 277, 87, neki, 30, 277, 87);
            }
        }
    }

    moveClouds() {
        // izrisat čisto nebo za oblaki;
        this.#ctx.putImageData(this.#currSkyBhnd, 0, 30);

        // risanje oblakov;
        this.#clouds.mvmtCountr++;   // pomaknemo na nov položaj;
        this.drawClouds();
        
        // čekiranje za odstranjevanje elementov;
        const closerClouds = this.#clouds.starts.closer;
        const farClouds = this.#clouds.starts.farther;
        if(this.#clouds.mvmtCountr % 60 == 0) {
            if(closerClouds.length > 0 && closerClouds[closerClouds.length - 1] + this.#clouds.mvmtCountr * Background.#nearX > GameScreen.width) {
                closerClouds.pop();
            }
            if(farClouds.length > 0 && farClouds[farClouds.length - 1] + this.#clouds.mvmtCountr * Background.#farX > GameScreen.width) {
                farClouds.pop();
            }
            // console.log(this.clouds.starts)
            if(farClouds.length == 0 && closerClouds.length == 0) {
                console.log('Clouds interval ended and stopped;')
                return true;    // pomeni končamo ticker za oblake
            }
        }
        return false;
    }
}