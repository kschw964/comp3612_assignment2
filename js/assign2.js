/* url of song api --- https versions hopefully a little later this semester */
const api =
  "http://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php";

/* note: you may get a CORS error if you try fetching this locally (i.e., directly from a
   local file). To work correctly, this needs to be tested on a local web server.  
   Some possibilities: if using Visual Code, use Live Server extension; if Brackets,
   use built-in Live Preview.
*/
const songs = JSON.parse(localStorage.getItem("songList"));
if (!songs) {
  fetch(api)
    .then((response) => response.json())
    .then((data) => {
      localStorage.setItem("songList", JSON.stringify(data));
      // call method that needs the songList using data as argument
    })
    .catch((error) => {
      console.error(error);
    });
} else {
  // call method that needs the songList using the songs variable
}
