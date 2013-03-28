var NUM_QUESTIONS    = QUESTIONS.length
  , elem_question    = $('#question')
  , elem_completed   = $('#completed')
  , elem_facets      = $('#result-facets')
  , elem_words       = $('#result-words')
  , CURRENT_QUESTION = 0
  , SCORES           = {};

function shuffle (a) {
  for (var j, x, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
  return a;
}

function askQuestion () {
  elem_completed.text(CURRENT_QUESTION);
  
  if (CURRENT_QUESTION >= NUM_QUESTIONS) return;
  
  elem_question.text(QUESTIONS[CURRENT_QUESTION].question);
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

function arrangeQuestions (questions, facets) {
  var result = []
    , aspects = {openness: false, conscientiousness: false, extraversion: false, agreeableness: false, neuroticism: false}
    , aspectsAnswered = 0;
  
  var answeredHere = 0;
  
  while (questions.length > 0) {
    for (var k in facets) {
      facets[k] = false;
    }
    
    for (var i = 0; i < questions.length; ++i) {
      var question = questions[i];
      
      if (!facets[question.facet] && !aspects[question.aspect]) {
        aspects[question.aspect] = true;
        facets[question.facet] = true;
        result.push(question);
        questions.splice(i, 1);
        i -= 1;
        aspectsAnswered += 1;
      }
      
      if (aspectsAnswered >= 5) {
        for (var k in aspects) {
          aspects[k] = false;
        }
        
        aspectsAnswered = 0;
      }
    }
  }
  
  return result;
}

function begin () {
  var facets = {};
  
  shuffle(QUESTIONS);
  
  for (var i = 0; i < NUM_QUESTIONS; ++i) {
    var question = QUESTIONS[i]
      , facet    = question.facet
      , aspect   = question.aspect;
    
    facets[facet] = false;
    
    if (!SCORES[facet])  SCORES[facet]  = [];
    if (!SCORES[aspect]) SCORES[aspect] = [];
  }
  
  for (var k in WORDS) {
    var words = WORDS[k];
    
    words.lo = words.lo.split(', ');
    words.hi = words.hi.split(', ');
  }
  
  QUESTIONS = arrangeQuestions(QUESTIONS, facets);
  
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

function addWords (words, added) {
  var la = added.length
    , lw = words.length;
  for (var i = 0; i < la; ++i) {
    var present = false
      , add     = added[i];
    
    for (var j = 0; j < lw; ++j) {
      if (words[j] == add) {
        present = true;
        break;
      }
    }
    
    if (!present) words.push(add);
  }
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
      addWords(words, WORDS[name]['hi']);
    } else if (value <= -0.175) {
      addWords(words, WORDS[name]['lo']);
    }
  }
  
  elem_facets.html(tableHTML);
  elem_words.text(words.join(', '));
}

$('#answer').click(function(e){
  console.log('clicked', e.clientX);
  answerQuestion((e.clientX - 100) / 100);
});

begin();