'use strict';

const mainDocElement = document.querySelector('.main');
let imgs;
let lesserBoundingHorizontal

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

    // za Fuel;
    lesserBoundingHorizontal = window.innerWidth > screen.width ? screen.width : window.innerWidth;
    console.log(lesserBoundingHorizontal)
    imgs = document.getElementsByClassName('pics');
    for (let i = 0; i < imgs.length; i++) {
        if (imgs[i].width > lesserBoundingHorizontal - 50 /* 20 margin mainDoc + 20, kolikor je marginL slike + 10, kolikor je margR slike; */
            && imgs[i].width < imgs[i].height /* samo za pokončne slike za zdaj */ ) {
                console.log('ja')
                imgs[i].style.marginLeft = '0px';
                imgs[i].style.marginRight = '20px';
                imgs[i].width = lesserBoundingHorizontal - 40;  // ker zdaj je 20 margin mainDoc + 20 marginR slike; marginR mainDoc (30?) ne vpliva (vsaj ne, če imaš vodoravne slike ali ne)

        }
    }

}