'use strict';

class Background {

    static bckgndsCatalogue = {
        0: {
            x: 0,
            y: 0
        },
        1: {
            x: 602,
            y: 0
        },
    }

    constructor(ctx, assets) {
        this.ctx = ctx;
        this.assets = assets;
        this.skiesBhndClouds = {
            0: undefined,
            1: undefined,
        }
        this.currBckgndIdx = undefined;
        this.currSkyBhnd;   // tle se shrani nebo za oblaki;
        this.clouds = {
            starts: {
                farther: [-170, 220, 450],
                closer: [-270, 20, 470]
            },
            intrvlID: 0,
            mvmtCountr: 0,
        }
    }

    draw(bckgndIdx) {
        if(this.currBckgndIdx == undefined || this.currBckgndIdx != bckgndIdx) {
            this.currBckgndIdx = bckgndIdx;
            const currBckgndDef = Background.bckgndsCatalogue[this.currBckgndIdx];
            this.ctx.drawImage(this.assets, currBckgndDef.x, currBckgndDef.y, 600, 420, 0, 0, 600, 420);
            // shranimo ozadje za oblaki
            if(this.skiesBhndClouds[this.currBckgndIdx] == undefined) {
                this.skiesBhndClouds[this.currBckgndIdx] = this.ctx.getImageData(0, 30, Screen.width, 107);
            }
            this.currSkyBhnd = this.skiesBhndClouds[this.currBckgndIdx];
        }
        this.startClouds();
    }

    drawClouds() {
        // najprej oddaljeni oblaki;
        if(this.clouds.starts.farther.length > 0) {
            for (const cloud of this.clouds.starts.farther) {
                // tle bi moralo bit x:279 in w:194, ampak verjetno ker gre korak po 0,5 (ko je bilo tako), skoči za 0,5 nazaj (ali naprej) in pokaže črno črto pred ali po;
                const neki = cloud + this.clouds.mvmtCountr * 1.2;  // izvirno (pri 420 ms): 0.6; rabi se pri prehodu zaslona (pri štartu je drugi seštevanec 0 in ne bi rabil tega preračuna);
                this.ctx.drawImage(bckgndAssets, 280, 422, 193, 60, neki, 77, 193, 60);
            }
        }
        //bližnji oblaki
        if(this.clouds.starts.closer.length > 0) {
            for (const cloud of this.clouds.starts.closer) {
                const neki = cloud + this.clouds.mvmtCountr * 2;    // izvirno (pri 420 ms): 1 (torej brez); ob zagonu igre je ta preračun odvečen;
                this.ctx.drawImage(bckgndAssets, 0 , 422, 277, 87, neki, 30, 277, 87);
            }
        }
    }

    startClouds() {
        this.drawClouds();
        this.clouds.intrvlID = setInterval(this.moveClouds.bind(this), 1000);    // izvirno 420 ms;
    }

    stopClouds() {
        clearInterval(this.clouds.intrvlID);
        this.clouds.intrvlID = 0;
        this.ctx.putImageData(this.currSkyBhnd, 0, 30);
    }

    moveClouds() {
        // izrisat čisto nebo za oblaki;
        this.ctx.putImageData(this.currSkyBhnd, 0, 30);

        // risanje oblakov;
        this.clouds.mvmtCountr++;   // pomaknemo na nov položaj;
        this.drawClouds();
        
        // čekiranje za odstranjevanje elementov;
        const closerClouds = this.clouds.starts.closer;
        const farClouds = this.clouds.starts.farther;
        if(this.clouds.mvmtCountr % 150 == 0) {
            if(closerClouds.length > 0 && closerClouds[closerClouds.length - 1] + this.clouds.mvmtCountr > Screen.width) {
                closerClouds.pop();
            }
            if(farClouds.length > 0 && farClouds[farClouds.length - 1] + this.clouds.mvmtCountr * 0.6 > Screen.width) {
                farClouds.pop();
            }
            // console.log(this.clouds.starts)
            if(farClouds.length == 0 && closerClouds.length == 0) {
                this.stopClouds();
                console.log('Clouds interval ended and stopped;')
            }
        }
    }

}