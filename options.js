// options.js

document.addEventListener('DOMContentLoaded', function() {
    const addSiteButton = document.getElementById('add-site-btn');
    const toolbarSitesInput = document.getElementById('toolbar-sites');
    const toolbarSitesList = document.getElementById('toolbar-sites-list');

    const addSpeedDialButton = document.getElementById('add-speed-dial-btn');
    const speedDialSitesInput = document.getElementById('speed-dial-sites');
    const speedDialSitesList = document.getElementById('speed-dial-sites-list');

    const saveSessionButton = document.getElementById('save-session-btn');
    const restoreSessionButton = document.getElementById('restore-session-btn');
    const sessionList = document.getElementById('session-list');

    // Load existing sites from storage
    loadToolbarSites();
    loadSpeedDialSites();
    loadSessions();

    // Add site to quick access toolbar
    addSiteButton.addEventListener('click', function() {
        const siteUrl = toolbarSitesInput.value.trim();
        if (siteUrl) {
            addToolbarSite(siteUrl);
            toolbarSitesInput.value = ''; // Clear input
        } else {
            alert("Please enter a valid URL.");
        }
    });

    // Add site to speed dial
    addSpeedDialButton.addEventListener('click', function() {
        const siteUrl = speedDialSitesInput.value.trim();
        if (siteUrl) {
            addSpeedDialSite(siteUrl);
            speedDialSitesInput.value = ''; // Clear input
        } else {
            alert("Please enter a valid URL.");
        }
    });

    // Save current session
    saveSessionButton.addEventListener('click', function() {
        saveCurrentSession();
    });

    // Restore selected session
    restoreSessionButton.addEventListener('click', function() {
        restoreSession();
    });
});

// Load existing toolbar sites from storage
function loadToolbarSites() {
   chrome.storage.sync.get(['toolbarSites'], function(result) {
       const sites = result.toolbarSites || [];
       sites.forEach(site => addToolbarSiteToList(site));
   });
}

// Load existing speed dial sites from storage
function loadSpeedDialSites() {
   chrome.storage.sync.get(['speedDialSites'], function(result) {
       const sites = result.speedDialSites || [];
       sites.forEach(site => addSpeedDialSiteToList(site));
   });
}

// Load existing sessions from storage
function loadSessions() {
   chrome.storage.sync.get(['sessions'], function(result) {
       const sessions = result.sessions || [];
       sessions.forEach(session => addSessionToList(session));
   });
}

// Add a site to the quick access toolbar
function addToolbarSite(siteUrl) {
   chrome.storage.sync.get(['toolbarSites'], function(result) {
       const sites = result.toolbarSites || [];
       if (!sites.includes(siteUrl)) { // Prevent duplicates
           sites.push(siteUrl);
           chrome.storage.sync.set({ toolbarSites: sites }, function() {
               addToolbarSiteToList(siteUrl);
               alert(`Site added to toolbar: ${siteUrl}`);
           });
       } else {
           alert("This site is already in the toolbar.");
       }
   });
}

// Display a site in the quick access toolbar list
function addToolbarSiteToList(siteUrl) {
   const li = document.createElement('li');
   li.textContent = siteUrl;
   document.getElementById('toolbar-sites-list').appendChild(li);
}

// Add a site to the speed dial
function addSpeedDialSite(siteUrl) {
   chrome.storage.sync.get(['speedDialSites'], function(result) {
       const sites = result.speedDialSites || [];
       if (!sites.includes(siteUrl)) { // Prevent duplicates
           sites.push(siteUrl);
           chrome.storage.sync.set({ speedDialSites: sites }, function() {
               addSpeedDialSiteToList(siteUrl);
               alert(`Site added to speed dial: ${siteUrl}`);
           });
       } else {
           alert("This site is already in the speed dial.");
       }
   });
}

// Display a site in the speed dial list
function addSpeedDialSiteToList(siteUrl) {
   const li = document.createElement('li');
   li.textContent = siteUrl;
   document.getElementById('speed-dial-sites-list').appendChild(li);
}

// Save the current session (tab URLs)
function saveCurrentSession() {
   chrome.tabs.query({}, function(tabs) {
       const sessionUrls = tabs.map(tab => tab.url);
       chrome.storage.sync.set({ sessions: sessionUrls }, function() {
           alert("Current session saved.");
           loadSessions(); // Refresh the session list
       });
   });
}

// Restore a saved session (to be implemented)
function restoreSession() {
   chrome.storage.sync.get(['sessions'], function(result) {
       const sessionUrls = result.sessions || [];
       sessionUrls.forEach(url => {
           chrome.tabs.create({ url: url }); // Open each URL in a new tab
       });
   });
}

// Function to display a saved session in the dropdown list (if needed)
function addSessionToList(session) {
   const option = document.createElement('option');
   option.value = session;
   option.textContent = session; // You may want to format this better
   document.getElementById('session-list').appendChild(option);
}
