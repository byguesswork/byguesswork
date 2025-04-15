'use strict';

const mainDocElement = document.querySelector('.main');
// let imgs;
// let lesserBoundingHorizontal

let isMobile;
if (navigator.userAgent.match(/(android|iphone|ipad)/i) != null || navigator.userAgentData.mobile == true) {
    isMobile = true;
} else {
    isMobile = false;
}

if (isMobile) {
    mainDocElement.style.marginTop = '30px';
    mainDocElement.style.marginRight = '30px';
    mainDocElement.style.marginLeft = '20px';

    // predvsem za Fuel, ker Igrajmo se ima majhne slike, povrh imajo velikost določeno na element level;
    const lesserBoundingHorizontal = window.innerWidth > screen.width ? screen.width : window.innerWidth;
    console.log(lesserBoundingHorizontal)
    const imgs = document.getElementsByClassName('pics');
    for (let i = 0; i < imgs.length; i++) {
        if (imgs[i].width >= lesserBoundingHorizontal - 60 /* 20 margin mainDoc + 20 (marginL slike) + 20 (margR slike); */
            && imgs[i].width < imgs[i].height /* samo za pokončne slike za zdaj */ ) {
                imgs[i].style.marginLeft = '20px';
                imgs[i].style.marginRight = '40px';
                imgs[i].style.marginBottom = '30px';
                imgs[i].width = lesserBoundingHorizontal - 80;  // ker zdaj je 20 margin mainDoc + 20 margin L slike + 40 marginR slike; marginR mainDoc (30?) ne vpliva (vsaj ne, če imaš vodoravne slike ali ne)

        }
    }

}