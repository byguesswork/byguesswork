'use strict';

class Toggle{

    #isOn;  // privatna spremenljivka; od zunaj dostopamo z getterjem; pove, ali je stikalo v položaju za vključeno;
    #subordinates; //seznam  morebitnih podrejenih togglov (takih, ki se spremenijo enako z nadrejenim, če se nadrejeni spremeni);
    #toggleTickt; // kr ena fora, dovolilnica za izvajanje toggle, ki omogoča, da je private metoda zelo majhna (samo potrdi ticket),..
                // javna pa dostopna le s ticketom, ki je lahko potrjen le v privatni;
    #isUnactionable;    // pove, ali je toggle osivljen, da ga ne moreš kliknit/spremenit;

    static #areBckgdClrsCmptd = false;
    static #areInactveClrsCmptd = false;

    constructor(
        divNode, // prejme spremenljivko, ki predstavlja node, ki je vrste div; OPOMBA: morebitna vsebina podanega div-a bo izbrisana;
        stateOnOrOff_string_optional, // <string>: edina veljavna vrednost je 'on' (ni case-sensitive); pove, ali je stikalo že takoj na "on"; privzeto (če ni podano "on") je "off" (#isOn -> false);
        masterToggle_or_isUnactionable // masterToggle <instanca classa Toggle>: opredeli, kateri toggle (master toggle) je nadrejen temu (v katerega podajaš argumente), tj. če nadrejeni spremeni položaj, ga tale sprmeni enako;
                                        // isUnactionable <bool>: pove, ali je toggle osivljen, da ga ne moreš kliknit/spremenit;
                                        // ne smeš podat master kot 2. argument in isUnactionable kot 3.; v takem primeru bi obveljal master..
                                        // ..(ne moreta obstajati hkrati, ker ne moreš slediti masterju, hkrati pa je toggle osviljen; osivljen toggle se ne premika);
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
            // najprej za primer, če je master podan kot 2. argument; treba preverjat za != null, ker typeof null == object, nima pa constructorja;
            if(typeof stateOnOrOff_string_optional == 'object' && stateOnOrOff_string_optional != null && stateOnOrOff_string_optional.constructor.name == this.constructor.name) {
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

            if(this.#isOn) this.#toggle(); // šele zdaj, ker prej niso bili nastavljeni klasi, ki se preverjajo v metodi toggle;
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
            // this.switchDiv.addEventListener('click', this.#toggle);
            // deluje na katerega od spodnjih dveh načinov;
            this.switchDiv.addEventListener('click', this.#toggle.bind(this));   // če hočeš poslat parameter, ga moraš za this v bind: this.#toggle.bind(this, undefined));
            // this.switchDiv.addEventListener('click', () => { this.#toggle() });

        } else console.log('za ta podan node: ', divNode, 'ne ustvarimo switcha, ker ni podan DIV')
    }
    //   -  -  konec constructor  - - - - - 

    //   -  -  -  -  METODE  -  -  -  - 

    #toggle() {
        this.#toggleTickt = true;
        this.doToggle();
    }

    doToggle() {
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
                    if(element.#isOn != movedTowrdsOn) element.#toggle();   // če je sub na levi (false), master pa se je premaknil na desno (true), dregnemo suba;
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