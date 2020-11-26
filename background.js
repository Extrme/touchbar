/**
 * Setting init value for homepage
 */
chrome.runtime.onInstalled.addListener(function () {
    chrome.storage.sync.set({ homepage: 'http://google.com' });
    chrome.storage.sync.set({ buttonColor: '#FF5733' });
});

// Receive messages from the content_script.
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "fullscreen") {
            fullscreen();
        } else if (request.action === "forward" || request.action === "back" || request.action === "reload") {
            tabs(request.action);
        } else if (request.action === "homepage") {
            homepage();
        } else {
            sendResponse({ msg: "Error: Action not recognized." });
            return;
        }
        sendResponse({ msg: "Ok" });
    });

/**
 * Toggles fullscreen of the current window.
 */
function fullscreen() {
    chrome.windows.getCurrent(function (win) {
        if (win.state === "fullscreen") {
            chrome.windows.update(win.id, { state: "normal" });
        } else {
            chrome.windows.update(win.id, { state: "fullscreen" });
        }
    });
}

/**
 * Manages tab actions.
 * 
 * @param {*} action the action to be performed on the current tab
 */
function tabs(action) {
    chrome.windows.getCurrent(function (win) {
        chrome.tabs.getSelected(win.id, function (tab) {
            if (action === "forward") {
                chrome.tabs.goForward(tab.id);
            } else if (action === "back") {
                chrome.tabs.goBack(tab.id);
            } else if (action === "reload") {
                chrome.tabs.reload(tab.id);
            } else {
                console.error("Error: Action on tabs not supported.")
            }
        });
    });
}

/**
 * Redirects the current tab to the configured homepage.
 */
function homepage() {
    chrome.storage.sync.get(['homepage'], function (result) {
        chrome.windows.getCurrent(function (win) {
            chrome.tabs.getSelected(win.id, function (tab) {
                chrome.tabs.update(tab.id, { url: result.homepage });
            });
        });
    });
}
