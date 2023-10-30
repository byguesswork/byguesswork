'use strict';

// dat manjšo sliko pri ozkem ekranu oz. normalno pri večjem
const pic = document.getElementById('pic');
const picDiv = document.getElementById('pic-div');
if (window.innerWidth > 640 && screen.width > 640 && mainDocElement.getBoundingClientRect().width > 640) {
    // samo spremenimo source, na večjega, višina div-a pa je že naštimana za večjo sliko;
    pic.setAttribute("src", "../images/random_crooked_600w.jpg");
} else {
    // moramo popravit višino (na div-u), ker je izvirno naštimana za večjo sliko; src je privzeto mala slika;
    picDiv.style.height = "168px";
}

