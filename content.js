// content.js

// Function to fetch and display cookies for the current page
function displayCookies() {
    chrome.cookies.getAll({ url: window.location.href }, function(cookies) {
        const cookieList = document.getElementById('cookie-list-items');
        cookieList.innerHTML = ''; // Clear previous cookies

        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        if (cookies.length === 0) {
            console.log('No cookies found for this page.');
            return;
        }

        cookies.forEach(cookie => {
            const li = document.createElement('li');
            li.textContent = `${cookie.name}: ${cookie.value}`;
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = function() {
                deleteCookie(cookie.name);
            };
            li.appendChild(deleteButton);
            cookieList.appendChild(li);
        });
    });
}

// Function to add a new cookie
function addCookie(name, value) {
    const cookieDetails = {
        url: window.location.href,
        name: name,
        value: value,
        expirationDate: (new Date().getTime() / 1000) + 3600 // Expires in 1 hour
    };

    chrome.cookies.set(cookieDetails, function(cookie) {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            console.log(`Cookie added: ${cookie.name} = ${cookie.value}`);
            displayCookies(); // Refresh the cookie list
        }
    });
}

// Function to delete a cookie by name
function deleteCookie(name) {
    chrome.cookies.remove({ url: window.location.href, name: name }, function() {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else {
            console.log(`Cookie deleted: ${name}`);
            displayCookies(); // Refresh the cookie list
        }
    });
}

// Function to clear all cookies for the current page
function clearAllCookies() {
    chrome.cookies.getAll({ url: window.location.href }, function(cookies) {
        cookies.forEach(cookie => deleteCookie(cookie.name));
    });
}

// Quick access toolbar logic
function createQuickAccessToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'quick-access-toolbar';
    toolbar.style.position = 'fixed';
    toolbar.style.top = '10px';
    toolbar.style.right = '10px';
    toolbar.style.backgroundColor = '#fff';
    toolbar.style.border = '1px solid #ccc';
    toolbar.style.padding = '10px';
    toolbar.style.zIndex = '9999';

    // Add buttons or links to the toolbar as needed
    const showCookiesButton = document.createElement('button');
    showCookiesButton.innerText = 'Show Cookies';
    showCookiesButton.onclick = displayCookies; // Show cookies when clicked

    const clearCookiesButton = document.createElement('button');
    clearCookiesButton.innerText = 'Clear Cookies';
    clearCookiesButton.onclick = clearAllCookies; // Clear cookies when clicked

    toolbar.appendChild(showCookiesButton);
    toolbar.appendChild(clearCookiesButton);
    
    document.body.appendChild(toolbar);
}

// Integrated notes logic
function createNotesSection() {
    const notesContainer = document.createElement('div');
    notesContainer.id = 'notes-section';
    
    const notesTitle = document.createElement('h2');
    notesTitle.innerText = 'Notes';
    
    const notesList = document.createElement('ul');
    
    const noteInput = document.createElement('input');
    noteInput.type = 'text';
    noteInput.placeholder = 'Enter your note here...';

    const addNoteButton = document.createElement('button');
    addNoteButton.innerText = 'Add Note';
    
    addNoteButton.onclick = function() {
        const noteText = noteInput.value.trim();
        if (noteText) {
            const li = document.createElement('li');
            li.textContent = noteText;

            // Create a delete button for each note
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = function() {
                notesList.removeChild(li); // Remove the note from the list
            };

            li.appendChild(deleteButton);
            notesList.appendChild(li);
            noteInput.value = ''; // Clear input after adding
        }
    };

    notesContainer.appendChild(notesTitle);
    notesContainer.appendChild(noteInput);
    notesContainer.appendChild(addNoteButton);
    notesContainer.appendChild(notesList);

    // Add the notes section to the body
    document.body.appendChild(notesContainer);
}

// Initialize functions on page load
window.onload = function() {
   createQuickAccessToolbar();
   createNotesSection();
   displayCookies(); // Fetch and display cookies on load
};
