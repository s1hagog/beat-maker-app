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
        this.trackSelect = document.querySelector('.available-tracks');
        this.muteBtns = document.querySelectorAll('.mute');
        this.tempoSlider = document.querySelector('.tempo-slider');
        this.saveButton = document.querySelector('.save-track');
        this.saveTrackButton = document.querySelector('.save-name');
        this.loadButton = document.querySelector('.load-track');
        this.deleteButton = document.querySelector('.delete-track');
        this.trackNameInput = document.querySelector('.track-name');
        this.activePadsNumber = 0;
        this.myTracks = localStorage.getItem('myTracks')
            ? JSON.parse(localStorage.getItem('myTracks'))
            : [];
        this.saveTrackInputs = document.querySelector('.save-track-inputs');
        this.loadTracks();

        this.trackSelect.selectedIndex = -1;
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
                this.saveTrackInputs.classList.add('hidden');
            }
        }
    }

    loadTrackButton(e) {
        //Clear Sequence
        this.clearSequence();

        //Track Value is taken from option tag;
        // const trackValue = this.trackSelect.value;

        //Actually its better to use index, for performance
        //I assume that our tracks in select will be always indexed the same as objects
        //in the main track array
        const trackIndex = this.trackSelect.selectedIndex;

        //get the track
        const track = this.myTracks[trackIndex];

        //Output the track
        track.trackMix.forEach((mix) => {
            this.pads.forEach((innerPad) => {
                if (innerPad.classList.contains(mix[1])) {
                    if (innerPad.classList.contains(mix[2])) {
                        innerPad.classList.add('active');
                        return true;
                    }
                }
            });
        });

        document.querySelector('.tempo-nr').innerText = track.trackBPM;
        this.tempoSlider.value = track.trackBPM;
    }

    showLoadButtons(e) {
        if (
            this.loadButton.classList.contains('hidden') &&
            this.deleteButton.classList.contains('hidden')
        ) {
            this.loadButton.classList.remove('hidden');
            this.deleteButton.classList.remove('hidden');
        }
    }

    clearSequence() {
        this.pads.forEach((pad) => {
            pad.classList.remove('active');
        });
    }

    showSaveTrackInputs() {
        this.saveTrackInputs.classList.remove('hidden');
    }

    saveCurrentMix(e) {
        const trackName = this.trackNameInput.value;

        if (trackName) {
            const allPadsMix = Array.from(document.querySelectorAll('.pad'));

            const currentPadsMix = allPadsMix.filter((el) =>
                el.classList.contains('active')
            );

            //Make classes array
            const currentPadsClassesArray = currentPadsMix.map(
                (pad) => pad.classList
            );

            const trackValue = trackName.replace(/ /g, '_').toLowerCase();

            const currentBPM = this.tempoSlider.value;

            //Another approach
            this.myTracks.push({
                trackValue,
                trackName,
                trackMix: currentPadsClassesArray,
                trackBPM: currentBPM,
            });
            localStorage.setItem('myTracks', JSON.stringify(this.myTracks));

            //Rewrite main tracks array to remove extra value from Node List (weird things are there)
            this.myTracks = JSON.parse(localStorage.getItem('myTracks'));

            //Add name to the selects options;
            const newOption = document.createElement('option');
            newOption.text = trackName;
            newOption.value = trackValue;
            this.trackSelect.add(newOption);
        } else {
            alert('Imput Cannot be empty!');
        }
    }

    deleteCurrentMix(e) {
        //Getting track Value
        const trackValue = this.trackSelect.options[
            this.trackSelect.selectedIndex
        ].value;

        //Changing local storage array
        const oldTracksArray = JSON.parse(localStorage.getItem('myTracks'));
        const newTracksArray = oldTracksArray.filter(
            (el) => el.trackValue != trackValue
        );

        //Rewriting new array to local storage
        localStorage.setItem('myTracks', JSON.stringify(newTracksArray));

        //Rewriting inner array
        this.myTracks = newTracksArray;

        //UI changes
        this.trackSelect.remove(this.trackSelect.selectedIndex);
    }

    loadTracks() {
        const tracksSelect = Array.from(this.selects).filter(
            (el) => el.className === 'available-tracks'
        );

        // Iterate through track data
        this.myTracks.forEach((track) => {
            //Create option element and fill with data
            const option = document.createElement('option');
            option.innerText = track.trackName;
            option.value = track.trackValue;

            //Small hack because our select is array with one element
            tracksSelect[0].add(option);
        });
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
    if (select.className !== 'available-tracks') {
        select.addEventListener('change', function (e) {
            drumKit.changeSound(e);
        });
    }
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
    drumKit.showSaveTrackInputs();
});

//Load Button
drumKit.loadButton.addEventListener('click', function (e) {
    drumKit.loadTrackButton(e);
});
drumKit.trackSelect.addEventListener('change', function (e) {
    drumKit.showLoadButtons(e);
});

//Save Track Name Button
drumKit.saveTrackButton.addEventListener('click', function (e) {
    drumKit.saveCurrentMix(e);
});

//Delete Button
drumKit.deleteButton.addEventListener('click', function (e) {
    drumKit.deleteCurrentMix(e);
});
