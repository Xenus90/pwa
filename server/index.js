var webpush = require("web-push");

async function sendNotifications() {
  webpush.setVapidDetails(
    'mailto:xenus90@gmail.com',
    'BEAvlkBoHLKqo5-9oTKj8PC275S75enKa_S8va4_HIyv7Y0zOUlSxsGYeYQ8o-tHIiW2Hnds56v6WeWpXSbon9w',
    '3JyBnCtYYYNJMiTyNL8PkaSI0XbVb2mXlVa8PT_73_M'
  );
  var res = await fetch('https://pwagram-d032d-default-rtdb.firebaseio.com/subscriptions.json');
  var subscriptions = await res.json();
    subscriptions.forEach(subscription => {
      var pushConfig = {
        endpoint: subscription.endpoint,
        keys: {
          auth: subscription.keys.auth,
          p256dh: subscription.keys.p256dh,
        },
      };
      webpush.sendNotification(pushConfig, JSON.stringify({
        title: 'new post',
        content: 'new post added',
        openUrl: '/help'
      }));
    });
}