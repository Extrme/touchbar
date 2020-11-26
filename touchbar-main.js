import Hammer from './hammer.min.js';

/**
 * Manages the touchbar and gestures.
 */
export function main() {

    /**
     * Initializes CSS for the touch bar buttons.
     */
    function intiCss() {

        chrome.storage.sync.get(['buttonColor'], function (result) {
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = `.ext-floating-button { 
                margin: 20px 0 0 20px;
                background-color: ${result.buttonColor};
                color: white;
                height: 35px;
                border: none;
                border-radius: 10px;
                z-index: 1000;
                text-align: center;
                -webkit-box-shadow: 0px 3px 7px 1px rgba(5,5,5,0.75);
                -moz-box-shadow: 0px 3px 7px 1px rgba(5,5,5,0.75);
                box-shadow: 0px 3px 7px 1px rgba(5,5,5,0.75);
                z-index: 9999; 
            }
            .ext-floating-div {
                left: 0;
                top: 0;
                width: 100%; 
                min-height: 75px; 
                overflow: auto;
                background-color: rgb(0,0,0); 
                background-color: rgba(0,0,0,0.4); 
                z-index: 9999; 
            }
            .ext-svg-reload {
                background-image: url("images/svgs/autorenew.svg")
            }`;
            document.getElementsByTagName('head')[0].appendChild(style);
        });
    }

    /**
     * Adds the HTML used in the touch bar.
     */
    function initHtml() {
        const touchBar = `<div id="extension-div" class="ext-floating-div"> 
                            <button id="extension-home-btn" class="ext-floating-button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
                            </button>
                            <button id="extension-reload-btn" class="ext-floating-button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/></svg>
                            </button>
                            <button id="extension-fullscreen-btn" class="ext-floating-button">
                                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                            </button>
                            <button id="extension-back-btn" class="ext-floating-button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
                            </button>
                            <button id="extension-forward-btn" class="ext-floating-button">
                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
                            </button>
                        </div>`;
        body.insertAdjacentHTML('afterbegin', touchBar);
    }

    /**
     * Sends message to background.js
     */
    function sendMessage(action) {
        chrome.runtime.sendMessage({ action: action }, function (response) {
            errorHandling(response.msg);
        });
    }

    /**
    * Simple error handling.
    * 
    * @param {*} message the message to be logged if its an error.
    */
    function errorHandling(message) {
        if (message.startsWith("Error")) {
            console.error(message);
        }
    }

    // Init CSS
    intiCss();

    // Select the body element.
    const body = document.querySelector('body');

    // Enables text selection
    delete Hammer.defaults.cssProps.userSelect;

    // Instantiate the Hammer manager.
    let hammerTime = new Hammer.Manager(body, {
        touchAction: 'auto',
        inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput,
        recognizers: [
            [Hammer.Swipe, {
                direction: Hammer.DIRECTION_ALL
            }],
            [Hammer.Tap,
            { event: 'doubletap', taps: 2 }
            ]
        ]
    });

    // If the touch bar is viewable or not.
    let viewable = false;

    // Listener on hammer swipe events.
    hammerTime.on('swipe', function (ev) {
        if (viewable) {
            switch (ev.direction) {
                case Hammer.DIRECTION_LEFT:
                    sendMessage("forward")
                    break;
                case Hammer.DIRECTION_RIGHT:
                    sendMessage("back")
                    break;
                case Hammer.DIRECTION_UP:
                    sendMessage("fullscreen")
                    break;
                case Hammer.DIRECTION_DOWN:
                    sendMessage("reload")
                    break;
            }
        }
    });

    // Listener on hammer double taps.
    hammerTime.on('doubletap', function (ev) {
        if (!viewable) {
            viewable = true;
            // 1. Add touch bar to HTML body
            initHtml();
            // 2. Initialize default buttons
            const extensionBtn = document.getElementById('extension-home-btn');
            const reloadBtn = document.getElementById('extension-reload-btn');
            const fullscreenBtn = document.getElementById('extension-fullscreen-btn');
            const backBtn = document.getElementById('extension-back-btn');
            const forwardBtn = document.getElementById('extension-forward-btn');
            // 3. Add the event listeners to the buttons
            extensionBtn.addEventListener('click', function (ev) {
                sendMessage("homepage")
            });
            reloadBtn.addEventListener('click', function (ev) {
                sendMessage("reload")
            });
            fullscreenBtn.addEventListener('click', function (ev) {
                sendMessage("fullscreen")
            });
            backBtn.addEventListener('click', function (ev) {
                sendMessage("back")
            });
            forwardBtn.addEventListener('click', function (ev) {
                sendMessage("forward")
            });
        } else {
            viewable = false;
            body.removeChild(document.getElementById('extension-div'));
        }
    });

}