// background.js

// Create a context menu item for opening the Cookie Editor
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        id: "openCookieEditor",
        title: "Open Cookie Editor",
        contexts: ["action"]
    });
});

// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (info.menuItemId === "openCookieEditor") {
        chrome.action.openPopup();
    }
});

// Function to get cookies for a specific URL
function getCookiesForUrl(url, callback) {
    chrome.cookies.getAll({ url: url }, function(cookies) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            callback([]);
        } else {
            callback(cookies);
        }
    });
}

// Function to set a cookie
function setCookie(url, cookieDetails, callback) {
    chrome.cookies.set({ url: url, ...cookieDetails }, function(cookie) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            callback(null);
        } else {
            callback(cookie);
        }
    });
}

// Function to remove a cookie
function removeCookie(url, cookieName, callback) {
    chrome.cookies.remove({ url: url, name: cookieName }, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            callback(false);
        } else {
            callback(true);
        }
    });
}

// Function to remove all cookies for a specific URL
function removeAllCookiesForUrl(url, callback) {
    console.log(`Fetching cookies for URL: ${url}`);
    
    getCookiesForUrl(url, function(cookies) {
        console.log(`Found ${cookies.length} cookies.`);
        
        if (cookies.length === 0) {
            console.log('No cookies found. Callback with success.');
            callback(true);
            return;
        }

        const removePromises = cookies.map(function(cookie) {
            return new Promise(function(resolve) {
                console.log(`Removing cookie: ${cookie.name}`);
                removeCookie(url, cookie.name, resolve);
            });
        });
        
        Promise.all(removePromises)
            .then(function() {
                console.log('All cookies removed successfully.');
                callback(true);
            })
            .catch(function(error) {
                console.error('Error removing cookies:', error);
                callback(false);
            });
    });
}

// Message listener for handling various cookie operations
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    const { action, url, cookieDetails } = request;

    switch(action) {
        case 'getCookies':
            getCookiesForUrl(url, sendResponse);
            return true;
        case 'setCookie':
            setCookie(url, cookieDetails, sendResponse);
            return true;
        case 'removeCookie':
            removeCookie(url, cookieDetails.name, sendResponse);
            return true;
        case 'removeAllCookies':
            removeAllCookiesForUrl(url, sendResponse);
            return true;
        default:
            sendResponse({ error: "Unknown action" });
            return false;
    }
});