const METADATA = {
  namespace: "spotify-clone",
  clientID: "0664bb72e5bd453fb77af312c44b8137",
  redirectURI: "https://kaiz16.github.io/spotify-clone-api",
  scope: "user-read-private user-read-email user-top-read",
};

function getLocalToken() {
  const token = sessionStorage.getItem(`${METADATA.namespace}_access_token`);
  return token;
}

function setLocalToken(token) {
  sessionStorage.setItem(`${METADATA.namespace}_access_token`, token);
}

function deleteLocalToken() {
  sessionStorage.removeItem(`${METADATA.namespace}_access_token`);
}

function getLocalCodeVerifier() {
  const codeVerifier = sessionStorage.getItem(
    `${METADATA.namespace}_code_verifier`
  );
  return codeVerifier;
}

function setLocalCodeVerifier(codeVerifier) {
  sessionStorage.setItem(`${METADATA.namespace}_code_verifier`, codeVerifier);
}

function deleteLocalCodeVerifier() {
  sessionStorage.removeItem(`${METADATA.namespace}_code_verifier`);
}

function generateRandomString(length) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

function base64encode(input) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function authorize() {
  const authUrl = new URL("https://accounts.spotify.com/authorize");
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  setLocalCodeVerifier(codeVerifier);

  const params = {
    response_type: "code",
    client_id: METADATA.clientID,
    scope: METADATA.scope,
    redirect_uri: METADATA.redirectURI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  };

  authUrl.search = new URLSearchParams(params).toString();
  window.location.href = authUrl.toString();
}

function extractCodeFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  let code = urlParams.get("code");
  return code;
}

async function getProfile() {
  const token = getLocalToken();
  if (!token) return null;

  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  const data = await response.json();
  return data;
}

async function getToken(code) {
  const codeVerifier = getLocalCodeVerifier();

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: METADATA.clientID,
      grant_type: "authorization_code",
      code,
      redirect_uri: METADATA.redirectURI,
      code_verifier: codeVerifier,
    }),
  };

  const body = await fetch(url, payload);
  const response = await body.json();

  setLocalToken(response.access_token);
  return response.access_token;
}

function cleanURL() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function updateBtns() {
  const signUpBtn = document.querySelector(".sign-up-btn");
  const loginBtn = document.querySelector(".login-btn");
  const signOutBtn = document.querySelector(".sign-out-btn");
  if (getLocalToken()) {
    signUpBtn.style.display = "none";
    loginBtn.style.display = "none";
    signOutBtn.style.display = "block";
    signOutBtn.addEventListener("click", () => {
      deleteLocalToken();
      deleteLocalCodeVerifier();
      window.location.reload();
    });
  } else {
    signUpBtn.style.display = "block";
    loginBtn.style.display = "block";
    signOutBtn.style.display = "none";
    [signUpBtn, loginBtn].forEach((btn) => {
      btn.addEventListener("click", () => {
        authorize();
      });
    });
  }
}

function generateCard(image, title, subtitle, href) {
  return `
    <a class="card" href="${href}" target="_blank">
        <img
            src="${image}"
            alt="peaceful piano"
            srcset=""
        />
        <span class="mdi mdi-play mdi-36px"></span>
        <div class="title">${title}</div>
        <div class="subtitle">${subtitle}</div>
    </a>
    `;
}

async function fetchUserTopItems() {
  try {
    var endpoint = "https://api.spotify.com/v1/me/top/tracks";
    var response = await fetch(endpoint + "?limit=6", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getLocalToken()}`,
      },
    });
    var data = await response.json();
    console.log("User top items", data);
    displayUserTopItems(data); // Display user top items
  } catch (error) {
    alert("Something went wrong.");
    console.log(error);
  }
}

async function fetchNewReleases() {
  try {
    var endpoint = "https://api.spotify.com/v1/browse/new-releases";
    var response = await fetch(endpoint + "?limit=6", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getLocalToken()}`,
      },
    });
    var data = await response.json();
    console.log("New releases", data);
    displayNewReleases(data); // Display new releases
  } catch (error) {
    alert("Something went wrong.");
    console.log(error);
  }
}

async function fetchFeaturedPlaylists() {
  try {
    var endpoint = "https://api.spotify.com/v1/browse/featured-playlists";
    var response = await fetch(endpoint + "?limit=6", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getLocalToken()}`,
      },
    });
    var data = await response.json();
    console.log("Featured playlists", data);
    displayFeaturedPlaylists(data); // Display featured playlists
  } catch (error) {
    alert("Something went wrong.");
    console.log(error);
  }
}

function displayUserTopItems(data) {
  var section = document.querySelector("#your-top-items");
  var sectionTitle = section.querySelector(".title");
  var sectionSubtitle = section.querySelector(".subtitle");
  var sectionWrapper = section.querySelector(".card-wrapper");
  sectionTitle.textContent = "Your Top Items";
  sectionSubtitle.textContent = "Based on your recent listening";

  if (!data.items.length) {
    sectionWrapper.innerHTML =
      "<h1> Uh oh! Looks like you haven't listened to anything recently. Go listen to some music on <a href='https://open.spotify.com' target='_blank'>Spotify</a> and come back here!</h1>";
    return;
  }
  for (let i = 0; i < data.items.length; i++) {
    var track = data.items[i];

    var image = track.album.images[1].url;
    var title = track.name;
    var subtitle = track.album.artists[0].name;
    var href = track.album.external_urls.spotify;

    sectionWrapper.innerHTML += generateCard(image, title, subtitle, href);
  }
}

function displayNewReleases(data) {
  var section = document.querySelector("#new-releases");
  var sectionTitle = section.querySelector(".title");
  var sectionSubtitle = section.querySelector(".subtitle");
  var sectionWrapper = section.querySelector(".card-wrapper");
  sectionTitle.textContent = "New Releases";
  sectionSubtitle.textContent = "New releases from Spotify";

  if (!data.albums.items.length) {
    sectionWrapper.innerHTML =
      "<h1> Uh oh! Looks like there aren't any new releases right now. Try again later!</h1>";
    return;
  }

  for (let i = 0; i < data.albums.items.length; i++) {
    var track = data.albums.items[i];

    var image = track.images[1].url;
    var title = track.name;
    var subtitle = track.artists[0].name;
    var href = track.external_urls.spotify;

    sectionWrapper.innerHTML += generateCard(image, title, subtitle, href);
  }
}

function displayFeaturedPlaylists(data) {
  var section = document.querySelector("#featured-playlists");
  var sectionTitle = section.querySelector(".title");
  var sectionSubtitle = section.querySelector(".subtitle");
  var sectionWrapper = section.querySelector(".card-wrapper");
  sectionTitle.textContent = "Featured Playlists";
  sectionSubtitle.textContent = "Featured playlists from Spotify";

  if (!data.playlists.items.length) {
    sectionWrapper.innerHTML =
      "<h1> Uh oh! Looks like there aren't any featured playlists right now. Try again later!</h1>";
    return;
  }

  for (let i = 0; i < data.playlists.items.length; i++) {
    var track = data.playlists.items[i];

    var image = track.images[0].url;
    var title = track.name;
    var subtitle = track.description;
    var href = track.external_urls.spotify;

    // Escape links in subtitle
    subtitle = subtitle.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    sectionWrapper.innerHTML += generateCard(image, title, subtitle, href);
  }
}

window.addEventListener("load", async () => {
  const profile = await getProfile();
  const code = extractCodeFromURL();
  if (!profile && !code) {
    authorize();
    // return updateBtns();
  }

  if (code) {
    await getToken(code);
  }

  updateBtns();
  cleanURL();
  fetchUserTopItems();
  fetchNewReleases();
});
