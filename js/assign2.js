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
        FORTESTINGONLY_addRandomSongButton(data);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // call methods that need the songList using the storedSongs variable
    populateHomeScreen(storedSongs);
    FORTESTINGONLY_addRandomSongButton(storedSongs);
  }

  addPopupFunctionality();
  addNavClickListeners();
  populatePlaylist();
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
      document.querySelector("main#home").style.display = "none";
      document.querySelector("main#search").style.display = "grid";
      document.querySelector("main#playlist").style.display = "none";
      document.querySelector("main#song").style.display = "none";
    });
  document
    .querySelector("nav button#playlistButton")
    .addEventListener("click", (e) => {
      document.querySelector("main#home").style.display = "none";
      document.querySelector("main#search").style.display = "none";
      document.querySelector("main#playlist").style.display = "grid";
      document.querySelector("main#song").style.display = "none";
    });
  document.querySelector("header img").addEventListener("click", (e) => {
    document.querySelector("main#home").style.display = "grid";
    document.querySelector("main#search").style.display = "none";
    document.querySelector("main#playlist").style.display = "none";
    document.querySelector("main#song").style.display = "none";
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

function populatePlaylist() {
  // populate Playlist if there is a playlist stored in localStorage
  JSON.parse(localStorage.getItem("playlist"))?.forEach((song) => {
    document
      .querySelector("main#playlist tbody")
      .appendChild(createSongTableRow(song));
  });

  // add ClickListener for the "Clear All" button
  document
    .querySelector("main#playlist section button:first-of-type")
    .addEventListener("click", (e) => {
      clearPlaylist();
    });

  // add event delegation ClickListener for the song remove buttons
  document
    .querySelector("main#playlist tbody")
    .addEventListener("click", (e) => {
      if (e.target.nodeName == "BUTTON" && e.target.dataset.song_id) {
        removeSongFromPlaylist(e.target.dataset.song_id);
      }
    });
}

function addSongToPlaylist(song_id) {
  // add song to playlist in localStorage
  const song = JSON.parse(localStorage.getItem("songList")).find(
    (song) => song.song_id == song_id
  );
  if (song) {
    let playlist = JSON.parse(localStorage.getItem("playlist"));
    if (playlist) {
      playlist.push(song);
    } else {
      playlist = [song];
    }
    localStorage.setItem("playlist", JSON.stringify(playlist));

    // add song to table in DOM
    document
      .querySelector("main#playlist tbody")
      .appendChild(createSongTableRow(song));
  }
}

function removeSongFromPlaylist(song_id) {
  // remove song from playlist in localStorage
  let playlist = JSON.parse(localStorage.getItem("playlist"));
  if (playlist) {
    playlist = playlist.filter((element) => element.song_id != song_id);
    if (playlist.length > 0) {
      localStorage.setItem("playlist", JSON.stringify(playlist));
    } else {
      // if playlist empty delete it from localStorage
      localStorage.removeItem("playlist");
    }

    // remove song from table in DOM
    document
      .querySelector(`main#playlist tbody tr[data-song_id="${song_id}"]`)
      .remove();
  }
}

function clearPlaylist() {
  // remove playlist from localStorage
  localStorage.removeItem("playlist");

  // clear table content in DOM
  document.querySelector("main#playlist tbody").innerHTML = "";
}

function createSongTableRow(song) {
  const tr = document.createElement("tr");
  tr.dataset.song_id = song.song_id;

  // create table-data element with the remove-button inside
  const tdButton = document.createElement("td");
  const button = document.createElement("button");
  button.textContent = "Remove";
  button.dataset.song_id = song.song_id;
  tdButton.appendChild(button);

  tr.append(
    createTextTabelData(song.title),
    createTextTabelData(song.artist.name),
    createTextTabelData(song.year),
    createTextTabelData(song.genre.name),
    createTextTabelData(song.details.popularity),
    tdButton
  );
  return tr;
}

function createTextTabelData(text) {
  const td = document.createElement("td");
  td.textContent = text;
  return td;
}

// TODO: remove once search-view is implemented
function FORTESTINGONLY_addRandomSongButton(songList) {
  const buttonAdd = document.createElement("button");
  buttonAdd.textContent = "Add Random";
  buttonAdd.addEventListener("click", (e) => {
    addSongToPlaylist(
      songList[Math.floor(Math.random() * songList.length)].song_id
    );
  });
  document.querySelector("main#playlist section header").appendChild(buttonAdd);
}
