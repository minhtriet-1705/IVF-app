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
  apiKey: "AIzaSyC9OUgxdx89IIBBkLLjYuW7tCLJv_l5V4Y",
  authDomain: "sandrasoft-8fe2b.firebaseapp.com",
  projectId: "sandrasoft-8fe2b",
  storageBucket: "sandrasoft-8fe2b.appspot.com",
  messagingSenderId: "247597878491",
  appId: "1:247597878491:web:58451d1659da966208d0fe",
  measurementId: "G-26M2K5J74E",
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
