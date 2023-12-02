var deferredPrompt;
var enableNotificationButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./serviceWorker.js')
    .then(() => {
      console.log('Service worker registered!');
    })
    .catch(err => {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', event => {
  console.log('beforeinstallprompt fired');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

function displayConfirmNotification() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(swreg => {
        console.log('Displaying notification');
        swreg.showNotification('Successfully subscribed!', {
          body: 'You successfully subscribed to our Notification service!',
          icon: './src/images/icons/app-icon-96x96.png',
          image: './src/images/sf-boat.jpg',
          dir: 'ltr',
          lang: 'en-US',
          vibrate: [100, 50, 200],
          badge: './src/images/icons/app-icon-96x96.png',
          tag: 'confirm-notification',
          renotify: true,
          actions: [
            { action: 'confirm', title: 'Okay', icon: './src/images/icons/app-icon-96x96.png' },
            { action: 'cancel', title: 'Cancel', icon: './src/images/icons/app-icon-96x96.png' },
          ],
        });
      });
  }
}

function configurePushSubscription() {
  if (!('serviceWorker' in navigator)) {
    return;
  }
  var reg;
  navigator.serviceWorker.ready
    .then(swreg => {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(sub => {
      if (sub === null) {
        var vapidPublicKey = 'BEAvlkBoHLKqo5-9oTKj8PC275S75enKa_S8va4_HIyv7Y0zOUlSxsGYeYQ8o-tHIiW2Hnds56v6WeWpXSbon9w';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey,
        });
      } else {

      }
    })
    .then(newSubscription => {
      return fetch('https://pwagram-d032d-default-rtdb.firebaseio.com/subscriptions.json', {
        method: 'post',
        headers: {
          'content-type': 'application/json',
          'accept': 'application/json',
        },
        body: JSON.stringify(newSubscription),
      })
    })
    .then(res => {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(err => {
      console.log('app ~ 88: ', err);
    });
}

function askForNotificationPermission() {
  Notification.requestPermission(result => {
    if (result !== 'granted') {
      console.log('No notification permission granted');
    } else {
      console.log('Notification permission granted');
      configurePushSubscription();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (var i = 0; i < enableNotificationButtons.length; i++) {
    enableNotificationButtons[i].style.display = 'inline-block';
    enableNotificationButtons[i].addEventListener('click', askForNotificationPermission);
  }
}
