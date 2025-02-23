class Ring {

    static x;   // horizontalni radij in obenem x središča;
    static y;   // vr - vertikalni radij in obenem y središča;
    static r;   // r je hipotenuza hr in vr; največi radij obroča, ki seka oglišča ekrana oz. okna;

    constructor(ringCounter, isProminent = false, changes){
        this.ringNr = ringCounter;  // katera absolutna številka kroga je tale krog;
        this.isProminent = isProminent;
        this.changes = Array.from(changes); // bodoča struktura, ki se inicializira v update:
        // angleX,
        // angleY,
        // ringNrAtShift,
        // r; premer obroča, ko je prišlo do sprmembe; TO JE OBENEM TUDI VEDNO NAJMANJŠI R, oz. r pri najmanjšem ratio, ker do spremembe itak pride pri novem obroču!
        
        // tej se spremenijo pozneje oz. takoj v update;
        this.currRatioIdx = -1; // zero-based, torej idx od niza ratiov; na začetku -1, ker mu že takoj v update (pred prvim risanjem) damo++;
        this.currR = 0;
        this.currY = 0;
    }

    static setXYR (x, y, r) {
        Ring.x = x;     // lahko daš Ring ali this, isto je, ker je vse static, ta metoda in sprmenljivka inicializirana v field initializerju (takoj za class);
        this.y = y;
        this.r = r;
    }

    update(bumpX, bumpY, newAngle, ringCounter) {
        this.currRatioIdx++;
        this.currR = Ring.r * Data.ratios[this.currRatioIdx];

        if (newAngle) {
            this.changes.unshift({angleX : bumpX, angleY : bumpY, ringNrAtShift : ringCounter, r : this.currR})
            console.log('Angle shift after ring nr: ', this.changes[0].ringNrAtShift - 1);
        }
        
        let angleX = 0, angleY = 0;
        let timesX = 0, timesY = 0;
        let shiftR = 0;
        this.currX = 0; // zdaj jo bomo uporabili kot začasno spremenljivko;
        this.currY = 0;
        if (this.changes.length != 0) {
            let startRingNr;
            for (let j = 0; j < this.changes.length; j++) {
                if (j == 0) startRingNr = this.ringNr;
                    else startRingNr = this.changes[j-1].ringNrAtShift;
                angleX = this.changes[j].angleX;
                timesX = startRingNr - this.changes[j].ringNrAtShift + 1;
                angleY = this.changes[j].angleY;
                timesY = startRingNr - this.changes[j].ringNrAtShift + 1;
                // težava je pogruntat, kako velik premik naredit;
                // za zdaj je videt, dognano s poskušanjem, da bi lahko bilo (this.changes[0].r + this.currR); zakaj je tako, ne vem;
                // vsaka posebej al mal preveč zaostaja, al mal preveč prehiteva ...
                shiftR = (this.changes[j].r + this.currR)/2;
                // console.log('j:', j, 'angl:', angle, 'times:', times, 'shiftR', shiftR);
                this.currX += Math.sin(angleX) * timesX * (2 * shiftR); // bi tu moralo bit 1x ali 2x shiftR ??  ; 
                this.currY += Math.sin(angleY) * timesY * (2 * shiftR);
            }
        }

        this.currX = Ring.x + this.currX;   // slednji currX se je v zgornji zanki potencialno spremenil;
        this.currY = Ring.y + this.currY;   // slednji currY se je v zgornji zanki potencialno spremenil;

        return Array.from(this.changes);

    }

    draw(drawingCtx, ringsIdx){

        // prosojnost;
        const decValue = 24 /* štartamo iz precej temnega */ + (this.currRatioIdx / Data.numRatios) * (255 - 64); // ker -64 (namesto -24) na podlago +24 pomeni, da nikoli ne pridemo do povsem svetle barve;
        const opacityValue = '' + decToHex(decValue);
        
        // debelina črte;
        let lineThickns = 2;
        if (ringsIdx == Data.numRings - 2) lineThickns = 3;
        if (ringsIdx >= Data.numRings - 1 ) lineThickns = 4; // zadnji obroč, ampak samo če je poln array, je 4;
        drawingCtx.lineWidth = lineThickns;

        //barva
        if (!this.isProminent) {
            drawingCtx.strokeStyle = `${Data.lightRingColor}${opacityValue}`;
        } else {
            drawingCtx.strokeStyle = `${Data.prominentRingColor}${opacityValue}`;
        }
        
        // risanje
        drawingCtx.beginPath();
        drawingCtx.arc(this.currX, this.currY, this.currR, 0, 2 * Math.PI);
        drawingCtx.stroke();

    }
}

