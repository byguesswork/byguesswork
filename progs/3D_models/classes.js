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
    constructor(    // če ne rabiš, lahko pustiš vse prazno
        doFill, // false/true
        type, // glej konstante, BASE ali PROXIMAL
        fillColor,
        spatlDiffFrmCtr) {  // SpacePoint, ki pove, koliko je od prostorsekga centra oddaljena točka, s katero bomo preverjali, al prej vidiš prostorski center ploskve al tisto točko; za PROXIMAL-e;
        
            if (doFill == undefined || doFill == false) {
            this.doFill = false;    // doFill je najpomembnejši; zadostuje, da je doFill false, pa so ostali nerelevantni;
        } else {
            this.doFill = true;   // true, če si prišel do sem; če false, ostali itak ostanejo undefined, glej zgoraj;
            if (type != BASE && type != PROXIMAL && fillColor == undefined) {  // predpostavljamo, da podaš kar barvo na drugem mestu;
                this.fillCol = type;
            } else {
                this.typ = type // glej konstante;
                this.fillCol = fillColor;  // barva obarvanja ploskve; lahko pustiš prazno, če je prvi false;
                if (spatlDiffFrmCtr != undefined) { // za zdaj v distlSptlCtr shranimo samo diff (relativno), absolutno vred. izračunamo pozneje;
                    this.distlSptlCtr = spatlDiffFrmCtr;
                }
            }
        }
    }
}


class Segment{
    constructor(
        allSpcPtsRef,   // ref na spacePoints od predmeta;  
        fillInfo,       // če undefined/false, se nastavi fillInfo.doFill = false;
        connections,    // če undefined, se nastavi na obrazec povezave, ki opiše štirikotnik;
        spcPtsIdxs,     // spcPtsIdxs je array indeksov, na osnovi katerega bo nastal podnabor točk za to ploskev; če UNDEFINED, se nastavi na allSpcPtsRef;
        rArc) {     // polmer kroga, če krog
        
        this.spcPts;
        this.connsAlt = new Array();   // tega se zapolni v konstruktorju od predmeta s klicem createConnsAlt();

        if (fillInfo.constructor.name == 'FillInfo' || fillInfo == undefined || fillInfo == false) {
            if (fillInfo.constructor.name == 'FillInfo') this.fillInfo = fillInfo;
                else this.fillInfo = new FillInfo(false);

            if (connections == undefined) this.conns = Thingy.defaultConnections;
            else this.conns = connections;
        
            if (spcPtsIdxs == undefined) this.spcPts = allSpcPtsRef;
            else {
                this.spcPts = new Array();
                spcPtsIdxs.forEach(idx => {
                    this.spcPts.push(allSpcPtsRef[idx]);
                })
            }
        } else {    // če z argumentom fillInfo podamo objekt, ki je lik, in ne FillInfo
            this.frmObj = true; // zabeležimo, da je bil segment (pomembno: SEGMENT, ne item) ustvarjen iz prej ustvarjenega objekta (instance nekega klasa);
            this.fillInfo = Object.assign({}, fillInfo.segments[0].fillInfo); //plitko kopiranje objekta;
            this.conns = [...fillInfo.segments[0].conns];
            this.spcPts = [...fillInfo.segments[0].spcPts];
            if (fillInfo.segments[0].rArc != undefined) this.rArc = fillInfo.segments[0].rArc;
        }

        if (this.fillInfo.typ == PROXIMAL && this.fillInfo.spatialCtr == undefined) {   // pogoj z spatialCtr == undefined je zato, da ne greš dvakrat skozi, če namesto fillInfo podaš objekt;
            this.fillInfo.spatialCtr = Thingy.calcSpatialCtr(this.spcPts);
            if (this.fillInfo.distlSptlCtr == undefined) { this.fillInfo.distlSptlCtr = new SpacePoint(0, 0, 0); }  // tu je začasno shranjena samo relativno razlika distalne točke;
            this.fillInfo.distlSptlCtr.x += this.fillInfo.spatialCtr.x;
            this.fillInfo.distlSptlCtr.y += this.fillInfo.spatialCtr.y;
            this.fillInfo.distlSptlCtr.z += this.fillInfo.spatialCtr.z;
        }

        if (rArc != undefined) this.rArc = rArc;
    }
}

//konstante
// tipi za FillInfo.typ
const BASE = 'b';   // te ploskve se izrišejo prve in vedno; NAJPREJ DAJ ČRNE BASE, potem oris!!
const PROXIMAL = 'p'; // se izrišejo, če so pred določeno prostorsko točko;
// barva;
const GLASS = '#caebf555'; // barva stekla;


class Thingy {

    static ctx;
    static rotationAngleIncrmnt = Math.PI/30;
    static defaultConnections = [ [0, 1], [2], [3], [0]];   // čeprav fill() samodejno potegne do izhodiščne točke (in bi ne rabil napisat ta četrtega [0]), imaš recimo primere, ko imaš like,..
    //                                        .. jih pa ne filaš, tam bi potem ne povezalo; ne želim pa po defaultu rabit closePath, ker ta v nekaterih primerih še enkrat potegne še eno črto;

    constructor() {
        this.planrCentr = undefined // središče telesa na vodoravni ravnini, gledano s ptičje perspektive

        // KO INSTANCIIRAŠ OBJEKT, KI EXTENDA THINGY, OBVEZNO ustvari/zaženi:
            // - spacePoints - // OPOMBA: podana točka običajno pomeni spodnjo levo točko spredaj, ostale izhajajo iz nje;
            // - segments
            // - createConnsAlt
            // - planarcenter je obvezen, če gre za telo, ker telesa je treba izrisovat odvisno od razdalje od gledalca;
            // drugo je optional (center, barva, rotate, ...)
    }

    draw(screenPoints, whichSegmnt) { //    ! !  PAZI ! !  riše s screenPts, ne spacePts ! !

        ctx.beginPath();
        if (this.segments[whichSegmnt].rArc == undefined) {
            this.segments[whichSegmnt].conns.forEach(connctn => {
                if (connctn.length == 1) {  // če je array connctn (ki je del arraya connections) dolg 1, podaja samo končno točko poteze (vzeto iz arraya scrnPts);
                    ctx.lineTo(screenPoints[connctn[0]].x, screenPoints[connctn[0]].y);
                } else {    // če je array connctn (ki je del arraya connections) dolg 2, podaja novo izhodišče in nato končno točko poteze;
                    ctx.moveTo(screenPoints[connctn[0]].x, screenPoints[connctn[0]].y);
                    ctx.lineTo(screenPoints[connctn[1]].x, screenPoints[connctn[1]].y);
                }
            });
        } else {
            const rX = Math.abs(screenPoints[1].x - screenPoints[0].x);
            const rY = Math.abs(screenPoints[2].y - screenPoints[0].y);
            ctx.ellipse(screenPoints[0].x, screenPoints[0].y, rX, rY, 0, 0, 6.3);
            ctx.fillStyle = this.segments[whichSegmnt].fillInfo.fillCol;
            ctx.fill();
        }
        if (this.segments[whichSegmnt].fillInfo.doFill) {
            ctx.fillStyle = this.segments[whichSegmnt].fillInfo.fillCol;
            ctx.fill();
            if (this.segments[whichSegmnt].fillInfo.typ == PROXIMAL) {
                ctx.strokeStyle = this.segments[whichSegmnt].fillInfo.fillCol;
                ctx.lineWidth = 0.5;
                ctx.stroke();
                ctx.lineWidth = 1;  // povrnemo začetne nastavitve strokstyle;
                ctx.strokeStyle = lineColor;
            }
            return; // da ne naredi stroke, torej obrobe okoli obarvane površine;
        }
        // ctx.closePath(); // če daš tle closePath, postanejo nekatere črte bolj izrazite, namreč class Connection, ki izvirno potegne črto od A do B, closePath pa potem še od B nazaj k A;
        ctx.stroke();
    }

    rotate(passedAngle){    // poda se ali (1) true/false za clockwise/anticlockwise ali (2) število za delto kota;
        
        // najprej helper
        function helper(spcPt, passedThis) {
            let x = spcPt.x - passedThis.planrCentr.x;  // x in y relativiziramo; to sta x in y koordinati PROSTORSKE točke
            let y = spcPt.y - passedThis.planrCentr.y;    // ampak uporabljamo samo x in y, ker vrtimo samo po eni osi, na eni ravnini;
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
            spcPt.x = r * Math.sin(angle) + passedThis.planrCentr.x;
            spcPt.y = r * Math.cos(angle) + passedThis.planrCentr.y;
        }
        
        // začetek dogajanja;
        if (this.planrCentr == undefined) { this.planrCentr = Thingy.calcPlanarCtr(this.objSpcPts); }

        let diffAngle;
        if (typeof passedAngle == 'boolean') {
            if (passedAngle) diffAngle = Thingy.rotationAngleIncrmnt;
            else diffAngle = -Thingy.rotationAngleIncrmnt;
        } else diffAngle = passedAngle;

        // glavna akcija (ki se seveda odvija v helper, tle je samo disambiguacija;)
        // 1. rotirat treba točke iz arraya this.objSpcPts;
        this.objSpcPts.forEach(spcPt => { helper(spcPt, this); })
        this.segments.forEach(segment => {
            // 2.(opcijsko) rotirat treba referenčne točke za distalse;
            if (segment.fillInfo.typ == PROXIMAL) {
                helper(segment.fillInfo.spatialCtr, this);
                helper(segment.fillInfo.distlSptlCtr, this);
            }
            // 3.(opcijsko) rotirat treba tiste točke, ki so prišle iz objektov in jih ni najti v arrayu this.objSpcPts (v 1.);
            if (segment.frmObj) {
                segment.spcPts.forEach(spcPt => {
                    if (this.objSpcPts.indexOf(spcPt) == -1) { helper(spcPt, this); }
                });
            }
        })
    }

    static createConnsAlt(passdSegments) {
        passdSegments.forEach(segment => {
            segment.conns.forEach((el, i, arr) => {
                if (el.length == 2) {
                    segment.connsAlt.push([el[0], el[1]]);
                } else {    // če ima povezava samo en element, moramo izhodišče potegnit iz prejšnje povezave; 
                    if (arr[i - 1].length == 1) {
                        segment.connsAlt.push([arr[i-1][0], el[0]]);
                    } else segment.connsAlt.push([arr[i-1][1], el[0]]);
                }
            })
        })
    }

    static meetCtx(passedCtx){
        Thingy.ctx = passedCtx;
    }

    static calcPlanarCtr(passdArr) {    // prejme array (verjetno) spacePointov, morda lahko tudi kaj drugea, kar ima not x in y;
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

    static calcSpatialCtr(passdArr) {   // prejme array (verjetno) spacePointov
        let xMin = passdArr[0].x;
        let xMax = passdArr[0].x;
        let yMin = passdArr[0].y;
        let yMax = passdArr[0].y;
        let zMin = passdArr[0].z;
        let zMax = passdArr[0].z;
        passdArr.forEach(spcPt => {
            if (spcPt.x < xMin) xMin = spcPt.x;
            else if (spcPt.x > xMax) xMax = spcPt.x;
            // y;
            if (spcPt.y < yMin) yMin = spcPt.y;
            else if (spcPt.y > yMax) yMax = spcPt.y;
            // z;
            if (spcPt.z < zMin) zMin = spcPt.z;
            else if (spcPt.z > zMax) zMax = spcPt.z;
        });
        return { // to poda tridimenzionalne koordinate v prostoru, kljer je središče plsokve;
            x: (xMin + xMax) / 2,
            y: (yMin + yMax) / 2,
            z: (zMin + zMax) / 2
        };
    }

    // izračuna daljico r med dvema točkama na VODORAVNI RAVNINI; referenca na obj je samo zato, ker gre za strukturirane podatke, ki vsebujejo x in y, objekt ne pomeni predmeta v prostoru;
    static calcPlanarRFromSpcPt(passdObj, passdViewrObj) {   // v resnici iz katerihkoli 2 objektov, ki na prvem nivoju vsebujeta propertija x in y;
        return ((passdObj.x - passdViewrObj.x)**2 + (passdObj.y - passdViewrObj.y)**2)**(0.5);
    }

    // izračuna daljico r med dvema točkama V PROSTORU;
    static calcSpatialRFromSpcPt(passdObj, passdViewrObj) {
        return ((passdObj.x - passdViewrObj.x)**2 + (passdObj.y - passdViewrObj.y)**2 + (passdObj.z - passdViewrObj.z)**2)**(0.5);
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

    constructor(
            passedSpacePoint,   // podana točka pomeni spodnjo levo točko spredaj, ostale izhajajo iz nje;
            side,               // dolžina stranice kocke;
            colors) {  // izbirno; array, ki ima lahko 1 element (vse ploskve te barve), 3 (prednja-zadnja, L-D, zg.-sp.) ali 6 el. (spr., zad, L, D, zgo., spo.);
        
        super();
        
        this.side = side;

        this.objSpcPts = [
            // prednji kvadrat;
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, passedSpacePoint.z),    // 0
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y, passedSpacePoint.z),
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y, passedSpacePoint.z + this.side),
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, passedSpacePoint.z + this.side),
            // zadnji kvadrat (oddaljenejši)
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + this.side, passedSpacePoint.z),  // 4;
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y + this.side, passedSpacePoint.z),
            new SpacePoint(passedSpacePoint.x + this.side, passedSpacePoint.y + this.side, passedSpacePoint.z + this.side),
            new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + this.side, passedSpacePoint.z + this.side),
        ]

        this.planrCentr = Thingy.calcPlanarCtr(this.objSpcPts);

        this.segments = [];

        // barve, če; najprej to, ker najprej BASE, potem oris, sicer BASE preriše poteze orisa;
        if (colors != undefined) {
            if (colors.length == 1 || colors.length == 3 || colors.length == 6) {
                let color = colors[0];
                // sprednja ploskev;
                if (color != undefined) this.segments.push(new Segment(this.objSpcPts, new FillInfo(true, BASE, color), undefined, [0, 1, 2, 3]));
                // zadnja;
                if (colors.length == 6) color = colors[1];  // barvo spremenimo samo, če je 6 barv, sicer ni potrebe;
                if (color != undefined) this.segments.push(new Segment(this.objSpcPts, new FillInfo(true, BASE, color), undefined, [4, 5, 6, 7]));
                // leva ploskev;
                if (colors.length == 6) color = colors[2];
                else if (colors.length == 3) color = colors[1]; // če pa je podana samo ena barva je itak že od začetka enako colors[0];
                if (color != undefined) this.segments.push(new Segment(this.objSpcPts, new FillInfo(true, BASE, color), undefined, [4, 0, 3, 7]));
                // desna ploskev;
                if (colors.length == 6) color = colors[3];  // barvo spreminjamo samo, če je podanih 6 barv, sicer ni treba (L-D sta par istih barv);
                if (color != undefined) this.segments.push(new Segment(this.objSpcPts, new FillInfo(true, BASE, color), undefined, [5, 1, 2, 6]));
                // zgornja ploskev;
                if (colors.length == 6) color = colors[4];
                else if (colors.length == 3) color = colors[2]; // če pa je podana samo ena barva je itak že od začetka enako colors[0];
                if (color != undefined) this.segments.push(new Segment(this.objSpcPts, new FillInfo(true, BASE, color), undefined, [3, 2, 6, 7]));
                // spodnja ploskev;
                if (colors.length == 6) color = colors[5];  // barvo spreminjamo samo, če je podanih 6 barv, sicer ni treba (zg.-sp. sta par istih barv);
                if (color != undefined) this.segments.push(new Segment(this.objSpcPts, new FillInfo(true, BASE, color), undefined, [0, 1, 5, 4]));
            } else {
                console.log('v arrayu colors je bilo podano napačno število barv za Cube. število mora biti 1, 3 ali 6. Predmet:');
                console.log(this);
            }
        }

        // oris;
        this.segments.push(new Segment(this.objSpcPts,
            new FillInfo(false),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7] ],
        ));

        // pol bi blo pa treba narisat še proximalse ... BASE je, če zadevo gledaš v notranjosti predmeta,..
        // proximalsi pa, če na neko ploskev gledaš kot na zunanjop plosekv predmeta in mora prebarvat barve orisa
        // za if (color != undefined) bi moral še if je base narišeš, če je prximal ga vržeš v array, ki bo izrisan pozneje

        Thingy.createConnsAlt(this.segments);
    }
}


class Pickup extends Thingy {
    constructor(passedSpacePoint, bodyColr = 'grey', passedAngle){  // gledan od spredaj, točka spodaj levo; 
                                                // passed angle se rabi, če želiš predmet zarotirati takoj ob stvaritvi;
                                                // če passed angle ni podan, je undefined, preverjeno;
        super();

        // navedba vseh točk, ki bojo kdaj uporabljene za risanje, vse definirane glede na podano izhodišče;
        this.objSpcPts = [
        // OPISI PODANI GLEDANO OD SPREDAJ PROTI SEVERU;
        // prednji kvadrat karoserije;
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, passedSpacePoint.z), // 0 je spodnji levi kot karoserije, gledano od spredaj;
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y, passedSpacePoint.z), // 1
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y, passedSpacePoint.z + 0.9),
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y, passedSpacePoint.z + 0.9),
    
        // zadnji kvadrat karoserije;
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 5, passedSpacePoint.z), // 4
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 5, passedSpacePoint.z), // 
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 5, passedSpacePoint.z + 0.9),
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 5, passedSpacePoint.z + 0.9),
    
        // kabina
        new SpacePoint(passedSpacePoint.x + 0.03, passedSpacePoint.y + 1.0, passedSpacePoint.z + 1.1), // 8   ; 0,1, da je malo ožje kot karoserija spodaj
        new SpacePoint(passedSpacePoint.x + 1.97, passedSpacePoint.y + 1.0, passedSpacePoint.z + 1.1),    // 9 ; 1.95, da je malo ožje kot karoserija spodaj (1,85, točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;
        new SpacePoint(passedSpacePoint.x + 1.9, passedSpacePoint.y + 1.7, passedSpacePoint.z + 1.8), // 10   ; desna zgornja točka stekla (gledano od spredaj, dolžina tega dela: 0,7, končan višina: 1,8
        new SpacePoint(passedSpacePoint.x + 0.1, passedSpacePoint.y + 1.7, passedSpacePoint.z + 1.8),    // 11 ; leva zgornja stekla
        new SpacePoint(passedSpacePoint.x + 1.9, passedSpacePoint.y + 2.4, passedSpacePoint.z + 1.8), // 12   ; desna zadnja zgornja točka kabine (gledano od spredaj, ravna streha kabine dolga 0,7
        new SpacePoint(passedSpacePoint.x + 0.1, passedSpacePoint.y + 2.4, passedSpacePoint.z + 1.8),    // 13 ; leva zadnja zgornja kabine
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 2.4, passedSpacePoint.z + 0.9), // 14   ; desna zadnja spodnja točka kabine (na sredini karoserije, na pol poti od tli do vrha; gledano od spredaj)
        new SpacePoint(passedSpacePoint.x + 0.0, passedSpacePoint.y + 2.4, passedSpacePoint.z + 0.9),    // 15 ; leva zadnja spodnja kabine (na sredini med tlemi in vrhom kabine)

        // luči spredaj
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y, passedSpacePoint.z + 0.60), // 16
        new SpacePoint(passedSpacePoint.x + 0.60, passedSpacePoint.y, passedSpacePoint.z + 0.60),
        new SpacePoint(passedSpacePoint.x + 0.60, passedSpacePoint.y, passedSpacePoint.z + 0.80),
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y, passedSpacePoint.z + 0.80), //
    
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y, passedSpacePoint.z + 0.60), // 20
        new SpacePoint(passedSpacePoint.x + 1.85, passedSpacePoint.y, passedSpacePoint.z + 0.60),
        new SpacePoint(passedSpacePoint.x + 1.85, passedSpacePoint.y, passedSpacePoint.z + 0.80),
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y, passedSpacePoint.z + 0.80), //

        // luči zadaj   - pri pravokotnikih je vedno podano spodnje levo oglišče;
        new SpacePoint(passedSpacePoint.x + 0.15, passedSpacePoint.y + 5, passedSpacePoint.z + 0.60), // 24
        new SpacePoint(passedSpacePoint.x + 1.4, passedSpacePoint.y + 5, passedSpacePoint.z + 0.60), // 25

        new SpacePoint(passedSpacePoint.x + 0.03, passedSpacePoint.y + 2.4, passedSpacePoint.z + 1.1), // 26 leva točka na (de facto desnem) B strebričku, enako visoka kot vrh havbe;
        new SpacePoint(passedSpacePoint.x + 1.97, passedSpacePoint.y + 2.4, passedSpacePoint.z + 1.1), // ista ne desni strani (de f levi strebričk);
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 2.4, passedSpacePoint.z + 0.2), // 28   ; desna zadnja spodnja točka kesona (na sredini karoserije, na dnu avta; gledano od spredaj)
        new SpacePoint(passedSpacePoint.x + 0.0, passedSpacePoint.y + 2.4, passedSpacePoint.z + 0.2), // 29 ; leva zadnja spodnja kesona (na dnu avta)

        // GUME
        // (levo) SD
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 0.75, passedSpacePoint.z),   // 30; (levo) kao desna sprednja guma ; središče, postavimo ga na spodnji rob karoserije;
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 0.75, passedSpacePoint.z - 0.4),    // 31  // pravokotniki za gume (podaš spodnjo levo točko pravokotnika)
        new SpacePoint(passedSpacePoint.x + 0.25, passedSpacePoint.y + 0.75, passedSpacePoint.z),  // 32 - shadow; (krog ki prikazuje okroglo ploskev gume na zadnji strani gume)
        // (levo) ZD
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 3.9, passedSpacePoint.z),    // 33; (levo) desna zadnja guma ;
        new SpacePoint(passedSpacePoint.x + 0.25, passedSpacePoint.y + 3.9, passedSpacePoint.z),    // 34; (levo) desna zadnja guma ; shadow (levo) ZD guma
        new SpacePoint(passedSpacePoint.x, passedSpacePoint.y + 3.9, passedSpacePoint.z - 0.4),  // 35; pravokotnik (zadaj levo) ZD guma
        // (desno) SL guma
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 0.75, passedSpacePoint.z),    // 36; (desno) kao leva sprednja guma ; središče, postavimo ga na spodnji rob karoserije;
        new SpacePoint(passedSpacePoint.x + 2 - 0.25, passedSpacePoint.y + 0.75, passedSpacePoint.z),    // 37; (desno) SL guma - shadow
        new SpacePoint(passedSpacePoint.x + 2 - 0.25, passedSpacePoint.y + 0.75, passedSpacePoint.z - 0.4),  // 38 (spredaj levo, na desni); pravokotnik
        // (desno) ZL guma
        new SpacePoint(passedSpacePoint.x + 2, passedSpacePoint.y + 3.9, passedSpacePoint.z),    // 39; (desno) kao leva zadnja guma; središče, postavimo ga na spodnji rob karoserije;
        new SpacePoint(passedSpacePoint.x + 2 - 0.25, passedSpacePoint.y + 3.9, passedSpacePoint.z),    // 40; - shadow
        new SpacePoint(passedSpacePoint.x + 2 - 0.25, passedSpacePoint.y + 3.9, passedSpacePoint.z - 0.4),  // 41 - (desno) ZD guma - pravokotnik
        ];

        this.planrCentr = Thingy.calcPlanarCtr(this.objSpcPts);
        this.bodyColor = bodyColr;

        this.segments = [];

        // NAJPREJ DAJ ČRNE BASE, potem oris!!

        // črno (spodnji del avta, cel zgornji del v višini vrha kesona (v dveh delih), havba od zadaj)
        this.segments.push(new Segment( 
            this.objSpcPts,   // to se poda samo za referenco, ne bo nikjer shranjeno
            new FillInfo(true, BASE, 'black'),
            [ [0, 1], [5], [4], [3, 2], [8], [9], [7, 6], [8], [9], [3, 2], [10], [11]],
            [0, 1, 2, 3, 4, 5, 6, 7, 14, 15, 9, 8]
        ));

         // filerji kot base;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, BASE, 'black'),
            [ [0, 1], [2], [3], [4, 5], [6], [7]], 
            [ 15, 3, 8, 26, 2, 9, 27, 14]
        ));

        // // glavni oris (oris mora vedno slediti črnemu baseu)
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(false),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 14], [6], [3, 15], [7], [3, 8], [2, 9],
            [8, 9], [10,11], [10, 12], [13], [11], [13, 19], [20], [12], [15, 18], [14, 17] ],
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 28, 29, 26/*19*/, 27],
        ))

        // prednja stena kesona; ta sledi orisu, ker če ne je oris notranjosti kabine videt skozi pregrado;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, BASE, 'black'), undefined,[ 15, 14, 28, 29]
        ));

        // ploskev pod zadnjim steklom
        this.segments.push(new Segment(this.objSpcPts,
            new FillInfo(true, BASE, 'black'), undefined, [15, 14, 27, 26])
        );

        // dodatni oris, ker sta 2 dela predelne stene kesona prebarvala del orisa;
        this.segments.push(new Segment(this.objSpcPts,
            new FillInfo(false),
            [[3, 0], [1], [2], [4, 5]],  // povezave
            [8,9,10,11, 14, 15]
        ))

        // prednja ploskev;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(0, 0.03, 0)), undefined, [ 0, 1, 2, 3 ]
        ));

        // desna ploskev (vozila, sicer na levi strani koordinatnega sistema);
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(0.03, 0, 0)), undefined, [ 4, 0, 3, 7 ]
        ));

        // leva ploskev;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(-0.03, 0, 0)), undefined, [ 5, 1, 2, 6]
        ));

        // zadnja ploskev;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(0, -0.03, 0)), undefined, [ 4, 5, 6, 7]
        ));

        // havba;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(0, 0.01, -0.05)), undefined, [ 3, 2, 9, 8]
        ));

        // desni filer (na desni strani vozila, sicer levo v smislu koordinate x);
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(0.03, 0, -0.01)), undefined, [ 15, 3, 8, 26]
        ));

        // levi filer;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(-0.03, 0, -0.01)), undefined, [ 2, 9, 27, 14]
        ));

        // prednje steklo;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, BASE, GLASS), undefined, [ 8, 9, 10, 11]
        ));

        // desno steklo;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, BASE, GLASS), undefined, [ 26, 8, 11, 13]
        ));

        // levo steklo;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, BASE, GLASS), undefined, [ 9, 10, 12, 27]
        ));

        // zadnje steklo;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, BASE, GLASS), undefined, [ 12, 13, 26, 27]
        ));

        // luči spredaj;
        this.segments.push(new Segment( this.objSpcPts,
            new FillInfo(true, PROXIMAL, '#fffdf0', new SpacePoint(0, 0.03, 0)),
            [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4]],
            [ 16, 17, 18, 19, 20, 21, 22, 23]
        ));

        // luči zadaj;
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlRect(this.objSpcPts[24], {x:0.45, y:0, z:0.2}, new FillInfo(true, PROXIMAL, '#d11515', new SpacePoint(0, -0.03, 0))) ));
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlRect(this.objSpcPts[25], {x:0.45, y:0, z:0.2}, new FillInfo(true, PROXIMAL, '#d11515', new SpacePoint(0, -0.03, 0))) ));

        //ozka ploskev pod zadnjim steklom
        this.segments.push(new Segment(this.objSpcPts,
            new FillInfo(true, PROXIMAL, this.bodyColor, new SpacePoint(0, -0.03, 0)), undefined, [15, 14, 27, 26])
        );

        //  - - - -   GUME   - - - 
        // sprednja D guma - proximal
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[30], 0.4, [false], new FillInfo(true, PROXIMAL, 'black', new SpacePoint(0.05, 0, 0)))  ));

        // sprednja D guma kot BASE, ker mora bit viden krog pod vozilom, tudi ko gumo gledaš z druge strani vozila pod vozilom;
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[30], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // pravokotnik (naris gume, če jo gledano od spredaj) SD gume (na L strani)
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlRect(this.objSpcPts[31], {x: 0.25, y: 0, z: 0.8}, new FillInfo(true, 'black')) ));

        // shadow guma (levo, SD guma) - shadow so BASE
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[32], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // zadnja D guma (na L strani)
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[33], 0.4, [false], new FillInfo(true, PROXIMAL, 'black', new SpacePoint(0.05, 0, 0)))  ));

        // zadnja D guma (na L strani) - kot base
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[33], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // shadow guma (levo, ZD guma) - shadow so BASE
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[34], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // pravokotnik (naris gume, če jo gledano od spredaj) ZD gume (na L strani)
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlRect(this.objSpcPts[35], {x: 0.25, y: 0, z: 0.8}, new FillInfo(true, 'black')) ))

        // sprednja L guma (desno) - proximal
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[36], 0.4, [false], new FillInfo(true, PROXIMAL, 'black', new SpacePoint(-0.05, 0, 0)))  ));

        // sprednja L guma (desno) kot base
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[36], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // sprednja L guma (desno) - shadow
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[37], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // pravokotnik (naris gume, gledano od spredaj) SL gume (na D strani)
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlRect(this.objSpcPts[38], {x: 0.25, y: 0, z: 0.8}, new FillInfo(true, 'black')) ));

        // zadnja L guma (desno)
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[39], 0.4, [false], new FillInfo(true, PROXIMAL, 'black', new SpacePoint(-0.05, 0, 0)))  ));

        // zadnja L guma (desno) kot BASE
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[39], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // zadnja L guma (desno) - shadow
        this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlCircle(this.objSpcPts[40], 0.4, [false], new FillInfo(true, BASE, 'black'))  ));

        // pravokotnik (naris gume, gledano od spredaj) ZL gume (na D strani)
         this.segments.push(new Segment(this.objSpcPts,
            new OrtgnlRect(this.objSpcPts[41], {x: 0.25, y: 0, z: 0.8}, new FillInfo(true, 'black')) ))

        // ustvarimo še povezave napisane na tak način, da se lahko lažje uporabi pri interpolaciji
        Thingy.createConnsAlt(this.segments);

        if (passedAngle != undefined && passedAngle != 0) this.rotate(passedAngle);
    }
}


class Connection extends Thingy {

    constructor(spacePoint, spacePoint2) {
        super();

        this.objSpcPts = [spacePoint, spacePoint2];
        
        this.segments = new Array(new Segment(
            this.objSpcPts,
            new FillInfo(),
            [[0, 1]]
        ));

        Thingy.createConnsAlt(this.segments);
    }
}


class OrtgnlRect extends Thingy {   // ortogonal rectangle; je vzporeden z eno od ravnin; podaš izhodišče (absolutno) in odmik (relativno) nasprotnega oglišča, oboje s SpacePoint;

    constructor(spacePoint, offset, fillInfo) {   // offset se poda s SpacePointom, ki mora imeti eno dimenzijo 0;spacepoint je ponavadi spodnje levo/bližnje oglišče;
        super();
        if (offset.x != 0 && offset.y != 0 && offset.z != 0) {
            console.log('! DEBUG - ortgnlRect rabi vsaj eno dimenzijo == 0 v offset; podano je bilo:', offset);
            console.log('Ustvarjena je bila fake točka, da ne zlomimo kode')
            this.objSpcPts = [ new SpacePoint(spacePoint.x, spacePoint.y, spacePoint.z),new SpacePoint(spacePoint.x, spacePoint.y, spacePoint.z) ];
            this.segments = [ new Segment(this.objSpcPts, new FillInfo(), [[0, 1]] )];
        } else {
            if (offset.x == 0) {
                this.objSpcPts = [
                    spacePoint,
                    new SpacePoint(spacePoint.x, spacePoint.y + offset.y, spacePoint.z),
                    new SpacePoint(spacePoint.x, spacePoint.y + offset.y, spacePoint.z + offset.z),
                    new SpacePoint(spacePoint.x, spacePoint.y, spacePoint.z + offset.z)
                ];
            } else if (offset.y == 0) {
                this.objSpcPts = [
                    spacePoint,
                    new SpacePoint(spacePoint.x + offset.x, spacePoint.y, spacePoint.z),
                    new SpacePoint(spacePoint.x + offset.x, spacePoint.y, spacePoint.z + offset.z),
                    new SpacePoint(spacePoint.x, spacePoint.y, spacePoint.z + offset.z)
                ];
            } else {    // z == 0
                this.objSpcPts = [
                    spacePoint,
                    new SpacePoint(spacePoint.x + offset.x, spacePoint.y, spacePoint.z),
                    new SpacePoint(spacePoint.x + offset.x, spacePoint.y + offset.y, spacePoint.z),
                    new SpacePoint(spacePoint.x, spacePoint.y + offset.y, spacePoint.z)
                ];
            }
            
            this.segments = [ new Segment(this.objSpcPts, fillInfo) ];
        } 

        Thingy.createConnsAlt(this.segments);
    }
}

class OrtgnlCircle extends Thingy {

    constructor(
            center, // center - središče kroga, podano s spacePointom ali objektom z ustreznimi polji;
            r,      // r - polmer;
            dirs,   // array s tremi polji, ki so lahko true ali false, in ki pomenijo, ali polmer sega v dotično smer (v zaporedju x, y, z) > krog je zato lahko samo na kateri od 3 ravnin;
            fillInfo) {
        
        super();

        this.objSpcPts = [center];
        if (dirs[0] == false) { // če r sega v dimenziji y in z, ker je x (0 == x v zaporedju x, y, z) false;
            this.objSpcPts.push(new SpacePoint(center.x, center.y + r, center.z));
            this.objSpcPts.push(new SpacePoint(center.x, center.y, center.z + r));
        } else if (dirs[1] == false) {
            this.objSpcPts.push(new SpacePoint(center.x + r, center.y, center.z));
            this.objSpcPts.push(new SpacePoint(center.x, center.y, center.z + r));
        } else {
            this.objSpcPts.push(new SpacePoint(center.x + r, center.y, center.z));
            this.objSpcPts.push(new SpacePoint(center.x, center.y + r, center.z));
        }
        
        this.segments = [ new Segment(this.objSpcPts, fillInfo, [[0,1], [0,2]]) ];
        this.segments[0].rArc = r;

        Thingy.createConnsAlt(this.segments);
    }
}