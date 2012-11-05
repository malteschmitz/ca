var filename = location.search.slice(1);
if (filename) {
  d3.text('automata/' + filename, function(text) {
    if (text) {
      loadText(text);
      d3.select('#text').text(text);
    }
  });
}

var step = function() {
  update();
  display();
};

d3.select('#step').on('click', step);

var intervalId;

d3.select('#play').on('click', function() {
  if (intervalId) {
    window.clearInterval(intervalId);
    intervalId = undefined;
    d3.select(this).text('Play');
    d3.selectAll('#step, #load, #interval').attr('disabled',null);
  } else {
    intervalId = window.setInterval(step, +document.getElementById('interval').value);
    d3.select(this).text('Stop');
    d3.selectAll('#step, #load, #interval').attr('disabled','disabled');
  }
});

d3.select('#load').on('click', function() {
  loadText(document.getElementById('text').value);
});

var loadText = function(text) {
  if (intervalId) {
    window.clearInterval(intervalId);
  }
  text = text.split(/\r\n|\n|\r/).filter(function(line){
    return line && line.slice(0,2) != '//';
  }).join('\n');
  text = text.split('\n--\n');
  parseInitial(text[0]);
  parseRules(text[1]);
  display();
};

var data = [];

var parseInitial = function(init) {
  data = init.split('\n').map(function(l) {
    return l.split('').map(function(v) {
      return +v;
    });
  });
};

var rules = [];
var radius = 0;

var parseRules = function(lines) {
  var makeRule = function() {
    return {
      mask: [],
      conditions: [],
      value: 0,
      compile: function() {
        if (this.conditions.length > 0) {
          this.conditions = this.conditions.map(function(x) {
            return '(' + x + ')';
          }).join('&&');
          this.conditions = eval('(function(o) {with(o){return ' + this.conditions + ';}})');
        } else {
          delete this.conditions;
          this.applies = function(value) {
            for (var i = 0; i < this.mask.length; i++) {
              if (!isNaN(this.mask[i])) {
                if (this.mask[i] != value[i]) {
                  return false;
                }
              }
            }
            return true;
          };
        }
        return this;
      },
      applies: function(value) {
        var sum = {};

        for (var i = 0; i < this.mask.length; i++) {
          if (isNaN(this.mask[i])) {
            sum[this.mask[i]] = (sum[this.mask[i]] || 0) + value[i];
          } else {
            if (this.mask[i] != value[i]) {
              return false;
            }
          }
        }
        return this.conditions(sum);
      }
    }
  };
  var rule = makeRule();
  lines = lines.split('\n');
  lines.forEach(function(line) {
    if (line.slice(0,1) == '#') {
      rule.conditions.push(line.slice(1));
    } else if (line.slice(0,1) == '>') {
      rule.value = +line.slice(1);
      rules.push(rule.compile());
      rule = makeRule();
    } else {
      Array.prototype.push.apply(rule.mask, line.split(''));
      radius = line.length;
    }
  });
  radius = Math.floor(radius/2);
};

var display = function() {
  var rows = d3.select('#ca').selectAll('tr').data(data);
  rows.enter().append('tr');
  var cells = rows.selectAll('td').data(function(d){
    return d;
  });
  cells.enter().append('td');
  cells.attr('class', function(d){
    return 'cell cell' + d;
  });
};

var extractArea = function(x,y) {
  var result = [], xx, yy, v;
  for (yy = y-radius; yy <= y+radius; yy++) {
    for (xx = x-radius; xx <= x+radius; xx++) {
      v = data[yy] && data[yy][xx];
      if (v) {
        result.push(v);
      } else {
        result.push(0);
      }
    }
  }
  return result;
};

var newValue = function(x,y) {
  var area = extractArea(x,y);
  for (var i = 0; i < rules.length; i++) {
    if (rules[i].applies(area)) {
      return rules[i].value;
    }
  }
  return 0;
}

var update = function() {
  var x, y, newData = [];
  for (y = 0; y < data.length; y++) {
    newData[y] = [];
    for (x = 0; x < data[0].length; x++) {
      newData[y][x] = newValue(x,y);
    }
  }
  data = newData;
}