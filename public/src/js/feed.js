var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0vh)';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function (choiceResult) {
      console.log(choiceResult.outcome);

      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation');
      } else {
        console.log('User added to home screen');
      }
    });

    deferredPrompt = null;
  }
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(registrations => {
  //       for (let i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister();
  //       }
  //     });
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// const onSaveButtonClicked = event => {
//   if ('caches' in window) {
//     caches.open('user-requested')
//       .then(cache => {
//         cache.add('https://httpbin.org/get');
//         cache.add('/src/images/sf-boat.jpg');
//       });
//   }
// };

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(data) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  for (let i = 0; i < data.length; i++) {
    createCard(data[i]);
  }
}

const url = 'https://pwagram-d032d-default-rtdb.firebaseio.com/posts.json';
let networkDataRecieved = false;

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataRecieved = true;
    const dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

if ('indexedDB' in window) {
  readAllData('posts')
    .then(data => {
      if (!networkDataRecieved) {
        updateUI(data);
      }
    });
}

function sendData() {
  fetch('https://pwagram-d032d-default-rtdb.firebaseio.com/posts.json', {
    method: 'post',
    headers: {
      'content-type': 'application/json', 
      'accept': 'application/json',
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
    })
  })
    .then(() => {
      updateUI();
    });
}

form.addEventListener('submit', event => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then(sw => {
        var post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value,
        };
        writeData('sync-posts', post)
          .then(() => {
            return sw.sync.register('sync-new-posts');
          })
          .then(() => {
            var snackbarContainer = document.querySelector('#confirmation-toast');
            var data = { message: 'Your post was saved for syncing!' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(err => {
            console.log(err);
          });
      });
  } else {
    sendData();
  }
});
