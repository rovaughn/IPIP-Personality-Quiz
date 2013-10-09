<!DOCTYPE html>
<html>
<head>
  <title>Indie Fire</title>
  <link rel="stylesheet" href="reset.css">
  <link rel="stylesheet" href="main.css">
</head>
<body>
  <div id="body">
    <div class="column">
      <h1>My Queue</h1>
      <div id="my-queue" class="drop">
        <!-- Empty -->
      </div>
    </div>
    <div class="column">
      <h1>Proposals</h1>
      <div id="proposals" class="drop">
        <div class="card proposal-card" style="background-image:url('test/link-med.jpg');">
        <div class="vertical-bottom">The Legend of Zelda:<br>Three Regents</div>
        </div>
        <div class="card proposal-card" style="background-image:url('test/samus-med.jpg');">
        <div class="vertical-bottom">Metroid Origins</div>
        </div>
        <div class="card proposal-card" style="background-image:url('test/desert-med.jpg');">
        <div class="vertical-bottom">The Desert</div>
        </div>
      </div>
    </div>
    <div class="column">
      <h1>Portfolios</h1>
      <div id="portfolios" class="drop">
        <div class="card portfolio-card" style="background-image:url('test/jared-portfolio.jpg');"></div>
      </div>
    </div>
    <div class="column">
      <h1>Songs</h1>
      <div id="songs" class="drop">
        <div class="card music-card" style="background-image:url('test/mother-earth.jpg');">
          <div class="vertical-bottom">
            Mother Earth
            <audio controls>
              <source src="test/mother-earth-30s.mp3" type="audio/mpeg">
              Your browser does not support audio.
            </audio>
          </div>
        </div>
        <div class="card music-card" style="background-image:url('test/red-blue-sanctuary.png');">
          <div class="vertical-bottom">
            Red Blue Sanctuary
            <audio controls>
              <source src="test/red-blue-sanctuary.mp3" type="audio/mpeg">
              Your browser does not support audio.
            </audio>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script src="jquery.js"></script>
  <script src="jquery-ui.js"></script>
  <script>
    $('#my-queue').sortable({
      connectWith: '#proposals, #portfolios, #songs',
    });
    $('#proposals').sortable({
      connectWith: '#my-queue, #portfolios, #songs',
    });
    $('#portfolios').sortable({
      connectWith: '#my-queue, #proposals, #songs',
    });
    $('#songs').sortable({
      connectWith: '#my-queue, #proposals, #portfolios',
    });
  </script>
</body>
</html>