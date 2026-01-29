'use strict';

class Shark extends ScreenObj {

    static #maxSpeed = 20;
    static #look = {
        right: 171,
        left: 203
    };
    static turnEmbargo = 4; // koliko premikov (turnov) ne smeš spreminjat globine;

    // boundary določa meje širine vode; morski pes se giblje za eno svojo širino znotraj teh meja;

    constructor(xPos, yPos, boundryL, boundryR) {
        super(xPos, yPos, 171, 0, 29, 39);
            // ima tudi: 
                // this.sx, this.sy, this.width in this.height, določeno s super zgoraj;
        this.initialYPos = 0;  // kolikšen yPos je bil podan ob instanciaciji, mora bit isto, kot to, kar podaš v super();
        this.boundryL = boundryL;
        this.boundryR = boundryR;
        this.speed = Shark.#maxSpeed;   // na začetku se avtomatsko giba v desno;
        this.depth = {
            curr: 0,
            target: 0,
            turn: 0,
            levels: [0, -15, -30]
        };
        this.water = new ScreenObj(boundryL, 0, /*sx:*/ 0, /*sy:*/ 90, boundryR - boundryL, 12);
        this.waterCountr = 1;
        // end game;
        this.endGame = false;   // true, ko možiček pada in ga bo pes pojedel;
        this.menuSign;  // slikca za obed;
        this.sharkPic;  // slikca pred obedom;
        this.endGameXPos;
        this.gameEnded = false;
    }

    startEndGame(xPos) {
        // podatkovje;
        this.endGameXPos = xPos;
        this.endGame = true;
        this.menuSign = new ScreenObj(xPos - 50, 5, 0, 104, 143, 105, false); // -50 ker je širina slike 140, potem je 40 možiček in spet 50 slike;
        this.sharkPic = new ScreenObj(xPos, 0, 165, 108, 50, 60, false);
        
        //morski pes;   se obrne proti modelu in gre na srednjo globino, potem kmalu izgine;
        this.render(false);
        if(this.xPos > xPos) {
            this.sx = Shark.#look.left;
        } else this.sx = Shark.#look.right;
        this.yPos = this.initialYPos - 10; // nastavimo srednjo globino;
        this.render(true);
        this.water.render(true);
        setTimeout(() => {  // po določenem času izbrišemo morskega psa;
            this.render(false);
            this.water.render(true);
        }, 260);
    }

    showSharkPic() {
        this.sharkPic.render(true);
        this.water.render(true);
    }

    showMenuSign() {
        this.menuSign.render(true);
        this.gameEnded = true;
    }

    processChanges() {
        
        // najprej vse izbrišemo (šharka znotraj if-a);
        this.water.render(false);

        if(!this.endGame) { // premikanje morskega psa se izvaja, ko ni end game;
            this.render(false);
            const startXPos = this.xPos;
            this.xPos += this.speed;
            let obrat = false;
    
            if(this.speed > 0 && this.xPos + 2 * this.width >= this.boundryR) obrat = true;
                else if(this.speed < 0 && this.xPos - this.width <= this.boundryL) obrat = true;
            if(obrat) {
                this.xPos = startXPos;  // ostanemo na istem x-u
                this.speed = -this.speed; // obrnemo smer gibanja, tj, se obrnemo v drugo smer na emstu;
            }
            if(this.speed > 0) this.sx = Shark.#look.right;
                else this.sx = Shark.#look.left;
    
            // globina;
            // najprej jo prilagodit;
            this.depth.turn++;
            if(this.depth.turn > Shark.turnEmbargo) {
                const shallDo = Math.random() < 0.3 ? true : false;
                if(shallDo) {
                    this.depth.turn = 0;    // azzeriramo embargo counter;
                    const possDepths = [];
                    for (const element of this.depth.levels) {
                        if(element != this.depth.curr) possDepths.push(element);
                    }
                    if(Math.random() > 0.5) this.depth.target = possDepths[0];
                        else this.depth.target = possDepths[1];
                    
                    // nastavit nov depth.curr;
                    if((this.depth.curr == this.depth.levels[0] && this.depth.target == this.depth.levels[2]) 
                        || (this.depth.curr == this.depth.levels[2] && this.depth.target == this.depth.levels[0])) {
                        this.depth.curr = this.depth.levels[1]; // če sta bile v skrajnosti, se ciljni približaš za en korak;
                    } else this.depth.curr = this.depth.target; // če ne pa greš kar direkt na target, ker si bil oddlajen za en korak;
    
                }
            } else if(this.depth.curr != this.depth.target) {   // to je smiselno preverjat v else, ker se tovrsten pripis vrednosti lahko zgodi le v turn == 1,..
                this.depth.curr = this.depth.target;    // ..torej če si se v prejšnjem turn premaknil v sredino, zdaj pa se v nasprotno skrajnot;
            }
    
            // upoštevat globino za izračun vrednosti this.yPos;
            this.yPos = this.initialYPos + this.depth.curr;
            this.render(true);
        }
        
        // voda:
        // voda je naštimana, da se slika ponavlja vsakih 90px, zato jo predvajamo 60/30/0, da gredo valovi po 30px v desno vsakokrat;
        // lahko uporabiš katerikoli delitelj števila 90 (recimo 6 korakov z zamikom po 15);
        // v primeru 60/30/0 mora bit slika 60px daljša od boundaryR - boundaryL;
        // let sX = 60;
        // if(this.waterCountr == 2) sX = 30;
        // else if(this.waterCountr == 3) sX = 0;
        // this.water.sx = sX;
        // this.waterCountr++;
        // if(this.waterCountr == 4) this.waterCountr = 1;
        let sX = 75;
        if(this.waterCountr == 2) sX = 60;
        else if(this.waterCountr == 3) sX = 45;
        else if(this.waterCountr == 4) sX = 30;
        else if(this.waterCountr == 5) sX = 15;
        else if(this.waterCountr == 6) sX = 0;
        this.water.sx = sX;
        this.waterCountr++;
        if(this.waterCountr == 7) this.waterCountr = 1;
        this.water.render(true);

        if(this.gameEnded) this.menuSign.render(true);
    }
}


class FlyPod extends ScreenObj {

    static #maxSpeed = 20;
    static #assetsSX = {
        1: 169,
        2: 250,
        3: 331,
    }
    static #spriteRef;

    // boundary določa meje gibanja poda;

    constructor(xPos, yPos, dirBool, boundryL, boundryR, spriteRef) {
        super(xPos, yPos, 169, 41, 80, 19);
            // ima tudi: 
                // this.sx, this.sy, this.width in this.height, določeno s super zgoraj;
        this.boundryL = boundryL;
        this.boundryR = boundryR;
        this.speed = dirBool == true ? FlyPod.#maxSpeed : - FlyPod.#maxSpeed;   // true za v desno;
        this.sxCountr = 1;
        FlyPod.#spriteRef = spriteRef;
    }

    didHitSprite() {    // preverja al bi platforma ob planiranem premiku zadela sprajt;
        let potentlHit = false;
        if(this.speed > 0) {
            const selfREdge = this.xPos + this.width;
            if((selfREdge - this.speed) <= FlyPod.#spriteRef.xPos && selfREdge > FlyPod.#spriteRef.xPos) {
                potentlHit = true;  // potential, ker smo potrdili samo prekoračenje po osi x;
            }
        } else {
            const spriteR = FlyPod.#spriteRef.xPos + FlyPod.#spriteRef.width;
            if((this.xPos - this.speed) >= spriteR && this.xPos < spriteR) {
                potentlHit = true;
            }
        }

        if(potentlHit) {
            if((this.yPos + this.height) > FlyPod.#spriteRef.yPos && this.yPos < (FlyPod.#spriteRef.yPos + FlyPod.#spriteRef.height)) {
                return true;
            }
        }
        return false;
    }

    processChanges() {
        
        // najprej vse izbrišemo;
        this.render(false);
        let spriteOn = false;
        const sprt = FlyPod.#spriteRef;

        if(sprt.yPos == this.yPos + this.height) {
            if(sprt.xPos + sprt.width >= this.xPos + 20 && sprt.xPos <= this.xPos + this.width - 20) spriteOn = true;
        }

        const startXPos = this.xPos;
        this.xPos += this.speed;
 
        // testiranje al smo morda prišli do meje in moramo obrniti;
        if(this.xPos < this.boundryL || this.xPos + this.width > this.boundryR) {   // obrat = true;
            this.xPos = startXPos;  // se vrnemo na izhodišče;
            this.speed = -this.speed; // obrnemo smer gibanja,;
            this.xPos += this.speed; // izvedemo premik v nasprotno smer;

            // ker je bil izveden obrat, moramo preverit, da ne bi s premikom po obratu zadeli sprajta (če je sprajt zgoraj, ni treba);
            if(!spriteOn && this.didHitSprite()) {
                this.xPos = startXPos; // ostanemo na mestu, hitrost pa ohranimo novo (torej nasprotno kot pred nesojenim obratom);
            }
        } else if(!spriteOn && this.didHitSprite()) this.xPos = startXPos;  // ne izvedemo ne premika ne spremembe smeri (samo ostanemo na izhodišču);

        if(spriteOn) sprt.extrnlLatPush(this.speed);    // če sprajt stoji gor, se premakne hkrati;

        // slikca;
        this.sx = FlyPod.#assetsSX[this.sxCountr];
        this.sxCountr++;
        if(this.sxCountr == 4) this.sxCountr = 1;
   
        this.render(true);
        
    }
}