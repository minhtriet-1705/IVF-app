import firebase from "firebase";
import { Capacitor } from "@capacitor/core";
import {
  cfaSignOut,
  cfaSignIn,
  cfaSignInPhoneOnCodeSent,
} from "capacitor-firebase-auth";
import { sleep } from "./helpers";

var firebaseConfig = {
  apiKey: "AIzaSyDHde62EhI_4GZ9zi-B2kwq3c1-tlZx3vc",
  authDomain: "ivf-app-new.firebaseapp.com",
  projectId: "ivf-app-new",
  storageBucket: "ivf-app-new.firebasestorage.app",
  messagingSenderId: "92852289480",
  appId: "1:92852289480:web:c2ea7a70ae6efe7d6b4afd",
  databaseURL:
    "https://ivf-app-new-default-rtdb.asia-southeast1.firebasedatabase.app",
};

export function getGcpGsUrl() {
  return `gs://${firebaseConfig.storageBucket}/public`;
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const database = firebase.database();

// firebase authentication
firebase.auth().useDeviceLanguage();
var GoogleAuthProvider = new firebase.auth.GoogleAuthProvider();
var FacebookAuthProvider = new firebase.auth.FacebookAuthProvider();

export const OAuthProviderType = {
  Google: 1,
  Facebook: 2,
};

export function OAuthSignIn(providerType = OAuthProviderType.Google) {
  var provider;
  switch (providerType) {
    case OAuthProviderType.Google:
      provider = GoogleAuthProvider;
      break;
    case OAuthProviderType.Facebook:
      provider = FacebookAuthProvider;
      break;
    default:
      provider = null;
  }
  if (provider == null) {
    throw new Error("OAuthSignIn failed due to no provider supplied");
  }
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(() => {
        /** @type {firebase.auth.OAuthCredential} */
        firebase
          .auth()
          .currentUser.getIdToken(/* forceRefresh */ true)
          .then(function (idToken) {
            return resolve(idToken);
          })
          .catch(function (error) {
            return reject(error);
          });
      })
      .catch((error) => {
        return reject(error);
      });
  });
}

export function OAuthSignOut() {
  // REMOVE CAPACITOR
  if (Capacitor.isNativePlatform()) {
    return cfaSignOut().subscribe();
  }
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        return resolve(true);
      })
      .catch((error) => {
        return reject(error);
      });
  });
}

// Verify Phone Number
export async function getRecapthaVerifierInstance() {
  // REMOVE CAPACITOR
  if (Capacitor.isNativePlatform()) return;

  if (window.recaptchaVerifier) {
    return window.recaptchaVerifier;
  }
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier(
    "verify-phone-number-btn",
    {
      size: "invisible",
    }
  );
  return window.recaptchaVerifier;
}

var CapacitorPhoneVerificationID = "";

export async function sendConfirmationPhoneNumber(
  phoneNumber,
  onAuthStateChange = null
) {
  // REMOVE CAPACITOR
  if (Capacitor.isNativePlatform()) {
    return new Promise((resolve, reject) => {
      cfaSignInPhoneOnCodeSent().subscribe({
        next: (verificationId) => {
          console.log("at next cfaSignInPhoneOnCodeSent!");
          CapacitorPhoneVerificationID = verificationId;
          console.log(CapacitorPhoneVerificationID);
        },
        error: (error) => {
          console.log("at error cfaSignInPhoneOnCodeSent!");
          console.log(error);
          return reject(error);
        },
        complete: () => {
          console.log("at complete cfaSignInPhoneOnCodeSent!");
          return resolve(true);
        },
      });
      cfaSignIn("phone", { phone: phoneNumber }).subscribe(async (user) => {
        console.log(">>>>>> at complete cfaSignIn!" + JSON.stringify(user));
        if (onAuthStateChange) {
          await onAuthStateChange(user);
          await sleep(100);
        }
        if (Capacitor.getPlatform().toLowerCase() == "android") {
          return resolve(true);
        }
      });
    });
  }
  var appVerifier = window.recaptchaVerifier;
  return new Promise((resolve, reject) => {
    firebase
      .auth()
      .signInWithPhoneNumber(phoneNumber, appVerifier)
      .then((confirmationResult) => {
        // SMS sent. Prompt user to type the code from the message, then sign the
        // user in with confirmationResult.confirm(code).
        window.confirmationResult = confirmationResult;
        return resolve(confirmationResult);
        // ...
      })
      .catch((error) => {
        reject(error);
        appVerifier.reset(0);
      });
  });
}

export async function verifyConfirmationPhoneNumber(code) {
  return new Promise((resolve, reject) => {
    // REMOVE CAPACITOR
    if (CapacitorPhoneVerificationID) {
      const credential = firebase.auth.PhoneAuthProvider.credential(
        CapacitorPhoneVerificationID,
        code
      );
      firebase
        .auth()
        .signInWithCredential(credential)
        .then((auth) => {
          console.log("done!");
          console.log(auth);
          var { user } = auth;
          return resolve(user);
        })
        .catch((error) => {
          return reject(error);
        });
    } else {
      window.confirmationResult
        .confirm(code)
        .then((result) => {
          // User signed in successfully.
          const user = result.user;
          return resolve(user);
        })
        .catch((error) => {
          // User couldn't sign in (bad verification code?)
          return reject(error);
        });
    }
  });
}

// firebase storage
// Get a reference to the storage service, which is used to create references in your storage bucket
var storage = firebase.storage();

// Create a storage reference from our storage service
var storageRef = storage.ref();

export async function firebaseUploadBlob(blob, prefix, fileName, onProgressFn) {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  blob.lastModifiedDate = new Date();
  blob.name = fileName;
  var name = `${prefix}/${fileName}`;
  return firebaseUpload(blob, name, onProgressFn);
}

export async function firebaseUpload(file, name, onProgressFn) {
  var path = `public/${name}`;
  var uploadTask = storageRef.child(path).put(file);
  return new Promise((resolve, reject) => {
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      // on uploadString progress,
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgressFn) {
          onProgressFn(progress);
        }
      },
      function (error) {
        return reject(error);
      },
      function () {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          return resolve(downloadURL);
        });
      }
    );
  });
}

export async function firebaseUploadBase64(base64Str, name, onProgressFn) {
  var path = `public/${name}`;
  var uploadTask = storageRef.child(path).putString(base64Str, "data_url");
  return new Promise((resolve, reject) => {
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      // on upload progress,
      function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgressFn) {
          onProgressFn(progress);
        }
      },
      function (error) {
        return reject(error);
      },
      function () {
        // Upload completed successfully, now we can get the download URL
        uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          return resolve(downloadURL);
        });
      }
    );
  });
}

// firebase messaging
var fcmWebPushToken =
  "BHDdtrzAD417UBdwT9vpDmJkijQAOI0wab4_TUVEfTrbIKWwtbSg_KRcPRWV3EF0EoIstI_i8WDHkqqeyDfJHyo";

function getFcmInstance() {
  if (firebase.messaging.isSupported()) {
    return firebase.messaging();
  } else {
    return {
      onMessage: async () => {
        return true;
      },
    };
  }
}

export const FirebaseMessaging = getFcmInstance();

export async function getDeviceFcmToken() {
  return new Promise((resolve, reject) => {
    // Check browser support first hand
    if (firebase.messaging.isSupported()) {
      console.log("This browser có hỗ trợ Notification. Hooray!");
      FirebaseMessaging.getToken({ vapidKey: fcmWebPushToken })
        .then((currentToken) => {
          if (currentToken) {
            return resolve(currentToken);
          } else {
            console.error(
              "No registration token available. Request permission to generate one."
            );
          }
        })
        .catch((err) => {
          console.error("An error occurred while retrieving token. ", err);
          return reject(err);
        });
    } else {
      return resolve(null);
    }
  });
}
