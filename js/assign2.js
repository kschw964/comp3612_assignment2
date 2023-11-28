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
        addfilterEventListeners(data);
        FORTESTINGONLY_addRandomSongButton(data);
      })
      .catch((error) => {
        console.error(error);
      });
  } else {
    // call methods that need the songList using the storedSongs variable
    populateHomeScreen(storedSongs);
    populateSearchScreen(storedSongs);
    addfilterEventListeners(storedSongs);
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
      showScreen("search");
    });
  document
    .querySelector("nav button#playlistButton")
    .addEventListener("click", (e) => {
      showScreen("playlist");
    });
  document.querySelector("header img").addEventListener("click", (e) => {
    showScreen("home");
  });
}

function addfilterEventListeners(songList) {
  /* 
listens to radioButtons and greys non-selected.
*/
  let titleRadio = document.querySelector("#titleRadio");
  titleRadio.addEventListener("click", highlightTitleField);
  let artistRadio = document.querySelector("#artistRadio");
  artistRadio.addEventListener("click", highlightArtistField);
  let genreRadio = document.querySelector("#genreRadio");
  genreRadio.addEventListener("click", highlightGenreField);

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

    highlightTitleField();
    selectSortingButton("#orderTitle");

    const arrangedList = rearrangeList(songList, "title");
    populateBrowseList(arrangedList);
  });

  /* 
via radio buttons, calls populateList with given type and target, when filter button hit 
arranges them alphabetically per given category
*/
  const filterButton = document.querySelector("#filterButton");
  filterButton.addEventListener("click", () => {
    const currList = getCurrentFilteredList(songList);
    populateBrowseList(currList);
  });

  addSortButtonListeners(songList);

  /* 
listener for the name part of list item of song, then grabs the div ID which was set to the song ID.
Switch to song screen, pass the song ID to a new function that populates the song page.  
*/
  const browseSearchList = document.querySelector("#browseList");
  browseSearchList.addEventListener("click", function (e) {
    if (e.target.classList == "songName") {
      const songID = e.target.dataset.songId;
      showSingleSongView(songID);
    }
  });

  // 'add to playlist button' for each li
  const browseList = document.querySelector("#browseList");
  browseList.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON") {
      const songID = e.target.dataset.songId;
      addSongToPlaylist(songID);

      //song added to playlist popup
      const addedPopUp = document.querySelector(".addedPopUp");
      addedPopUp.classList.add("show");
      setTimeout(() => {
        addedPopUp.classList.remove("show");
      }, 5000);
    }
    //listener for the name part of list item of song, then grabs the div ID which was set to the song ID.
    //Switch to song screen, pass the song ID to a new function that populates the song page.
    if (e.target.classList.contains("songName")) {
      const songID = e.target.dataset.songId;
      showSingleSongView(songID);
    }

    if (e.target.classList.contains("elips")) {
      const songPopUp = document.createElement("div");
      songPopUp.innerHTML = e.target.dataset.fullSongName;
      songPopUp.classList.add("songPopUp");
      e.target.appendChild(songPopUp);
      setTimeout(() => {
        e.target.removeChild(songPopUp);
      }, 3000);
    }
  });
}

function addSortButtonListeners(songList) {
  /*
  reorders browelist when reorder buttons are clicked
  */
  const orderTitle = document.querySelector("#orderTitle");
  orderTitle.addEventListener("click", function (e) {
    reorderBrowseList(songList, "title");
    selectSortingButton("#orderTitle");
  });
  const orderArtist = document.querySelector("#orderArtist");
  orderArtist.addEventListener("click", function (e) {
    reorderBrowseList(songList, "artist");
    selectSortingButton("#orderArtist");
  });
  const orderYear = document.querySelector("#orderYear");
  orderYear.addEventListener("click", function (e) {
    reorderBrowseList(songList, "year");
    selectSortingButton("#orderYear");
  });
  const orderGenre = document.querySelector("#orderGenre");
  orderGenre.addEventListener("click", function (e) {
    reorderBrowseList(songList, "genre");
    selectSortingButton("#orderGenre");
  });
  const orderPopularity = document.querySelector("#orderPopularity");
  orderPopularity.addEventListener("click", function (e) {
    reorderBrowseList(songList, "popularity");
    selectSortingButton("#orderPopularity");
  });
}

function reorderBrowseList(songList, orderByType) {
  const currList = getCurrentFilteredList(songList);
  const arrangedList = rearrangeList(currList, orderByType);
  populateBrowseList(arrangedList);
}

function selectSortingButton(css_selector) {
  if (document.querySelector(css_selector)) {
    // remove class from all buttons
    document.querySelector("#orderTitle").classList.remove("buttonSelected");
    document.querySelector("#orderArtist").classList.remove("buttonSelected");
    document.querySelector("#orderYear").classList.remove("buttonSelected");
    document.querySelector("#orderGenre").classList.remove("buttonSelected");
    document
      .querySelector("#orderPopularity")
      .classList.remove("buttonSelected");
    // re-add the class to the selected one
    document.querySelector(css_selector).classList.add("buttonSelected");
  }
}

function highlightTitleField() {
  document.querySelector("#titleTextField").style.opacity = "1";
  document.querySelector("#artistDropdown").style.opacity = "0.5";
  document.querySelector("#genreDropdown").style.opacity = "0.5";
}

function highlightArtistField() {
  document.querySelector("#titleTextField").style.opacity = "0.5";
  document.querySelector("#artistDropdown").style.opacity = "1";
  document.querySelector("#genreDropdown").style.opacity = "0.5";
}

function highlightGenreField() {
  document.querySelector("#titleTextField").style.opacity = "0.5";
  document.querySelector("#artistDropdown").style.opacity = "0.5";
  document.querySelector("#genreDropdown").style.opacity = "1";
}

/*
returns array of song objects based on current filters
*/
function getCurrentFilteredList(songList) {
  let filterRadioSelected = document.querySelector(
    'input[name="filterMethod"]:checked'
  ).value;

  if (filterRadioSelected == "title") {
    const titleUserInput = document.querySelector("#titleTextField").value;
    const newSongList = filterList(songList, "title", titleUserInput);
    const arrangedList = rearrangeList(newSongList, "title");
    return arrangedList;
  } else if (filterRadioSelected == "artist") {
    const artistUserInput = document.querySelector("#artistDropdown").value;
    const newSongList = filterList(songList, "artist", artistUserInput);
    const arrangedList = rearrangeList(newSongList, "artist");
    return arrangedList;
  } else {
    //genre
    const genreUserInput = document.querySelector("#genreDropdown").value;
    const newSongList = filterList(songList, "genre", genreUserInput);
    const arrangedList = rearrangeList(newSongList, "genre");
    return arrangedList;
  }
}

/* 
Launches browse/search page in a pre-filtered state, according the the filterByType and filterTarget
filterByType should be artist or genre.  Do not call this with "title" for the second argument.
Do not give it an argument (genre or artist) that does not exist within the JSONs.
It actually works by changing which filters are selected and then automatically 'hitting' the filter button. 
Arguments:
  filterByType: string that is either "genre" or "artist"
  filterTarget: the name of the artist or genre
*/
function launchBrowseWithFilter(songList, filterByType, filterTarget) {
  const newSongList = filterList(songList, filterByType, filterTarget);
  const arrangedList = rearrangeList(newSongList, "title");

  resetFilterFields();

  if (filterByType == "artist") {
    document.querySelector("#artistRadio").checked = true;
    highlightArtistField();
    // Find the option and select it for the dropdown
    const artistDropdown = document.querySelector("#artistDropdown");
    artistDropdown.selectedIndex = indexOfOption(
      artistDropdown.options,
      filterTarget
    );
  } else {
    document.querySelector("#genreRadio").checked = true;
    highlightGenreField();
    // Find the option and select it for the dropdown
    const genreDropdown = document.querySelector("#genreDropdown");
    genreDropdown.selectedIndex = indexOfOption(
      genreDropdown.options,
      filterTarget
    );
  }
  populateBrowseList(arrangedList);
  selectSortingButton("#orderTitle");
  showScreen("search");
}

function indexOfOption(collection, value) {
  let optionIndex = 0;
  for (let i = 0; i < collection.length; i++) {
    if (collection[i].value == value) {
      optionIndex = i;
      break;
    }
  }
  return optionIndex;
}

function resetFilterFields() {
  document.querySelector("#titleTextField").value = "";
  document.querySelector("#artistDropdown").selectedIndex = 0;
  document.querySelector("#genreDropdown").selectedIndex = 0;
}

function populateSearchScreen(songList) {
  // add all artists and genres to the dropdown menus, grey
  fetchGenres();
  fetchArtists();
  // grey non selected radio buttons
  highlightTitleField();
  // inittialy arrange alpabetically by title
  const arrangedList = rearrangeList(songList, "title");
  populateBrowseList(arrangedList);
}

function showScreen(name) {
  // hide all screens
  document.querySelector("main#home").style.display = "none";
  document.querySelector("main#search").style.display = "none";
  document.querySelector("main#playlist").style.display = "none";
  document.querySelector("main#song").style.display = "none";

  // show the wanted one
  document.querySelector("main#" + name).style.display = "grid";
}

function showSingleSongView(songID) {
  populateSongViewScreen(songID, JSON.parse(localStorage.getItem("songList")));
  showScreen("song");
}

function populateSongViewScreen(songID, songList) {
  fetch("./json/artists.json")
    .then((response) => response.json())
    .then((artists) => {
      const foundSong = songList.find((currSong) => currSong.song_id == songID);

      const foundArtist = artists.find(
        (currArtist) => currArtist.id == foundSong.artist.id
      );

      // clear Song Info List, then populate it again
      const songInfoList = document.querySelector("#songInfoList");
      songInfoList.innerHTML = "";
      songInfoList.append(
        createTextListItem(`Title: ${foundSong.title}`),
        createTextListItem(`Artist: ${foundSong.artist.name}`),
        createTextListItem(`Artist Type: ${foundArtist.type}`),
        createTextListItem(`Genre: ${foundSong.genre.name}`),
        createTextListItem(`Year: ${foundSong.year}`)
      );

      const minutes = Math.floor(foundSong.details.duration / 60);
      const remainingSeconds = foundSong.details.duration % 60;
      const formattedSeconds = String(remainingSeconds).padStart(2, "0");
      const convertedDuration = `${minutes}:${formattedSeconds}`;
      songInfoList.appendChild(
        createTextListItem(`Duration: ${convertedDuration}`)
      );

      // clear Analysis Data List, then populate it again
      const songAnalysisList = document.querySelector("#songAnalysisList");
      songAnalysisList.innerHTML = "";
      songAnalysisList.append(
        createTextListItem(`BPM: ${foundSong.details.bpm}`),
        createTextListItem(`Popularity: ${foundSong.details.popularity}`),
        createTextListItem(`Loudness: ${foundSong.details.loudness}`),
        createTextListItem(`Energy: ${foundSong.analytics.energy}`),
        createTextListItem(`Danceability: ${foundSong.analytics.danceability}`),
        createTextListItem(`Liveness: ${foundSong.analytics.liveness}`),
        createTextListItem(`Valence: ${foundSong.analytics.valence}`),
        createTextListItem(`Acousticness: ${foundSong.analytics.acousticness}`),
        createTextListItem(`Speechiness: ${foundSong.analytics.speechiness}`)
      );

      // clear Radar-Chart, then populate it again
      const radarChart = document.querySelector("#radarChart");
      radarChart.innerHTML = "";
      new Chart(radarChart, {
        type: "radar",
        data: {
          labels: [
            "Danceability",
            "Energy",
            "Speechiness",
            "Acousticness",
            "Liveness",
            "Valence",
          ],
          datasets: [
            {
              label: "",
              data: [
                foundSong.analytics.danceability,
                foundSong.analytics.energy,
                foundSong.analytics.speechiness,
                foundSong.analytics.acousticness,
                foundSong.analytics.liveness,
                foundSong.analytics.valence,
              ],
              borderWidth: 1,
              lineTension: 0.5,
            },
          ],
        },
        options: {
          scales: {
            r: {
              grid: {
                circular: true,
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    })
    .catch((error) => {
      console.error("Error fetching artists", error);
    });
}

/* 
used on search page to retrieve and populate filter dropdown options 
*/
function fetchArtists() {
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

  for (const artist of artists) {
    const newOpt = document.createElement("option");
    newOpt.setAttribute("value", artist.name);
    newOpt.innerHTML = artist.name;
    artistDropdown.appendChild(newOpt);
  }
}

/* 
used on search page to retrieve and populate  filter dropdown options 
*/
function fetchGenres() {
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

  for (const genre of genres) {
    const newOpt = document.createElement("option");
    newOpt.setAttribute("value", genre.name);
    newOpt.innerHTML = genre.name;
    genreDropdown.appendChild(newOpt);
  }
}

/*
 fills list of songs for search/browse page
 note: adds a button that has an ID that is the songID for that list item
*/
function populateBrowseList(songList) {
  const browseList = document.querySelector("#browseList");
  browseList.innerHTML = "";
  for (const song of songList) {
    const newLi = document.createElement("li");

    const songNameSpan = document.createElement("span");
    songNameSpan.dataset.songId = song.song_id;
    songNameSpan.classList.add("songName");
    if (song.title.length > 25) {
      songNameSpan.innerHTML = song.title.substring(0, 25);
      const elips = document.createElement("span");
      elips.classList.add("elips");
      elips.innerHTML = "&hellip;";
      elips.dataset.fullSongName = song.title;
      songNameSpan.appendChild(elips);
    } else {
      songNameSpan.innerHTML = song.title;
    }

    newLi.append(
      songNameSpan,
      createTextSpanWithClass(song.artist.name, "artistName"),
      createTextSpanWithClass(song.year, "songYear"),
      createTextSpanWithClass(song.genre.name, "genreName"),
      createTextSpanWithClass(song.details.popularity, "popularity")
    );

    const addButton = document.createElement("button");
    addButton.textContent = "+Playlist";
    addButton.dataset.songId = song.song_id;
    addButton.classList.add("addToPlayListButton");
    newLi.appendChild(addButton);

    browseList.appendChild(newLi);
  }
}

function createTextSpanWithClass(text, className) {
  const span = document.createElement("span");
  span.textContent = text;
  span.classList.add(className);
  return span;
}

function createTextListItem(text) {
  const li = document.createElement("li");
  li.textContent = text;
  return li;
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

  switch (orderByType) {
    case "title":
      newList.sort((a, b) => a[orderByType].localeCompare(b[orderByType]));
      break;

    case "genre":
    case "artist":
      newList.sort((a, b) =>
        a[orderByType].name.localeCompare(b[orderByType].name)
      );
      break;

    case "year":
      newList.sort((a, b) => a[orderByType] - b[orderByType]);
      break;

    case "popularity":
      newList.sort((a, b) => a.details[orderByType] - b.details[orderByType]);
      break;
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
  // loop through all songs. if substring, then make deep copy and add to newList
  let newList;

  switch (filterByType) {
    case "title":
      newList = songList.filter((song) => song.title.includes(filterTarget));
      break;

    case "genre":
    case "artist":
      newList = songList.filter((song) =>
        song[filterByType].name.includes(filterTarget)
      );
      break;

    default:
      newList = [];
      console.error("filterList(): Wrong filter-type provided");
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
    const genre = songList.find(
      (element) => element.genre.id == sortedGenres[i][0]
    ).genre;
    li.dataset.genre_id = genre.id;
    li.appendChild(document.createTextNode(genre.name));
    popularGenreUl.appendChild(li);
  }

  popularGenreUl.addEventListener("click", (e) => {
    if (e.target.nodeName == "LI" && e.target.dataset.genre_id) {
      const songs = JSON.parse(localStorage.getItem("songList"));
      const genreName = songs.find(
        (element) => element.genre.id == e.target.dataset.genre_id
      ).genre.name;
      launchBrowseWithFilter(songs, "genre", genreName);
    }
  });
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
  const sortedArtists = [...count].sort(
    (one, other) => other[1].count - one[1].count
  );

  const popularArtistsUl = document.querySelector(
    "main#home section:nth-of-type(2) ul"
  );

  for (let i = 0; i < 10; i++) {
    const li = document.createElement("li");
    const artist = sortedArtists[i];
    li.dataset.artist_id = artist[0];
    li.appendChild(document.createTextNode(artist[1].name));
    popularArtistsUl.appendChild(li);
  }

  popularArtistsUl.addEventListener("click", (e) => {
    if (e.target.nodeName == "LI" && e.target.dataset.artist_id) {
      const songs = JSON.parse(localStorage.getItem("songList"));
      const artistName = songs.find(
        (element) => element.artist.id == e.target.dataset.artist_id
      ).artist.name;
      launchBrowseWithFilter(songs, "artist", artistName);
    }
  });
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
    li.dataset.song_id = sorted[i].song_id;
    li.appendChild(document.createTextNode(sorted[i].title));
    popularSongsUl.appendChild(li);
  }

  popularSongsUl.addEventListener("click", (e) => {
    if (e.target.nodeName == "LI" && e.target.dataset.song_id) {
      showSingleSongView(e.target.dataset.song_id);
    }
  });
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
      } else if (
        e.target.nodeName == "TD" &&
        e.target.parentNode.dataset.song_id
      ) {
        showSingleSongView(e.target.parentNode.dataset.song_id);
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
