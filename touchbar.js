(async () => {
    const src = chrome.extension.getURL('touchbar-main.js');
    const contentScript = await import(src);
    contentScript.main(/* chrome: no need to pass it */);
})();
