
var send = document.getElementById('send');
var command = document.getElementById('command');
var canvas = document.getElementById('world');

var Mapping = Mapping();
var World = World(canvas, Mapping);
var Tokenize = Tokenize();
var Semantics = Semantics();
var Action = Action(Semantics);

// render the initial world
World.render();

// wait for user command
send.addEventListener('click', function() {

  // parse sentence
  var c = command.value.toLowerCase().replace(/[.,-\/#!$%\^&\*;:{}=\-_`()]/g, '');
  var parsed = Tokenize.parse(c, World.objects);

  // determine what action to perform in world by
  // converting the English command into an object 
  // that separates the action to perform,
  // object to place, location, etc.
  // "program-specific semantic representation"
  var formula = Action.determine(parsed);

  if (formula!==undefined) { 

    // convert the formula into actual objects
    // that we can manipulate in the world
    // and update the World.objects array accordingly
    World.convert(formula);

    // re-render the updated world
    // after change have been made to
    // World.objects
    World.render();

  }

});

// user presses enter
command.addEventListener('keydown', function(e) {
  if (e.keyCode===13) {
    $(send).click();
  }
});


