class Axis {  // axis kot gradient axis, gradient line;
    constructor() {


        // TODO da se da vlečt black ali tone

        // to je kot (angle) od heading barve; na vrhu, navpično navzgor oz. 0deg, je rdeča;
        this.heading = 0;
        // zamik druge barve; -60 pomeni, da offset barva za 60 stopinj zaostaja za glavno (heading) barvo;
        this.offset = -60;
        this.offsetAngle = 300;

        // glavna oz. neodvisna barva (kot heading pri orientaciji, torej kamor si usmerjen);
        // PAZI - v RGB, ker bo še veliko preračunov;
        this.headingColor = {
            R: 255,
            G: 0,
            B: 0,
            get value() {
                return `${this.R}${this.G}${this.B}`;
            }
        }

        // odvisna barva, ki je za določen kot na barvnem krogu drugačna od glavne barve;
        // PAZI - v RGB, ker bo še veliko preračunov;
        this.offsetColor = {
            R: 255,
            G: 0,
            B: 255,
            get value() {
                return `${this.R}${this.G}${this.B}`;
            }
        }

        // glavna barva, samo tokrat z upoštevanjem morebitnega shadow (black) in tint (white);
        // tale pa je v hex;
        this.impactedHeadingColor = {
            R: 'ff',
            G: '00',
            B: '00',
            get value() {
                return `${this.R}${this.G}${this.B}`;
            }
        }

        // offset barva z upoštevanjem toniranja;
        // v hex;
        this.impactedOffsetColor = {
            R: 'ff',
            G: '00',
            B: 'ff',
            get value() {
                return `${this.R}${this.G}${this.B}`;
            }
        }

        this.controls = new Controls(this);

        this.#initialCircletteBckgroundDo();
        this.#addEventListeners();
    }

    #getOffsetAngle() {
        this.offsetAngle = this.heading + this.offset;
        if (this.offsetAngle < 0) {
            this.offsetAngle = 360 + this.offsetAngle; // bolj točno bi bilo 360 - Math.abs(angle);
        } else if (this.offsetAngle > 360) {
            this.offsetAngle = this.offsetAngle - 360;
        };
    }

    #atKeyPress(evt) {
        let shallDo = false;
        if (evt.key === 'ArrowLeft') {
            this.heading--;
            if (this.heading < 0) this.heading = 359;
            shallDo = true;
        } else if (evt.key === 'ArrowRight') {
            this.heading++;
            if (this.heading > 359) this.heading = 0;
            shallDo = true;
        } else if (evt.key === 'ArrowUp') {
            this.offset++;
            if (this.offset > 359) this.offset = 0;
            shallDo = true;
        } else if (evt.key === 'ArrowDown') {
            this.offset--;
            if (this.offset < -359) this.offset = 0;
            shallDo = true;
        };

        if (shallDo === true) {
            this.#calculateComponentValues();   // iz kota izračuna rgb (v hex), brez upoštevanja toniranja;
            this.calculateImpact();
            this.draw();
            this.circlette();
            this.refreshLabels();
        }
    }

    #addEventListeners() {
        document.addEventListener('keydown', this.#atKeyPress.bind(this)); // temu bind bi se lahko izognil z arrow funkcijo

    }   // konec listenerjev

    draw() {
        // privzeto gre gradient 0deg od spodaj-navzgor; začetna (neodvisna, nosilna, heading) barva je torej v mojem primeru podana v drug barvni atribut, ne v prvega;
        // v programu gre sicer gradient privzeto L-D (90');
        const text = this.controls.gradientDirection === 'follow-angle' ? this.heading : this.controls.gradientDirection;
        circle.style.backgroundImage = `linear-gradient(${text}deg, #${this.impactedOffsetColor.value} 12%, #${this.impactedHeadingColor.value} 88%)`;  // pravilno: ${this.heading}deg
    }

    #doStuffHelper(angle, color) {      // za določitev barve na podlagi kota;
        if (angle > 0 && angle < 60) {
            color.R = 255;
            color.G = percOf60(0, angle) * 255;
            color.B = 0;
        } else if (angle > 180 && angle < 240) {
            color.R = 0;
            color.G = (1 - percOf60(180, angle)) * 255;
            color.B = 255;
        } else if (angle > 60 && angle < 120) {
            color.R = (1 - percOf60(60, angle)) * 255;
            color.G = 255;
            color.B = 0;
        } else if (angle > 240 && angle < 300) {
            color.R = percOf60(240, angle) * 255;
            color.G = 0;
            color.B = 255;
        } else if (angle > 120 && angle < 180) {
            color.R = 0;
            color.G = 255;
            color.B = percOf60(120, angle) * 255;
        } else if (angle > 300 && angle < 360) {
            color.R = 255;
            color.G = 0;
            color.B = (1 - percOf60(300, angle)) * 255;
        } else if (angle === 0) {
            color.R = 255;
            color.G = 0;
            color.B = 0;
        } else if (angle === 60) {
            color.R = 255;
            color.G = 255;
            color.B = 0;
        } else if (angle === 120) {
            color.R = 0;
            color.G = 255;
            color.B = 0;
        } else if (angle === 180) {
            color.R = 0;
            color.G = 255;
            color.B = 255;
        } else if (angle === 240) {
            color.R = 0;
            color.G = 0;
            color.B = 255;
        } else if (angle === 300) {
            color.R = 255;
            color.G = 0;
            color.B = 255;
        }
    }


    #calculateComponentValues() {   // to najprej izračuna offset kot, potem pa barvo za glavni kot in za offset kot;
        // greš po komponentah, pri vsaki preverjaš za 4 območja: kjer je komponenta ff, kjer je 00 in dve območji, kjer prehaja med skrajnostma;
        // recimo pri R je ff od 300 do 60; 00 od 120 do 240; v dveh 60-stopinjskih intervalih pa prehaja med 00 in ff oz. obratno;
        // to krat 3 = 12 možnosti;
        // boljše je torej kar direkt obdelat vsako od 12 možnosti: 6 večkratnikov kota 60 in 6 vmesnih območij (ker pri širših, 120-stopinjskih območjih obstajajo taka, ki so delno levo, delno desno od 0deg in torej de facto ratajo dve območji);
        // in sicer najprej prehodna, in sicer v zaporedju 1, 4, 2, 5, 3, 6 (da izenačiš verjetnosti izhoda iz zanke if-else), potem pa še 6 čistih prehodnih točk (te šele na koncu, ker so manj verjetne kot prehodna območja);

        // 0':     ff0000     rdeča             od tu dalje: G NARAŠČA
        // 60'     ffff00     rumena            od tu dalje: R PADA
        // 120':   00ff00     zelena            od tu dalje: B NARAŠČA
        // 180':   00ffff     svetlo modra      od tu dalje: G PADA
        // 240':   0000ff     temno modra       od tu dalje: R NARAŠČA
        // 300':   ff00ff     magenta           od tu dalje: B PADA

        this.#getOffsetAngle();
        this.#doStuffHelper(this.heading, this.headingColor);
        this.#doStuffHelper(this.offsetAngle, this.offsetColor);

    };

    calculateImpact() {     // ta izračuna vpliv black in white, obenem pretvori RGB v hex;

        let intermediateR, intermediateG, intermediateB;
        const shadow = this.controls.shadow;
        const tint = this.controls.tint;

        function helperShadow(color) {  // tu je pomembno, da dobimo intermediateX, in ga dobimo v vsakem primeru;
            if (color.R > 0) {
                intermediateR = lerp(color.R, 0, shadow / 100);
            } else intermediateR = color.R;
            if (color.G > 0) {
                intermediateG = lerp(color.G, 0, shadow / 100);
            } else intermediateG = color.G;
            if (color.B > 0) {
                intermediateB = lerp(color.B, 0, shadow / 100);
            } else intermediateB = color.B;
        }

        function helperTint() {   // najvišja cifra od treh ostane enaka, ostale se ji sorazmerno približajo (lerp);
            const maxx = Math.max(intermediateR, intermediateG, intermediateB);
            if (intermediateR < maxx) { // če je manj kot max, se sorazmerno ratiu približa od izvirne vrednosti do max-a;
                intermediateR = lerp(intermediateR, maxx, tint / 100)
            };
            if (intermediateG < maxx) {
                intermediateG = lerp(intermediateG, maxx, tint / 100)
            };
            if (intermediateB < maxx) {
                intermediateB = lerp(intermediateB, maxx, tint / 100)
            };
        }

        function helperAssign(passedImpactedColor) {
            passedImpactedColor.R = decToHex(intermediateR);
            passedImpactedColor.G = decToHex(intermediateG);
            passedImpactedColor.B = decToHex(intermediateB);
        }

        function mainAction(color, impactedColor) {
            // najprej shadow
            if (shadow === 0) {
                intermediateR = color.R;
                intermediateG = color.G;
                intermediateB = color.B;
            } else {
                helperShadow(color);
            }

            // potem tint;
            if (tint === 0) {
                // se nič ne spremeni, intermediate smo dobili že v prejšnjem koraku, ga ni treba znova zganjat;
            } else {
                helperTint();
            }

            helperAssign(impactedColor);
        }

        mainAction(this.headingColor, this.impactedHeadingColor);
        mainAction(this.offsetColor, this.impactedOffsetColor);

    }


    // - - - - - POMEMBNO - - - - -
    // POMEMBNO!! treba se je zavedat, da kljub temu da črte rišeš, da predstavljajo kot, pod katerim je barva (0 je navzgor), so v preračunih mišljene tako, da kot 0 gleda vodoravno desno;
    // to pa zato, da lahko isti kot uporabiš za risanje črte,  risanje loka in risanje mavričnega ozadja kanvasa!!;
    // - - - - - POMEMBNO - - - - -

    #initialCircletteBckgroundDo() {    // to nariše canvas, ki služi za ozadje glavnemu canvasu;
        for (let x = 0; x < 360; x++) {
            this.heading = x;
            this.#calculateComponentValues();
            this.calculateImpact();

            let kot = degToRad(this.heading, -90);

            ctxBckgrnd.strokeStyle = `#${this.impactedHeadingColor.value}`;
            ctxBckgrnd.beginPath();
            ctxBckgrnd.moveTo(50, 50);
            ctxBckgrnd.lineTo(50 + Math.cos(kot) * 50, 50 + Math.sin(kot) * 50);
            ctxBckgrnd.stroke();

        }
        ctxBckgrnd.strokeStyle = 'black';
        ctxBckgrnd.beginPath();
        ctxBckgrnd.arc(50, 50, 49, 0, 2 * Math.PI);
        ctxBckgrnd.stroke();

        // to je da povrneš začetne vrednosti (0 in -60), ker je izris končal pri 359;
        this.heading = 0;
        this.#calculateComponentValues();
        this.calculateImpact();
    }

    circlette() {  // to vsakokrat nariše filo, ki predstavlja ofset in območje gradienta, ter črn krog in črn kazalec glavnega canvasa;
        activeCanvas.width = 99;    // to je finta, da izbrišeš canvas;
        activeCanvas.width = 100;

        if (this.heading.valueOf() != this.offsetAngle.valueOf()) {

            let manjsiKot, vecjiKot;
            if (this.offset < 0) {
                manjsiKot = this.offsetAngle.valueOf();
                vecjiKot = this.heading.valueOf();
            } else {
                manjsiKot = this.heading.valueOf();
                vecjiKot = this.offsetAngle.valueOf();
            }
            const manjsiKotVRad = degToRad(manjsiKot, -90);
            const vecjiKotVRad = degToRad(vecjiKot, -90);

            ctx.strokeStyle = `#d3d3d3`;    // RGBA - polprosojna
            ctx.fillStyle = `#b3b3b380`;
            ctx.lineWidth = 1;

            // narišemo levi kazalec iz središča (v svetlo sivi);
            ctx.beginPath();
            ctx.moveTo(50, 50);
            ctx.lineTo(50 + Math.cos(manjsiKotVRad) * 49, 50 + Math.sin(manjsiKotVRad) * 49);

            // narišemo del krožnice (v smeri urinega) in zapremo;
            ctx.arc(50, 50, 49, manjsiKotVRad, vecjiKotVRad);   // 49, ker je canvas 100, polmer pa naj bo mal manj kot 50, da ne bo kje krožnica prisekana;
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

        }

        // vedno narišemo črn krog (da preriše svetlo siv izsek krožnice, ki uokvirja filo) in kazalec glavnega kota;
        ctx.strokeStyle = `black`;
        ctx.beginPath();
        ctx.arc(50, 50, 49, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.stroke();

        const kot = degToRad(this.heading.valueOf(), -90);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(50 + Math.cos(kot) * 50, 50 + Math.sin(kot) * 50);
        ctx.stroke();

    }

    refreshLabels() {
        mainColorHexLbl.innerHTML = `#${this.impactedHeadingColor.value}`;
        mainColorAngleLbl.innerHTML = `${this.heading} deg`;
        offsetColorHexLbl.innerHTML = `#${this.impactedOffsetColor.value}`;
        if (Math.abs(this.offset) <= 180) {
            offsetColorOffsetLbl.innerHTML = `${this.offset} deg`;
        } else {
            const neg = this.offset < 0 ? true : false;
            const alt = 360 - Math.abs(this.offset);
            offsetColorOffsetLbl.innerHTML = `${this.offset} (${neg ? '+' : '-'}${alt}) deg`;
        };
    }

}

