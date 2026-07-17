//////////
///// Find the elements I need
//////////
const introDialog = document.getElementById("intro-dialog");
const introDialogCloseButton = document.getElementById("intro-dialog-close-button");
const infoButton = document.getElementById("info-button");
const infoDialog = document.getElementById("info-dialog");
const infoDialogCloseButton = document.getElementById("info-dialog-close-button");

const myCanvas = document.getElementById("adsr-svg-canvas");
const adsrLine = document.getElementById("adsr-line");

const volumeSlider = document.getElementById("volume-slider");
// find all the waveform select radio inputs and make them into an array
const waveformInputs = Array.from(document.getElementsByClassName("waveformSelect"));
const envelopeInputs = Array.from(document.getElementsByClassName("envelopeSlider"));
const filterFreqSlider = document.getElementById("filter-freq-slider");
const filterQSlider = document.getElementById("filter-q-slider");
const filterTypesSelect = document.getElementById("filter-types-select");
const volumeFeedback = document.getElementById("volume-feedback");

//////////
///// Initialise Tone instrument and effects
//////////
const synth = new Tone.PolySynth(Tone.Synth);
const filter = new Tone.Filter(0, "lowpass");
const meter = new Tone.Meter();
// change the metered volume range to be between 0 and 1
meter.normalRange = true;
//meter.smoothing = 0.1;
// connect the parts together then send to audio output
// function only runs once user has closed the intro dialog
function toneInit(){
    synth.chain(filter, meter, Tone.Destination);
}

//////////
///// Dialog Setup
//////////
// show intro modal on page load
introDialog.showModal();
// close dialog with button
introDialogCloseButton.addEventListener("click", () => {
    introDialog.close();
});
// run the tone setup only after user action
// using the close event, just in case user closes modal in other way than button
introDialog.addEventListener("close", toneInit);
// show info modal on button press
infoButton.addEventListener("click", () => { infoDialog.showModal() });
// close dialog with button
infoDialogCloseButton.addEventListener("click", () => {
    infoDialog.close();
});









const defaultPreset = {
    volume: 0,
    oscType: "square",
    attack: 0.01,
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
    input.nextElementSibling.textContent = parseFloat(defaultPreset[input.dataset.env]).toFixed(2);
    input.addEventListener("input", (e) => {
        // here we're using the stored data attribute to set the appropriate value
        synth.set({
            envelope: {
                [input.dataset.env]: e.target.value
            }
        });
        input.nextElementSibling.textContent = parseFloat(e.target.value).toFixed(2);
        plotADSR();
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

function plotADSR(){
    // first find env values and add up envelope time
    let envValues = {};
    let totalTime = 0;
    envelopeInputs.forEach((input) =>{
        if(input.dataset.env !== "sustain"){
            totalTime += parseFloat(input.value);
        }
        envValues[`${input.dataset.env}`] = input.value;
    });
    //sustain is a percentage of volume not a time measurement, so we'll instead make it a quarter of the length
    let sustainQuarter = totalTime / 3;
    totalTime += sustainQuarter;
    // then work out percentages (canvas is 100 units wide)
    // they keep adding on each other so need to factor that in
    let attackLength = envValues.attack / totalTime * 100;
    let decayLength = attackLength + (envValues.decay / totalTime * 100);
    // we know sustain is set to 1 sec by default, so we also need to work out height
    let sustainLength = decayLength + (sustainQuarter / totalTime * 100);
    let sustainHeight = 25 - (envValues.sustain * 25);
    // then we plot points based on this
    let pointsList = `0,25
                      ${attackLength},3
                      ${decayLength},${sustainHeight}
                      ${sustainLength},${sustainHeight}
                      ${100},25`;
    adsrLine.setAttribute("points", pointsList);
}
plotADSR();


/// metering
let meterRunning = true;
let meterValue;

function meterVolume() {
    meterValue = meter.getValue();
    if(meterValue < 0.001){
        meterValue = 0;
    }
    volumeFeedback.style.backgroundColor = `color-mix(in hsl, var(--col06) ${meterValue*100}%, var(--col04))`;
    if(meterRunning){
        requestAnimationFrame(meterVolume);
    }
}
requestAnimationFrame(meterVolume);
