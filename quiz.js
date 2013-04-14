var NUM_QUESTIONS      = QUESTION_SET.length
  , QUESTIONS          = null
  , elem_question      = $('#question')
  , elem_completed     = $('#completed')
  , elem_facets        = $('#result-facets')
  , elem_words         = $('#result-words')
  , CURRENT_QUESTION   = 0
  , SCORES             = {}
  , QUESTION_ORDER     = []
  , PREVIOUS_QUESTIONS = [];

function shuffle (a) {
  for (var j, x, i = a.length; i; j = parseInt(Math.random() * i), x = a[--i], a[i] = a[j], a[j] = x);
  return a;
}

function askQuestion () {
  elem_completed.text(CURRENT_QUESTION);
  
  if (CURRENT_QUESTION >= NUM_QUESTIONS) {
    elem_question.text('THE QUIZ HAS COMPLETED.');
    return;
  }
  
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
  
  PREVIOUS_QUESTIONS.push([aspect, facet]);
  
  CURRENT_QUESTION += 1;
  
  askQuestion();
}

function undoAnswer () {
  var previousQuestion = PREVIOUS_QUESTIONS.pop();
  
  if (previousQuestion) {
    var previousAspect = previousQuestion[0]
      , previousFacet  = previousQuestion[1];
    
    SCORES[previousAspect].pop();
    SCORES[previousFacet].pop();
    
    buildResults();
    
    CURRENT_QUESTION -= 1;
    
    askQuestion();
  }
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
  
  $('#all-results').toggle();
  
  QUESTIONS = QUESTION_SET.slice(0);
  
  shuffle(QUESTIONS);
  
  for (var i = 0; i < QUESTIONS.length; ++i) {
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
  
  for (var i = 0; i < QUESTIONS.length; ++i) {
    QUESTION_ORDER.push(+QUESTIONS[i].index);
  }
  
  CURRENT_QUESTION = 0;
  buildResults();
  askQuestion();
}

function beginFrom (datastr) {
  var data             = JSON.parse(datastr)
    , question_order   = data.question_order
    , scores           = data.scores
    , current_question = data.current_question;
  
  QUESTIONS = [];
  
  for (var i = 0; i < question_order.length; ++i) {
    QUESTIONS.push(QUESTION_SET[question_order[i]]);
  }
  
  SCORES           = scores;
  CURRENT_QUESTION = current_question;
  QUESTION_ORDER   = question_order;
  
  buildResults();
  askQuestion();
}

function showProgress () {
  return JSON.stringify({
    question_order: QUESTION_ORDER, scores: SCORES,
    current_question: CURRENT_QUESTION
  });
}

function makeScore (answers) {
  if (answers.length == 0) return 0;
  
  var total = 0
    , count = 0;
  
  for (var i = 0; i < answers.length; ++i) {
    total += answers[i];
    count += 1;
  }
  
  return (total / count);
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
    , words     = []
    , odd       = true;
  
  for (var i = 0; i < facets.length; ++i) {
    var facet = facets[i]
      , name  = facet[0]
      , count = facet[1]
      , value = facet[2]
      , shown = Math.round(value * 100);
    
    if (odd) {
      tableHTML += '<tr class="odd-row">';
    } else {
      tableHTML += '<tr>';
    }
    
    odd = !odd;
    
    var shownName = name;
    
    if (name == 'openness' || name == 'conscientousness' || name == 'extraversion' || name == 'agreeableness' || name == 'neuroticism') {
      shownName = '<strong>' + name + '</strong>';
    }
    
    tableHTML += '<td>' + shownName + '</td><td class="num">' + shown + '%</td><td class="faint">based on</td><td class="num">' + count + '</td><td class="faint">questions</td></tr>';
    
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
  var result = 2 * (Math.max(0, (e.pageX - $('#answer').position().left) / 200) - 0.5);
  answerQuestion(result);
});

$('#save-progress').click(function(e){
  $('#progress-box').val(showProgress()).select();
});

$('#load-progress').click(function(e){
  beginFrom($('#progress-box').val());
});

$('#undo-button').click(function(e){
  undoAnswer();
});

$('#results-toggle').click(function(e){
  $('#all-results').toggle();
});

begin();
