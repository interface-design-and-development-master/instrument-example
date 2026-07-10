const volumeSlider = document.getElementById("volume-slider");
// find all the waveform select radio inputs and make them into an array
const waveformInputs = Array.from(document.getElementsByClassName("waveformSelect"));

const synth = new Tone.PolySynth(Tone.Synth).toDestination();

const defaultPreset = {
    volume: 0,
    oscType: "square"
}

// update synth values and UI to reflect default presets
changeVolume(defaultPreset.volume);
volumeSlider.value = defaultPreset.volume;
changeOscillatorType(defaultPreset.oscType);
document.getElementById(`${defaultPreset.oscType}-select`).checked = true;

function changeVolume(newVolume){
    // then we set the volume of the synth based on this : this is a Tone.js specific method, run on the synth
    // polySynth which is defined within toneSetup.js
    synth.set({volume: newVolume});
}

/* then we add an eventlister that triggers our function to the appropriate input */
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