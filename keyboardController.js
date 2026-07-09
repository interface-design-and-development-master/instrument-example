
// we can find all the active keys on our page by searching for both white keys and black
// keys using their class and the adding (concatenating) them into a single list (array)
const whiteKeys = document.getElementsByClassName("whiteKey");
const blackKeys = document.getElementsByClassName("blackKey");
const allKeys = Array.from(whiteKeys).concat(Array.from(blackKeys));

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
       synth.triggerRelease();
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
       synth.triggerRelease();
       e.target.classList.remove("activeKey");
   });
});
