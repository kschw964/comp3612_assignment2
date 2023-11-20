/* url of song api --- https versions hopefully a little later this semester */
const api =
  "http://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php";

/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/

document.addEventListener("DOMContentLoaded", () => {
  const storedSongs = JSON.parse(localStorage.getItem("songList"));
  if (!storedSongs) {
    fetch(api)
      .then((response) => response.json())
      .then((data) => {
        localStorage.setItem("songList", JSON.stringify(data));
        // call methods that need the songList using data as argument
        populateHomeScreen(data);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // call methods that need the songList using the storedSongs variable
    populateHomeScreen(storedSongs);
  }

  addPopupFunctionality();
  addNavClickListeners();
});

// add EventListener to show Credits-Popup and hide it again after 5 seconds
function addPopupFunctionality() {
  document.querySelector("#creditsButton").addEventListener("mouseover", () => {
    const popupClasses = document.querySelector("#creditsPopup").classList;
    popupClasses.remove("hidden");
    setTimeout(() => {
      popupClasses.add("hidden");
    }, 5000);
  });
}

function addNavClickListeners() {
  document
    .querySelector("nav button#searchButton")
    .addEventListener("click", (e) => {
      document.querySelector("main#home").classList.add("hidden");
      document.querySelector("main#search").classList.remove("hidden");
      document.querySelector("main#playlist").classList.add("hidden");
      document.querySelector("main#song").classList.add("hidden");
    });
  document
    .querySelector("nav button#playlistButton")
    .addEventListener("click", (e) => {
      document.querySelector("main#home").classList.add("hidden");
      document.querySelector("main#search").classList.add("hidden");
      document.querySelector("main#playlist").classList.remove("hidden");
      document.querySelector("main#song").classList.add("hidden");
    });
  document.querySelector("header img").addEventListener("click", (e) => {
    document.querySelector("main#home").classList.remove("hidden");
    document.querySelector("main#search").classList.add("hidden");
    document.querySelector("main#playlist").classList.add("hidden");
    document.querySelector("main#song").classList.add("hidden");
  });
}

function populateHomeScreen(songList) {
  populateGenreList(songList);
  populateArtistList(songList);
  populateSongList(songList);
}

function populateGenreList(songList) {
  // figure out amount of songs that belong to a genre
  const count = new Map();
  for (const song of songList) {
    if (count.has(song.genre.id)) {
      count.set(song.genre.id, count.get(song.genre.id) + 1);
    } else {
      count.set(song.genre.id, 1);
    }
  }

  // sort the map by converting it to an array
  const sortedGenres = [...count].sort((one, other) => other[1] - one[1]);

  const popularGenreUl = document.querySelector(
    "main#home section:first-of-type ul"
  );

  for (let i = 0; i < 10; i++) {
    const li = document.createElement("li");
    li.appendChild(
      document.createTextNode(
        songList.find((element) => element.genre.id == sortedGenres[i][0]).genre
          .name
      )
    );
    popularGenreUl.appendChild(li);
  }
}

function populateArtistList(songList) {
  // figure out the number of songs an artists has
  const count = new Map();
  for (const song of songList) {
    if (count.has(song.artist.id)) {
      count.get(song.artist.id).count += 1;
    } else {
      count.set(song.artist.id, { name: song.artist.name, count: 1 });
    }
  }

  // sort the map by converting it to an array
  const sortedArtists = [...count.values()].sort(
    (one, other) => other.count - one.count
  );

  const popularArtistsUl = document.querySelector(
    "main#home section:nth-of-type(2) ul"
  );

  for (let i = 0; i < 10; i++) {
    const li = document.createElement("li");
    li.appendChild(document.createTextNode(sortedArtists[i].name));
    popularArtistsUl.appendChild(li);
  }
}

function populateSongList(songList) {
  // sort songs by popularity
  const sorted = songList.sort(
    (one, other) => other.details.populatiry - one.details.populatiry
  );

  const popularSongsUl = document.querySelector(
    "main#home section:last-of-type ul"
  );

  for (let i = 0; i < 10; i++) {
    const li = document.createElement("li");
    li.appendChild(document.createTextNode(sorted[i].title));
    popularSongsUl.appendChild(li);
  }
}
