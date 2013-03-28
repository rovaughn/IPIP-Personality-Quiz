var NUM_QUESTIONS    = QUESTIONS.length
  , elem_question    = document.getElementById('question')
  , elem_completed   = document.getElementById('completed')
  , elem_facets      = document.getElementById('result-facets')
  , elem_words       = document.getElementById('result-words')
  , CURRENT_QUESTION = 0
  , SCORES           = {};

function shuffle (a) {
  for (var j, x, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
  return a;
}

function askQuestion () {
  elem_completed.innerText = CURRENT_QUESTION;
  
  if (CURRENT_QUESTION >= NUM_QUESTIONS) return;
  
  elem_question.innerText = QUESTIONS[CURRENT_QUESTION].question;
}

function answerQuestion (answer) {
  if (CURRENT_QUESTION >= NUM_QUESTIONS) return;
  
  var question = QUESTIONS[CURRENT_QUESTION]
    , alpha    = question.alpha
    , facet    = question.facet
    , aspect   = question.aspect
    , inverted = question.inverted;
  
  if (inverted) answer = -answer;
  
  SCORES[facet].push(answer);
  SCORES[aspect].push(answer * alpha);
  
  buildResults();
  
  CURRENT_QUESTION += 1;
  
  askQuestion();
}

function begin () {
  shuffle(QUESTIONS);
  
  for (var i = 0; i < NUM_QUESTIONS; ++i) {
    var question = QUESTIONS[i]
      , facet    = question.facet
      , aspect   = question.aspect;
    
    if (!SCORES[facet])  SCORES[facet]  = [];
    if (!SCORES[aspect]) SCORES[aspect] = [];
  }
  
  CURRENT_QUESTION = 0;
  askQuestion();
}

function makeScore (answers) {
  if (answers.length == 0) return 0;
  
  var total = 0
    , count = 0;
  
  for (var i = 0; i < answers.length; ++i) {
    total += answers[i];
    count += 1;
  }
  
  return (total / count) * confidence(count);
}

var Z  = 1.96
  , Z2 = Z*Z;

function confidence (n) {
  if (n == 0) return 0;
  
  return (1 + Z2/(2*n) - Z*Math.sqrt(Z2/(4*n*n))) / (1 + Z2/n);
}

function buildResults () {
  var facets = [];
  
  for (var k in SCORES) {
    var scores = SCORES[k]
      , count  = scores.length
      , score  = makeScore(scores);
    
    facets.push([k, count, score]);
  }
  
  facets.sort(function(a,b){return Math.abs(b[2]) - Math.abs(a[2]);});
  
  var tableHTML = ''
    , words     = [];
  
  for (var i = 0; i < facets.length; ++i) {
    var facet = facets[i]
      , name  = facet[0]
      , count = facet[1]
      , value = facet[2]
      , shown = Math.round(value * 100);
    
    tableHTML += '<tr><td>' + name + '</td><td class="num">' + shown + '%</td><td class="faint">based on</td><td class="num">' + count + '</td><td class="faint">questions</td></tr>';
    
    if (value >= 0.175) {
      words.push(WORDS[name]['hi']);
    } else if (value <= -0.175) {
      words.push(WORDS[name]['lo']);
    }
  }
  
  elem_facets.innerHTML = tableHTML;
  elem_words.innerText  = words.join(', ');
}

document.getElementById('answer').onclick = function(e){
  answerQuestion((e.x - 100) / 100);
};

begin();
