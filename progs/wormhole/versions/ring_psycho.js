class Ring {

    // del, določen z viewportom, sredina ekrana;
    static x;   // horizontalni radij in obenem x središča;
    static y;   // vr - vertikalni radij in obenem y središča;
    static r;   // r je hipotenuza hr in vr; največi radij obroča, ki seka oglišča ekrana oz. okna;

    // del, določen s položajem gledalca/letalca;
    static dxAbstrct = 0;  // nabrani offset od Ring.x; točka, kjer se trenutno nahaja gledalec; abstraktna, izražena kot delež enote, ne kot število pikslov, ki je recimo odvisno od r-ja;
    static dyAbstrct = 0;

    static you;

    constructor(ringCounter, isProminent = false){
        this.ringNr = ringCounter;  // katera absolutna številka kroga je tale krog;
        this.isProminent = isProminent;
        
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

    static meet (nekoga) { Ring.you = nekoga; }

    update() {
        this.currRatioIdx++;
        // this.currR = Ring.r * Data.ratios[this.currRatioIdx];    // včasih je bil r določen tako, nespremenljiv glede na razdaljo pogleda od osi gibanja središč obročev;

    }

    draw(drawingCtx, ringsIdx){

        // prosojnost;
        // const decValue = 24 /* štartamo iz precej temnega */ + (this.currRatioIdx / Data.numRatios) * (255 - 64); // ker -64 (namesto -24) na podlago +24 pomeni, da nikoli ne pridemo do povsem svetle barve;
        const decValue = ((Data.ratios[this.currRatioIdx] + (this.currRatioIdx / Data.numRatios)) * 255) / 2; // mix med linearno in hiperbolično;
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
        let fOVdx = 0;
        const aa = (Data.numRatios - this.currRatioIdx) / Data.stepsPerUnit;    // v enotah, koliko je pravokotna razdalja od ravnine gledalca do središča obroča 
        const ang = Math.atan2(Ring.dxAbstrct, aa); // kot z vrhom v gledalcu med vzporednico, na kateri je gledalec, in središčem kroga;
        const connection = (Ring.dxAbstrct ** 2 + aa ** 2) ** (1/2);
        // console.log(Ring.dxAbstrct, aa.toFixed(2), connection.toFixed(2));
        this.currR = Ring.r * 2*Math.atan2(0.5, connection);
        fOVdx = Math.sin(ang + Ring.you.angle) * connection * Data.ratios[this.currRatioIdx];  // field of view DX

        drawingCtx.beginPath();
        drawingCtx.arc((Ring.x - fOVdx * Ring.r), Ring.y, /*this.currR*/Ring.r * aa, 0, 2 * Math.PI);
        //  Ring.x - Ring.dx, ker ko gledalec pritisne tipko desno, je to pozitiven odmik, ampak obroči pa e morajo premaknit levo;
        drawingCtx.stroke();

        drawingCtx.strokeStyle = 'red';
        drawingCtx.beginPath();
        drawingCtx.arc((Ring.x - fOVdx * Ring.r), Ring.y, Ring.r * Data.ratios[this.currRatioIdx], 0, 2 * Math.PI);
        //  Ring.x - Ring.dx, ker ko gledalec pritisne tipko desno, je to pozitiven odmik, ampak obroči pa e morajo premaknit levo;
        drawingCtx.stroke();

        if (ringsIdx >= 9)console.log(2*Math.atan2(0.5, aa), Data.ratios[this.currRatioIdx])

    }

}

