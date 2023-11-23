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
        populateSearchScreen(data);
        FORTESTINGONLY_addRandomSongButton(data);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // call methods that need the songList using the storedSongs variable
    populateHomeScreen(storedSongs);
    populateSearchScreen(storedSongs);
    FORTESTINGONLY_addRandomSongButton(storedSongs);
  }

  addPopupFunctionality();
  addNavClickListeners();
  addfilterEventListeners(storedSongs);
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

function addfilterEventListeners(songList) {
  /* 
CSS code that listens to radioButtons and greys non-selected.
*/
  let titleRadio = document.querySelector("#titleRadio");
  titleRadio.addEventListener("click", () => {
    document.querySelector("#titleTextField").style.opacity = "1";
    document.querySelector("#artistDropdown").style.opacity = "0.5";
    document.querySelector("#genreDropdown").style.opacity = "0.5";
  });
  let artistRadio = document.querySelector("#artistRadio");
  artistRadio.addEventListener("click", () => {
    document.querySelector("#titleTextField").style.opacity = "0.5";
    document.querySelector("#artistDropdown").style.opacity = "1";
    document.querySelector("#genreDropdown").style.opacity = "0.5";
  });
  let genreRadio = document.querySelector("#genreRadio");
  genreRadio.addEventListener("click", () => {
    document.querySelector("#titleTextField").style.opacity = "0.5";
    document.querySelector("#artistDropdown").style.opacity = "0.5";
    document.querySelector("#genreDropdown").style.opacity = "1";
  });

  /* 
clear = radio set to title, text/dropdowns reset, populate with default songList 
*/
  const clearButton = document.querySelector("#clearButton");
  clearButton.addEventListener("click", () => {
    let titleRadio = document.querySelector("#titleRadio");
    titleRadio.checked = true;

    let filterRadioSelected = document.querySelector(
      'input[name="filterMethod"]'
    );
    filterRadioSelected.value = 0;

    const titleTextField = document.querySelector("#titleTextField");
    titleTextField.value = "";

    const artistDropdown = document.querySelector("#artistDropdown");
    artistDropdown.selectedIndex = 0;

    const genreDropdown = document.querySelector("#genreDropdown");
    genreDropdown.selectedIndex = 0;

    const arrangedList = rearrangeList(songList, "title");
    populateBrowseList(arrangedList);
  });

  /* 
via radio buttons, calls populateList with given type and target, when filter button hit 
*/
  const filterButton = document.querySelector("#filterButton");
  filterButton.addEventListener("click", () => {
    let filterRadioSelected = document.querySelector(
      'input[name="filterMethod"]:checked'
    ).value;

    if (filterRadioSelected == "title") {
      const titleUserInput = document.querySelector("#titleTextField").value;
      const newSongList = filterList(songList, "title", titleUserInput);
      const arrangedList = rearrangeList(newSongList, "title");
      populateBrowseList(arrangedList);
    } else if (filterRadioSelected == "artist") {
      const artistUserInput = document.querySelector("#artistDropdown").value;
      const newSongList = filterList(songList, "artist", artistUserInput);
      const arrangedList = rearrangeList(newSongList, "artist");
      populateBrowseList(arrangedList);
    } else {
      //genre
      const genreUserInput = document.querySelector("#genreDropdown").value;
      const newSongList = filterList(songList, "genre", genreUserInput);
      const arrangedList = rearrangeList(newSongList, "genre");
      populateBrowseList(arrangedList);
    }
  });

  // add to playlist button for each li
  const browseList = document.querySelector("#browseList");
  browseList.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
      const songID = e.target.id;
    }
  });
}

function populateSearchScreen(songList) {
  // add all artists and genres to the dropdown menus, grey
  genres = fetchGenres();
  artists = fetchArtists();
  // grey non selected radio buttons
  document.querySelector("#artistDropdown").style.opacity = "0.5";
  document.querySelector("#genreDropdown").style.opacity = "0.5";
  // inittialy arrange alpabetically by title
  const arrangedList = rearrangeList(songList, "title");
  populateBrowseList(arrangedList);
}

/* 
used on search page to retrieve and populate filter dropdown options 
*/
function fetchArtists() {
  genres = [];
  fetch("./json/artists.json")
    .then((response) => response.json())
    .then((artists) => {
      populateArtistsOptions(artists);
    })
    .catch((error) => {
      console.error("Error fetching artists", error);
    });
}
/* 
for fetchArtists 
*/
function populateArtistsOptions(artists) {
  const artistDropdown = document.querySelector("#artistDropdown");

  for (const arts of artists) {
    const newOpt = document.createElement("option");
    newOpt.setAttribute("value", arts.name);
    newOpt.innerHTML = arts.name;
    artistDropdown.appendChild(newOpt);
  }
}

/* 
used on search page to retrieve and populate  filter dropdown options 
*/
function fetchGenres() {
  genres = [];
  fetch("./json/genres.json")
    .then((response) => response.json())
    .then((genres) => {
      populateGenresOptions(genres);
    })
    .catch((error) => {
      console.error("Error fetching genres", error);
    });
}
/* 
for fetchGenres 
*/
function populateGenresOptions(genres) {
  const genreDropdown = document.querySelector("#genreDropdown");

  for (const gnrs of genres) {
    const newOpt = document.createElement("option");
    newOpt.setAttribute("value", gnrs.name);
    newOpt.innerHTML = gnrs.name;
    genreDropdown.appendChild(newOpt);
  }
}

/*
 fills list of songs for search/browse page
*/
function populateBrowseList(songList) {
  const browseList = document.querySelector("#browseList");
  browseList.innerHTML = "";
  for (const songs of songList) {
    const newLi = document.createElement("li");

    const songName = document.createElement("div");
    songName.setAttribute("class", "songName");
    songName.innerHTML = songs.title;
    newLi.appendChild(songName);

    const artistName = document.createElement("div");
    artistName.setAttribute("class", "artistName");
    artistName.innerHTML = songs.artist.name;
    newLi.appendChild(artistName);

    const songYear = document.createElement("div");
    songYear.setAttribute("class", "songYear");
    songYear.innerHTML = songs.year;
    newLi.appendChild(songYear);

    const genreName = document.createElement("div");
    genreName.setAttribute("class", "genreName");
    genreName.innerHTML = songs.genre.name;
    newLi.appendChild(genreName);

    const addButton = document.createElement("button");
    addButton.innerHTML = "Add to Playlist";
    addButton.setAttribute("id", songs.song_id);
    newLi.appendChild(addButton);

    browseList.appendChild(newLi);
  }
}

/* rearrangeList
  Arguments:
  songList: a list of songs (not necessarily master list)
  orderByType: specifies what to filter by (title/artist/year/genre)

  Returns:
  newOrderedList: new array of song objects that are now ordered

  Means: depending on if genre/title/artist or year, a different sort function is called.
  If its genre/title/artist, then .sort is called to make new alphabetical array.
  If its year, then a custom .sort is called. 
*/
function rearrangeList(songList, orderByType) {
  // Deep copy using JSON methods
  const newList = JSON.parse(JSON.stringify(songList));

  if (orderByType == "year") {
    newList.sort((a, b) => {
      if (a.year < b.year) {
        return 1;
      }
      if (a.year > b.year) {
        return -1;
      }
      return 0;
    });
  } else if (orderByType == "title") {
    newList.sort((a, b) => {
      if (a.title < b.title) {
        return -1;
      }
      if (a.title > b.title) {
        return 1;
      }
      return 0;
    });
  } else if (orderByType == "artist") {
    newList.sort((a, b) => {
      if (a.artist.name < b.artist.name) {
        return -1;
      }
      if (a.artist.name > b.artist.name) {
        return 1;
      }
      return 0;
    });
  } else {
    //"genre"
    newList.sort((a, b) => {
      if (a.genre.name < b.genre.name) {
        return -1;
      }
      if (a.genre.name > b.genre.name) {
        return 1;
      }
      return 0;
    });
  }
  return newList;
}

/* 
  filterList

  Arguments: 
  songList: master list of all songs
  filterByType: specifies what to filter by (title/genre/artist).
  filterTarget: specifies what target (title/genre/artist).

  Returns: 
  newFilteredList: array of song objects that are a substring

  Means: checks songList indexes if its title/genre/artist contains filterTarget as a substring.
  If true, then adds to newFilteredList.  For genre/artist, it will be a full match, but also technically a substring.
*/
function filterList(songList, filterByType, filterTarget) {
  // loop through all songs
  // if substring, then make deep copy and add to newList
  const newList = [];

  if (filterByType == "title") {
    for (const songs of songList) {
      if (songs.title.includes(filterTarget)) {
        const copiedSong = JSON.parse(JSON.stringify(songs));
        newList.push(copiedSong);
      }
    }
  } else if (filterByType == "genre") {
    for (const songs of songList) {
      if (songs.genre.name.includes(filterTarget)) {
        const copiedSong = JSON.parse(JSON.stringify(songs));
        newList.push(copiedSong);
      }
    }
  } else {
    //"artist"
    for (const songs of songList) {
      if (songs.artist.name.includes(filterTarget)) {
        const copiedSong = JSON.parse(JSON.stringify(songs));
        newList.push(copiedSong);
      }
    }
  }

  return newList;
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
    (one, other) => other.details.popularity - one.details.popularity
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
