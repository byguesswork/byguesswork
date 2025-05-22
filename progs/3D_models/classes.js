class SpacePoint{
    constructor (xWidth, yDepth, zHeight) {
        this.x = xWidth; // širina prostora; kar je na ekranu levo desno
        this.y = yDepth; // globina prostora; kar bi bilo na ekranu naprej, v globino, daleč od gledalca;
        this.z = zHeight; // višina prostora; kar je na ekranu gor/dol;
    }
}

class ScreenPoint{
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
}

class FillInfo{
    constructor(doFill, color, type) {  // slednja dva lahko pustiš prazna, če ju ne rabiš;
        this.doFill = doFill;   // true/false; če false, naj ostale ostanejo undefined;
        this.color = color;  // barva obarvanja ploskve; lahko pustiš prazno, če je prvi false;
        this.typ = type // glej konstante; lahko pustiš prazno, če je prvi false;
    }
}


class Segment{
    constructor(
        allSpcPtsRef,   // ref na spacePoints od predmeta;  
        fillInfo,       // če undefined/false, se nastavi fillInfo.doFill = false;
        connections,    // če undefined, se nastavi na obrazec povezave, ki opiše štirikotnik;
        spcPtsIdxs) {   // spcPtsIdxs je array indeksov, na osnovi katerega bo nastal podnabor točk za to ploskev; če UNDEFINED, se nastavi na allSpcPtsRef;
        
        this.spcPts;
        this.conns4CalcScrnPts = new Array();   // tega se zapolni v konstruktorju od predmeta s klicem createConns4CalcScrnPts();

        if (fillInfo == undefined || fillInfo == false) this.fillInfo = new FillInfo(false);
            else this.fillInfo = fillInfo;

        if (connections == undefined) this.conns = Thingy.defaultConnections;
            else this.conns = connections;
        
        if (spcPtsIdxs == undefined) this.spcPts = allSpcPtsRef;
        else {
            this.spcPts = new Array();
            spcPtsIdxs.forEach(idx => {
                this.spcPts.push(allSpcPtsRef[idx]);
            })
        }
    }
}

//konstante
// tipi za FillInfo.typ
const ANTECENTRUM = 'ac';   // če tak tip, se ploskev izriše samo, če je bliže gledalcu od (ploskovnega) centra objekta; te se izrisujejo zadnje;
const ORBITAL = 'o'; // ploskve takega tipa se v posebni pasaži izrisujejo od planarno najbolj oddaljene od gledalca (glede na r) do najbližje
const BASE = 'b';   // te ploskeve se izrišejo prve in vedno; NAJPREJ DAJ ČRNE BASE, potem oris!!
// barva;
const GLASS = '#caebf555'; // barva stekla;


class Thingy {

    static ctx;
    static rotationAngleIncrmnt = Math.PI/30;
    static defaultConnections = [ [0, 1], [2], [3], [0]];

    constructor() {
        // this.angle = 0;  kot se za zdaj še ne rabi; rabil bi se, če bi se stvari premikale in bi moral poznat njihovo usmeritev, da bi jih pravilno premaknil; 
        this.center = undefined // središče telesa na vodoravni ravnini, gledano s ptičje perspektive

        // KO INSTANCIIRAŠ OBJEKT, KI EXTENDA THINGY, OBVEZNO ustvari/zaženi:
            // - spacePoints
            // - segments
            // - calcRFromSpcPt
            // - center je obvezen, če podaš kak drug tip kot BASE
            // drugo je optional (center, barva, rotate, ...)
    }

    draw(screenPoints, whichSegmnt) { //    ! !  PAZI ! !  riše s screenPts, ne spacePts ! !

        ctx.beginPath();
        this.segments[whichSegmnt].conns.forEach(connctn => {
            if (connctn.length == 1) {  // če je array connctn (ki je del arraya connections) dolg 1, podaja samo končno točko poteze (vzeto iz arraya scrnPts);
                ctx.lineTo(screenPoints[connctn[0]].x, screenPoints[connctn[0]].y);
            } else {    // če je array connctn (ki je del arraya connections) dolg 2, podaja novo izhodišče in nato končno točko poteze;
                ctx.moveTo(screenPoints[connctn[0]].x, screenPoints[connctn[0]].y);
                ctx.lineTo(screenPoints[connctn[1]].x, screenPoints[connctn[1]].y);
            }
        });
        if (this.segments[whichSegmnt].fillInfo.doFill) {
            ctx.fillStyle = this.segments[whichSegmnt].fillInfo.color;
            ctx.fill();
            if (this.segments[whichSegmnt].fillInfo.typ == ANTECENTRUM) {
                ctx.strokeStyle = this.segments[whichSegmnt].fillInfo.color;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.lineWidth = 1;  // povrnemo začetne nastavitve strokstyle;
                ctx.strokeStyle = lineColor;
            }
            return; // da ne naredi stroke, torej obrobe okoli obarvane površine;
        }
        ctx.stroke();
    }

    rotate(passedAngle){    // poda se ali (1) true/false za clockwise/anticlockwise ali (2) število za delto kota;
        
        // najprej helper
        function helper(spcPt, passedThis) {
            let x = spcPt.x - passedThis.center.x;  // x in y relativiziramo; to sta x in y koordinati PROSTORSKE točke
            let y = spcPt.y - passedThis.center.y;    // ampak uporabljamo samo x in y, ker vrtimo samo po eni osi, na eni ravnini;
            const r = (x**2 + y**2)**(0.5);
            
            let angle;
            if (y > 0) {
                angle = Math.asin(x/r) + diffAngle;   // izračunamo kot od središča do točke in HKRATI prištejemo še spremembo kota;
            } else if (y < 0) {
                angle = Math.PI - Math.asin(x/r) + diffAngle;
            } else if (y == 0) {
                if (x < 0) angle = 1.5 * Math.PI + diffAngle;
                else angle = 0.5 * Math.PI + diffAngle;
            }
            
            //zdaj, ko smo dobili nov kot, že kar lahko izračunamo nov x in nov y (prostorske) relativne točke, ki bo izrisana;
            spcPt.x = r * Math.sin(angle) + passedThis.center.x;
            spcPt.y = r * Math.cos(angle) + passedThis.center.y;
        }
        
        // začetek dogajanja;
        if (this.center == undefined) { this.center = Thingy.calcPlanarCtr(this.spacePoints); }

        let diffAngle;
        if (typeof passedAngle == 'boolean') {
            if (passedAngle) diffAngle = Thingy.rotationAngleIncrmnt;
            else diffAngle = -Thingy.rotationAngleIncrmnt;
        } else diffAngle = passedAngle;

        // glavna akcija (ki se seveda odvija v helper, tle je samo disambiguacija;)
        this.spacePoints.forEach(spcPt => { helper(spcPt, this); })
    }

    static createConns4CalcScrnPts(passdSegments) {
        passdSegments.forEach(segment => {
            segment.conns.forEach((el, i, arr) => {
                if (el.length == 2) {
                    segment.conns4CalcScrnPts.push([el[0], el[1]]);
                } else {    // če ima povezava samo en element, moramo izhodišče potegnit iz prejšnje povezave; 
                    if (arr[i - 1].length == 1) {
                        segment.conns4CalcScrnPts.push([arr[i-1][0], el[0]]);
                    } else segment.conns4CalcScrnPts.push([arr[i-1][1], el[0]]);
                }
            })
        })
    }

    static meetCtx(passedCtx){
        Thingy.ctx = passedCtx;
    }

    static calcPlanarCtr(passdArr) {    // prejme array (verjetno) spacePointov, morda lahko tudi kaj drugea, kar ima not x in y;
        // console.log(passdArr)
        let xMin = passdArr[0].x;
        let xMax = passdArr[0].x;
        let yMin = passdArr[0].y;
        let yMax = passdArr[0].y;
        passdArr.forEach(spcPt => {
            if (spcPt.x < xMin) xMin = spcPt.x;
            else if (spcPt.x > xMax) xMax = spcPt.x;
            // y;
            if (spcPt.y < yMin) yMin = spcPt.y;
            else if (spcPt.y > yMax) yMax = spcPt.y;
        });
        return { // to poda dvodimenzionalne koordinate, na vodoravni ravnini, kjer se bo odvijalo vrtenje;
            x: (xMin + xMax) / 2,
            y: (yMin + yMax) / 2
        };
    }

    // izračuna daljico r med dvema točkama; referenca na obj je samo zato, ker gre za strukturirane podatke, ki vsebujejo x in y, objekt ne pomeni predmeta v prostoru;
    static calcRFromSpcPt(passdObj, passdViewrObj) {   // v resnici iz katerihkoli 2 objektov, ki na prvem nivoju vsebujeta propertija x in y;
        return ((passdObj.x - passdViewrObj.x)**2 + (passdObj.y - passdViewrObj.y)**2)**(0.5);
    }
}


class Viewer {

    constructor(x, y, z){
        this.posIn3D = new SpacePoint(x, y, z)
        this.angle = 0; // kot 0 gleda vzdolž osi y, v smeri naraščanja y;
        this.rotationAngleIncrmnt = Math.PI/90;
    }

    move(dir, viewer){
        if (dir == LEFT) {
            this.posIn3D.x -= 0.2 * Math.cos(viewer.angle); // prvenstveni premik;
            this.posIn3D.y += 0.2 * Math.sin(viewer.angle); // dodaten premik ob morebitnem kotu;
        } else if (dir == RIGHT) {
            this.posIn3D.x += 0.2 * Math.cos(viewer.angle);
            this.posIn3D.y -= 0.2 * Math.sin(viewer.angle);
        } else if (dir == FORWARD) {
            this.posIn3D.y += 0.2 * Math.cos(viewer.angle); // prvenstveni premik;
            this.posIn3D.x += 0.2 * Math.sin(viewer.angle);
        } else if (dir == BACK) {
            this.posIn3D.y -= 0.2 * Math.cos(viewer.angle);
            this.posIn3D.x -= 0.2 * Math.sin(viewer.angle);
        } else if (dir == UP) {
            this.posIn3D.z += 0.2;
        } else if (dir == DOWN) {
            this.posIn3D.z -= 0.2;
        }
    }

    rotate(dir){
        if (dir == ANTICLOCKW) {
            this.angle -= this.rotationAngleIncrmnt;
        } else {
            this.angle += this.rotationAngleIncrmnt;
        }
        this.angle = rangeAngle(this.angle);
    }
}


// class Square extends Thingy {    // je bil samo za učenje, trenutno se ne uporablja

//     constructor(spacePoint, side) {
//         super();

//         this.spacePoints = [new SpacePoint(), new SpacePoint(), new SpacePoint(), new SpacePoint()];
//         this.side = side;
//         // connections so navodila, med katerimi točkami je treba risat povezave; začetek v točki 0 je privzet (v metodi draw());
//         this.connections = [[1], [2], [3], [0]];    // connections za kvadrat podaja samo točke za zvezno risanje, vmes nobenega novega izhodišča (novo izhodišče bi bilo, če bi kateri od elementov arraya connections bil array z dvema elementoma);

//         this.move(spacePoint);          
//     }
    
//     // v bistvu uporabimo isto metodo za prvič postavit na zemjevid in vsakokrat naslednjič;
//     move(spacePoint){ // vedno (pri inicializaciji in morebitnem poznejšem move) podaš izhodiščno točko, ki je spodnja leva; morda v prihodnje naredit tudi varianto metode, da podaš samo zamik;
//         this.spacePoints[0].x = spacePoint.x; // 0 je spodnji levi;
//         this.spacePoints[0].y = spacePoint.y;
//         this.spacePoints[0].z = spacePoint.z;
//         // y-ji so vsi enaki;
//         this.spacePoints[1].y = spacePoint.y;
//         this.spacePoints[2].y = spacePoint.y;
//         this.spacePoints[3].y = spacePoint.y;
//         // še ostala oglišča, v kontra smeri urinega kazalca;
//         this.spacePoints[1].x = spacePoint.x + this.side;
//         this.spacePoints[1].z = spacePoint.z;
//         this.spacePoints[2].x = spacePoint.x + this.side;
//         this.spacePoints[2].z = spacePoint.z - this.side;
//         this.spacePoints[3].x = spacePoint.x;
//         this.spacePoints[3].z = spacePoint.z - this.side;

//     }

//     draw(scrnPts){
//         super.draw(scrnPts, this.connections);
//     }
// }


class Cube extends Thingy {

    constructor(passedSpacePoint, side){
        super();
        
        this.side = side;

        this.spacePoints = [
            // prednji kvadrat;
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, -passedSpacePoint.z),    // 0
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y, -passedSpacePoint.z),
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y, -passedSpacePoint.z - this.side),
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, -passedSpacePoint.z - this.side),
            // zadnji kvadrat (oddaljenejši)
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + this.side, -passedSpacePoint.z),  // 4;
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y + this.side, -passedSpacePoint.z),
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y + this.side, -passedSpacePoint.z - this.side),
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + this.side, -passedSpacePoint.z - this.side),
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + this.side, -passedSpacePoint.z),
        ]

        this.center = Thingy.calcPlanarCtr(this.spacePoints);

        this.segments = [];

        this.segments.push(new Segment(this.spacePoints,
            new FillInfo(false),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7] ],
        ));

        Thingy.createConns4CalcScrnPts(this.segments);
    }
}


class Pickup extends Thingy {
    constructor(passedSpacePoint, bodyColr = 'grey', passedAngle){  // gledan od spredaj, točka spodaj levo; 
                                                // passed angle se rabi, če želiš predmet zarotirati takoj ob stvaritvi;
                                                // če passed angle ni podan, je undefined, preverjeno;
        super();

        // navedba vseh točk, ki bojo kdaj uporabljene za risanje, vse definirane glede na podano izhodišče;
        this.spacePoints = [
        // OPISI PODANI GLEDANO OD SPREDAJ PROTI SEVERU;
        // prednji kvadrat karoserije;
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, -passedSpacePoint.z), // 0 je spodnji levi kot karoserije, gledano od spredaj;
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y, -passedSpacePoint.z), // 1
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y, -passedSpacePoint.z - 0.9),
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, -passedSpacePoint.z - 0.9),
    
        // zadnji kvadrat karoserije;
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 5, -passedSpacePoint.z), // 4
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 5, -passedSpacePoint.z), // 
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 5, -passedSpacePoint.z - 0.9),
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 5, -passedSpacePoint.z - 0.9),
    
        // kabina
        new SpacePoint(passedSpacePoint.x + 0.05, passedSpacePoint.y + 1.0, - passedSpacePoint.z - 1.1), // 8   ; 0,1, da je malo ožje kot karoserija spodaj
        new SpacePoint(passedSpacePoint.x + 1.95, passedSpacePoint.y + 1.0, - passedSpacePoint.z - 1.1),    // 9 ; 1.95, da je malo ožje kot karoserija spodaj (1,85, točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;
        new SpacePoint(passedSpacePoint.x + 1.9, passedSpacePoint.y + 1.7, - passedSpacePoint.z - 1.8), // 10   ; desna zgornja točka stekla (gledano od spredaj, dolžina tega dela: 0,7, končan višina: 1,8
        new SpacePoint(passedSpacePoint.x + 0.1, passedSpacePoint.y + 1.7, - passedSpacePoint.z - 1.8),    // 11 ; leva zgornja stekla
        new SpacePoint(passedSpacePoint.x + 1.9, passedSpacePoint.y + 2.4, - passedSpacePoint.z - 1.8), // 12   ; desna zadnja zgornja točka kabine (gledano od spredaj, ravna streha kabine dolga 0,7
        new SpacePoint(passedSpacePoint.x + 0.1, passedSpacePoint.y + 2.4, - passedSpacePoint.z - 1.8),    // 13 ; leva zadnja zgornja kabine
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 2.4, - passedSpacePoint.z - 0.9), // 14   ; desna zadnja spodnja točka kabine (na sredini karoserije, na pol poti od tli do vrha; gledano od spredaj)
        new SpacePoint(passedSpacePoint.x + 0.0, passedSpacePoint.y + 2.4, - passedSpacePoint.z - 0.9),    // 15 ; leva zadnja spodnja kabine (na sredini med tlemi in vrhom kabine)

        // luči spredaj
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y, - passedSpacePoint.z - 0.60), // 16
        new SpacePoint(passedSpacePoint.x + 0.60, passedSpacePoint.y, - passedSpacePoint.z - 0.60),
        new SpacePoint(passedSpacePoint.x + 0.60, passedSpacePoint.y, - passedSpacePoint.z - 0.80),
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y, - passedSpacePoint.z - 0.80), //
    
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y, - passedSpacePoint.z - 0.60), // 20
        new SpacePoint(passedSpacePoint.x + 1.85, passedSpacePoint.y, - passedSpacePoint.z - 0.60),
        new SpacePoint(passedSpacePoint.x + 1.85, passedSpacePoint.y, - passedSpacePoint.z - 0.80),
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y, - passedSpacePoint.z - 0.80), //

        // luči zadaj
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.60), // 24
        new SpacePoint(passedSpacePoint.x + 0.60, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.60),
        new SpacePoint(passedSpacePoint.x + 0.60, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.80),
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.80), //
    
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.60), // 28
        new SpacePoint(passedSpacePoint.x + 1.85, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.60),
        new SpacePoint(passedSpacePoint.x + 1.85, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.80),
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y + 5, - passedSpacePoint.z - 0.80), //7

        new SpacePoint(passedSpacePoint.x + 0.022, passedSpacePoint.y + 2.4, -passedSpacePoint.z - 1.1), // 32 točka na desnem B strebričku (na levi strani, gledano od spredaj), enako visoka kot vrh havbe;
        new SpacePoint(passedSpacePoint.x + 2 - 0.022, passedSpacePoint.y + 2.4, -passedSpacePoint.z - 1.1), // ista ne levem strebričku

        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 2.4, -passedSpacePoint.z - 0.2), // 34   ; desna zadnja spodnja točka kesona (na sredini karoserije, na dnu avta; gledano od spredaj)
        new SpacePoint(passedSpacePoint.x + 0.0, passedSpacePoint.y + 2.4, - passedSpacePoint.z - 0.2),    // 35 ; leva zadnja spodnja kesona (na dnu avta)
        ];

        this.center = Thingy.calcPlanarCtr(this.spacePoints);
        this.bodyColor = bodyColr;

        this.segments = [];

        // NAJPREJ DAJ ČRNE BASE, potem oris!!

        // črno
        this.segments.push(new Segment( 
            this.spacePoints,   // to se poda samo za referenco, ne bo nikjer shranjeno
            new FillInfo(true, 'black', BASE),
            [ [0, 1], [5], [4], [0], [3, 2], [6], [7], [3] ],
            [0, 1, 2, 3, 4, 5, 6, 7]
        ));

         // havba kot base (če gledaš od zadaj in jo vidiš od noter);
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, 'black', BASE), 
            undefined,  // če podajaš povezavo, ki opisuje štirikotnik, lahko podaš undefined;
            [ 3, 2, 9, 8]
        ));

         // filerji kot base;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, 'black', BASE),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4]], 
            [ 15, 3, 8, 32, 2, 9, 33, 14]
        ));

        // // glavni oris (oris mora vedno slediti črnemu baseu)
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(false, undefined, BASE),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7], [3, 8], [2, 9],
            [8, 9], [10], [11], [8], [10, 12], [13], [11], [13, 15], [14], [12], [15, 18], [14, 17] ],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 34, 35],
        ))

        // prednja stena kesona; ta sledi orisu, ker če ne je oris notranjosti kabine videt skozi pregrado;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, 'blask', BASE), undefined,[ 15, 14, 34, 35]
        ));

        // prednja ploskev;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ANTECENTRUM), undefined, [ 0, 1, 2, 3 ]
        ));

        // desna ploskev;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ANTECENTRUM), undefined, [ 4, 0, 3, 7 ]
        ));

        // leva ploskev;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ANTECENTRUM), undefined, [ 5, 1, 2, 6]
        ));

        // zadnja ploskev;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ANTECENTRUM), undefined, [ 4, 5, 6, 7]
        ));

        // havba;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ANTECENTRUM), undefined, [ 3, 2, 9, 8]
        ));

        // desni filer;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ORBITAL), undefined, [ 15, 3, 8, 32]
        ));

        // levi filer;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, this.bodyColor, ORBITAL), undefined, [ 2, 9, 33, 14]
        ));

        // prednje steklo;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, GLASS, BASE), undefined, [ 8, 9, 10, 11]
        ));

        // desno steklo;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, GLASS, BASE), undefined, [ 32, 8, 11, 13]
        ));

        // levo steklo;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, GLASS, BASE), undefined, [ 9, 10, 12, 33]
        ));

        // zadnje steklo;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, GLASS, BASE), undefined, [ 14, 15, 13, 12]
        ));

        // luči spredaj;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, '#fffdf0', ANTECENTRUM),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4]],
            [ 16, 17, 18, 19, 20, 21, 22, 23]
        ));

        // luči zadaj;
        this.segments.push(new Segment( this.spacePoints,
            new FillInfo(true, '#d11515', ANTECENTRUM),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4]],
            [ 24, 25, 26, 27, 28, 29, 30, 31]
        ));

        // ustvarimo še povezave napisane na tak način, da se lahko lažje uporabi pri interpolaciji
        Thingy.createConns4CalcScrnPts(this.segments);

        if (passedAngle != undefined && passedAngle != 0) this.rotate(passedAngle);
    }
}


class Connection extends Thingy {

    constructor(spacePoint, spacePoint2) {
        super();

        this.spacePoints = [spacePoint, spacePoint2];
        
        this.segments = new Array(new Segment(
            this.spacePoints,
            false,
            [[0, 1]]
        ));

        Thingy.createConns4CalcScrnPts(this.segments);
    }
}


class HorzRectangle extends Thingy {

    constructor(spacePoint, width, depth) {
        super();

        this.width = width;
        this.depth = depth;

        this.spacePoints = [
            new SpacePoint(spacePoint.x, spacePoint.y, spacePoint.z),
            new SpacePoint(spacePoint.x + this.width, spacePoint.y, spacePoint.z),
            new SpacePoint(spacePoint.x + this.width, spacePoint.y + this.depth, spacePoint.z),
            new SpacePoint(spacePoint.x, spacePoint.y + this.depth, spacePoint.z)
        ];
 
        this.segments = [
            new Segment(this.spacePoints, new FillInfo(true, 'white', BASE))
        ];

        Thingy.createConns4CalcScrnPts(this.segments);
    }
}