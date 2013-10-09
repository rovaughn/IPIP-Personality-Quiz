<?php

$STYLESHEETS = array(
  'main.css'
);

$SCRIPTS = array();
$TITLE = null;

function title ($title) {
  global $TITLE;
  $TITLE = $title;
}

function head () {
  global $STYLESHEETS;
  global $TITLE;
  echo '<!DOCTYPE html>';
  echo '<html>';
  echo '<head>';
  echo '<title>', $TITLE, '</title>';
  foreach ($STYLESHEETS as $sheet) {
    echo '<link rel="stylesheet" href="', $sheet, '">';
  }
  echo '</head>';
  echo '<body>';
}

function foot () {
  global $SCRIPTS;
  foreach ($SCRIPTS as $script) {
    echo '<script src="', $script, '"></script>';
  }
  echo '</body>';
  echo '</html>';
}
