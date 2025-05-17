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


class Thingy {

    static ctx;
    static rotationAngleIncrmnt = Math.PI/30;

    constructor() {
        // this.angle = 0;  kot se za zdaj še ne rabi; rabil bi se, če bi se stvari premikale in bi moral poznat njihovo usmeritev, da bi jih pravilno premaknil; 
        this.center = undefined
    }

    draw(screenPoints, usesAlt) {
        Thingy.ctx.beginPath();
        if (!usesAlt) {
            Thingy.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);   // na začetku se vedno najprej pomakneš na izhodiščno točko (0-ta točka v arrayu scrnPts);
            this.connections.forEach(element => {
                if (element.length == 1) {  // če je array element (ki je del arraya connections) dolg 1, podaja samo končno točko poteze (vzeto iz arraya scrnPts);
                    ctx.lineTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                } else {                    // če je array element (ki je del arraya connections) dolg 2, podaja novo izhodišče in nato končno točko poteze;
                    ctx.moveTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                    ctx.lineTo(screenPoints[element[1]].x, screenPoints[element[1]].y);
                }
            });
        } else {
            this.connectionsAlt.forEach(element => {
                if (screenPoints[element[0]].x != undefined && screenPoints[element[1]].x != undefined) {   // rišemo samo če imamo obe piki;
                    ctx.moveTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                    ctx.lineTo(screenPoints[element[1]].x, screenPoints[element[1]].y);
                }
            });
        }
        Thingy.ctx.stroke();
    }

    rotate(passedAngle){    // poda se (1) true/false za clockwise/anticlockwise ali (2) število za delto kota;
        if (this.center == undefined) {
            // če center ni določen, ga določimo s simple aritmetično sredino največjih in najmanjših;
            let xMin = this.spacePoints[0].x;
            let xMax = this.spacePoints[0].x;    // za zdaj so lahko enaki, se bojo spremenili med naslednjo primerjavo;
            let yMin = this.spacePoints[0].y;
            let yMax = this.spacePoints[0].y;
            this.spacePoints.forEach(spcPt => {
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

        let diffAngle;
        if (typeof passedAngle == 'boolean') {
            if (passedAngle) diffAngle = Thingy.rotationAngleIncrmnt;
            else diffAngle = -Thingy.rotationAngleIncrmnt;
        } else diffAngle = passedAngle;

        this.spacePoints.forEach((spcPt) => {
            let x = spcPt.x - this.center.x;  // x in y relativiziramo; to sta x in y koordinati PROSTORSKE točke
            let y = spcPt.y - this.center.y;    // ampak uporabljamo samo x in y, ker vrtimo samo po eni osi, na eni ravnini;
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
            spcPt.x = r * Math.sin(angle) + this.center.x;
            spcPt.y = r * Math.cos(angle) + this.center.y;
        })

    }

    static meetCtx(passedCtx){
        Thingy.ctx = passedCtx;
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
    constructor(passedSpacePoint, passedAngle){  // gledan od spredaj, točka spodaj levo; 
                                                // passed angle se rabi, če želiš predmet zarotirati takoj ob stvaritvi;
                                                // če passed angle ni podan, je undefined, preverjeno;
        super();

        this.spacePoints = new Array(8);
        for (let i = 0; i <= 7; i++) { this.spacePoints[i] = new SpacePoint(); }
        this.connections = [[1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7], [3, 8], [2, 9],
         [8, 9], [10], [11], [8], [10, 12], [13], [11], [13, 15], [14], [12], [16, 17], [18], [19], [16], [20, 21], [22], [23], [20]];
        this.connectionsAlt = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7], [3, 8], [2, 9],
         [8, 9], [9, 10], [10, 11], [11, 8], [10, 12], [12, 13], [13, 11], [13, 15], [15, 14], [14, 12], [16, 17], [17, 18],
         [18, 19], [19, 16], [20, 21], [21, 22], [22, 23], [23, 20]];

        this.createPoints(passedSpacePoint);
        if (passedAngle != undefined && passedAngle != 0) this.rotate(passedAngle);
    }

    createPoints(spacePoint){
        this.spacePoints[0].x = spacePoint.x; // 0 je spodnji levi kot karoserije, gledano od sprefaj;
        this.spacePoints[0].y = spacePoint.y;
        this.spacePoints[0].z = - spacePoint.z; // z-je treba podajat negativno !!!! ker se prostorska z os preslika v y os na zaslonu, y pa narašća navzdol; za razlago glej Cube;
    
        // preostali y-i prednjega kvadrata so vsi enaki;
        this.spacePoints[1].y = spacePoint.y;
        this.spacePoints[2].y = spacePoint.y;
        this.spacePoints[3].y = spacePoint.y;
        // še ostala oglišča prednjega kvadrata, v kontra smeri urinega kazalca;
        this.spacePoints[1].x = spacePoint.x + 2;    // širina kabine
        this.spacePoints[1].z = - spacePoint.z;
        this.spacePoints[2].x = spacePoint.x + 2;
        this.spacePoints[2].z = - spacePoint.z - 0.9; // višina spodnjega dela karoserije; side se odšteje, ne pa prišteje (razlago glej Cube);
        this.spacePoints[3].x = spacePoint.x;
        this.spacePoints[3].z = - spacePoint.z - 0.9;
    
        // zadnji kvadrat karoserij;
        // y-i zadnjega kvadrata so vsi enaki;
        this.spacePoints[4].y = spacePoint.y + 5; // dolžina
        this.spacePoints[5].y = spacePoint.y + 5;
        this.spacePoints[6].y = spacePoint.y + 5;
        this.spacePoints[7].y = spacePoint.y + 5;
        // še ostala oglišča zadnjega kvadrata, v kontra smeri urinega kazalca;
        this.spacePoints[4].x = spacePoint.x;
        this.spacePoints[4].z = - spacePoint.z;
        this.spacePoints[5].x = spacePoint.x + 2;
        this.spacePoints[5].z = - spacePoint.z;
        this.spacePoints[6].x = spacePoint.x + 2;
        this.spacePoints[6].z = - spacePoint.z - 0.9;
        this.spacePoints[7].x = spacePoint.x;
        this.spacePoints[7].z = - spacePoint.z - 0.9;
    
        // kabina
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, - spacePoint.z - 1.1)); // 8   ; 0,1, da je malo ožje kot karoserija spodaj
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.95, spacePoint.y + 1.0, - spacePoint.z - 1.1));    // 9 ; 1.75, da je malo ožje kot karoserija spodaj (1,85); točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.9, spacePoint.y + 1.7, - spacePoint.z - 1.8)); // 10   ; desna zgornja točka stekla (gledano od spredaj); dolžina tega dela: 0,7, končan višina: 1,8
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 1.7, - spacePoint.z - 1.8));    // 11 ; leva zgornja stekla
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.9, spacePoint.y + 2.4, - spacePoint.z - 1.8)); // 12   ; desna zadnja zgornja točka kabine (gledano od spredaj); ravna streha kabine dolga 0,7
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 2.4, - spacePoint.z - 1.8));    // 13 ; leva zadnja zgornja kabine
        this.spacePoints.push(new SpacePoint(spacePoint.x + 2, spacePoint.y + 2.4, - spacePoint.z - 0.9)); // 14   ; desna zadnja spodnja točka kabine (na sredini karoserije, na pol poti od tli do vrha; gledano od spredaj)
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.0, spacePoint.y + 2.4, - spacePoint.z - 0.9));    // 15 ; leva zadnja spodnja kabine (na sredini med tlemi in vrhom kabine)
    
        // luči
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.15, spacePoint.y, - spacePoint.z - 0.60)); //16
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.60, spacePoint.y, - spacePoint.z - 0.60));
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.60, spacePoint.y, - spacePoint.z - 0.80));
        this.spacePoints.push(new SpacePoint(spacePoint.x + 0.15, spacePoint.y, - spacePoint.z - 0.80)); //19
    
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.4, spacePoint.y, - spacePoint.z - 0.60)); //20
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y, - spacePoint.z - 0.60));
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y, - spacePoint.z - 0.80));
        this.spacePoints.push(new SpacePoint(spacePoint.x + 1.4, spacePoint.y, - spacePoint.z - 0.80)); //23
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

        this.spacePoints = [new SpacePoint(), new SpacePoint(), new SpacePoint(), new SpacePoint()];
        this.width = width;
        this.depth = depth;
        // connections so navodila, med katerimi točkami je treba risat povezave; začetek v točki 0 je privzet (v metodi draw());
        this.connections = [[1], [2], [3], [0]];    // connections za kvadrat podaja samo točke za zvezno risanje, vmes nobenega novega izhodišča (novo izhodišče bi bilo, če bi kateri od elementov arraya connections bil array z dvema elementoma);
        this.connectionsAlt = [[0, 1], [1, 2], [2, 3], [3, 0]]; // če je kateri y negativen in določene črte ne bomo narisali uporabimo te povezave;

        this.createPoints(spacePoint);          
    }
    
    createPoints(spacePoint){
        this.spacePoints[0].x = spacePoint.x; // 0 je sprednji (bližnji) levi;
        this.spacePoints[0].y = spacePoint.y;
        this.spacePoints[0].z = spacePoint.z;
        // z-ji so vsi enaki;
        this.spacePoints[1].z = spacePoint.z;
        this.spacePoints[2].z = spacePoint.z;
        this.spacePoints[3].z = spacePoint.z;
        // še ostala oglišča, v kontra smeri urinega kazalca;
        this.spacePoints[1].x = spacePoint.x + this.width;
        this.spacePoints[1].y = spacePoint.y;
        this.spacePoints[2].x = spacePoint.x + this.width;
        this.spacePoints[2].y = spacePoint.y + this.depth;
        this.spacePoints[3].x = spacePoint.x;
        this.spacePoints[3].y = spacePoint.y + this.depth;
    }
}