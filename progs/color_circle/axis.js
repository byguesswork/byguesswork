class Axis {  // axis kot gradient axis, gradient line;
    constructor() {

        // to je kot (angle) od heading barve; na vrhu, navpično navzgor oz. 0deg, je rdeča;
        this.heading = 0;
        // zamik druge barve; -60 pomeni, da offset barva za 60 stopinj zaostaja za glavno (heading) barvo;
        this.offset = -60;
        this.offsetAngle = 300;
        this.gradientDirection = '0';

        // glavna oz. neodvisna barva (kot heading pri orientaciji, torej kamor si usmerjen);
        this.headingColor = {
            R: 'ff',
            G: '00',
            B: '00',
            get value() {
                return `${this.R}${this.G}${this.B}`;
            }
        }

        // odvisna barva, ki je za določen kot na barvnem krogu drugačna od glavne barve
        this.offsetColor = {
            R: '00',
            G: '00',
            B: '00',
            get value() {
                return `${this.R}${this.G}${this.B}`;
            }
        }

        this.#initialCircletteBckgroundDo();
        this.#offsetCirclette();
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
            this.#calculateComponentValues();
            this.#draw();
            this.#circlette();
            this.#offsetCirclette();
            this.#refreshLabels();
        }
    }

    #addEventListeners() {
        document.addEventListener('keydown', this.#atKeyPress.bind(this)); // temu bind bi se lahko izognil z arrow funkcijo

        gradientDirection.forEach(curr => {
            curr.addEventListener('change', (e) => {
                this.gradientDirection = e.target.value;
                curr.blur();
                this.#draw();
            })
        });


    }

    #draw() {
        // privzeto gre gradient 0deg od spodaj navzgor; začetna (neodvisna, nosilna, heading) barva je torej v mojem primeru podana v drug barvni atribut, ne v prvega;
        const text = this.gradientDirection === 'follow-angle' ? this.heading : this.gradientDirection;
        circle.style.backgroundImage = `linear-gradient(${text}deg, #${this.offsetColor.value} 12%, #${this.headingColor.value} 88%)`;  // pravilno: ${this.heading}deg
    }

    #doStuffHelper(angle, color) {      // za določitev barve na podlagi kota;
        if (angle > 0 && angle < 60) {
            color.R = 'ff';
            color.G = decToHex(percOf60(0, angle) * 255);
            color.B = '00';
        } else if (angle > 180 && angle < 240) {
            color.R = '00';
            color.G = decToHex((1 - percOf60(180, angle)) * 255);
            color.B = 'ff';
        } else if (angle > 60 && angle < 120) {
            color.R = decToHex((1 - percOf60(60, angle)) * 255);
            color.G = 'ff';
            color.B = '00';
        } else if (angle > 240 && angle < 300) {
            color.R = decToHex(percOf60(240, angle) * 255);
            color.G = '00';
            color.B = 'ff';
        } else if (angle > 120 && angle < 180) {
            color.R = '00';
            color.G = 'ff';
            color.B = decToHex(percOf60(120, angle) * 255);
        } else if (angle > 300 && angle < 360) {
            color.R = 'ff';
            color.G = '00';
            color.B = decToHex((1 - percOf60(300, angle)) * 255);
        } else if (angle === 0) {
            color.R = 'ff';
            color.G = '00';
            color.B = '00';
        } else if (angle === 60) {
            color.R = 'ff';
            color.G = 'ff';
            color.B = '00';
        } else if (angle === 120) {
            color.R = '00';
            color.G = 'ff';
            color.B = '00';
        } else if (angle === 180) {
            color.R = '00';
            color.G = 'ff';
            color.B = 'ff';
        } else if (angle === 240) {
            color.R = '00';
            color.G = '00';
            color.B = 'ff';
        } else if (angle === 300) {
            color.R = 'ff';
            color.G = '00';
            color.B = 'ff';
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


    // - - - - - POMEMBNO - - - - -
    // POMEMBNO!! treba se je zavedat, da kljub temu da črte rišeš, da predstavljajo kot, pod katerim je barva (0 je navzgor), so v preračunih mišljene tako, da kot 0 gleda vodoravno desno;
    // to pa zato, da lahko isti kot uporabiš za risanje črte,  risanje loka in risanje mavričnega ozadja kanvasa!!;
    // - - - - - POMEMBNO - - - - -

    #initialCircletteBckgroundDo() {    // to nariše canvas, ki služi za ozadje glavnemu canvasu;
        for (let x = 0; x < 360; x++) {
            this.heading = x;
            this.#calculateComponentValues();

            let kot = degToRad(this.heading, -90);

            ctxBckgrnd.strokeStyle = `#${this.headingColor.value}`;
            ctxBckgrnd.beginPath();
            ctxBckgrnd.moveTo(50, 50);
            ctxBckgrnd.lineTo(50 + Math.cos(kot) * 50, 50 + Math.sin(kot) * 50);
            ctxBckgrnd.stroke();

        }
        ctxBckgrnd.strokeStyle = 'black';
        ctxBckgrnd.beginPath();
        ctxBckgrnd.arc(50, 50, 49, 0, 2 * Math.PI);
        ctxBckgrnd.stroke();

        this.positionCirclette();

        // to je da povrneš začetne vrednosti (0 in -60), ker je izris končal pri 359;
        this.heading = 0;
        this.#calculateComponentValues();
    }

    positionCirclette() {   // to pozicionira glavni canvas (activeCanvas), da leži točno nad ozadjem glavnega canvasa;
        const bckgndCanvasFrame = canvas.getBoundingClientRect();
        activeCanvas.style.top = `${bckgndCanvasFrame.top - 20}px`;     // -20, ker ima body, ki je relative source tega absoulta, margin 20;
        activeCanvas.style.left = `${bckgndCanvasFrame.left - 20}px`;   // -20, ker ima body, ki je relative source tega absoulta, margin 20;
        activeCanvas.style.width = '100px';
        activeCanvas.style.height = '100px';
        activeCanvas.width = 100;
        activeCanvas.height = 100;

        this.#circlette();
    }

    #circlette() {  // to vsakokrat nariše črn kazalec glavnega canvasa;
        activeCanvas.width = 99;    // to je finta, da izbrišeš canvas;
        activeCanvas.width = 100;

        const kot = degToRad(this.heading, -90);

        ctx.strokeStyle = `black`;
        ctx.beginPath();
        ctx.moveTo(50, 50);
        ctx.lineTo(50 + Math.cos(kot) * 49, 50 + Math.sin(kot) * 49);
        ctx.stroke();

    }

    #offsetCirclette() {    //  to izriše canvas pod gradientom, tistega, na katerem je prikazan offset;
        offsetCanvas.width = 99;    // to je finta, da izbrišeš canvas;
        offsetCanvas.width = 100;

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

            offsetCtx.strokeStyle = `#d3d3d377`;    // RGBA - polprosojna
            offsetCtx.fillStyle = `#d3d3d377`;
            offsetCtx.lineWidth = 1;

            // narišemo levi kazalec iz središča (v svetlo sivi);
            offsetCtx.beginPath();
            offsetCtx.moveTo(50, 50);
            offsetCtx.lineTo(50 + Math.cos(manjsiKotVRad) * 48, 50 + Math.sin(manjsiKotVRad) * 48);  // 48, ker je canvas 100, polmer pa za bit 49, da ziher ne gre čez rob canvasa; fila pa mora bit še manjša kot polmer;

            // narišemo del krožnice (v smeri urinega) in zapremo;
            offsetCtx.arc(50, 50, 48, manjsiKotVRad, vecjiKotVRad);
            offsetCtx.closePath();
            offsetCtx.fill();
            offsetCtx.stroke();

        }

        // vedno narišemo črn krog in kazalec glavnega kota;
        offsetCtx.strokeStyle = `black`;
        offsetCtx.beginPath();
        offsetCtx.arc(50, 50, 49, 0, 2 * Math.PI);
        offsetCtx.closePath();
        offsetCtx.stroke();

        const kot = degToRad(this.heading.valueOf(), -90);
        offsetCtx.lineWidth = 1.5;
        offsetCtx.beginPath();
        offsetCtx.moveTo(50, 50);
        offsetCtx.lineTo(50 + Math.cos(kot) * 50, 50 + Math.sin(kot) * 50);
        offsetCtx.stroke();

    }

    #refreshLabels() {
        mainColorHexLbl.innerHTML = `#${axis.headingColor.value}`;
        mainColorAngleLbl.innerHTML = `${axis.heading} deg`;
        offsetColorHexLbl.innerHTML = `#${axis.offsetColor.value}`;
        if (Math.abs(axis.offset) <= 180) {
            offsetColorOffsetLbl.innerHTML = `${axis.offset} deg`;
        } else {
            const neg = axis.offset < 0 ? true : false;
            const alt = 360 - Math.abs(axis.offset);
            offsetColorOffsetLbl.innerHTML = `${axis.offset} (${neg ? '+' : '-'}${alt}) deg`;
        };
    }


}

