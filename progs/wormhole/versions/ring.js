class Ring {

    // del, določen z viewportom, sredina ekrana;
    static x;   // horizontalni radij in obenem x središča;
    static y;   // vr - vertikalni radij in obenem y središča;
    static r;   // r je hipotenuza hr in vr; največi radij obroča, ki seka oglišča ekrana oz. okna;

    static you; // bo referenca do instance you;

    static main = 0;    // koliko je celih dolžin pred obročem, npr. obroč, ki je oddaljen 7,54, ima 7 celih dolžin;
    static leader = 0;  // odmik, koliko je obroč oddaljen od najbližje cele dolžine, npr, če je od gledalca oddaljen 7,54, je odmik 0,54;

    static testXs = [];

    constructor(isProminent = false){ // dif je pozitivna vrednost;
        this.isProminent = isProminent;
        
        this.distance = (Data.numRings - 1) + Ring.leader; // abstraktna razdalja od gledalca;
        this.currR = Ring.r * ((2 * Math.atan2(0.5, this.distance)) / 2.6); // treba že v constructorju, ker obroč, ki je ustvarjen, ne gre v update pred prvim risanjem;
        this.currY = 0;
    }

    static setXYR (x, y, r) {
        Ring.x = x;     // lahko daš Ring ali this, isto je, ker je vse static, ta metoda in spremenljivka inicializirana v field initializerju (takoj za class);
        this.y = y;
        this.r = r;
    }

    static meet (nekoga) { Ring.you = nekoga; }

    update(i) {
        if (i == 0) {
            this.distance = Math.trunc((this.distance - Ring.you.dFwd) * 100000) / 100000;  // da zaokrožiš na 5 mest;
            Ring.main = Math.floor(this.distance)
            Ring.leader = this.distance - Ring.main;
            console.log(Ring.main, Ring.leader.toFixed(5));
        } else {
            this.distance = Ring.main + i + Ring.leader; 
        }
        this.currR = Ring.r * ((2 * Math.atan2(0.5, this.distance)) / 2.6); // 2,6 ker dejmo rečt da je tak kot človekovega vidnega polja v radianih;
    }
    
    draw(drawingCtx, ringsIdx){
        
        // debelina črte;
        let lineThickns = 2;
        if (ringsIdx == Data.numRings - 2) lineThickns = 3;
        if (ringsIdx >= Data.numRings - 1 ) lineThickns = 4; // zadnji obroč, ampak samo če je poln array, je 4;
        drawingCtx.lineWidth = lineThickns;
        
        // vrednosti;
        // field of view dx, razdalja (izražena v abstraktnih enotah) na črti, ki je pravokotna na pogled gledalca in seka središča kroga..
        // od sredine pogleda gledalca do središča kroga;
        let fOVdx = 0;
        // kot z vrhom v gledalcu med vzporednico, na kateri je gledalec, in središčem kroga;
        const ang = Math.atan2(Ring.you.dx, this.distance);
        // razdalja od gledalca do središča kroga;
        const connection = (Ring.you.dx ** 2 + (this.distance / 2) ** 2) ** (1/2);
        const ratio = (2 * Math.atan2(0.5, connection));
      // zmanjšat r, če je krog oddaljenjši?
        // if (Ring.you.dx != 0) this.currR = Ring.r * ratio; // za primer dx == 0 urejeno v update;
        fOVdx = Math.sin(ang + Ring.you.angleToAction) * connection * ratio;
        
        // prosojnost (šele zdaj, ker je odvisno od dx);
        const dist = Ring.you.dx == 0 ? this.distance : connection;
        const decValue = 255 - 255 * (Math.abs(dist) / (dist + 3));    // izvirno: 255 - 255 * (Math.abs(this.distance) / 20)
        const opacityValue = '' + decToHex(decValue);
        // if (ringsIdx == 0) console.log(decToHex(decValue));
        
        // barva (šele zdaj, ker je odvisna od prosojnosti);
        if (!this.isProminent) {
            drawingCtx.strokeStyle = `${Data.lightRingColor}${opacityValue}`;
        } else {
            drawingCtx.strokeStyle = `${Data.prominentRingColor}${opacityValue}`;
        }

        // risanje;

        const testTemp = Ring.x - fOVdx * Ring.r;
        Ring.testXs.unshift(testTemp);

        drawingCtx.beginPath();
        drawingCtx.arc(testTemp, Ring.y, this.currR, 0, 2 * Math.PI);
        //  Ring.x - Ring.dx, ker ko gledalec pritisne tipko desno, je to pozitiven odmik, ampak obroči pa e morajo premaknit levo;
        drawingCtx.stroke();
        // console.log('draw')

    }

}

