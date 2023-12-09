var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');
var videoPlayer = document.querySelector('#player');
var canvasElement = document.querySelector('#canvas');
var captureButton = document.querySelector('#capture-btn');
var imagePicker = document.querySelector('#image-picker');
var imagePickerArea = document.querySelector('#pick-image');
var picture;
var locationButton = document.querySelector('#location-btn');
var locationLoader = document.querySelector('#location-loader');
var fetchedLocation = { lat: 0, lng: 0 };

locationButton.addEventListener('click', event => {
  var sawAlert = false;
  locationButton.style.display = 'none';
  locationLoader.style.display = 'block';
  navigator.geolocation.getCurrentPosition(position => {
    locationButton.style.display = 'inline';
    locationLoader.style.display = 'none';
    fetchedLocation = position.coords;
    locationInput.value = 'In Israel'; // position.coors could be parsed to a address via Google Maps API
    document.querySelector('#manual-location').classList.add('is-focused');
  }, error => {
    console.log('feed ~ 19: ', error);
    locationButton.style.display = 'inline';
    locationLoader.style.display = 'none';
    if (!sawAlert) {
      alert('Could not fetch a location');
      sawAlert = true;
    }
    fetchedLocation = { lat: 0, lng: 0 };
  }, {
    timeout: 1000 * 7,
  });
});

function initializeLocation() {
  if (!('geolocation' in navigator)) {
    locationButton.style.display = 'none';
  }
}

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function (constraints) {
      var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented'));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    };
  }

  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(stream => {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(error => {
      imagePickerArea.style.display = 'block';
    });
}

captureButton.addEventListener('click', event => {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  var context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvasElement.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvasElement.width));
  videoPlayer.srcObject.getVideoTracks().forEach(track => {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener('change', event => {
  picture = event.target.files[0];
});

function openCreatePostModal() {
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(0vh)';
  }, 1);
  initializeMedia();
  initializeLocation();
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
}

function closeCreatePostModal() {
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationButton.style.display = 'inline';
  locationLoader.style.display = 'none';
  captureButton.style.display = 'inline';
  if (videoPlayer.srcObject) {
    videoPlayer.srcObject.getVideoTracks().forEach(track => {
      track.stop();
    });
  }
  setTimeout(() => {
    createPostArea.style.transform = 'translateY(100vh)';
  }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

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
  var postData = new FormData();
  var id = new Date().toISOString();
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);
  postData.append('file', picture, `${id}.png`);
  fetch('https://pwagram-d032d-default-rtdb.firebaseio.com/posts.json', {
    method: 'post',
    body: postData,
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
          picture: picture,
          rawLocation: fetchedLocation,
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
