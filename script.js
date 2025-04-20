var TOKEN = ""; // The token. Will be updated later.
var client_id = "0664bb72e5bd453fb77af312c44b8137"; // Your client ID
var client_secret = "d8b50548e0994fa3aa5b1f85fb9b499a";
var redirect_uri = "http://127.0.0.1:5500"; // The deployment URL
var scope = "user-read-private user-read-email user-top-read"; // A space separated scopes.
function authorize() {
  var url = "https://accounts.spotify.com/authorize";
  url += "?response_type=code";
  url += "&client_id=" + encodeURIComponent(client_id);
  url += "&scope=" + encodeURIComponent(scope);
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  window.open(url, "_self");
}

async function extractCodeAndExchangeForToken() {
  var url = window.location.href;
  var chunks = url.split("?");
  var params = chunks[1];
  var pairs = params?.split("&") || [];
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split("=");
    if (pair[0] === "code") {
      var code = pair[1];
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + btoa(client_id + ":" + client_secret),
        },
        body: new URLSearchParams({
          code: code,
          redirect_uri: redirect_uri,
          grant_type: "authorization_code",
        }),
      });
      var data = await response.json();
      return data.access_token;
    }
  }

  return null; // Return null if there's no token
}

function cleanURL() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function updateBtns() {
  const signUpBtn = document.querySelector(".sign-up-btn");
  const loginBtn = document.querySelector(".login-btn");
  const signOutBtn = document.querySelector(".sign-out-btn");
  if (TOKEN) {
    signUpBtn.style.display = "none";
    loginBtn.style.display = "none";
    signOutBtn.style.display = "block";
    signOutBtn.addEventListener("click", () => {
      window.open("https://accounts.spotify.com/logout", "_blank");
      cleanURL();
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
        Authorization: "Bearer " + TOKEN,
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
        Authorization: "Bearer " + TOKEN,
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
        Authorization: "Bearer " + TOKEN,
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
  TOKEN = await extractCodeAndExchangeForToken();
  updateBtns();
  if (TOKEN) {
    console.log("Token", TOKEN);
    // fetch the endpoints
    fetchUserTopItems();
    fetchNewReleases();
    // fetchFeaturedPlaylists(); // Deprecated from Spotify API
  } else {
    authorize(); // Redirect to Spotify login page
  }
});
