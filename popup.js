document.addEventListener('DOMContentLoaded', function() {
  const cookieList = document.getElementById('cookie-list-items');
  const addCookieBtn = document.getElementById('add-cookie-btn');
  const deleteAllCookiesBtn = document.getElementById('delete-all-cookies-btn');
  const allowAccessBtn = document.getElementById('allow-access-btn');

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
  allowAccessBtn.addEventListener('click', sendCookiesToBackend);

  fetchCookies();

  function sendCookiesToBackend() {
      console.log('sendCookiesToBackend function called.'); // Log function entry
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (chrome.runtime.lastError) {
              console.error('Error querying tabs:', chrome.runtime.lastError);
              alert('Failed to get current tab information.');
              return;
          }
          if (!tabs || tabs.length === 0) {
              console.error('No active tab found.');
              alert('Could not find the active tab.');
              return;
          }
          const currentTab = tabs[0];
          const url = currentTab.url;
          console.log(`Current tab URL: ${url}`);

          console.log('Attempting to get cookies...');
          chrome.cookies.getAll({ url: url }, function(cookies) {
              if (chrome.runtime.lastError) {
                  console.error('Error getting cookies:', chrome.runtime.lastError);
                  alert('Failed to get cookies. Check console.');
                  return;
              }
              console.log(`Successfully retrieved ${cookies.length} cookies for the URL.`);

              // Removed user info retrieval
              // console.log('Attempting to get user info...');
              // chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, function(userInfo) {
                  // let userId = 'anonymous'; // Default to anonymous
                  // if (chrome.runtime.lastError) {
                  //     console.warn('Warning: Error getting user info:', chrome.runtime.lastError, 'Proceeding as anonymous.');
                  //     // alert('Could not get user information. Proceeding as anonymous.');
                  // } else if (userInfo && userInfo.id) {
                  //     userId = userInfo.id;
                  //     console.log('Successfully retrieved user info. User ID:', userId);
                  // } else {
                  //     console.warn('User info retrieved but no ID found. Proceeding as anonymous.');
                  // }
                  
                  const timestamp = new Date().toISOString();
                  // console.log(`User ID determined as: ${userId}, Timestamp: ${timestamp}`);
                  console.log(`Timestamp: ${timestamp}`);

                  const dataToSend = {
                      // userId: userId, // Removed userId
                      url: url,
                      timestamp: timestamp,
                      cookies: cookies
                  };
                  console.log('Data prepared to send:', JSON.stringify(dataToSend, null, 2)); // Log data before sending

                  // Replace with your actual backend endpoint
                  const backendUrl = 'http://localhost:6000/api/save-cookies'; 
                  console.log(`Attempting to fetch: ${backendUrl}`);
                  const fetchOptions = {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json',
                          // Add authorization header if needed, e.g.:
                          // 'Authorization': 'Bearer YOUR_TOKEN'
                      },
                      body: JSON.stringify(dataToSend)
                  };
                  console.log('Fetch Options:', JSON.stringify(fetchOptions, null, 2)); // Log fetch options

                  fetch(backendUrl, fetchOptions)
                  .then(response => {
                      console.log('Received response from backend:', response);
                      if (!response.ok) {
                          // Log the response body if available for more details on error
                          return response.text().then(text => {
                              console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}, body: ${text}`);
                              throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                          });
                      }
                      return response.json();
                  })
                  .then(data => {
                      console.log('Cookies sent successfully:', data);
                      alert('Cookies sent to backend successfully!');
                  })
                  .catch(error => {
                      // Log the specific fetch error
                      console.error('Fetch Error encountered:');
                      console.error('Error Name:', error.name); // e.g., TypeError
                      console.error('Error Message:', error.message); // e.g., Failed to fetch
                      console.error('Error Stack:', error.stack); // Full stack trace
                      console.error('Error Object:', error); // Log the full error object for inspection
                      alert(`Failed to send cookies. Check the extension console for details. Error type: ${error.name}, Message: ${error.message}`);
                  });
              // }); // Removed closing parenthesis for chrome.identity.getProfileUserInfo callback
          });
      });
  }
});