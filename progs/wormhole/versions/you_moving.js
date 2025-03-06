class You {

    constructor () {   // nobenih statičnih ni treba, ker itak instanciiraš samo enkrat in pol je lih isto al je static al 1x instanca;

        // količine
        this.angleSpeed = 0;        // končna hitrost po koraku;
        this.angleSpeedToAction;    // srednja hitrost tekom koraka; ta se upošteva pri spremembi kota;
        this.angle = 0;
        
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
        if (this.angleSpeed != 0) this.#updateAngles();
        
        // po potrebi določimo ODMIK iz preteklega odmika ter kota in trajanja;
        if (this.angle != 0) this.#updateOffsets();

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
        // če ustrezno, kot izrazimo drugače
        if (previousAngle <= Math.PI && this.angle > Math.PI) this.angle = -Math.PI + (this.angle - Math.PI);
        if (previousAngle >= -Math.PI && this.angle < -Math.PI) this.angle = Math.PI + (this.angle + Math.PI); 
    }
    
    #updateOffsets() {
        Ring.dxAbstrct += Data.shareOf1StepIn1Unit * Math.sin(this.angle); 
        // +=, da je pozitiven odmik pri pozitivnem kotu (arbitrarno takrat, ko uporabiš tipko za desno);
        // Data.shareOf1StepIn1Unit, ker v enem koraku narediš (se premakneš naprej za) tolik del enote;
        
        // console.log('kot:', this.angle.toFixed(3), 'dX:', Ring.dxAbstrct.toFixed(2));
    }

    #straighten() {
        this.angleSpeed = 0;
        this.angleSpeedToAction;
        this.angle = 0;
    }

    #center() {
        this.#straighten();
        Ring.dxAbstrct = 0;
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