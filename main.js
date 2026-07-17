//////////
///// Synth settings to load into synth and UI on page load
//////////
const defaultPreset = {
    volume: 0,
    oscType: "square",
    attack: 0.01,
    decay: 0.1,
    sustain: 0.3,
    release: 1,
    filterType: "lowpass",
    filterFreq: 18000,
    filterQ: 1
};

//////////
///// Find the elements I need
//////////
// dialog elements
const introDialog = document.getElementById("intro-dialog");
const introDialogCloseButton = document.getElementById("intro-dialog-close-button");
const infoButton = document.getElementById("info-button");
const infoDialog = document.getElementById("info-dialog");
const infoDialogCloseButton = document.getElementById("info-dialog-close-button");
// input elements
const volumeSlider = document.getElementById("volume-slider");
// find all the waveform select radio inputs and make them into an array
const waveformInputs = Array.from(document.getElementsByClassName("waveformSelect"));
const filterTypesSelect = document.getElementById("filter-types-select");
const filterFreqSlider = document.getElementById("filter-freq-slider");
const filterQSlider = document.getElementById("filter-q-slider");
// find all the envelope range inputs and make them into an array
const envelopeInputs = Array.from(document.getElementsByClassName("envelopeSlider"));
// feedback elements
const volumeFeedback = document.getElementById("volume-feedback");
const adsrLine = document.getElementById("adsr-line");

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
    // run the keyboard control init : see keyboardController.js
    keyboardControlInit();
}
// update the settings from the preset
// while we only have the default at the moment, we'll write it as a function so alternate presets could be implemented
function loadPreset(preset){
    // each setting should update both tone and UI
    // the tone setting functions are included in a section below
    changeVolume(preset.volume);
    volumeSlider.value = preset.volume;
    changeOscillatorType(preset.oscType);
    // work out which box to check based on setting
    document.getElementById(`${preset.oscType}-select`).checked = true;
    filterTypesSelect.value = preset.filterType;
    changeFilterType(preset.filterType);
    filterFreqSlider.value = preset.filterFreq;
    filterFreqSlider.nextElementSibling.textContent = parseInt(preset.filterFreq);
    changeFilterFreq(preset.filterFreq);
    filterQSlider.value = preset.filterQ;
    filterQSlider.nextElementSibling.textContent = parseFloat(preset.filterQ).toFixed(2);
    changeFilterQ(preset.filterQ);
    // because the envelope inputs are stored in an array we need to loop through them
    envelopeInputs.forEach((input) => {
        // each envelope has their "type" stored as a data-attribute in HTML, so we can use that to retrieve the correct
        // preset value
        input.value = preset[input.dataset.env];
        // for consistency, we also want to make sure the value of the envelope inputs is always to 2 decimal places,
        // which means using the toFixed method on a float
        input.nextElementSibling.textContent = parseFloat(preset[input.dataset.env]).toFixed(2);
    });
    // then we have to update the adsr feedback line : see full function below for more details
    plotADSR();
}
// we can then run our function on page load and pass it our default preset
loadPreset(defaultPreset);

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

//////////
///// Input Setup
//////////
// here we're defining each value change as a separate function so it can be used when loading presets
// then we're attaching that function to the relevant HTML input via event listeners
// I thought about putting validation in here too, but maybe not needed if the inputs are set up properly
function changeVolume(newVolume){
    // note that when changing a value on a tone element we usually have to use the set method and pass it an object like
    // below. in rare cases we are instead able to set the value using JS operators, see the changeFilterFreq function for
    // an example of this
    synth.set({
        volume: newVolume
    });
}
// note that while we might pass the function directly using the addEventListener, such as the commented line below:
// volumeSlider.addEventListener("input", changeVolume);
// we are instead using an anonymous function to retrieve the value from the event we've called e, and then passing it
// to the appropriate function. this is because functions like changeVolume also need to work in the context of loading
// presets, so they won't always have an associated event
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

function changeOscillatorType(newOscType){
    synth.set({
        oscillator : { type: newOscType }
    });
}
// as we've stored the waveform checkboxes in an array we can just loop through and add an eventlistener to each in turn
waveformInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
        changeOscillatorType(e.target.value);
    });
});

function changeFilterType(newFilterType){
    filter.set({
        type: newFilterType
    });
}
filterTypesSelect.addEventListener("input", (e) => {
    changeFilterType(e.target.value);
});

function changeFilterFreq(newFilterFreq){
    filter.frequency.value = newFilterFreq;
}
filterFreqSlider.addEventListener("input", (e) => {
    changeFilterFreq(e.target.value);
    e.target.nextElementSibling.textContent = parseInt(e.target.value);
})

function changeFilterQ(newFilterQ){
    filter.Q.value = newFilterQ;
}
filterQSlider.addEventListener("input", (e) => {
    changeFilterQ(e.target.value);
    e.target.nextElementSibling.textContent = parseFloat(e.target.value).toFixed(2);
});

// like the waveform inputs we're looping through the array of envelope inputs and adding an event listerner to each
envelopeInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
        // here we're using the data-attribute stored in the HTML input to set the appropriate value
        synth.set({
            envelope: {
                [input.dataset.env]: e.target.value
            }
        });
        // we also need to make sure the value of the envelope inputs is always to 2 decimal places, see above for more details
        input.nextElementSibling.textContent = parseFloat(e.target.value).toFixed(2);
        // finally we need to trigger an update to the adsr feedback line
        plotADSR();
    });
});

//////////
///// Feedback
//////////
// this will update the adsr envelope line whenever one of the values is updated
function plotADSR(){
    // we need to store all the current values together
    let envValues = {};
    // we also need to work out the envelopes total time to apply the appropriate width
    let totalTime = 0;
    // loop through inputs and update the above variables
    envelopeInputs.forEach((input) =>{
        // as sustain's value does not represent a time, only add the other values to the totalTime
        if(input.dataset.env !== "sustain"){
            totalTime += parseFloat(input.value);
        }
        // add to object using their type as the key
        envValues[`${input.dataset.env}`] = input.value;
    });
    //sustain is a percentage of volume not a time measurement, so we'll instead make it a quarter of the length
    let sustainQuarter = totalTime / 3;
    // then add it on to the totalTime
    totalTime += sustainQuarter;
    // then work out width as percentages (canvas is 100 units wide)
    let attackLength = envValues.attack / totalTime * 100;
    // decayLength starts where attackLength stops, so we also need to add it on
    let decayLength = attackLength + (envValues.decay / totalTime * 100);
    let sustainLength = decayLength + (sustainQuarter / totalTime * 100);
    // if we actually set height to 0, the width of line means not total is shown, so we only give it a range of 23 instead
    // of 25. this is only a rough visual feedback guide, so exact precision isn't so important
    let sustainHeight = 25 - (envValues.sustain * 23);
    // then we plot points based on this
    // see here for more details about how this works
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/polyline
    let pointsList = `0,25
                      ${attackLength},3
                      ${decayLength},${sustainHeight}
                      ${sustainLength},${sustainHeight}
                      ${100},25`;
    adsrLine.setAttribute("points", pointsList);
}

// this will update the volume "light" object based on the output volume
// it's a pretty simple implementation of requestAnimationFrame, see here for more details about how it works
// https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
// stores whether metering should run : currently always set to true, but could be interacted with if you wanted
let meterRunning = true;
// this will store the volume output, which currently is expected to be between 0 and 1 (although is sometimes a little out
// of that range)
let meterValue;

function meterVolume() {
    meterValue = meter.getValue();
    // see the changeVolume function above for a more detailed explanation, but basically making close to 0 equal 0
    if(meterValue < 0.001){
        meterValue = 0;
    }
    // update our css using the color-mix function, which takes a percentage, so we just multiply our value by 100
    // https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/color-mix
    volumeFeedback.style.backgroundColor = `color-mix(in hsl, var(--col06) ${meterValue*100}%, var(--col04))`;
    // continue the loop
    if(meterRunning){
        requestAnimationFrame(meterVolume);
    }
}
// start the loop on page load
requestAnimationFrame(meterVolume);
