
var Semantics = function() { 

  var semantics = {

    // make call to ConceptNet API and see if tag is
    // related to something in the semantics data
    // eg. magenta->relatedTo->blue in ConceptNet graph
    relatedTo: function(tag, callback) {

      /*
      $.ajax({
        url: 'http://conceptnet5.media.mit.edu/data/5.4/c/en/' + tag,
        dataType: 'json',
        success: function(data) {
          callback(data.edges);
        }
      });
      */

    },

    // basic hard-coded knowledge that the program
    // will try to filter for when organizing the command
    concepts: {

      action: {
        place: [
          'place', 
          'add', 
          'put', 
          'create'
        ],
        update: [
          'update', 
          'change', 
          'modify', 
          'make',
          'translate', 
          'rotate',
          'spin',
          'move', 
          'turn',
          'increase',
          'decrease',
          'augment'
        ],
        remove: [
          'remove', 
          'delete',
          'rid',
          'subtract'
        ]
      },

      object: [
        'cube', 
        'pyramid', 
        'cubes', 
        'pyramids', 
        'object', 
        'objects', 
        'something', 
        'anything'
      ],

      description: {
        number: function(t) { 
          return (nlp.value(t).number()!==null); 
        },
        size: [
          'small', 
          'medium', 
          'large', 
          'big',
          'long',
          'wide', 
          'flat',
          'tall', 
          'short', 
          //'width', 
          //'length', 
          //'height',
          'default',
          'normal'
        ],
        color: [
          'white',
          'red', 
          'blue', 
          'green', 
          'yellow',
          'black',
          'gray',
          'pink',
          'teal',
          'orange',
          'purple'
        ]
      },

      location: [
        'front', 
        'back', 
        'behind', 
        'left', 
        'center', 
        'middle', 
        'right', 
        'above',
        'top', 
        'on',
        'below', 
        'beneath',
        'under', 
        'over', 
        'somewhere', 
        'anywhere', 
        'near', 
        'next',
        'around',
        // not locations but program treats these
        // words as such to make object creation easier
        // by treating them as "location relations"
        'smaller',
        'taller',
        'bigger',
        'shorter',
        'wider',
        'flatter',
        'larger'
      ]

    }

  };

  return semantics;

};
