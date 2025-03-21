// popup.js - Settings popup, defaults to true, stores the setting chosen by the user in the popup

// for some reason this is finnicky, best of luck if you want to make changes

document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("insightsToggle");

    chrome.storage.sync.get("alwaysShowInsights", (data) => {
        if (data.alwaysShowInsights === undefined) {
          chrome.storage.sync.set({ alwaysShowInsights: true }, () => {
            toggle.checked = true;
            console.log("Initialized alwaysShowInsights to true.");
          });
        } else {
          toggle.checked = data.alwaysShowInsights;
          console.log("Loaded alwaysShowInsights:", data.alwaysShowInsights);
        }
      });
      

    toggle.addEventListener("change", () => {
        chrome.storage.sync.set({ alwaysShowInsights: toggle.checked });
        console.log("Updated setting: alwaysShowInsights =", toggle.checked);
    });
});
