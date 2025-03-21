// popup.js - Settings popup, defaults to true, stores the setting chosen by the user in the popup

// for some reason this is finnicky, best of luck if you want to make changes

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("insightsToggle");

    chrome.storage.sync.get(["alwaysShowInsights", "firstRun"], (data) => {
        if (data.firstRun === true) {
            chrome.storage.sync.set({ firstRun: false }, () => {
                console.log("Popup opened: firstRun reset to false.");
            });
            chrome.storage.sync.set({ alwaysShowInsights: true }, () => {
                toggle.checked = true;
            });
        } else {
            toggle.checked = data.alwaysShowInsights ?? true;
            console.log("Loaded stored setting: alwaysShowInsights =", toggle.checked);
        }
    });

    toggle.addEventListener("change", () => {
        chrome.storage.sync.set({ alwaysShowInsights: toggle.checked });
        console.log("Updated setting: alwaysShowInsights =", toggle.checked);
    });
});
