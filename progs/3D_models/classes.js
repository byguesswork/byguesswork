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
    constructor(doFill, colr, anteCtrm) {
        this.doFill = doFill;   // true/false; če false, naj ostale ostanejo undefined;
        this.color = colr;  // barva obarvanja ploskve
        this.anteCentrum = anteCtrm // true/false true - ploskev se izriše samo, če je bliže gledalcu od centra objekta; false/undefined - izriše se vedno
    }
}


class Thingy {

    static ctx;
    static rotationAngleIncrmnt = Math.PI/30;

    constructor() {
        // this.angle = 0;  kot se za zdaj še ne rabi; rabil bi se, če bi se stvari premikale in bi moral poznat njihovo usmeritev, da bi jih pravilno premaknil; 
        this.center = undefined // središče telesa na vodoravni ravnini, gledano s ptičje perspektive
    }

    draw(screenPoints, usesAlt, whichSegmnt) { //    ! !  PAZI ! !  riše s screenPts, ne spacePts ! !
        ctx.beginPath();
        if (!usesAlt) {
            ctx.moveTo(screenPoints[0].x, screenPoints[0].y);   // na začetku se vedno najprej pomakneš na izhodiščno točko (0-ta točka v arrayu scrnPts);
            // če smo podali whichSegment, uporabimo drug array za določanje točk, tak, ki opisuje le določen segment celega predmeeta;
            const target = whichSegmnt != undefined ? this.connectionsSegmtd[whichSegmnt] : this.connections;
            target.forEach(element => {
                if (element.length == 1) {  // če je array element (ki je del arraya connections) dolg 1, podaja samo končno točko poteze (vzeto iz arraya scrnPts);
                    ctx.lineTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                } else {    // če je array element (ki je del arraya connections) dolg 2, podaja novo izhodišče in nato končno točko poteze;
                    ctx.moveTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                    ctx.lineTo(screenPoints[element[1]].x, screenPoints[element[1]].y);
                }
            });
            if (whichSegmnt != undefined && this.spcPtsData.fillInfo[whichSegmnt].doFill) {  // če imamo strukturirano tako, da imamo podatke za fill, in je fill true;
                ctx.fillStyle = this.spcPtsData.fillInfo[whichSegmnt].color;
                ctx.fill();
                return; // da ne naredi stroke, torej obrobe okoli obarvane površine;
            }
        } else {
            const target = whichSegmnt != undefined ? this.connectionsAltSegmtd[whichSegmnt] : this.connectionsAlt;
            target.forEach(element => {
                if (screenPoints[element[0]].x != undefined && screenPoints[element[1]].x != undefined) {   // rišemo samo če imamo obe piki;
                    ctx.moveTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                    ctx.lineTo(screenPoints[element[1]].x, screenPoints[element[1]].y);
                }
            });
            if (whichSegmnt != undefined && this.spcPtsData.fillInfo[whichSegmnt].doFill) {
                ctx.fillStyle = this.spcPtsData.fillInfo[whichSegmnt].color;
                ctx.fill();
                return;
            }
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
        if (this.center == undefined) { this.calcCenter(); }

        let diffAngle;
        if (typeof passedAngle == 'boolean') {
            if (passedAngle) diffAngle = Thingy.rotationAngleIncrmnt;
            else diffAngle = -Thingy.rotationAngleIncrmnt;
        } else diffAngle = passedAngle;

        // glavna akcija (ki se seveda odvija v helper, tle je samo disambiguacija;)
        if (this.spcPtsData != undefined) {
            this.spcPtsData.spacePoints.forEach(arr => {
                arr.forEach(spcPt => { helper(spcPt, this); });
            });
        } else {
            this.spacePoints.forEach(spcPt => {
                helper(spcPt, this);
            })
        }
    }

    calcCenter() {
        let target;  // proxy za lokacijo, kjer bomo iskali min in max;
        // če imamo segmentirane podatke o točkah, je treba na eno mesto nabrat vse točke;
        let arrayOfVals = new Array();
        if (this.spcPtsData != undefined) {
            this.spcPtsData.spacePoints.forEach(array => {
                arrayOfVals = arrayOfVals.concat(array);
            })
            target = arrayOfVals;   // proxy v tem primeru kaže sem;
        } else target = this.spacePoints;
        let xMin = target[0].x;
        let xMax = target[0].x;    // za zdaj so lahko enaki, se bojo spremenili med naslednjo primerjavo;
        let yMin = target[0].y;
        let yMax = target[0].y;
        target.forEach(spcPt => {
            //x, lahko z elsom;
            if (spcPt.x < xMin) xMin = spcPt.x;
            else if (spcPt.x > xMax) xMax = spcPt.x;
            // y;
            if (spcPt.y < yMin) yMin = spcPt.y;
            else if (spcPt.y > yMax) yMax = spcPt.y;
        });
        this.center = { // to poda dvodimenzionalne koordinate, na vodoravni ravnini, kjer se bo odvijalo vrtenje;
            x: (xMin + xMax) / 2,
            y: (yMin + yMax) / 2
        };
    }

    static meetCtx(passedCtx){
        Thingy.ctx = passedCtx;
    }

    static caclPlanarCtr(passdArr) {    // prejme array (verjetno) spacePointov, morda lahko tudi kaj drugea, kar ima not x in y;
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

        this.spacePoints = new Array(8);
        for (let i = 0; i <= 7; i++) { this.spacePoints[i] = new SpacePoint(); }
        this.side = side;
        // connections so navodila, med katerimi točkami je treba risat povezave; začetek v točki 0 je lahko privzet (v metodi draw());
        this.connections = [[1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7],];    // connections za kocko najprej nariše sprednji kvadrat (0,1,2,3), potem zadnjega (4,5,6,7) in potem povezovalne črte;
        this.connectionsAlt = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],];

        this.createPoints(passedSpacePoint);
    }

    createPoints(spacePoint){
        this.spacePoints[0].x = spacePoint.x; // 0 je spodnji levi kot prednjega kvadrata;
        this.spacePoints[0].y = spacePoint.y;
        this.spacePoints[0].z = - spacePoint.z; // z-je treba podajat negativno !!!! ker se prostorska z os preslika v y os na zaslonu, y pa narađća navzdol
        // skratka, če podaš prostorske koordinate (-1, 5, -1), tj, malo levo dol od sredine ekrana, se v spacePoint[0] to shrani kot (-1, 5, 1) ..
        // .. tj. z v spacepoint je notiran inverzno, da se potem lahko pravilno pretvori v koordinato y na ploskvi canvasa;
    
        // preostali y-i prednjega kvadrata so vsi enaki;
        this.spacePoints[1].y = spacePoint.y;
        this.spacePoints[2].y = spacePoint.y;
        this.spacePoints[3].y = spacePoint.y;
        // še ostala oglišča prednjega kvadrata, v kontra smeri urinega kazalca;
        this.spacePoints[1].x = spacePoint.x + this.side;
        this.spacePoints[1].z = - spacePoint.z;
        this.spacePoints[2].x = spacePoint.x + this.side;
        this.spacePoints[2].z = - spacePoint.z - this.side; // zato se tudi side odšteje, ne pa prišteje; LAHKO PA BI MORDA vse imel tu na plus in samo pri preračunu na ploskev dal na minus;
        this.spacePoints[3].x = spacePoint.x;
        this.spacePoints[3].z = - spacePoint.z - this.side;
    
        // zadnji kvadrat;
        // y-i zadnjega kvadrata so vsi enaki;
        this.spacePoints[4].y = spacePoint.y + this.side;
        this.spacePoints[5].y = spacePoint.y + this.side;
        this.spacePoints[6].y = spacePoint.y + this.side;
        this.spacePoints[7].y = spacePoint.y + this.side;
        // še ostala oglišča zadnjega kvadrata, v kontra smeri urinega kazalca;
        this.spacePoints[4].x = spacePoint.x;
        this.spacePoints[4].z = - spacePoint.z;
        this.spacePoints[5].x = spacePoint.x + this.side;
        this.spacePoints[5].z = - spacePoint.z;
        this.spacePoints[6].x = spacePoint.x + this.side;
        this.spacePoints[6].z = - spacePoint.z - this.side;
        this.spacePoints[7].x = spacePoint.x;
        this.spacePoints[7].z = - spacePoint.z - this.side;
    }
}


class Pickup extends Thingy {
    constructor(passedSpacePoint, bodyColr = 'grey', passedAngle){  // gledan od spredaj, točka spodaj levo; 
                                                // passed angle se rabi, če želiš predmet zarotirati takoj ob stvaritvi;
                                                // če passed angle ni podan, je undefined, preverjeno;
        super();

        // zadeve, ki extendajo Thingy, lahko vsebujejo:
        // ALI spacePoints, connections in connectionsAlt
        // ALI spcPtsData, connectionsSegmtd in connectionsAltSegmtd
        this.spcPtsData = {
            spacePoints : [new Array()], // ja, array arrayev;
            fillInfo : [],    // v array se bo podajalo instance FillInfo ;
        }
        this.connectionsSegmtd = [
         [ [1], [5], [4], [0], [3, 2], [6], [7], [3]],  // 0, črna
         [ [1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7], [3, 8], [2, 9],
         [8, 9], [10], [11], [8], [10, 12], [13], [11], [13, 15], [14], [12] ],  // 1, oris vsega
         [ [1], [2], [3], [0]],  // 2, karoserija (prednja ploskev)
         [ [1], [2], [3], [0]],  // 3, karoserija (desna ploskev)
         [ [1], [2], [3], [0]],  // 4, karoserija (leva ploskev)
         [ [1], [2], [3], [0]],  // 5, karoserija (zadnja ploskev)
         [ [1], [3], [2], [0]],  // 6, karoserija (havba)
         [ [1], [2], [3], [0]],  // 7, karoserija (desni filer)
         [ [1], [2], [3], [0]],  // 8, karoserija (desni filer)
         [ [1], [2], [3], [0]],  // 9, prednje steklo
         [ [1], [2], [3], [0]],  // 10, desno steklo
         [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4] ],
         [ [0, 1], [2], [3], [0], [4, 5], [6], [7], [4] ]
        ];
        this.connectionsAltSegmtd = [
         [ [0, 1], [1, 5], [5, 4], [4, 0], [3, 2], [2, 6], [6, 7], [7, 3] ],
         [ [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7], [3, 8], [2, 9],
         [8, 9], [9, 10], [10, 11], [11, 8], [10, 12], [12, 13], [13, 11], [13, 15], [15, 14], [14, 12] ],
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 2, siva (prednja ploskev)
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 3, karoserija (prednja ploskev)
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 4, karoserija (prednja ploskev)
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 5, karoserija (zadnja ploskev)
         [ [0, 1], [1, 3], [3, 2], [2, 0]],  // 6, karoserija (havba)
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 7, karoserija (desni filer)
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 8, karoserija (desni filer)
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 9, prednje steklo
         [ [0, 1], [1, 2], [2, 3], [3, 0]],  // 10, prednje steklo
         [ [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4] ],
         [ [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4] ]
        ];
        this.bodyColor = bodyColr;

        this.createPoints(passedSpacePoint);
        this.calcCenter();
        if (passedAngle != undefined && passedAngle != 0) this.rotate(passedAngle);
    }

    createPoints(spacePoint){

        // črna notranjost kabine (pokrov kesona in dno podvozja);
        this.spcPtsData.fillInfo.push(new FillInfo(true, 'black', false));
        // prednji pravokotnik (maska);
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z)); // 0 je spodnji levi kot karoserije, gledano od sprefaj;
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z)); // 1
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z - 0.9));
    
        // zadnji kvadrat karoserije;
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z)); // 4
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z)); // 
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[0].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z - 0.9));

        // 1: oris vsega;
        this.spcPtsData.spacePoints.push(new Array());  // 1
        this.spcPtsData.fillInfo.push(new FillInfo(false));
        // z-je treba podajat negativno !!!! ker se prostorska z os preslika v y os na zaslonu, y pa narašća navzdol; za razlago glej Cube;
        // prednji pravokotnik (maska);
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z)); // 0 je spodnji levi kot karoserije, gledano od sprefaj;
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z)); // 1
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z - 0.9));
    
        // zadnji kvadrat karoserije;
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z)); // 4
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z)); // 
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z - 0.9));
    
        // kabina
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, - spacePoint.z - 1.1)); // 8   ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 1.95, spacePoint.y + 1.0, - spacePoint.z - 1.1));    // 9 ; 1.95, da je malo ožje kot karoserija spodaj (1,85); točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 1.9, spacePoint.y + 1.7, - spacePoint.z - 1.8)); // 10   ; desna zgornja točka stekla (gledano od spredaj); dolžina tega dela: 0,7, končan višina: 1,8
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 1.7, - spacePoint.z - 1.8));    // 11 ; leva zgornja stekla
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 1.9, spacePoint.y + 2.4, - spacePoint.z - 1.8)); // 12   ; desna zadnja zgornja točka kabine (gledano od spredaj); ravna streha kabine dolga 0,7
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 2.4, - spacePoint.z - 1.8));    // 13 ; leva zadnja zgornja kabine
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 2.4, - spacePoint.z - 0.9)); // 14   ; desna zadnja spodnja točka kabine (na sredini karoserije, na pol poti od tli do vrha; gledano od spredaj)
        this.spcPtsData.spacePoints[1].push(new SpacePoint(spacePoint.x + 0.0, spacePoint.y + 2.4, - spacePoint.z - 0.9));    // 15 ; leva zadnja spodnja kabine (na sredini med tlemi in vrhom kabine)
        // konec ene skupine;
    
        // 2: prednja ploskev; 
        this.spcPtsData.spacePoints.push(new Array());  // 2
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, true));    //2
         // prednji pravokotnik (maska);
        this.spcPtsData.spacePoints[2].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z)); // 0 je spodnji levi kot karoserije, gledano od sprefaj;
        this.spcPtsData.spacePoints[2].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z)); // 1
        this.spcPtsData.spacePoints[2].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[2].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z - 0.9));

        // 3: desna ploskev;
        this.spcPtsData.spacePoints.push(new Array());  // 3
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, true));    //3
         // desni pravokotnik;
        this.spcPtsData.spacePoints[3].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z)); // 0;
        this.spcPtsData.spacePoints[3].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z - 0.9)); // 1 navzgor, potem bazaj
        this.spcPtsData.spacePoints[3].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[3].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z));

        // 4: leva ploskev;
        this.spcPtsData.spacePoints.push(new Array());  // 4
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, true));    //4
         // desni pravokotnik;
        this.spcPtsData.spacePoints[4].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z)); // 0;
        this.spcPtsData.spacePoints[4].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z - 0.9)); // 1 navzgor, potem bazaj
        this.spcPtsData.spacePoints[4].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[4].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z));

        // 5: zadnja ploskev; 
        this.spcPtsData.spacePoints.push(new Array());  // 5
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, true));    // 5
         // prednji pravokotnik (maska);
        this.spcPtsData.spacePoints[5].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z)); // 0 je spodnji levi kot karoserije, gledano od sprefaj;
        this.spcPtsData.spacePoints[5].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z)); // 1
        this.spcPtsData.spacePoints[5].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 5, -spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[5].push(new SpacePoint(spacePoint.x, spacePoint.y + 5, -spacePoint.z - 0.9));

        // 6: havba; 
        this.spcPtsData.spacePoints.push(new Array());  // 6
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, true));    // 6
         // prednji pravokotnik (maska);
        this.spcPtsData.spacePoints[6].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z - 0.9)); // 0 je spodnji levi kot karoserije, gledano od sprefaj;
        this.spcPtsData.spacePoints[6].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z - 0.9)); // 1
        this.spcPtsData.spacePoints[6].push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, - spacePoint.z - 1.1)); //    ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[6].push(new SpacePoint(spacePoint.x + 1.95, spacePoint.y + 1.0, - spacePoint.z - 1.1));    //  ; 1.95, da je malo ožje kot karoserija spodaj (1,85); točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;

        // 7: desni filer; 
        this.spcPtsData.spacePoints.push(new Array());  // 7
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, false));    // 7
         // nepravilna oblika;
        this.spcPtsData.spacePoints[7].push(new SpacePoint(spacePoint.x, spacePoint.y + 2.4, - spacePoint.z - 0.9));
        this.spcPtsData.spacePoints[7].push(new SpacePoint(spacePoint.x, spacePoint.y, -spacePoint.z -0.9));
        this.spcPtsData.spacePoints[7].push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, -spacePoint.z - 1.1)); //    ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[7].push(new SpacePoint(spacePoint.x + 0.022, spacePoint.y + 2.4, -spacePoint.z - 1.1)); //    ; 0,1, da je malo ožje kot karoserija spodaj

        // 8: levi filer; 
        this.spcPtsData.spacePoints.push(new Array());  // 8
        this.spcPtsData.fillInfo.push(new FillInfo(true, this.bodyColor, false));    // 8
         // nepravilna oblika;
        this.spcPtsData.spacePoints[8].push(new SpacePoint(spacePoint.x + 2, spacePoint.y, -spacePoint.z -0.9));
        this.spcPtsData.spacePoints[8].push(new SpacePoint(spacePoint.x + 1.95, spacePoint.y + 1.0, -spacePoint.z - 1.1)); //    ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[8].push(new SpacePoint(spacePoint.x + 2 - 0.022, spacePoint.y + 2.4, -spacePoint.z - 1.1)); //    ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[8].push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 2.4, - spacePoint.z - 0.9));

        // 9: prednje steklo; 
        this.spcPtsData.spacePoints.push(new Array());  // 9
        this.spcPtsData.fillInfo.push(new FillInfo(true, '#caebf5', true));    // 9
        this.spcPtsData.spacePoints[9].push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, - spacePoint.z - 1.1)); // 8   ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[9].push(new SpacePoint(spacePoint.x + 1.95, spacePoint.y + 1.0, - spacePoint.z - 1.1));    // 9 ; 1.95, da je malo ožje kot karoserija spodaj (1,85); točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;
        this.spcPtsData.spacePoints[9].push(new SpacePoint(spacePoint.x + 1.9, spacePoint.y + 1.7, - spacePoint.z - 1.8)); // 10   ; desna zgornja točka stekla (gledano od spredaj); dolžina tega dela: 0,7, končan višina: 1,8
        this.spcPtsData.spacePoints[9].push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 1.7, - spacePoint.z - 1.8));    // 11 ; leva zgornja stekla

        // 10: desno steklo; 
        this.spcPtsData.spacePoints.push(new Array());  // 10
        this.spcPtsData.fillInfo.push(new FillInfo(true, '#caebf5', true));
        this.spcPtsData.spacePoints[10].push(new SpacePoint(spacePoint.x + 0.022, spacePoint.y + 2.4, -spacePoint.z - 1.1)); //    ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[10].push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, - spacePoint.z - 1.1)); // 8   ; 0,1, da je malo ožje kot karoserija spodaj
        this.spcPtsData.spacePoints[10].push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 1.7, - spacePoint.z - 1.8));    // 11 ; leva zgornja stekla
        this.spcPtsData.spacePoints[10].push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 2.4, - spacePoint.z - 1.8));    // 13 ; leva zadnja zgornja kabine

         // luči spredaj;
        this.spcPtsData.spacePoints.push(new Array());  // 6
        this.spcPtsData.fillInfo.push(new FillInfo(true, '#fffdf0', true));    // 6
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 0.15, spacePoint.y, - spacePoint.z - 0.60)); //0
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 0.60, spacePoint.y, - spacePoint.z - 0.60));
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 0.60, spacePoint.y, - spacePoint.z - 0.80));
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 0.15, spacePoint.y, - spacePoint.z - 0.80)); //3
    
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 1.4, spacePoint.y, - spacePoint.z - 0.60)); //4
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y, - spacePoint.z - 0.60));
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y, - spacePoint.z - 0.80));
        this.spcPtsData.spacePoints[11].push(new SpacePoint(spacePoint.x + 1.4, spacePoint.y, - spacePoint.z - 0.80)); //7

        // luči zadaj;
        this.spcPtsData.spacePoints.push(new Array());  // 7
        this.spcPtsData.fillInfo.push(new FillInfo(true, '#d11515', true));    // 7
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 0.15, spacePoint.y + 5, - spacePoint.z - 0.60)); //0
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 0.60, spacePoint.y + 5, - spacePoint.z - 0.60));
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 0.60, spacePoint.y + 5, - spacePoint.z - 0.80));
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 0.15, spacePoint.y + 5, - spacePoint.z - 0.80)); //3
    
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 1.4, spacePoint.y + 5, - spacePoint.z - 0.60)); //4
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y + 5, - spacePoint.z - 0.60));
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y + 5, - spacePoint.z - 0.80));
        this.spcPtsData.spacePoints[12].push(new SpacePoint(spacePoint.x + 1.4, spacePoint.y + 5, - spacePoint.z - 0.80)); //7

    }
}


class Connection extends Thingy {

    constructor(spacePoint, spacePoint2) {
        super();

        this.spacePoints = [spacePoint, spacePoint2];
        // connections so navodila, med katerimi točkami je treba risat povezave; začetek v točki 0 je privzet (v metodi draw());
        this.connections = [[0, 1]];
        this.connectionsAlt = this.connections;
    }
}


class HorzRectangle extends Thingy {

    constructor(spacePoint, width, depth) {
        super();

        this.width = width;
        this.depth = depth;
        
        this.spcPtsData = {
            spacePoints : [new Array(new SpacePoint(), new SpacePoint(), new SpacePoint(), new SpacePoint())], // ja, array arrayev;
            fillInfo : [new FillInfo(true, 'white')]    // ja, array arrayev;
        }
        this.connectionsSegmtd = [[[1], [2], [3], [0]]];    // connections za kvadrat podaja samo točke za zvezno risanje, vmes nobenega novega izhodišča (novo izhodišče bi bilo, če bi kateri od elementov arraya connections bil array z dvema elementoma);
        this.connectionsAltSegmtd = [[[0, 1], [1, 2], [2, 3], [3, 0]]]; // če je kateri y negativen in določene črte ne bomo narisali uporabimo te povezave;

        this.createPoints(spacePoint);          
    }
    
    createPoints(spacePoint){
        this.spcPtsData.spacePoints[0][0].x = spacePoint.x; // 0 je sprednji (bližnji) levi;
        this.spcPtsData.spacePoints[0][0].y = spacePoint.y;
        this.spcPtsData.spacePoints[0][0].z = spacePoint.z;
        // z-ji so vsi enaki;
        this.spcPtsData.spacePoints[0][1].z = spacePoint.z;
        this.spcPtsData.spacePoints[0][2].z = spacePoint.z;
        this.spcPtsData.spacePoints[0][3].z = spacePoint.z;
        // še ostala oglišča, v kontra smeri urinega kazalca;
        this.spcPtsData.spacePoints[0][1].x = spacePoint.x + this.width;
        this.spcPtsData.spacePoints[0][1].y = spacePoint.y;
        this.spcPtsData.spacePoints[0][2].x = spacePoint.x + this.width;
        this.spcPtsData.spacePoints[0][2].y = spacePoint.y + this.depth;
        this.spcPtsData.spacePoints[0][3].x = spacePoint.x;
        this.spcPtsData.spacePoints[0][3].y = spacePoint.y + this.depth;
    }
}