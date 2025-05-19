'use strict';

const mainDocElement = document.querySelector('.main');
const appName = document.getElementsByTagName('body')[0].dataset.app;
// let debugData = 'debug: <br>';

let isMobile;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null) {
    isMobile = true;
} else {
    isMobile = false;
}

function styleImgs([img, passedWidth]) {
    if (img.width >= passedWidth - 60 /* 20 margin mainDoc + 20 (marginL slike) + 20 (margR slike); */
        && img.width < img.height /* samo za pokončne slike za zdaj */ ) {
            img.style.marginLeft = '20px';
            img.style.marginRight = '40px';
            img.style.marginBottom = '30px';
            img.width = passedWidth - 80;  // ker zdaj je 20 margin mainDoc + 20 margin L slike + 40 marginR slike; marginR mainDoc (30?) ne vpliva (vsaj ne, če imaš vodoravne slike ali ne)
    }
}

if (isMobile) {
    mainDocElement.style.marginTop = '30px';
    mainDocElement.style.marginRight = '30px';
    mainDocElement.style.marginLeft = '20px';

    if (appName == 'fuel') {    // predvsem za Fuel, ker Igrajmo se ima majhne slike, povrh imajo velikost določeno na element level;

        // const debugPurpose = document.getElementById('signature');

        const lesserBoundingHorizontal = window.innerWidth > screen.width ? screen.width : window.innerWidth;
        console.log(lesserBoundingHorizontal)
        const imgs = document.getElementsByClassName('pics');
        for (let i = 0; i < imgs.length; i++) {
            if (imgs[i].complete) {
                styleImgs([imgs[i], lesserBoundingHorizontal]);
                // debugData += `complete, ${i}, false;<br>`;   // false pomeni, da ni bil klican listener;
            } else {
                imgs[i].addEventListener('load', styleImgs.bind(null, [imgs[i], lesserBoundingHorizontal]))
                // debugData += `not complete, ${i}, true;<br>`;    // true pomeni, da je bil klican listener;
            }
            imgs[i].style.border = '#83a2b8 solid 1px'; // samo fuel dobijo obrobo, pri igrajmose ni videt lepo;
        }
        // debugPurpose.insertAdjacentHTML('beforeBegin', debugData);
    }
    

}