'use strict';

// dat manjšo sliko pri ozkem ekranu
if (window.innerWidth < 640) {
    const pic = document.getElementById('pic');
    pic.setAttribute("src", "/images/random_crooked_300w.jpg");
}