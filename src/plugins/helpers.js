import moment from "moment";

export const isAuthenticated = () => {
  return getLocalStorage(process.env.VUE_APP_TOKEN_NAME) || false;
};

export const sleep = (milliseconds = 100) => {
  return new Promise((resolve) => {
    var timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve();
    }, milliseconds);
  });
};

export function setLocalStorage(lname, lvalue) {
  localStorage.setItem(lname, lvalue);
  return true;
}

export function getLocalStorage(lname) {
  const stringData = localStorage.getItem(lname);
  if (!stringData) {
    return null;
  }
  return stringData;
}

export function parseLocalStorage(lname) {
  const stringData = getLocalStorage(lname);
  if (!stringData) {
    return null;
  }
  return JSON.parse(stringData);
}

export function removeLocalStorage(lname) {
  localStorage.removeItem(lname);
  return true;
}

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export const convertPriceString = (val, isVND = false, forceMinus = false) => {
  if (val == 0) return isVND ? "0.000 VND" : "FREE";
  if (!val || isNaN(val)) return "";

  // if val is actually < 0 => forceMinus = true
  if (val < 0) {
    return convertPriceString(Math.abs(val), isVND, true);
  }

  const valStr = typeof val === "string" ? val : val.toString();
  const valDec = valStr.split(".")[0];

  var result =
    valDec.replace(/./g, function (c, i, a) {
      return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "." + c : c;
    }) + (isVND ? " VND" : "");

  return `${forceMinus ? "- " : ""}` + result;
};

export function standardizing(str) {
  // remove accents
  var from =
      "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçýỳỹỵỷ",
    to =
      "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(RegExp(from[i], "gi"), to[i]);
  }
  str = str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");

  return str;
}

export function uuidv4() {
  var code = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (Math.random() * 16) | 0,
        v = c == "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    }
  );
  return `${moment().utc().format("YYYYMMDDHHmmss")}-${code}`;
}

export async function awaitAll(promises) {
  return new Promise((resolve, reject) => {
    Promise.all(promises)
      .then((values) => {
        return resolve(values);
      })
      .catch((err) => reject(err));
  });
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

// usage example:
export const unique = (a) => a.filter(onlyUnique);
