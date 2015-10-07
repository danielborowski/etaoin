
var Tokenize = function() { 

  var tokenize = {

    // @input   original command text
    // @output  simplified array of commands along with part-of-speech tags
    // @info    using nlp_compromise library (https://github.com/spencermountain/nlp_compromise)
    // @note    use stanford parser to get better POS tags
    parse: function(command, objects) {

      var t;
      var tags, newTags;
      var simple = [];
      var exclude = ['DT', 'CP', 'IN', 'PRP', 'CC'];
      var newSen = command;
      var newSenArr;
      var verb_tag;
      var addNumber = false;

      // check for "color"
      if (newSen.indexOf('color')!==-1) {
        newSen = newSen.replace('color', '');
      } 

      // check for "on top"
      if (newSen.indexOf('on top')!==-1) {
        newSen = newSen.replace('on', '');
      } 

      // "increase"
      if (newSen.indexOf('increase')!==-1) {
        newSen = newSen.replace('increase', 'make larger');
        newSen = newSen.replace('size', '');
      } 

      // "decrease"
      if (newSen.indexOf('decrease')!==-1) {
        newSen = newSen.replace('decrease', 'make smaller');
        newSen = newSen.replace('size', '');
      } 

      newSenArr = newSen.split(' ');

      for (var i=0; i<newSenArr.length; i++) {
        // "move" to "translate"
        if (newSenArr[i]==='move') { newSenArr[i] = 'translate'; }
        // "box"
        if (newSenArr[i]==='box') { newSenArr[i] = 'cube'; }
        // converting "all" "each" "every" etc.
        if (newSenArr[i]==='all' || newSenArr[i]==='each' || newSenArr[i]==='every') {
          newSenArr[i] = '';
          addNumber = true;
        }
        // do not question this logic
        if (newSenArr[i]==='couple' || newSenArr[i]==='both') { newSenArr[i] = '2'; }
        if (newSenArr[i]==='some' || newSenArr[i]==='few') { newSenArr[i] = '4'; }
        if (newSenArr[i]==='several') { newSenArr[i] = '5'; }
      }

      // convert modified array back to sentence
      newSen = newSenArr.join(' ');

      // new command converted to nlp_compromise
      t = nlp.pos(newSen).sentences[0];
      tags = t.tags();

      // get the verb
      verb_tag = t.verbs()[0].text;

      // create simplified array
      for (var k=0; k<tags.length; k++) {
        // handling weird nlp_compromise POS tagging quirks
        if (exclude.indexOf(tags[k])===-1 || t.tokens[k].text==='on' || t.tokens[k].text==='below' || t.tokens[k].text==='around') { 
          simple.push(t.tokens[k].text); 
        } 
      }

      // hax work-around for "all" "each" "every" etc.
      if (addNumber) {
        simple.splice(simple.indexOf(verb_tag)+1, 0, objects.length.toString());
      }

      newTags = nlp.pos(simple.join(' ')).sentences[0].tags();

      // fix mistakes such as
      // grouping "tall yellow" as one word
      var hadToFix = false;
      for (var i=0; i<simple.length; i++) {
        if (simple[i].indexOf(' ')!==-1) {
          var p2 = simple[i].substring(simple[i].indexOf(' ')+1);
          simple[i] = simple[i].substring(0, simple[i].indexOf(' '));
          simple.splice(i+1, 0, p2);
          hadToFix = true;
        }
      }

      // sentence is an array of important tokens
      // e.g. ['put', 'cube', 'next', 'tall', 'pyramid'] 
      // tags is an array of POS tags for the new modified sentence 
      // e.g. ['VB', 'RB', 'NN']
      var parsed = {
        sentence: simple,
        tags: newTags
      };

      return parsed;

    }

  };

  return tokenize;

};