//firebase-messaging-sw.js
/*eslint-disable*/
importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.2.7/firebase-messaging.js");

self.addEventListener("notificationclick", function (event) {
  console.debug("SW notification click event", event);
  const url = event.notification.data.link;
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        // If so, just focus it.
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      // If not, then open the target URL in a new window/tab.
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

var firebaseConfig = {
  apiKey: "AIzaSyDHde62EhI_4GZ9zi-B2kwq3c1-tlZx3vc",
  authDomain: "ivf-app-new.firebaseapp.com",
  projectId: "ivf-app-new",
  storageBucket: "ivf-app-new.firebasestorage.app",
  messagingSenderId: "92852289480",
  appId: "1:92852289480:web:c2ea7a70ae6efe7d6b4afd",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function (payload) {
  const notificationTitle = "IVF App";
  const notificationOptions = {
    title: "IVF App",
    body: "You have new notification comming up!",
    icon: "https://ivf.phongkham.co/favicon.ico",
    data: {
      link: "https://ivf.phongkham.co",
    },
    actions: [{ action: "open_url", title: "View" }],
  };
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions
  );
});
