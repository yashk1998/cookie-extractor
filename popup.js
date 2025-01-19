document.addEventListener('DOMContentLoaded', function() {
  const cookieList = document.getElementById('cookie-list-items');
  const addCookieBtn = document.getElementById('add-cookie-btn');
  const deleteAllCookiesBtn = document.getElementById('delete-all-cookies-btn');

  function createCookieElement(cookie) {
      const li = document.createElement('li');
      li.className = 'cookie-item';

      // Create header with name and arrow
      const header = document.createElement('div');
      header.className = 'cookie-header';
      
      const nameSpan = document.createElement('span');
      nameSpan.className = 'cookie-name';
      nameSpan.textContent = cookie.name;

      const arrow = document.createElement('span');
      arrow.className = 'arrow';

      header.appendChild(nameSpan);
      header.appendChild(arrow);

      // Create details section
      const details = document.createElement('div');
      details.className = 'cookie-details';

      const valueDiv = document.createElement('div');
      valueDiv.className = 'cookie-value';
      valueDiv.textContent = `Value: ${cookie.value}`;

      const actions = document.createElement('div');
      actions.className = 'cookie-actions';

      const updateBtn = document.createElement('button');
      updateBtn.className = 'update-btn';
      updateBtn.textContent = 'Update';

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.textContent = 'Delete';

      actions.appendChild(updateBtn);
      actions.appendChild(deleteBtn);

      // Create update box
      const updateBox = document.createElement('div');
      updateBox.className = 'update-box';

      const updateInput = document.createElement('input');
      updateInput.type = 'text';
      updateInput.value = cookie.value;

      const saveBtn = document.createElement('button');
      saveBtn.textContent = 'Save';

      updateBox.appendChild(updateInput);
      updateBox.appendChild(saveBtn);

      details.appendChild(valueDiv);
      details.appendChild(actions);
      details.appendChild(updateBox);

      li.appendChild(header);
      li.appendChild(details);

      // Event listeners
      header.addEventListener('click', () => {
          arrow.classList.toggle('expanded');
          details.classList.toggle('visible');
      });

      updateBtn.addEventListener('click', () => {
          updateBox.classList.toggle('visible');
      });

      saveBtn.addEventListener('click', () => {
          updateCookie(cookie.name, updateInput.value);
          updateBox.classList.remove('visible');
      });

      deleteBtn.addEventListener('click', () => {
          deleteCookie(cookie.name);
      });

      return li;
  }

  function fetchCookies() {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const currentTab = tabs[0];
          chrome.cookies.getAll({ url: currentTab.url }, function(cookies) {
              cookieList.innerHTML = '';

              if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError);
                  return;
              }

              if (cookies.length === 0) {
                  const emptyMessage = document.createElement('div');
                  emptyMessage.className = 'empty-message';
                  emptyMessage.textContent = 'No cookies found for this page.';
                  cookieList.appendChild(emptyMessage);
                  return;
              }

              cookies.forEach(cookie => {
                  cookieList.appendChild(createCookieElement(cookie));
              });
          });
      });
  }

  function updateCookie(name, newValue) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const currentTab = tabs[0];
          chrome.cookies.get({
              url: currentTab.url,
              name: name
          }, function(cookie) {
              if (cookie) {
                  chrome.cookies.set({
                      url: currentTab.url,
                      name: name,
                      value: newValue,
                      domain: cookie.domain,
                      path: cookie.path,
                      secure: cookie.secure,
                      httpOnly: cookie.httpOnly,
                      sameSite: cookie.sameSite,
                      expirationDate: cookie.expirationDate
                  }, function() {
                      fetchCookies();
                  });
              }
          });
      });
  }

  function addCookie() {
      const cookieName = prompt('Enter cookie name:');
      const cookieValue = prompt('Enter cookie value:');
      if (cookieName && cookieValue) {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              const currentTab = tabs[0];
              chrome.cookies.set({
                  url: currentTab.url,
                  name: cookieName,
                  value: cookieValue,
                  expirationDate: (new Date().getTime() / 1000) + 3600
              }, function() {
                  fetchCookies();
              });
          });
      }
  }

  function deleteCookie(cookieName) {
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          const currentTab = tabs[0];
          chrome.cookies.remove({ url: currentTab.url, name: cookieName }, function() {
              fetchCookies();
          });
      });
  }

  function deleteAllCookies() {
      if (confirm('Are you sure you want to delete all cookies for this page?')) {
          chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
              const currentTab = tabs[0];
              chrome.cookies.getAll({ url: currentTab.url }, function(cookies) {
                  cookies.forEach(cookie => deleteCookie(cookie.name));
              });
          });
      }
  }

  addCookieBtn.addEventListener('click', addCookie);
  deleteAllCookiesBtn.addEventListener('click', deleteAllCookies);

  fetchCookies();
});