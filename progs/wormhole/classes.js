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
        spatlDiffFrmCtr) // SpacePoint, ki pove, koliko je od prostorskega centra oddaljena točka, s katero bomo preverjali, al prej vidiš prostorski center ploskve al tisto točko; za PROXIMAL-e;
        {
            if (doFill == undefined || doFill == false) {
            this.doFill = false;    // doFill je najpomembnejši; zadostuje, da je doFill false, pa so ostali nerelevantni;
        } else {
            this.doFill = true;   // true, če si prišel do sem; če false, ostali itak ostanejo undefined, glej zgoraj;
            if (type != undefined && fillColor == undefined) {  // predpostavljamo, da podaš kar barvo na drugem mestu;
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
        rArc) {     // polmer kroga, če krog; mal brezvezno polje, ker v resnici ne določa r-ja, ampak samo sporoči, da gra za krog, mroda bi bilo bolje, če bi se klicalo isArc;
        
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

        // izračunamo spatialcenter in proximalcenter za potrebne segmente (PROXIMAL, BASPROX)
        if ((this.fillInfo.typ == PROXIMAL || this.fillInfo.typ == BASPROX) && this.fillInfo.spatialCtr == undefined) {   // pogoj z spatialCtr == undefined je zato, da ne greš dvakrat skozi, če namesto fillInfo podaš objekt;
            this.fillInfo.spatialCtr = Thingy.calcSpatialCtr(this.spcPts);
            if (this.fillInfo.distlSptlCtr == undefined) { this.fillInfo.distlSptlCtr = new SpacePoint(0, 0, 0); }  // tu je začasno shranjena samo relativno razlika distalne točke;
            this.fillInfo.distlSptlCtr.x += this.fillInfo.spatialCtr.x;
            this.fillInfo.distlSptlCtr.y += this.fillInfo.spatialCtr.y;
            this.fillInfo.distlSptlCtr.z += this.fillInfo.spatialCtr.z;
        }

        if (rArc != undefined) this.rArc = rArc;
    }
}

// KONSTANTE;
// tipi za FillInfo.typ
const BASE = 'b';   // te ploskve se izrišejo prve in vedno; NAJPREJ DAJ ČRNE BASE/undefined, potem oris(e)!! Rabijo se za risanje neke osnove in notranje površine neke ploskve;
const PROXIMAL = 'p'; // se izrišejo, če so pred določeno prostorsko točko; rabijo se za barvanje zunanjih površin, če so drugačne barve kot notranja stran iste površine;
const BASPROX = 'bp';    // BASE-PROXIMAL, če ni izpolnjen pogoj bližine, se izrišejo kot base, sicer se izrišejo kot proximal;
// BASPROX (BASE-PROXIMAL) se rabi za barvanje površin, ki so enake barve gledano od zunaj in od znoter, je pa pomembno, kdaj v zaporedju barvanja so izrisane (ali grejo čez oris ali ne);
// splošna logika: (BASE/undefined > oris)(tako zaporedje po potrebi večkrat) > PROXIMALs; BASPROX se v pravem trenutku uvrstijo ali v BASE ali v PROXIMAL;

// barva;
const GLASS = '#caebf555'; // barva stekla;


class Thingy {

    static ctx;
    static rotationAngleIncrmnt = Math.PI/30;
    static defaultConnections = [ [0, 1], [2], [3], [0]];   // čeprav fill() samodejno potegne do izhodiščne točke (in bi ne rabil napisat ta četrtega [0]), imaš recimo primere, ko imaš like,..
    //                                        .. jih pa ne filaš, tam bi potem ne povezalo; ne želim pa po defaultu rabit closePath, ker ta v nekaterih primerih še enkrat potegne še eno črto;

    constructor() {

        // KO INSTANCIIRAŠ OBJEKT, KI EXTENDA THINGY, OBVEZNO ustvari/zaženi:
            // - spacePoints - // OPOMBA: podana točka običajno pomeni spodnjo levo točko spredaj, ostale izhajajo iz nje;
            // - segments
            // - createConnsAlt
            // POGOJNO OBVEZNo: spatialCenter - če gre za telesa v prostoru (ne landscape), ker jih je treba izrisovat odvisno od razdalje od gledalca (upoštevajoč višino predmetov, zato prostorsko);
            // drugo je optional (barva, rotate, ...)
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
            // ctx.fillStyle = this.segments[whichSegmnt].fillInfo.fillCol; // ta in spodnja vrstica se rabita le pri risaju koles pickupa v 3D objects;
            // ctx.fill();
        }
        if (this.segments[whichSegmnt].fillInfo.doFill) {
            ctx.fillStyle = this.segments[whichSegmnt].fillInfo.fillCol;
            ctx.fill();
            if (this.segments[whichSegmnt].fillInfo.typ == PROXIMAL || this.segments[whichSegmnt].fillInfo.typ == BASPROX) {
                ctx.strokeStyle = `${this.segments[whichSegmnt].fillInfo.fillCol}77`;   // da potegnemo skoraj prosojno črto v barvi ploskve;
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
        if (this.planrCentr == undefined) { 
            this.planrCentr = Thingy.calcPlanarCtr(this.objSpcPts); // središče telesa na vodoravni ravnini, gledano s ptičje perspektive, ki se rabi za izračun rotacije;
        }

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
            if (segment.fillInfo.typ == PROXIMAL || segment.fillInfo.typ == BASPROX) {
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

    static calcPlanarCtr(passdArr) { // prejme array (verjetno) spacePointov, karkoli, kar ima not x in y; rabi se le za rotate;
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
        this.angle = 0; // horizontal angle; kot 0 gleda vzdolž osi y, v smeri naraščanja y; narašča po osi x desno;
        this.diveAngle = 0 // vertival angle;kot 0 gleda vzdolž osi y, v smeri naraščanja y; narašča po osi z navzgot;
        this.rotationAngleIncrmnt = Math.PI/180;
    }

    move(dir){
        if (dir == FORWARD) {
            this.posIn3D.y += 0.5 * Math.cos(this.angle); // prvenstveni premik;
            this.posIn3D.x += 0.5 * Math.sin(this.angle);
            this.posIn3D.z += 0.5 * Math.sin(this.diveAngle);
        }
    }

    rotate(dir){
        if (dir == LEFT) {
            this.angle -= this.rotationAngleIncrmnt;
        } else if (dir == RIGHT) {
            this.angle += this.rotationAngleIncrmnt;
        } else if (dir == RISE) {   // lahko gremo vse na else, ker itak se rotate kliče po eden naenkrat;
            this.diveAngle += this.rotationAngleIncrmnt;
        } else if (dir == DIVE) {
            this.diveAngle -= this.rotationAngleIncrmnt;
        }
        this.angle = rangeAngle(this.angle);

        // tle bo treba dodat vertAngle ali riseAngle;
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