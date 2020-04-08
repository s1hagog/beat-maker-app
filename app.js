class DrumkKit {
    constructor() {
        this.pads = document.querySelectorAll('.pad');
        this.kickAudio = document.querySelector('.kick-sound');
        this.snareAudio = document.querySelector('.snare-sound');
        this.hihatAudio = document.querySelector('.hihat-sound');
        this.playBtn = document.querySelector('.play');
        this.currentKick = './sounds/kick-classic.wav';
        this.currentKick = './sounds/snare-acoustic01.wav';
        this.currentKick = './sounds/hihat-acoustic01.wav';
        this.index = 0;
        this.bpm = 120;
        this.isPlaying = null;
        this.selects = document.querySelectorAll('select');
        this.muteBtns = document.querySelectorAll('.mute');
        this.tempoSlider = document.querySelector('.tempo-slider');
        this.saveButton = document.querySelector('.save-track');
        this.loadButton = document.querySelector('.load-track');
        this.activePadsNumber = 0;
        this.myTracks = localStorage.getItem('myTracks') ? JSON.parse(localStorage.getItem('myTracks')) : {};

    }

    repeat() {
        let step = this.index % 8;
        const activeBars = document.querySelectorAll(`.b${step}`);

        //Loop over bars
        activeBars.forEach((bar) => {
            bar.style.animation = `playTrack 0.3s alternate ease-in-out 2`;

            if (bar.classList.contains('active')) {
                //Check each sound
                if (bar.classList.contains(`kick-pad`)) {
                    this.kickAudio.currentTime = 0;
                    this.kickAudio.play();
                }
                if (bar.classList.contains(`snare-pad`)) {
                    this.snareAudio.currentTime = 0;
                    this.snareAudio.play();
                }
                if (bar.classList.contains(`hihat-pad`)) {
                    this.hihatAudio.currentTime = 0;
                    this.hihatAudio.play();
                }
            }
        });
        this.index++;
    }

    start() {
        const interval = (60 / this.bpm) * 1000;

        //Check if its playing
        if (this.isPlaying) {
            clearInterval(this.isPlaying);

            //Just in case of reset
            // this.index = 0;

            this.isPlaying = null;
        } else {
            this.isPlaying = setInterval(() => {
                this.repeat();
            }, interval);
        }
    }

    activePad(e) {
        e.target.classList.toggle('active');
        if (e.target.classList.contains('active')) {
            this.activePadsNumber++;
        } else {
            this.activePadsNumber--;
        }
    }

    updateButton() {
        if (this.isPlaying) {
            this.playBtn.innerText = 'Stop';
            this.playBtn.classList.add('active');
        } else {
            this.playBtn.innerText = 'Play';
            this.playBtn.classList.remove('active');
        }
    }

    showSaveButton() {
        if (!this.saveButton.classList.contains('visible')) {
            this.saveButton.classList.add('visible');
        } else {
            if (this.activePadsNumber === 0) {
                this.saveButton.classList.remove('visible');
            }
        }
    }

    loadTrackButton(e) {
        console.log(JSON.stringify(this.myTracks));
    }

    saveCurrentMix(e) {
        const allPadsMix = Array.from(document.querySelectorAll('.pad'));

        const currentPadsMix = allPadsMix.filter((el) =>
            el.classList.contains('active')
        );

        //Make classes array
        const currentPadsClassesArray = currentPadsMix.map(
            (pad) => pad.classList
        );

        const trackName = 'FirstMix';

        this.myTracks[trackName] = currentPadsClassesArray;

        localStorage.setItem('myTracks', JSON.stringify(this.myTracks));
    }

    changeSound(event) {
        const selectionName = event.target.name;
        const selectionValue = event.target.value;

        switch (selectionName) {
            case 'skick-select':
                this.kickAudio.src = selectionValue;
                break;
            case 'ssnare-select':
                this.snareAudio.src = selectionValue;
                break;
            case 'shihat-select':
                this.hihatAudio.src = selectionValue;
                break;
        }
    }

    changeTempo(event) {
        const tempoText = document.querySelector('.tempo-nr');

        tempoText.innerText = event.target.value;
    }

    updateTempo(event) {
        this.bpm = event.target.value;
        clearInterval(this.isPlaying);
        this.isPlaying = null;

        if (this.playBtn.classList.contains('active')) {
            this.start();
        }
    }

    mute(event) {
        const muteIndex = event.target.getAttribute('data-track');
        event.target.classList.toggle('active');

        if (event.target.classList.contains('active')) {
            console.log(muteIndex);
            switch (muteIndex) {
                case '0':
                    this.kickAudio.volume = 0;
                    break;
                case '1':
                    this.snareAudio.volume = 0;
                    break;
                case '2':
                    this.hihatAudio.volume = 0;
                    break;
            }
        } else {
            switch (muteIndex) {
                case '0':
                    this.kickAudio.volume = 1;
                    break;
                case '1':
                    this.snareAudio.volume = 1;
                    break;
                case '2':
                    this.hihatAudio.volume = 1;
                    break;
            }
        }
    }
}

const drumKit = new DrumkKit();

//Event listeners

drumKit.pads.forEach((pad) => {
    pad.addEventListener('click', function (e) {
        drumKit.activePad(e);
    });
    pad.addEventListener('click', () => {
        drumKit.showSaveButton();
    });
    pad.addEventListener('animationend', function () {
        this.style.animation = '';
    });
});

drumKit.playBtn.addEventListener('click', function () {
    drumKit.start();
    drumKit.updateButton();
});

drumKit.selects.forEach((select) => {
    select.addEventListener('change', function (e) {
        drumKit.changeSound(e);
    });
});

drumKit.muteBtns.forEach((button) => {
    button.addEventListener('click', function (e) {
        drumKit.mute(e);
    });
});

drumKit.tempoSlider.addEventListener('input', function (e) {
    drumKit.changeTempo(e);
});
drumKit.tempoSlider.addEventListener('change', function (e) {
    drumKit.updateTempo(e);
});

//Save Button
drumKit.saveButton.addEventListener('click', function (e) {
    drumKit.saveCurrentMix(e);
});

//Load Button
drumKit.loadButton.addEventListener('click', function (e) {
    drumKit.loadTrackButton(e);
});
