class Thingy {

    static ctx;

    constructor () {
        // prazen;
    }

    draw(screenPoints, connections) {
        Thingy.ctx.beginPath();
        Thingy.ctx.moveTo(screenPoints[0].x, screenPoints[0].y);   // na začetku se vedno najprej pomakneš na izhodiščno točko (0-ta točka v arrayu scrnPts);
        connections.forEach(element => {  // samo napisalo tako: connections.array.forEach
            if (element.length == 1) {  // če je array element (ki je del arraya connections) dolg 1, podaja samo končno točko poteze (vzeto iz arraya scrnPts);
                ctx.lineTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
            } else {                    // če je array element (ki je del arraya connections) dolg 2, podaja novo izhodišče in nato končno točko poteze;
                ctx.moveTo(screenPoints[element[0]].x, screenPoints[element[0]].y);
                ctx.lineTo(screenPoints[element[1]].x, screenPoints[element[1]].y);
            }
        });
        Thingy.ctx.stroke();
    }

    move(spacePoint){
        if (typeof spacePoint == 'string') {
            if (spacePoint == LEFT) {
                this.spacePoints.forEach(el => el.x -= 0.2);
                this.draw(calcScreenPts(this.spacePoints));
            } else if (spacePoint == RIGHT) {
                this.spacePoints.forEach(el => el.x += 0.2);
                this.draw(calcScreenPts(this.spacePoints));
            } else if (spacePoint == CLOSER) {
                this.spacePoints.forEach(el => el.y -= 0.5);
                this.draw(calcScreenPts(this.spacePoints));
            } else if (spacePoint == FAR) {
                this.spacePoints.forEach(el => el.y += 0.5);
                this.draw(calcScreenPts(this.spacePoints));
            } else if (spacePoint == UP) {
                this.spacePoints.forEach(el => el.z += 0.2);
                this.draw(calcScreenPts(this.spacePoints));
            } else if (spacePoint == DOWN) {
                this.spacePoints.forEach(el => el.z -= 0.2);
                this.draw(calcScreenPts(this.spacePoints));
            }
        }
    }


    static meetCtx(passedCtx){
        Thingy.ctx = passedCtx;
    }
}


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


class Square extends Thingy {

    constructor(spacePoint, side) {
        super();

        this.spacePoints = [new SpacePoint(), new SpacePoint(), new SpacePoint(), new SpacePoint()];
        this.side = side;
        // connections so navodila, med katerimi točkami je treba risat povezave; začetek v točki 0 je privzet (v metodi draw());
        this.connections = [[1], [2], [3], [0]];    // connections za kvadrat podaja samo točke za zvezno risanje, vmes nobenega novega izhodišča (novo izhodišče bi bilo, če bi kateri od elementov arraya connections bil array z dvema elementoma);

        this.move(spacePoint);          
    }
    
    // v bistvu uporabimo isto metodo za prvič postavit na zemjevid in vsakokrat naslednjič;
    move(spacePoint){ // vedno (pri inicializaciji in morebitnem poznejšem move) podaš izhodiščno točko, ki je spodnja leva; morda v prihodnje naredit tudi varianto metode, da podaš samo zamik;
        this.spacePoints[0].x = spacePoint.x; // 0 je spodnji levi;
        this.spacePoints[0].y = spacePoint.y;
        this.spacePoints[0].z = spacePoint.z;
        // y-ji so vsi enaki;
        this.spacePoints[1].y = spacePoint.y;
        this.spacePoints[2].y = spacePoint.y;
        this.spacePoints[3].y = spacePoint.y;
        // še ostala oglišča, v kontra smeri urinega kazalca;
        this.spacePoints[1].x = spacePoint.x + this.side;
        this.spacePoints[1].z = spacePoint.z;
        this.spacePoints[2].x = spacePoint.x + this.side;
        this.spacePoints[2].z = spacePoint.z - this.side;
        this.spacePoints[3].x = spacePoint.x;
        this.spacePoints[3].z = spacePoint.z - this.side;

    }

    draw(scrnPts){
        super.draw(scrnPts, this.connections);
    }
}


class Cube extends Thingy {

    constructor(passedSpacePoint, side){
        super();

        this.spacePoints = new Array(8);
        for (let i = 0; i <= 7; i++) { this.spacePoints[i] = new SpacePoint(); }
        this.side = side;
        this.connections = [[1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7],];    // connections za kocko najprej nariše sprednji kvadrat (0,1,2,3), potem zadnjega (4,5,6,7) in potem povezovalne črte;

        this.move(passedSpacePoint);    // v bistvu uporabimo isto metodo za prvič postavit na zemljevid in vsakokrat naslednjič;
    }

    move(spacePoint){
        if (typeof spacePoint == "object") {
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
        } else if (typeof spacePoint == 'string') {
            super.move(spacePoint);
        } 
    }

    draw(scrnPts){
        super.draw(scrnPts, this.connections);
    }
}


class Pickup extends Thingy {
    constructor(passedSpacePoint){  // gledan od spredaj, točka spodaj levo
        super();

        this.spacePoints = new Array(8);
        for (let i = 0; i <= 7; i++) { this.spacePoints[i] = new SpacePoint(); }
        this.connections = [[1], [2], [3], [0], [4, 5], [6], [7], [4], [0, 4], [1, 5], [2, 6], [3, 7], [3, 8], [2, 9], [8, 9], [10], [11], [8], [10, 12], [13], [11], [13, 15], [14], [12]];

        this.move(passedSpacePoint);    // v bistvu uporabimo isto metodo za prvič postavit na zemljevid in vsakokrat naslednjič;
    }

    move(spacePoint){
        if (typeof spacePoint == "object") {
            this.spacePoints[0].x = spacePoint.x; // 0 je spodnji levi kot karoserije, gledano od sprefaj;
            this.spacePoints[0].y = spacePoint.y;
            this.spacePoints[0].z = - spacePoint.z; // z-je treba podajat negativno !!!! ker se prostorska z os preslika v y os na zaslonu, y pa narašća navzdol; za razlago glej Cube;
    
            // preostali y-i prednjega kvadrata so vsi enaki;
            this.spacePoints[1].y = spacePoint.y;
            this.spacePoints[2].y = spacePoint.y;
            this.spacePoints[3].y = spacePoint.y;
            // še ostala oglišča prednjega kvadrata, v kontra smeri urinega kazalca;
            this.spacePoints[1].x = spacePoint.x + 1.85;    // širina kabine
            this.spacePoints[1].z = - spacePoint.z;
            this.spacePoints[2].x = spacePoint.x + 1.85;
            this.spacePoints[2].z = - spacePoint.z - 0.9; // višina spodnjega dela karoserije; side se odšteje, ne pa prišteje (razlago glej Cube);
            this.spacePoints[3].x = spacePoint.x;
            this.spacePoints[3].z = - spacePoint.z - 0.9;
    
            // zadnji kvadrat karoserij;
            // y-i zadnjega kvadrata so vsi enaki;
            this.spacePoints[4].y = spacePoint.y + 4.7; // dolžina
            this.spacePoints[5].y = spacePoint.y + 4.7;
            this.spacePoints[6].y = spacePoint.y + 4.7;
            this.spacePoints[7].y = spacePoint.y + 4.7;
            // še ostala oglišča zadnjega kvadrata, v kontra smeri urinega kazalca;
            this.spacePoints[4].x = spacePoint.x;
            this.spacePoints[4].z = - spacePoint.z;
            this.spacePoints[5].x = spacePoint.x + 1.85;
            this.spacePoints[5].z = - spacePoint.z;
            this.spacePoints[6].x = spacePoint.x + 1.85;
            this.spacePoints[6].z = - spacePoint.z - 0.9;
            this.spacePoints[7].x = spacePoint.x;
            this.spacePoints[7].z = - spacePoint.z - 0.9;

            this.spacePoints.push(new SpacePoint(spacePoint.x + 0.05, spacePoint.y + 1.0, - spacePoint.z - 1.1)); // 8   ; 0,1, da je malo ožje kot karoserija spodaj
            this.spacePoints.push(new SpacePoint(spacePoint.x + 1.8, spacePoint.y + 1.0, - spacePoint.z - 1.1));    // 9 ; 1.75, da je malo ožje kot karoserija spodaj (1,85); točki pregiba preden se havba, ki se dviguje, začne dvigovat v steklo;
            this.spacePoints.push(new SpacePoint(spacePoint.x + 1.75, spacePoint.y + 1.7, - spacePoint.z - 1.8)); // 10   ; desna zgornja točka stekla (gledano od spredaj); dolžina tega dela: 0,7, končan višina: 1,8
            this.spacePoints.push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 1.7, - spacePoint.z - 1.8));    // 11 ; leva zgornja stekla
            this.spacePoints.push(new SpacePoint(spacePoint.x + 1.75, spacePoint.y + 2.4, - spacePoint.z - 1.8)); // 12   ; desna zadnja zgornja točka kabine (gledano od spredaj); ravna streha kabine dolga 0,7
            this.spacePoints.push(new SpacePoint(spacePoint.x + 0.1, spacePoint.y + 2.4, - spacePoint.z - 1.8));    // 13 ; leva zadnja zgornja kabine
            this.spacePoints.push(new SpacePoint(spacePoint.x + 1.85, spacePoint.y + 2.4, - spacePoint.z - 0.9)); // 14   ; desna zadnja spodnja točka kabine (na sredini karoserije, na pol poti od tli do vrha; gledano od spredaj)
            this.spacePoints.push(new SpacePoint(spacePoint.x + 0.0, spacePoint.y + 2.4, - spacePoint.z - 0.9));    // 15 ; leva zadnja spodnja kabine (na sredini med tlemi in vrhom kabine)

        } else if (typeof spacePoint == 'string') {
            super.move(spacePoint);
        } 
    }

    draw(scrnPts){
        super.draw(scrnPts, this.connections);
    }

}

class Connection extends Thingy {

    constructor(spacePoint, spacePoint2) {
        super();

        this.spacePoints = [spacePoint, spacePoint2];
        // connections so navodila, med katerimi točkami je treba risat povezave; začetek v točki 0 je privzet (v metodi draw());
        this.connections = [[0, 1]];

        // tale nima move();
    }
    
    // v bistvu uporabimo isto metodo za prvič postavit na zemljevid in vsakokrat naslednjič;
    move(spacePoint){
        if (typeof spacePoint == "object") {
            // prazno;
        } else if (typeof spacePoint == 'string') {
            super.move(spacePoint);
        } 
    }

    draw(scrnPts){
        super.draw(scrnPts, this.connections);
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

        this.move(spacePoint);          
    }
    
    // v bistvu uporabimo isto metodo za prvič postavit na zemjevid in vsakokrat naslednjič;
    move(spacePoint){
        if (typeof spacePoint == "object") {
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
        } else if (typeof spacePoint == 'string') {
            super.move(spacePoint);
        } 
    }

    draw(scrnPts){
        super.draw(scrnPts, this.connections);
    }
}