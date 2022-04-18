let TOKEN = ""; // Auth token
const client_id = "344cdc5aaf1e48d598aedc7bc81c6e3f"; // Your client ID
const redirect_uri = window.location; // Your Redirect URI - Make sure to set this Redirect URI in your Spotify app settings.
const scope = "user-read-private user-read-email user-top-read"; // A space separated scopes.
function getToken() {
  var url = "https://accounts.spotify.com/authorize";
  url += "?response_type=token";
  url += "&client_id=" + encodeURIComponent(client_id);
  url += "&scope=" + encodeURIComponent(scope);
  url += "&redirect_uri=" + encodeURIComponent(redirect_uri);
  window.open(url, "_self");
}

function extractTokenFromURL() {
  const hash = window.location.hash;
  if (hash && hash.includes("access_token")) {
    const url = hash.replace("#access_token=", "");
    const chunks = url.split("&");
    const token = chunks[0];
    return token;
  }
  return null;
}

function generateCard(image, name, description, href) {
  return `
    <a class="card" href="${href}" target="_blank">
        <img
            src="${image}"
            alt="peaceful piano"
            srcset=""
        />
        <span class="mdi mdi-play mdi-36px"></span>
        <div class="title">${name}</div>
        <div class="subtitle">${description}</div>
    </a>
    `;
}

function displayUserTopItems(data) {
  const sectionTopItems = document.querySelector("#your-top-items");
  const sectionTopItemsTitle = sectionTopItems.querySelector(".title");
  const sectionTopItemsSubtitle = sectionTopItems.querySelector(".subtitle");
  const sectionTopItemsWrapper = sectionTopItems.querySelector(".card-wrapper");
  sectionTopItemsTitle.textContent = "Your Top Items";
  sectionTopItemsSubtitle.textContent = "Based on your recent listening";
  for (let i = 0; i < data.items.length; i++) {
    const track = data.items[i];

    const image = track.album.images[1].url;
    const name = track.name;
    const description = track.album.artists
      .map((artist) => artist.name)
      .join(", ");
    const href = track.album.external_urls.spotify;

    sectionTopItemsWrapper.innerHTML += generateCard(
      image,
      name,
      description,
      href
    );
  }
}

function displayNewReleases(data) {
  const sectionNewReleases = document.querySelector("#new-releases");
  const sectionNewReleasesTitle = sectionNewReleases.querySelector(".title");
  const sectionNewReleasesSubtitle =
    sectionNewReleases.querySelector(".subtitle");
  const sectionNewReleasesWrapper =
    sectionNewReleases.querySelector(".card-wrapper");
  sectionNewReleasesTitle.textContent = "Popular New Releases";
  sectionNewReleasesSubtitle.textContent = "";
  for (let i = 0; i < data.albums.items.length; i++) {
    const track = data.albums.items[i];

    const image = track.images[1].url;
    const name = track.name;
    const description = track.artists.map((artist) => artist.name).join(", ");
    const href = track.external_urls.spotify;

    sectionNewReleasesWrapper.innerHTML += generateCard(
      image,
      name,
      description,
      href
    );
  }
}

function displayFeaturedPlaylists(data) {
  const sectionFeaturedPlaylists = document.querySelector(
    "#featured-playlists"
  );
  const sectionFeaturedPlaylistsTitle =
    sectionFeaturedPlaylists.querySelector(".title");
  const sectionFeaturedPlaylistsSubtitle =
    sectionFeaturedPlaylists.querySelector(".subtitle");
  const sectionFeaturedPlaylistsWrapper =
    sectionFeaturedPlaylists.querySelector(".card-wrapper");
  sectionFeaturedPlaylistsTitle.textContent = data.message;
  sectionFeaturedPlaylistsSubtitle.textContent = "";
  for (let i = 0; i < data.playlists.items.length; i++) {
    const track = data.playlists.items[i];

    const image = track.images[0].url;
    const name = track.name;
    const description = track.description;
    const href = track.external_urls.spotify;

    sectionFeaturedPlaylistsWrapper.innerHTML += generateCard(
      image,
      name,
      description,
      href
    );
  }
}

async function fetchUserTopItems() {
  try {
    const data = await fetch(
      "https://api.spotify.com/v1/me/top/tracks?limit=6",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + TOKEN,
        },
      }
    );
    const json = await data.json();
    displayUserTopItems(json);
  } catch (error) {
    alert("Something went wrong.");
    console.error(error);
  }
}

async function fetchNewReleases() {
  try {
    const data = await fetch(
      "https://api.spotify.com/v1/browse/new-releases?limit=6",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + TOKEN,
        },
      }
    );
    const json = await data.json();
    displayNewReleases(json);
  } catch (error) {
    alert("Something went wrong.");
    console.error(error);
  }
}

async function fetchFeaturedPlaylists() {
  try {
    const data = await fetch(
      "https://api.spotify.com/v1/browse/featured-playlists?limit=6",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + TOKEN,
        },
      }
    );
    const json = await data.json();
    displayFeaturedPlaylists(json);
  } catch (error) {
    alert("Something went wrong.");
    console.error(error);
  }
}

window.addEventListener("load", function () {
  TOKEN = extractTokenFromURL();
  if (TOKEN) {
    fetchUserTopItems();
    fetchNewReleases();
    fetchFeaturedPlaylists();
  } else {
    getToken();
  }
});
