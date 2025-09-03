class You {

    static movtFwdPerTurn = 0.05;   // če je razdalja o gledalca do zadnjega obroča numRings enot in je po en obroč na enoto, je treba 1 / movtFwdPerTrn klikov, da se obroč premakne na mesto prejšnjega;

    constructor () {   // nobenih statičnih ni treba, ker itak instanciiraš samo enkrat in pol je lih isto al je static al 1x instanca;

        // količine
        this.angleSpeed = 0;        // končna hitrost na koncu koraka;
        this.angleSpeedToAction = 0;    // srednja hitrost tekom koraka; ta se upošteva pri spremembi kota;
        this.angle = 0;         // končni kot na koncu koraka;
        this.angleToAction = 0; // srednji kot tekom koraka; ta se upošteva pri premiku naprej in pri odmikih;
        
        // količine gibanja, izpeljane iz kota;
        this.dFwd = 0;  // sprotno; koliko se je v tem turnusu gledalec premaknil naprej vzdolž navidezne poti naravnost;
        this.dx = 0;  // kumulativno; abstrakten odmik po osi x od navidezne poti naravnost, ki bi jo delala središča krogov, če se gledalec nikoli ne bi odmaknil levo ali desno;

        // fizikalne omejitve
        this.maxAngleSpeed = 0.02;  // orig: 0,03
        this.friction = 0.0025;     // orig: 0,005; meja za anulirat: 0,003
        this.acceleration = 0.007;  // orig: 0,012

        // upravljanje
        this.movesRight = false; // arbitrarno pozitiven kot po x;
        this.movesLeft = false;

        this.#controls();
    }


    update() {
        // najprej glede HITROSTI (kotne);
        this.#updateAngleSpeed();
        
        // po potrebi spremenimo še KOT (pogleda);
        if (this.angleSpeedToAction != 0) this.#updateAngles();
            // če je v prejšnjem turnusu hitrost padla na nič, je povp. h. še vedno bila različna od nič in zato končni kot drugačen od srednjega;
            else if (this.angleToAction != this.angle) {
                // zdaj mora ta srednji kot postati tak, kot je bil prej končni, ker se premiki in odmiki računajo s srednjim kotom;
                this.angleToAction = this.angle;
                console.log('ja, tak primer');
            }
        
        // določimo premik NAPREJ in po potrebi ODMIK iz preteklega odmika ter kota in trajanja;
        this.#updateOffsets();

        return this.angle;
    }
    

    #updateAngleSpeed() {
        const previousAngleSpeed = this.angleSpeed; 
    
        // če ustrezno, pridobivamo hitrost;
        if (this.movesRight) {
            this.angleSpeed += this.acceleration;
            // console.log(this.angleSpeed);
        } else if (this.movesLeft) {    // else samo zaradi ekonomike;
            this.angleSpeed -= this.acceleration;
            // console.log(this.angleSpeed);
        }
        // če ustrezno, zamejimo hitrost pri najvišji vrednosti;
        if (Math.abs(this.angleSpeed) > this.maxAngleSpeed) {
            if (this.angleSpeed < 0) this.angleSpeed = -this.maxAngleSpeed;
                else this.angleSpeed = this.maxAngleSpeed;
            // console.log('omejeno na max', this.angleSpeed);
        }
       
        // če ustrezno, zmanjšujemo hitrost zaradi trenja;
        if (this.angleSpeed != 0 && !this.movesRight && !this.movesLeft) {  // samo če se ne dotikaš ne leve, ne desne; če se dotikaš katere, je to pokrito že zgoraj;
            if (this.angleSpeed > 0) this.angleSpeed -= this.friction;
                else this.angleSpeed += this.friction;
            // console.log(this.angleSpeed);
        }
        // če ustrezno, hitrost spravimo na 0;
        if (this.angleSpeed != 0 && Math.abs(this.angleSpeed) <= 0.0015) {
            this.angleSpeed = 0;
            // console.log('na nič zaradi trenja', this.angleSpeed);
        }
    
        if (previousAngleSpeed != this.angleSpeed) {
            this.angleSpeedToAction = (previousAngleSpeed + this.angleSpeed) / 2;
        }   else this.angleSpeedToAction = this.angleSpeed;
        // console.log('anglespeed:', this.angleSpeed, 'toAction:', this.angleSpeedToAction);

    }


    #updateAngles() {
        const previousAngle = this.angle;

        // kot iz kotne hitrosti;
        this.angle += this.angleSpeedToAction;
        this.angleToAction = (previousAngle + this.angle) / 2;  // tega niti ni teba pretvorit, ker izračun bo lih enak (ni ga pa treba prikazat);
        // če ustrezno, kot izrazimo drugače
        if (previousAngle <= Math.PI && this.angle > Math.PI) this.angle = -Math.PI + (this.angle - Math.PI);
        if (previousAngle >= -Math.PI && this.angle < -Math.PI) this.angle = Math.PI + (this.angle + Math.PI); 
    }
    
    #updateOffsets() {

        // premik naprej; ni kumulativno;
        this.dFwd = You.movtFwdPerTurn * Math.cos(this.angleToAction); 
        
        // odmik po osi x; kumulativno;
        this.dx += You.movtFwdPerTurn * Math.sin(this.angleToAction); 
        // +=, da je pozitiven odmik pri pozitivnem kotu (arbitrarno takrat, ko uporabiš tipko za desno);
        
        // console.log('kot:', this.angle.toFixed(3), 'dX:', Ring.dxAbstrct.toFixed(2));
    }

    #straighten() {
        this.angleSpeed = 0;
        this.angleSpeedToAction = 0;
        this.angle = 0;
        this.angleToAction = 0;
    }

    #center() {
        this.#straighten();
        this.dx = 0;
    }


    #controls () {

        document.onkeydown=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.movesLeft=true;
                    break;
                case "ArrowRight":
                    this.movesRight=true;
                    break;
                case "c":
                    this.#center();
                    break;
                case "C":   // to bi moral rešit z e.code, ne e.key, pol bi lahko imel keyC, ki pokrije oba, c in C;
                    this.#center();
                    break;
                case "s":
                    this.#straighten();
                    break;
                case "S":
                    this.#straighten();
                    break;
            }
        }
        document.onkeyup=(event)=>{
            switch(event.key){
                case "ArrowLeft":
                    this.movesLeft=false;
                    break;
                case "ArrowRight":
                    this.movesRight=false;
                    break;
            }
        }
    }

    destroyControls () {
        document.onkeydown = null;
        document.onkeyup = null;

    }

}