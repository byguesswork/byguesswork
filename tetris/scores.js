'use strict';

//      --------------      Izvajanje High scores (samo high score, ne pa tudi sprotni score)

//   ---------  SELEKTORJI

const btnResetHighScores = document.querySelector('.button-1');
const btnCancelResetHscores = document.getElementById('btn-reset-hscores-no');
const frameResetHighScores = document.getElementById('reset-highscores');
const btnConfirmResetHscores = document.getElementById('btn-reset-hscores-yes');
const divHighScores = document.getElementById('high-scores');
const divHighScoresAll = document.getElementById('high-scores-all');
const labelHighScoresInitials = document.getElementById('high-score-initials');
const labelHighScoresTable = document.getElementById('high-scores-table');


//   - - - - -   SPREMENLJIVKE

let highScores = [];
let btnResetHighScoresPressedHuh = false;

//   --------  FUNKCIJE

function smallSizeHighScoresTable() {
    let collect = document.querySelectorAll('#high-scores-table td');
    collect.forEach(element => element.style.fontSize = '11px');

    divHighScores.style.width = '95%';
    divHighScores.style.height = '-moz-fit-content';
    divHighScores.style.height = 'fit-content';
    divHighScores.style.margin = '15px 0 0 10px';
    btnResetHighScores.style.margin = '10px 0 0 10px';
};

function displayHighScores() {
    labelHighScoresTable.innerHTML = '';    // najprej počistit vsebino okvirčka z najboljšimi rezultati
    let innerText = '';
    if (highScores.length === 0) {          // če ni shranjenih rezultatov, to napiši
        if (pageLang === 'en') innerText = `
        <tr>
            <td>No high scores yet. Play some!</td>
        </tr>`; else innerText = `
        <tr>
            <td>Dejmo kej igrat!<br>Tle bi morala bit tabela z dosežki!</td>
        </tr>`;
        labelHighScoresTable.insertAdjacentHTML('beforeend', innerText);
        return;
    } else {                                //  header
        if (pageLang === 'en')
            labelHighScoresTable.insertAdjacentHTML('beforeend', `
            <tr>
                <td colspan="6">&nbsp;&nbsp;ALL-TIME HIGH SCORES !</td>
            </tr>
            <tr>
                <td>Rank</td>
                <td>Score</td>
                <td>Name</td>
                <td>Date</td>
                <td>Grid</td>
                <td>Interval</td>
            </tr>`);
        else labelHighScoresTable.insertAdjacentHTML('beforeend', `
        <tr>
            <td colspan="6">&nbsp;&nbsp;NAJVEČJE LEGENDE VSEH ČASOV!</td>
        </tr>
        <tr>
            <td>X&nbsp;</td>
            <td>točk</td>
            <td>ime</td>
            <td>datum</td>
            <td>igr.polje</td>
            <td>interval</td>
        </tr>`);
        highScores.forEach((el, i) => {         //  podatki rezultatov
            let intervalText = el.interval;
            if (pageLang === 'sl' && el.interval !== undefined)
                if (el.interval === 'shrinking') intervalText = 'vse krajši'; else intervalText = 'konstanten';
            innerText = `
            <tr>
                <td>${i + 1} </td>
                <td>${el.score} </td>
                <td>${el.name} </td>
                <td style='font-size:13px'>${el.date}</td>
                <td style='font-size:13px'>${el.grid}</td>
                <td style='font-size:12px'>${intervalText}</td>
            </tr>`
            labelHighScoresTable.insertAdjacentHTML('beforeend', innerText);
        });
    };
    if (window.innerWidth < 1370) {
        smallSizeHighScoresTable();
    }
}

function resolveHighScores() {

    function finishHighScoresProcess() {
        inputInitials.value = '';
        inputInitials.blur();
        labelHighScoresInitials.classList.add('hidden');
        formInitials.removeEventListener('submit', initialsFormSubmitted);
        document.removeEventListener('keyup', initialsFormEscaped);
        if (window.innerWidth < 1221 || (window.innerHeight < 559 && window.innerWidth < 1239)) divHighScoresAll.classList.remove('hidden');
        displayHighScores();

        //  shranit v local storage
        localStorage.setItem('highScores', JSON.stringify(highScores));

        standBy();
        controlsTemporarilyOff = false;
    }

    function initialsFormSubmitted(e) {
        e.preventDefault();     // to mora bit; ne vpliva samo na morebiten cosnole.log, ampak preprosto reštarta igro (točneje, osveži stran)
        highScores[whichIndex].name = inputInitials.value;
        finishHighScoresProcess();
    }

    function initialsFormEscaped(e) {
        if (e.key === 'Escape') {
            highScores[whichIndex].name = 'nessuno';
            finishHighScoresProcess();
        }
    }

    const datum = new Date();
    const zapisDatuma = `${datum.getDate()}-${datum.getMonth() + 1}-${String(datum.getFullYear()).slice(2)}`;
    const intervalKončaneIgre = intervalTypeShrinkingHuh === true ? 'shrinking' : 'constant';
    const currentGridSize = `${lastRow0based + 1}x${lastColumn0Based + 1}`;
    const entry = { date: zapisDatuma, score: score, interval: intervalKončaneIgre, grid: currentGridSize };
    let whichIndex;

    if (highScores.length > 0) {    // če že obstaja seznam rezultatov, delaj spodnje

        //  od katerega elementa seznama je večji trenutni score
        whichIndex = highScores.findIndex(el => score > el.score);

        //  logika
        if (whichIndex < 0) {   // če trenutni score ni večji od nobenega rezultata na seznamu
            if (highScores.length === 8) {
                standBy();
                controlsTemporarilyOff = false;
                return
            }    //  če je tabela z rezultati že polna, pač nisi prišel nanjo;
            else {
                highScores.push(entry);
                whichIndex = highScores.length - 1;     // to je treba naredit, sicer whichIndex kaže -1, kar povzroči napako v nadaljevanju
            }
        } else highScores.splice(whichIndex, 0, entry);   // če je trenutni score večji od katerega s seznama, ga vstavi (dodaj) na isto mesto
        // da ne postane predolgo; ! ! !  PAZI  ! ! !: če spreminjaš, moraš tudi par vrstic više (številko 5 ali 10 ali kar že)
        if (highScores.length > 8) highScores.splice(8, 1);
    } else {    // sicer začni polnit trenutno prazen (torej nov) seznam rezultatov    
        whichIndex = 0;
        highScores[whichIndex] = entry;
    };

    // pokaže vnosno okno za inicialke (razen če pač nisi prišel na top listo) in zatem v callbacku še vse ostalo
    labelHighScoresInitials.classList.remove('hidden');
    inputInitials.focus();
    formInitials.addEventListener('submit', initialsFormSubmitted);
    document.addEventListener('keyup', initialsFormEscaped);    // zelo pomembno: tale je na keyup, ker je en drugi event listener tudi vezan ..
    //.. na pritisk tipke exc ( document.addEventListener('keydown', btnResetHighScoresEscaped) ), ampak ta tukaj mora imet prednost; če bi bila obadva na keydown, bi se zgodila oba, tako pa tisti, ki čaka,..
    //.. da se najprej konča ta, na keydown še ni izpolnjen, ker se ta izpolni šele na keyup
    //.. za naredit: lahko pa bi seveda tudi zamenjal logiko (da esc najprej zapre oni drugi meni, šele nato tega)
}

function loadHighScores() {     // naloži iz localStorage
    highScores = JSON.parse(localStorage.getItem('highScores'));
    if (highScores === null) {
        highScores = new Array();
    }
    displayHighScores();    // kliče displayHighScores tudi če niso bili uspešno naloadani, ker je v display... varovalka za tak primer
}

function btnResetHighScoresOperation() {

    function btnResetHighScoresEscaped(e) {
        if (e.key === 'Escape' && labelHighScoresInitials.classList.contains('hidden')) {
            btnResetHighScores.blur();
            frameResetHighScores.classList.add('hidden');
            document.removeEventListener('keydown', btnResetHighScoresEscaped);
        }
    }

    document.addEventListener('keydown', btnResetHighScoresEscaped);

    if (isAGameRunning === false) {
        frameResetHighScores.classList.remove('hidden');
        btnConfirmResetHscores.addEventListener('click', function () {
            frameResetHighScores.classList.add('hidden');
            localStorage.removeItem('highScores');
            loadHighScores();
            displayHighScores();
        })
        btnCancelResetHscores.addEventListener('click', function () {
            frameResetHighScores.classList.add('hidden');
        })
    } else if (!btnResetHighScoresPressedHuh) {
        btnResetHighScoresPressedHuh = true;
        btnResetHighScores.blur();
        labelNotNow.classList.remove('hidden');
        setTimeout(() => labelNotNow.classList.add('hidden'), 1200);
        if (isGamePaused) {
            labelEyesOnTheGame.innerHTML = (pageLang === 'sl') ?
                '<p>&nbsp;&nbsp;Šele po Game Over&nbsp;&nbsp;</p>' : '<p>&nbsp;&nbsp;Wait till Game Over&nbsp;&nbsp;</p>';
        }
        setTimeout(() => labelEyesOnTheGame.classList.remove('hidden'), 1200);
        setTimeout(() => {
            if (isGamePaused) {  // vrnit nazaj izvirno besedilo za naslednjo rabo, ki morda ne bo med pavzo
                labelEyesOnTheGame.innerHTML = (pageLang === 'sl') ?
                    '<p>&nbsp;&nbsp;Rajši glej igro!&nbsp;&nbsp;</p>' : '<p>&nbsp;&nbsp;Keep your eyes on the game!&nbsp;&nbsp;</p>';
            }
            labelEyesOnTheGame.classList.add('hidden');
            btnResetHighScoresPressedHuh = false;
        }, 2600);
    };
}


//      - - - - - -    LISTENERJI

btnResetHighScores.addEventListener('click', btnResetHighScoresOperation);
