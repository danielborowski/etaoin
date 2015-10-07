
var Action = function(semantics) {

  // the construct object will organize the sentence
  // into a formula so that we can actually have a function 
  // do something in the world 
  var construct = {

    // attempt to construct an object starting 
    // from a certain position
    object: function(loc, parsed, limit) {

      var TYPE = [];
      var NUMBER = [];
      var SIZE = [];
      var COLOR = [];

      if (!limit.max) { limit.max = 1000; }

      for (var k=loc+1; k<parsed.sentence.length; k++) {

        // determine type of object
        if (semantics.concepts.object.indexOf(parsed.sentence[k])!==-1) { 
          if (TYPE.length>=limit.max) { break; }
          TYPE.push(parsed.sentence[k]);
          parsed.sentence[k] = 'X';
        }

        // determine color
        else if (semantics.concepts.description.color.indexOf(parsed.sentence[k])!==-1) { 
          if (COLOR.length>=limit.max) { break; }
          COLOR.push(parsed.sentence[k]);
          parsed.sentence[k] = 'X';
        }

        // determine number
        else if (semantics.concepts.description.number(parsed.sentence[k])) { 
          if (NUMBER.length>=limit.max) { break; }
          NUMBER.push(nlp.value(parsed.sentence[k]).number());
          parsed.sentence[k] = 'X';
        }

        // determine size
        else if (semantics.concepts.description.size.indexOf(parsed.sentence[k])!==-1) { 
          if (SIZE.length>=limit.max) { break; }
          SIZE.push(parsed.sentence[k]);
          parsed.sentence[k] = 'X';
        }

        // break once it reaches a location keyword
        else if (semantics.concepts.location.indexOf(parsed.sentence[k])!==-1) {
          break;
        }

        // TODO
        // check ConceptNet API here if
        // none of the above are encountered
        // e.g. "magenta" -> "purple"
        //else { }

      }

      return {
        TYPE: TYPE, 
        NUMBER: NUMBER, 
        SIZE: SIZE, 
        COLOR: COLOR
      };

    },

    // hopefully WHAT to place has been figured out, now 
    // attempt to figure out WHERE in the world to put it
    location: function(loc, parsed) {

      var LOCATION = [];
      var INDEX;

      for (var k=loc; k<parsed.sentence.length; k++) {
        if (semantics.concepts.location.indexOf(parsed.sentence[k])!==-1) {
          LOCATION.push(parsed.sentence[k]);
          parsed.sentence[k] = 'X';
          INDEX = k;
          break;
        }
      }

      return {
        LOCATION: LOCATION,
        INDEX: INDEX
      };

    },

    // determine the RELATION to the location
    relation: function(index, parsed) {

      // a location relation is usually a relation
      // of some type simply to another object
      // e.g. "smaller than the blue cube" -> ["blue", "cube"]
      //      "behind the largest pyramid" -> ["largest", "pyramid"]
      return construct.object(index, parsed, {max: 1});

    }

  };

  var action = {

    // this function will determine what action to perform in the world
    // e.g. place an object, change something, etc.
    determine: function(parsed) {

      //console.log('NEW TAGS', parsed.tags);
      //console.log('MOD SENTENCE', parsed.sentence);

      var s = nlp.pos(parsed.sentence.join(' ')).sentences[0];
      if (s.verbs()[0]!==undefined) { 
        var verb = s.verbs()[0].text;
        if (semantics.concepts.action.place.indexOf(verb)!==-1) { return action.formulate(parsed, 'PLACE'); }
        else if (semantics.concepts.action.remove.indexOf(verb)!==-1) { return action.formulate(parsed, 'REMOVE'); }
        else if (semantics.concepts.action.update.indexOf(verb)!==-1) { return action.formulate(parsed, 'UPDATE'); }
      }

    },

    // if something should be placed into the world
    // then determine what-where-relation
    // remove and update follow the same logic
    // to create the formula
    formulate: function(parsed, act) {

      var s = nlp.pos(parsed.sentence.join(' ')).sentences[0];
      var verb_tag = s.verbs()[0].pos.tag;
      var verb_loc = parsed.tags.indexOf(verb_tag);
      var counter = 0;

      // when updating store the actual verb
      // e.g. need to know if it's "rotate" "move" "scale" etc.
      var formula = (act==='UPDATE') ? 
        [{'ACTION': act, 'VERB': parsed.sentence[verb_loc]}] :
        [{'ACTION': act}];

      parsed.sentence[verb_loc] = 'X';

      // convert whole sentence into a formulaic array of objects
      while (parsed.sentence.join(' ').match(/X/g).length !== parsed.sentence.length) { 

        // if program does not know what to do with some
        // word then just get rid of it after several attempts
        if (counter>3) {
          for (var i=0; i<parsed.sentence.length; i++) { 
            parsed.sentence[i] = 'X';
          }
        }

        // schema for object construction
        // e.g. ['cube', 'small', 'red']
        var o = construct.object(verb_loc, parsed, {max: false});

        // get location where to place object
        // e.g. ['behind']
        var l = construct.location(0, parsed);

        // determine if in the sentence a 
        // relation is provided for location
        // e.g. place red cube behind "the tall and blue pyramid"
        var c;
        if ((l.INDEX+1 < parsed.sentence.length) && (parsed.sentence.join(' ').match(/X/g).length !== parsed.sentence.length)) {
          c = construct.relation(l.INDEX, parsed);
        } 

        // check if relation has all undefined values
        // *idk why the relation sometimes gets picked up when there actually is none
        // *it seems to happen when a word not in the semantics file is entered
        if (c!==undefined) { 
          if (c.TYPE[0]===undefined && c.COLOR[0]===undefined && c.NUMBER[0]===undefined && c.SIZE[0]===undefined) {
            c = undefined;
          }
        }

        // each pass through sentence
        counter++;
        formula.push({'OBJECT': o, 'LOCATION': l, 'RELATION': c});
        //console.log('PASS ' + counter);
        //console.log(formula);
        //console.log('SEN', parsed.sentence);

      }

      return formula;

    }

  };

  return action;

};

