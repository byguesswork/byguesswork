'use strict';

// spodnje 3 funkcije vzete iz utils, kjer imajo tudi isto ime, ampak to ni težava; Tu na voljo, da je fajl celovit in uporaben, ne da bi rabil še utils.js;
// In JavaScript, when you define multiple functions with the same name, the one that appears last will replace the earlier function declarations. This is called "function hosting".
function avgHexCalc(firstHex, secondHex, ratio) {

    // oba hexa morata biti 6-mestna in veljavna, ratio mora bit med 0 in 1; ni preverjanja za napake;
    
    // izračuni;
    let reslt = ''; // ker je to string, se bojo spodaj številke samodejno spremenile v besedilo;
    for (let i = 0; 2 * i < firstHex.length; i++) { // ker imata oba isto dolžino (predhodno preverjanje), prverjamo tu samo enega;
        const firstDec = hex2dec2digits(firstHex.slice(2 * i, 2 * i + 2));
        const secondDec = hex2dec2digits(secondHex.slice(2 * i, 2 * i + 2));
        let midOfWayHex;
        midOfWayHex = decToHex(firstDec + (secondDec - firstDec) * ratio);
        reslt += midOfWayHex;   // ker je to string se rezultati dodajajo v string;
    }
    return reslt;
}

function hex2dec2digits(niz) {  // prejme 2-mestni hex niz in vrne razpon 0-255;
    // if (niz.length != 2) {   // trenutno to preverjanje ni potrebno, ker sem pošilja samo, če je dvomestno (in ima le hex znake);
    //     console.log('predolg ali prekratek niz poslan v hex2dec2digits; niz mora biti dolg točno 2 znaka in predstavljati mora hex vrednost');
    //     return
    // }
    let verHex = [niz[0], niz[1]];  // na nizu (stringu) ni mogoče zagnat forEach, zato v array;
    verHex.forEach(function (val, i) {
        if (val === 'a' || val == 'A') verHex[i] = 10; else
            if (val === 'b' || val == 'B') verHex[i] = 11; else
                if (val === 'c' || val == 'C') verHex[i] = 12; else
                    if (val === 'd' || val == 'D') verHex[i] = 13; else
                        if (val === 'e' || val == 'E') verHex[i] = 14; else
                            if (val === 'f' || val == 'F') verHex[i] = 15;
        else verHex[i] = Number(verHex[i]); // za številke od 0-9, ki so do sedaj zapisane kot znaki;
    })
    let ver255 = verHex[0] * 16 + verHex[1];
    return ver255;
}

function decToHex(num) {    // prejet mora število od 0-255;
    let quot = Math.floor(num / 16);
    if (quot > 9) switch (quot) {
        case (10): quot = 'a'; break;
        case (11): quot = 'b'; break;
        case (12): quot = 'c'; break;
        case (13): quot = 'd'; break;
        case (14): quot = 'e'; break;
        case (15): quot = 'f'; break;
    }
    let rem = Math.floor(num % 16);
    if (rem > 9) switch (rem) {
        case (10): rem = 'a'; break;
        case (11): rem = 'b'; break;
        case (12): rem = 'c'; break;
        case (13): rem = 'd'; break;
        case (14): rem = 'e'; break;
        case (15): rem = 'f'; break;
    }
    return `${quot}${rem}`;
}


class Toggle{

    #isOn;  // <boolean> - tells, whether the toggle knob is in the "on" position (true; position to the right) or the off position (false, position to the left);
    #subordinates; // optional - an array containing the nodes that are subordinate to this instancese (which is a "master"); when the master changes (say from on to off) its subordinates change the same way;
    #toggleTickt; // <boolean> - a granter variable that determines whether the toggle() public method may run; 
                // was conceived to allow to move the bulk of the code from a private instance method to a public method (whose execution behaves as if it were public due to this ticket);
    #isUnactionable;    // <boolean> - determines, whether the toggle is inactive or unactionable, i.e. it is not possible to change the position of its knob and the toggle is greyed out;

    static #areBckgdClrsCmptd = false;  // for computing CSV custom properties;
    static #areInactveClrsCmptd = false;    // for computing CSV custom properties;

    constructor(
        divNode, // <div html node> (HTMLDivElement): the html div element in which the toggle will be created; obligatorily a <div>; NOTE: any contents of passed div will be deleted;
        stateOnOrOff_string_optional,   // <string> - optional: only valid passed value is 'on' (not case-sensitive), meaning toggle is initially set to the "on" state (knob to the right of the toggle; field #isOn gets value true); 
                                        // any other passed value or if omitted defaults to "off" (toggle initially set in "off" state, ie. to the left);
        masterToggle_or_isUnactionable // with this argument two types of information can be passed: masterToggle or isUnactionable;
                        // argument masterToggle_or_isUnactionable can be passed as the second argument (if stateOnOrOff_string_optional is omitted) or third argument;
                        // info types masterToggle and isUnactionable are mutually exclusive; if both are passed (say as 2nd and 3rd argument), only the master is valid, info calling for isUnactionable is discarded;
                        // if masterToggle: <instance of Toogle class> - optional; tells that this passed masterToggle is the master toggle for the Toggle instance being created;
                        // if isUnactionable: <boolean>: if true, it means the toggle is inactive (unactionable, greyed out), i.e. clicking it does not budge it from its initial state (which can be off or on);
        // stateOnOrOff_string_optional je zanalašč string (lahko bi bil bool), da lahko preverjamo, kateri podatek se pošilja s katerim argumentom, na podlagi vrste argumenta (string, Toggle, bool);
        // opcija je bila, da bi dal isUnactionable kot bool pred <div html node> potem bi tudi stateOnOrOff lahko bil bool (ali pa njuni mesti zamenjani), med njima pa bi bil div node, da ju razloči;
    ) {
        if(divNode != null && divNode != undefined && divNode.nodeName != undefined && divNode.nodeName.toLowerCase() == 'div') {

            // začetne;
            this.#isOn = false; // privzeto je false;
            this.#toggleTickt = false;  // dovolilnica za izvajanje toggle, trenutno neaktivna; aktivna le po potrebi;
            this.#isUnactionable = false;

            // uredimo isOn;
            if(typeof stateOnOrOff_string_optional == "string") { // če je podan null, je typeof == object, če je podan undefined, je typeof == undefined;
                const str = stateOnOrOff_string_optional.toLowerCase();
                if(str == 'on') this.#isOn = true; 
            }
    
            // uredimo master
            let master = undefined;
            // najprej za primer, če je master podan kot 2. argument; treba preverjat za != null, ker typeof null == object, nima pa constructorja; this.constructor.name == Toggle;
            if(typeof stateOnOrOff_string_optional == 'object' && stateOnOrOff_string_optional != null && stateOnOrOff_string_optional.constructor.name == this.constructor.name) {  // this.constructor.name == Toggle;
                master = stateOnOrOff_string_optional;
            // za primer, če je podan kot tretji;
            } else if(typeof masterToggle_or_isUnactionable == 'object' && masterToggle_or_isUnactionable != null && masterToggle_or_isUnactionable.constructor.name == this.constructor.name) {
                master = masterToggle_or_isUnactionable;
            }

            if(master != undefined) {
                this.#isOn = master.receiveSubHello(this);   // s tem se kao prijaviš masterju, da si njegov podrejeni toggle, hkrati pa prejmeš njegovo stanje;
            
            // uredimo isUnactionable;
            } else {
                // zakaj v else? ker se medsebojno izključujeta;
                if(typeof stateOnOrOff_string_optional == 'boolean') {
                    this.#isUnactionable = stateOnOrOff_string_optional;
                } else if(typeof masterToggle_or_isUnactionable == 'boolean') {
                    this.#isUnactionable = masterToggle_or_isUnactionable;
                }
            }

            // izračunamo barve ozadja;
            if(!Toggle.#areBckgdClrsCmptd) { this.doBckgndClrs() }

            // uredimo drsalnico (ozadje, prostor) stikala;
            this.switchDiv = divNode;
            this.switchDiv.classList = 'switch-holder switch-hldr-left';
            const borderRds = this.switchDiv.getBoundingClientRect().height / 2;
            this.switchDiv.style.borderRadius = `${borderRds}px`;
    
            // uredimo štoflc (uni gumbek, ki ga premikaš) stikala;
            this.toggleDiv = document.createElement('div');
            this.toggleDiv.classList = 'toggle toggle-flush-left';
            this.switchDiv.innerHTML = '';
            this.switchDiv.appendChild(this.toggleDiv);

            if(this.#isOn) this.#toggleGranter(); // šele zdaj, ker prej niso bili nastavljeni klasi, ki se preverjajo v metodi toggle;
                // tako pa je, ker po defaultu je stikalo na levi, izklopljeno, če pa smo podali, da je stikalo on, ga moramo zdaj togglat;
    
                // šele zdaj, ker šele zdaj imamo položaj in barve in vse;
            if(this.#isUnactionable == true) {
                if(!Toggle.#areInactveClrsCmptd) { this.doInactvClrs() } // v takem vrstnem redu, ker inactive izhajajo tudi iz ozadja;
                if(this.switchDiv.classList.contains('switch-hldr-right')) {
                    this.switchDiv.classList.remove('switch-hldr-right');
                    this.switchDiv.classList.add('inactive-switch-hldr-right');
                }
                if(this.switchDiv.classList.contains('switch-hldr-left')) {
                    this.switchDiv.classList.remove('switch-hldr-left');
                    this.switchDiv.classList.add('inactive-switch-hldr-left');
                }
                if(this.toggleDiv.classList.contains('toggle-flush-left')) {
                    this.toggleDiv.classList.remove('toggle-flush-left');
                    this.toggleDiv.classList.add('inactive-toggle-flush-left');
                }
                if(this.toggleDiv.classList.contains('toggle-flush-right')) {
                    this.toggleDiv.classList.remove('toggle-flush-right');
                    this.toggleDiv.classList.add('inactive-toggle-flush-right');
                }
            }
            // zanimivo, spodnji ne dela, v toggle vrne undefined za this.switchDiv in this.toggleDiv ...;
            // verjetno zato, ker še ne obstaja this oz. objekt do konca izvedbe konstruktorja;
            // this.switchDiv.addEventListener('click', this.#toggleGranter);
            // deluje na katerega od spodnjih dveh načinov;
            this.switchDiv.addEventListener('click', this.#toggleGranter.bind(this));   // če hočeš poslat parameter, ga moraš za this v bind: this.#toggle.bind(this, undefined));
            // this.switchDiv.addEventListener('click', () => { this.#toggleGranter() });

        } else console.log('za ta podan node: ', divNode, 'ne ustvarimo switcha, ker ni podan DIV')
    }
    //   -  -  konec constructor  - - - - - 

    //   -  -  -  -  METODE  -  -  -  - 

    #toggleGranter() {
        this.#toggleTickt = true;
        this.toggle();
    }

    toggle() {
        if(this.#toggleTickt) {
            this.#toggleTickt = false;
            let movedTowrdsOn = undefined;  // v nadaljevanju bomo SAMO ČE JE INSTANCA MASTER ob premiku zabeležili, v katero smer je premik,..
                                            // da bojo potem isto še subsi (true za ON/desno, false za OFF/levo);
    
            if(this.toggleDiv.classList.contains('toggle-flush-left')) {    // mora preverjat za to in ne za this.#isOn == false, ker preverjanja za ..
                        // true in false vrnejo nekaj tudi med potovanjem (transitioning) in potem bi se klik zabeležil tudi med potovanjem, česar pa ne želimo;
    
                // ugotovili smo, da je bilo na levi (OFF) in da bomo gibali na desno (ON);
                // že takoj spremenimo status;
                this.#isOn = true;
    
                // togg začne potovat desno;
                this.toggleDiv.classList.remove('toggle-flush-left');
                this.toggleDiv.classList.add('toggle-transitioning-right');
    
                // ozadje stikala se spremeni;
                this.switchDiv.classList.remove('switch-hldr-left');
                this.switchDiv.classList.add('switch-hldr-right');
    
                // nastavimo kakšno bo statično stanje po koncu potovanja;
                setTimeout(() => {
                    this.toggleDiv.classList.remove('toggle-transitioning-right');
                    if(!this.#isUnactionable) this.toggleDiv.classList.add('toggle-flush-right');
                        else this.toggleDiv.classList.add('inactive-toggle-flush-right'); // to je samo za primer postavitve strani, ker bi se sicer po timeoutu postavila aktivna varianta;
                }, 300)
    
                if(this.#subordinates != undefined) { movedTowrdsOn = true; }
    
            } else if(this.toggleDiv.classList.contains('toggle-flush-right')) {
                // že takoj spremenimo status;
                this.#isOn = false;
    
                // togg začne potovat levo;
                this.toggleDiv.classList.remove('toggle-flush-right');
                this.toggleDiv.classList.add('toggle-transitioning-left');
    
                // ozadje stikala se spremeni;
                this.switchDiv.classList.remove('switch-hldr-right');
                this.switchDiv.classList.add('switch-hldr-left');
    
                // nastavimo kakšno bo statično stanje po koncu potovanja;
                setTimeout(() => {
                    this.toggleDiv.classList.remove('toggle-transitioning-left');
                    this.toggleDiv.classList.add('toggle-flush-left');
                }, 300)
    
                if(this.#subordinates != undefined) { movedTowrdsOn = false; }
    
            }  else console.log('Klik med premikom, ni dovoljeno');
    
            // če je instanca master, po potrebi dregnemo še podrejene instance;
            if (movedTowrdsOn != undefined) {
                this.#subordinates.forEach(element => {
                    if(element.#isOn != movedTowrdsOn) element.#toggleGranter();   // če je sub na levi (false), master pa se je premaknil na desno (true), dregnemo suba;
                });
            }
        } else {
            console.log('Klican doToggle, ampak brez dovoljenja;')
        }
    }

    doBckgndClrs() {
        // najprej medlo zeleno ozadje (ozadje na strani za stanje vklopljeno);
        let neki = getComputedStyle(document.documentElement).getPropertyValue('--knob-on');
        neki = neki.slice(1);
        neki = '#' + avgHexCalc(neki, 'e0e0e0', 0.87);  // e0e0e0 je neka medla barva, h kateri težimo pri barvah ozadja;
        document.documentElement.style.setProperty('--bckgnd-on-side', neki);
        // še ozadje na strani za stanje izklopljeno;
        neki = getComputedStyle(document.documentElement).getPropertyValue('--knob-off');
        neki = neki.slice(1);
        neki = '#' + avgHexCalc(neki, 'e0e0e0', 0.87);
        document.documentElement.style.setProperty('--bckgnd-off-side', neki);
        Toggle.#areBckgdClrsCmptd = true;
    }

    doInactvClrs() {
        // gumb na desni
        let neki = getComputedStyle(document.documentElement).getPropertyValue('--knob-on');
        neki = neki.slice(1);
        neki = '#' + avgHexCalc(neki, '818181', 0.87);  // 525252 (al tam nekje) je neka medla barva, h kateri težimo pri neaktivnih barvah;
        document.documentElement.style.setProperty('--inactive-knob-on', neki);
        // gumb na levi;
        neki = getComputedStyle(document.documentElement).getPropertyValue('--knob-off');
        neki = neki.slice(1);
        neki = '#' + avgHexCalc(neki, '818181', 0.87);
        document.documentElement.style.setProperty('--inactive-knob-off', neki);
        // še barve ozadij;
        neki = getComputedStyle(document.documentElement).getPropertyValue('--bckgnd-on-side');
        neki = neki.slice(1);
        neki = '#' + avgHexCalc(neki, '525252', 0.87);
        document.documentElement.style.setProperty('--inactive-bckgnd-on-side', neki);
        neki = getComputedStyle(document.documentElement).getPropertyValue('--bckgnd-off-side');
        neki = neki.slice(1);
        neki = '#' + avgHexCalc(neki, '525252', 0.87);
        document.documentElement.style.setProperty('--inactive-bckgnd-off-side', neki);

        Toggle.#areInactveClrsCmptd = true;
    }

    isOn() {    // getter za #isOn;
        return this.#isOn;
    }

    receiveSubHello(sub) {  // s tem se togglu nek drugi toggle (sub) javi, da mu je podrejen (da je "sub" pordejen temu, na katerem je klicana ta metoda); 
        if(this.#subordinates == undefined) {
            this.#subordinates = [];
        }
        this.#subordinates.push(sub);
        // obenem tudi master podrejenemu vrne svoje stanje;
        return this.#isOn;
    }
}