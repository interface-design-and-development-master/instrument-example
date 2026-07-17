//////////
///// Find the elements I need
//////////
// we can find all the active keys on our page by searching for both white keys and black
// keys using their class and the adding (concatenating) them into a single list (array)
const whiteKeys = document.getElementsByClassName("whiteKey");
const blackKeys = document.getElementsByClassName("blackKey");
const allKeys = Array.from(whiteKeys).concat(Array.from(blackKeys));

//////////
///// Onscreen keyboard
//////////
// we can then run a forEach loop on every key, adding the appropriate eventListeners
allKeys.forEach(key => {
   // runs when button held down over key
   key.addEventListener("mousedown", (e) => {
       // finds the data-note attribute for the key specified in the HTML
       // e.target here represents the specific key pressed
       let note = e.target.dataset.note;
       // finds the data-octave attribute for the key specified in the HTML
       // because this information is stored on the key's grandparent, we look for
       // e.target.parentElement.parentElement : if e.target is the key,
       // e.target.parentElement is the whiteKeyContainer or blackKeyContainer, so
       // e.target.parentElement.parentElement is the octaveContainer
       let octave = e.target.parentElement.parentElement.dataset.octave;
       // now that we know the appropriate note an octave we can use it to trigger the
       // attack on our synth
       synth.triggerAttack(note+octave);
       // finally we add some visual feedback by adding the class "activeKey"
       e.target.classList.add("activeKey");
   });
   // runs when button lifted over key
   key.addEventListener("mouseup", (e) => {
       // runs much the same as above, but in reverse : it uses triggerRelease() and
       // .classList.remove() instead
       let note = e.target.dataset.note;
       let octave = e.target.parentElement.parentElement.dataset.octave;
       synth.triggerRelease(note+octave);
       e.target.classList.remove("activeKey");
   });
   // runs once when cursor enters hovers over key
   // we need to account for moving between keys with mouse button held down
   key.addEventListener("mouseenter", (e) => {
       // e.buttons will tell us which mouse button is currently active : a result of
       // 1 means the left mouse button, so if that is found we quit the function using
       // the return keyword
       if(e.buttons !== 1) { return }
       let note = e.target.dataset.note;
       let octave = e.target.parentElement.parentElement.dataset.octave;
       synth.triggerAttack(note+octave);
       e.target.classList.add("activeKey");
   });
   // runs once when cursor leaves hover over key
   // we don't need to worry about held buttons here, it's pretty much the same as the
   // mouseup function
   key.addEventListener("mouseleave", (e) => {
       let note = e.target.dataset.note;
       let octave = e.target.parentElement.parentElement.dataset.octave;
       synth.triggerRelease(note+octave);
       e.target.classList.remove("activeKey");
   });
});

//////////
///// Computer keyboard
//////////
// we can do something similar to the above to trigger notes based on pressing our computer keyboard
// as there is no element to hold the note value we instead need to associate a particular key with a note
// as we're using the letter pressed, this input is case-sensitive (shift+a won't equal c3)
// we're also storing the note and octave separately so we can use them to find the appropriate on-screen key to add
// feedback to
// https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
// also note this only handles australian keyboard layouts, international layouts may vary
const keyCodeToNote = {
    a: {
        note: "c",
        octave: "3"
    },
    w: {
        note: "c#",
        octave: "3"
    },
    s: {
        note: "d",
        octave: "3"
    },
    e: {
        note: "d#",
        octave: "3"
    },
    d: {
        note: "e",
        octave: "3"
    },
    f: {
        note: "f",
        octave: "3"
    },
    t: {
        note: "f#",
        octave: "3"
    },
    g: {
        note: "g",
        octave: "3"
    },
    y: {
        note: "g#",
        octave: "3"
    },
    h: {
        note: "a",
        octave: "3"
    },
    u: {
        note: "a#",
        octave: "3"
    },
    j: {
        note: "b",
        octave: "3"
    },
    k: {
        note: "c",
        octave: "4"
    },
    o: {
        note: "c#",
        octave: "4"
    },
    l: {
        note: "d",
        octave: "4"
    },
    p: {
        note: "d#",
        octave: "4"
    },
}

// we're encapsulating these eventListeners in a function, so they're only added when toneInit is called from main.js
// be careful when referencing across multiple JS files like this, the order in which they're declared in your HTML
// will change which functions can see each other
function keyboardControlInit(){
    // again there's no element associated with the event, so the listener is added to the window
    // much like above, we distinguish down and up events with note on and off
    window.addEventListener("keydown", (e) => {
        // first check if this is a repeat event : stops multiple notes being triggered from one press
        if (e.repeat) return;
        // find the appropriate note+octave based on the key pressed
        let note = keyCodeToNote[e.key].note;
        let octave = keyCodeToNote[e.key].octave;
        // because we haven't mapped all the keys, we only want to pass a valid result
        // if the code doesn't exist in keyCodeToNote noteOctave will equal undefined, so we can filter using an if conditional
        if(note){
            synth.triggerAttack(note+octave);
        }
        // finally we want to add visual feedback to the onscreen keyboard
        // we need to find the appropriate key so we loop through and find if the associated note matches
        allKeys.forEach((key) => {
            if(key.dataset.note === note){
                // once we have the associated key we need to check it's the right octave
                // it's the grandparent of the key element that holds the octave data
                if(key.parentElement.parentElement.dataset.octave === octave){
                    // if that all matches we can add our feedback class
                    key.classList.add("activeKey");
                    // then we return to stop looking at other keys if we have the right one
                    return;
                }
            }
        });
    });
    // then on up we trigger the note release
    window.addEventListener("keyup", (e) => {
        // find the appropriate note+octave based on the code
        let note = keyCodeToNote[e.key].note;
        let octave = keyCodeToNote[e.key].octave;
        // because we haven't mapped all the keys, we only want to pass a valid result
        // if the key doesn't exist in keyCodeToNote note will equal undefined, so we can filter using an if conditional
        if(note){
            synth.triggerRelease(note+octave);
        }
        // we need to remove our feedback class too, see the above comments explaining how this works
        allKeys.forEach((key) => {
            if(key.dataset.note === note){
                if(key.parentElement.parentElement.dataset.octave === octave){
                    key.classList.remove("activeKey");
                    return;
                }
            }
        });
    });
}
