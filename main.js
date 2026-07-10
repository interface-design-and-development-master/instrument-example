
const introDialog = document.getElementById("intro-dialog");
const dialogCloseButton = document.getElementById("dialog-close-button");
const volumeSlider = document.getElementById("volume-slider");
// find all the waveform select radio inputs and make them into an array
const waveformInputs = Array.from(document.getElementsByClassName("waveformSelect"));
const envelopeInputs = Array.from(document.getElementsByClassName("envelopeSlider"));
const filterFreqSlider = document.getElementById("filter-freq-slider");
const filterQSlider = document.getElementById("filter-q-slider");
const filterTypesSelect = document.getElementById("filter-types-select");

const synth = new Tone.PolySynth(Tone.Synth);
let filter = new Tone.Filter(0, "lowpass");

//// DIALOG INIT
// show modal on page load
introDialog.showModal();

dialogCloseButton.addEventListener("click", () => {
    introDialog.close();
});

introDialog.addEventListener("close", toneInit);

function toneInit(){
    synth.chain(filter, Tone.Destination);
}

const defaultPreset = {
    volume: 0,
    oscType: "square",
    attack: 0.005,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
    filterType: "highpass",
    filterFreq: 18000,
    filterQ: 1
}

// update synth values and UI to reflect default presets
changeVolume(defaultPreset.volume);
volumeSlider.value = defaultPreset.volume;
changeOscillatorType(defaultPreset.oscType);
document.getElementById(`${defaultPreset.oscType}-select`).checked = true;
filterFreqSlider.value = defaultPreset.filterFreq;
changeFilterFreq(defaultPreset.filterFreq);

function changeVolume(newVolume){
    // then we set the volume of the synth based on this : this is a Tone.js specific method, run on the synth
    // polySynth which is defined within toneSetup.js
    synth.set({volume: newVolume});
}

/* then we add an eventlistener that triggers our function to the appropriate input */
volumeSlider.addEventListener("input", (e) => {
    // volume decibels are a bit tricky because they have a logarithmic relationship to loudness
    // see here for a breakdown: https://www.outeraudio.com/understanding-loudness/

    // to actually mute our synth we detect when it is at the bottom of the slider range and then set the volume to -128
    if(e.target.value === volumeSlider.min){
        changeVolume(-128);
    } else {
        changeVolume(e.target.value);
    }

});


// loop through each radio input and add an eventlistener
waveformInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
        // set the oscillator type to the input value
        changeOscillatorType(e.target.value);
    });
});

function changeOscillatorType(newOscType){
    synth.set({
        oscillator : { type: newOscType }
    });
}

// loop through each input and add eventlistener
envelopeInputs.forEach((input) => {
    // we're looping anyway so get the default value in there
    input.value = defaultPreset[input.dataset.env];
    input.addEventListener("input", (e) => {
        // here we're using the stored data attribute to set the appropriate value
        synth.set({
            envelope: {
                [input.dataset.env]: e.target.value
            }
        })
    });
});

function changeFilterType(newFilterType){

        filter.set({
            type: newFilterType
        });

}

filterTypesSelect.addEventListener("input", (e) => {
    changeFilterType(e.target.value);
})

function changeFilterFreq(newFilterFreq){
    filter.frequency.value = newFilterFreq;
}

filterFreqSlider.addEventListener("input", (e) => {
    changeFilterFreq(e.target.value);
})

function changeFilterQ(newFilterQ){
    /* check to see if parameter within expected range */
    if ( newFilterQ >= 0 && newFilterQ < 20){
        filter.Q.value = newFilterQ;
    }
}

filterQSlider.addEventListener("input", (e) => {
   changeFilterQ(e.target.value)
});