// Declare button to save the homepage
const saveButton = document.getElementById('save-button');
// Declare the input field for the homepage
const homepage = document.getElementById('homepage');
// Declare the input field for the button color
const buttonColor = document.getElementById('button-color');

/**
 * Initializes the options page
 */
function init() {
  saveButton.addEventListener('click', function () {
    save();
  });
  chrome.storage.sync.get(['homepage'], function (result) {
    homepage.value = result.homepage;
  });
  chrome.storage.sync.get(['buttonColor'], function (result) {
    buttonColor.value = result.buttonColor
  });
}

/**
 * Saves a new homepage to the chrome storage.
 */
function save() {
  chrome.storage.sync.set({ homepage: homepage.value }, function () {
    console.log('Hompage is ' + homepage.value);
  });
  chrome.storage.sync.set({ buttonColor: buttonColor.value }, function () {
    console.log('Button color is ' + buttonColor.value);
  })
}

// Perform init
init();
