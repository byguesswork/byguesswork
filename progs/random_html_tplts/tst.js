const left = document.getElementsByClassName('left');
const right = document.getElementsByClassName('right');
const mid = document.getElementsByClassName('mid');

left[0].addEventListener('click', () => {
    console.log('ja');
    mid[0].classList.add('one');
});
right[0].addEventListener('click', () => {
    console.log('hmh');
    mid[0].style.background = 'red';
})

// test, kako ima element level nastavitev prednost pred nastavitvijo, ki izhaja iz pripisanega klasa
// pomemben je tudi vrstni red zapisa v css-z: kar je bolj nizko, ima prednost pred enakim propertijem enake specifičnosti, ki je napisan bolj visoko