class Controls {
    constructor(parentsThis) {
        this.parentsThis = parentsThis;

        this.shadow = 0;    // začetna vrednost črne tinte, ujema se z začetno nastavitvijo širine levega dela v CSS-ju;
        this.tint = 0;

        this.gradientDirection = '90';

        this.shadowDiv = document.getElementById('shadow-div');
        this.shadowControllerLSide = document.getElementById('shadow-L-side');
        this.shadowControllerRSide = document.getElementById('shadow-R-side');
        this.shadowInfo = document.getElementById('shadow-info');
        this.tintDiv = document.getElementById('tint-div');
        this.tintControllerLSide = document.getElementById('tint-L-side');
        this.tintControllerRSide = document.getElementById('tint-R-side');
        this.tintInfo = document.getElementById('tint-info');
        this.gradientDirectionToggle = document.getElementsByName('gradient-direction');

        this.toneCtrlHeldPressed = false;


        this.#addEvtListeners();
        this.getBoundingRects();

    }

    #addEvtListeners() {

        // 4x evt listener za shadow
        this.shadowDiv.addEventListener('mousedown', (e) => {   // damo arrow funkcijo, da ni težav z this;
            this.#shadowCtrlChgGo(e.clientX);
            this.toneCtrlHeldPressed = true;
        })

        this.shadowDiv.addEventListener('mousemove', (e) => {
            if (this.toneCtrlHeldPressed) {
                this.#shadowCtrlChgGo(e.clientX);
            }
        })

        this.shadowDiv.addEventListener('mouseleave', (e) => {
            if (this.toneCtrlHeldPressed) {
                this.toneCtrlHeldPressed = false;
            }
        })

        this.shadowDiv.addEventListener('click', (e) => {   // click se zazna pri mouseup;
            if (this.toneCtrlHeldPressed) {
                this.toneCtrlHeldPressed = false;
            }
        })

        // 4x evt listener za tint
        this.tintDiv.addEventListener('mousedown', (e) => {
            this.#tintCtrlChgGo(e.clientX);
            this.toneCtrlHeldPressed = true;
        })

        this.tintDiv.addEventListener('mousemove', (e) => {
            if (this.toneCtrlHeldPressed) {
                this.#tintCtrlChgGo(e.clientX);
            }
        })

        this.tintDiv.addEventListener('mouseleave', (e) => {
            if (this.toneCtrlHeldPressed) {
                this.toneCtrlHeldPressed = false;
            }
        })

        this.tintDiv.addEventListener('click', (e) => {     // click se zazna pri mouseup;
            if (this.toneCtrlHeldPressed) {
                this.toneCtrlHeldPressed = false;
            }
        })

        this.gradientDirectionToggle.forEach(curr => {
            curr.addEventListener('change', (e) => {
                this.gradientDirection = e.target.value;
                curr.blur();
                this.parentsThis.draw();
            })
        });

    }

    #shadowCtrlChgGo(clientX) {
        const num = Math.round(clientX - this.shadowDivLeftEdge);
        if (num > 0 && num < 102) {   // 1 v shadow div je enako 0 širine left, 101 shadow div = 100 širine left;
            // shranjena numerična vrednost
            this.shadow = num - 1;
            // postavitev HTML-ja
            this.shadowControllerLSide.style.width = `${num - 1}px`;
            this.shadowControllerRSide.style.width = `${100 - (num - 1)}px`;
            // posodobit gradient in zapisano cifro pri sliderju;
            this.#refreshAfterToneChg('shadow');
        }
    }

    #tintCtrlChgGo(clientX) {
        const num = Math.round(clientX - this.tintDivLeftEdge);
        if (num > 0 && num < 102) {   // 1 v tint div je enako 0 širine left, 101 tint div = 100 širine left;
            // shranjena numerična vrednost
            this.tint = num - 1;
            // postavitev HTML-ja
            this.tintControllerLSide.style.width = `${num - 1}px`;
            this.tintControllerRSide.style.width = `${100 - (num - 1)}px`;
            // posodobit gradient in zapisano cifro pri sliderju;
            this.#refreshAfterToneChg('_');
        }
    }

    #refreshAfterToneChg(which) {
        if (which === 'shadow') {   // to je ternutno narejeno samo za shadow in tint, ne še za grey;
            this.shadowInfo.innerHTML = `${this.shadow}`;
        } else this.tintInfo.innerHTML = `${this.tint}`;
        this.parentsThis.calculateImpact();
        this.parentsThis.draw();
        this.parentsThis.refreshLabels();
    }

    getBoundingRects() {
        this.shadowDivLeftEdge = this.shadowDiv.getBoundingClientRect().left;
        this.tintDivLeftEdge = this.tintDiv.getBoundingClientRect().left;
    }


}