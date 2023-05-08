let hasFlippedCard = false;
let lockBoard = false;
let firstClick = true;
let gamerName = 'аноним';

let pairCounter,
    countStorage,
    periodGame,
    startTime,
    finishTime,
    firstCard,
    secondCard;

temporaryObj = JSON.parse(localStorage.getItem('myCount'));
countStorage = temporaryObj ? temporaryObj.count : 0;

listPast =  getList('past');
listWin = getList('win');

outputAllPastWin();

const cards = document.querySelectorAll('.memory-card');
const gameOver = document.querySelector('.game-over');
const resultTime = document.querySelector('.result-time');
const inputName = document.querySelector('.input-name');
const inputBtn = document.querySelector('.input-button');
const resetBtn = document.querySelector('.reset-btn');
const choiceAnimals = document.querySelector('.animals-theme');
const choicePirates = document.querySelector('.pirates-theme');

choiceTheme ();

resetBtn.addEventListener('click', resetStatictics);
choiceAnimals.addEventListener('change', choiceTheme);
choicePirates.addEventListener('change', choiceTheme);

cards.forEach(card => card.addEventListener('click', flipCard));

function flipCard () {
    
    if (lockBoard) return;
    if (this === firstCard) return;
    if (firstClick) {
        startTime = Date.now();
        firstClick = false;
    }

    this.classList.add('flip');
    
    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        return;
    }
    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    let isMatch = firstCard.dataset.image === secondCard.dataset.image;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    resetBoard();
    pairCounter++;
    if (pairCounter === 6) finishGame();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    resetBoard();
    }, 1000);//временная задержка для просмотра перевернутых карточек (1сек)
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

(function shuffle() {
    cards.forEach(card => {
        let ramdomPos = Math.floor(Math.random() * 12);
        card.style.order = ramdomPos;
        pairCounter = 0;
    });
})();

function finishGame () {
    finishTime = Date.now();
    periodGame = +((finishTime - startTime) / 1000).toFixed(1);
    resultTime.innerHTML = ` ${timeFormating(periodGame, 'мин', 'сек')}`;
    lockBoard = true;
    gameOver.classList.add('down');
    queryName();
}

function timeFormating(period, min, sec) {
    let result;
    const minutes = Math.trunc(period / 60);
    const seconds = +(period - minutes * 60).toFixed(1);
    if (minutes > 0) result = ` ${minutes} ${min}.  ${seconds} ${sec}.`;
    else result = ` ${seconds} ${sec}.`;
    return result;
}

function queryName () {
    inputName.focus();
    inputName.addEventListener('keydown', isEnter);
    inputName.addEventListener('keydown', isEsc);
    inputBtn.addEventListener('click', getName);
}

function getName () {
    if (inputName.value) gamerName = inputName.value;
    
    inputName.removeEventListener('keydown', isEnter);
    inputName.removeEventListener('keydown', isEsc);
    inputBtn.removeEventListener('click', getName);
    inputName.value = '';
    gameOver.classList.remove('down')
    putStorage(gamerName, periodGame);
    restartGame();
}

function isEnter (event) {
    if (event.keyCode === 13) {
        getName();
    }    
}

function isEsc (event) {
    if (event.keyCode === 27) {
        getName();
    }
}

function restartGame () {
    cards.forEach(card => {
        card.classList.remove('flip');
        card.addEventListener('click', flipCard);
    });
    cards.forEach(card => {
        let ramdomPos = Math.floor(Math.random() * 12);
        card.style.order = ramdomPos;
        pairCounter = 0;
    });
    resetBoard();
    firstClick = true;
}

function putStorage (name, time) {
    let serialObj,
        countObj,
        listObj,
        tempObj;

    switch (true) {
        case (countStorage === 0) : {
            listPast[countStorage] = [name, time];
            listWin[countStorage] = [name, time];

        } break;
        case (countStorage > 0 && countStorage < 10) : {
            listPast[countStorage] = [name, time];
            listWin[countStorage] = [name, time];
            listWin.sort((a, b) => a[1] - b[1]);
        }  break;
        default : {
            listPast = listPast.splice(1);
            listPast[countStorage - 1] = [name, time];
            listWin[countStorage] = [name, time];
            listWin.sort((a, b) => a[1] - b[1]);
            listWin.splice(countStorage);
            countStorage--;
        }
    }

    gamerName = 'аноним';

    for (let i = 0; i <= countStorage; i++) {

        let element = "";
        let namePast = `${listPast[i][0]}`;
        let timePast = listPast[i][1];
        let nameWin = `${listWin[i][0]}`;
        let timeWin = listWin[i][1];

        element = document.querySelector(`.name-past[data-list="${i}"]`);
        element.innerHTML = `${namePast}`;
        element = document.querySelector(`.time-past[data-list="${i}"]`);
        element.innerHTML =  timeFormating(timePast, 'м', 'c');

        element = document.querySelector(`.name-win[data-list="${i}"]`);
        element.innerHTML = `${nameWin}`;
        element = document.querySelector(`.time-win[data-list="${i}"]`);
        element.innerHTML =  timeFormating(timeWin, 'м', 'c');
        
        listObj = {
            past : {name: namePast, time: timePast},
            win : {name: nameWin, time: timeWin}
        }            

      serialObj = JSON.stringify(listObj); //сериализуем его
      localStorage.setItem(`${i}`, serialObj); //запишем его в хранилище по ключу в переменной "i"
    }

    countStorage++;
    countObj = { count: countStorage }
    tempObj = JSON.stringify(countObj);
    localStorage.setItem("myCount", tempObj);
}

function getList(key) {
    let array = [];
    let tempObj;
    if (countStorage === 0) {
        tempObj = JSON.parse(localStorage.getItem('0'));
        array[0] = tempObj ? [tempObj[key].name, tempObj[key].time] : [];
    } else {
        for (let i = 0; i < countStorage; i++) {
            tempObj = JSON.parse(localStorage.getItem(`${i}`));
            array[i] = [tempObj[key].name, tempObj[key].time];
        }
    }
    return array;
}

function outputAllPastWin () {
    for (let i = 0; i < countStorage; i++) {
        outputOnePastWin(i);
    }
};

function outputOnePastWin (i) {
    let element = '';
        let namePast = `${listPast[i][0]}`;
        let timePast = listPast[i][1];
        let nameWin = `${listWin[i][0]}`;
        let timeWin = listWin[i][1];

        element = document.querySelector(`.name-past[data-list="${i}"]`);
        element.innerHTML = `${namePast}`;
        element = document.querySelector(`.time-past[data-list="${i}"]`);
        element.innerHTML =  timeFormating(timePast, 'м', 'c');

        element = document.querySelector(`.name-win[data-list="${i}"]`);
        element.innerHTML = `${nameWin}`;
        element = document.querySelector(`.time-win[data-list="${i}"]`);
        element.innerHTML =  timeFormating(timeWin, 'м', 'c');
}

function resetStatictics () {
    let element = '';
    for (let i = 0; i < 10; i++) {
        element = document.querySelector(`.name-past[data-list="${i}"]`);
        element.innerHTML = '----';
        element = document.querySelector(`.time-past[data-list="${i}"]`);
        element.innerHTML =  '----';

        element = document.querySelector(`.name-win[data-list="${i}"]`);
        element.innerHTML = '----';
        element = document.querySelector(`.time-win[data-list="${i}"]`);
        element.innerHTML =  '----';

        localStorage.removeItem(`${i}`);
    }
    localStorage.removeItem('myCount');
    countStorage = 0;
    listPast = [];
    listWin = [];
}

function choiceTheme () {
    let element;
    const theme = choiceAnimals.checked ? 'animals' : 'pirates';
    for (let i = 1; i < 13; i++) {
        element = document.querySelector(`.memory-card[data-theme="${i}"]`);
        element.innerHTML = `<img class="front-face" src="./assets/img/${theme}/${i}.png" alt="image ${i}">
                            <img class="back-face" src="./assets/img/${theme}/0.png" alt="image 0">`;
    }
    element = document.querySelector('.audio');
    element.src = `./assets/img/${theme}/track.mp3`;
    element.volume=0.25;
    element.play();
}

console.log('1. Вёрстка +10');
console.log('   -реализован интерфейс игры +5');
console.log('   -в футере ссылка на гитхаб автора, год создания, логотип курса со ссылкой +5');
console.log('2. Логика игры. Карточки, по которым кликнули, переворачиваются согласно правилам игры +10');
console.log('3. Игра завершается, когда открыты все карточки +10');
console.log('4. По окончанию игры выводится её результат - количество ходов, которые понадобились для завершения игры +10');
console.log('!!! данный пункт (4) усложнил, вместо кол-ва ходов подсчитываю затраченное время (что бы не было сооблазна записать, где какая карточка лежит))');
console.log('5. Результаты последних 10 игр сохраняются в local storage. Есть таблица рекордов, в которой сохраняются результаты предыдущих 10 игр +10');
console.log('6. По клику на карточку – она переворачивается плавно, если пара не совпадает – обе карточки так же плавно переварачиваются рубашкой вверх +10');
console.log('7. Очень высокое качество оформления приложения и/или дополнительный не предусмотренный в задании функционал, улучшающий качество приложения +10');
console.log('   -высокое качество оформления приложения предполагает собственное оригинальное оформление равное или отличающееся в лучшую сторону по сравнению с демо');
console.log('!!! по п.7 добавил сброс статистики, смену темы карточек и аудиоплеер, который меняет трек при смене темы. Автозатпуск плеера(стр. 290) браузеры блокируют считая это навязчивой рекламой.');
console.log('');
console.log('Считаю задание полностью выполнено, оцениваю свою работу на 60 баллов. ');