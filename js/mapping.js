
var Mapping = function() { 

  // setup isomer colors
  var Color = Isomer.Color;

  // floor does not change or move
  var floor = {loc: [-0.8, -0.8, 0], size: [6, 6, 0.1]};

  // generate some initial random objects from a
  // small subset of objects that can be created
  var generateRandom = function() {
    var any = ['cube', 'pyramid']; 
    var col = ['red', 'blue', 'green', 'purple', 'yellow', 'white', 'black'];
    var size = ['tall', 'small', 'large', 'medium'];
    var lo = [[2, 2, 0.1], [1, 5, 0.1], [4, 3, 0.1], [5, 1, 0.1], [1, 1, 0.1]];
    return { 
      type: any[Math.floor(Math.random() * any.length)], 
      color: col[Math.floor(Math.random() * col.length)], 
      size: size[Math.floor(Math.random() * size.length)], 
      loc: lo[Math.floor(Math.random() * lo.length)]
    };
  };

  // find existing object matching type, color, size
  var findObject = function(find, objects, changes) {

    var any = ['cube', 'pyramid']; 
    var multiple = ['cubes', 'pyramids', 'objects'];

    // check for plural relation type
    // e.g. "cubes" 
    // and convert to single object
    if (multiple.indexOf(find.type)!==-1) {
      find.type = find.type.replace('s', '');
    }

    // e.g. "place a cube on top of something"
    if (find.type==='object' || find.type==='something' || find.type==='anything') {
      find.type = any[Math.floor(Math.random() * any.length)];
    }

    for (var i=0; i<objects.length; i++) {
      if (objects[i].type===find.type && objects[i].color===find.color && objects[i].size===find.size) {
        return [objects[i].loc[0]+changes.x, objects[i].loc[1]+changes.y, objects[i].loc[2]+changes.z];
      }
    }

    for (var i=0; i<objects.length; i++) {
      if (objects[i].type===find.type && objects[i].color===find.color) {
        return[objects[i].loc[0]+changes.x, objects[i].loc[1]+changes.y, objects[i].loc[2]+changes.z];
      }
    }

    for (var i=0; i<objects.length; i++) {
      if (objects[i].type===find.type && objects[i].size===find.size) {
        return [objects[i].loc[0]+changes.x, objects[i].loc[1]+changes.y, objects[i].loc[2]+changes.z];
      }
    }

    for (var i=0; i<objects.length; i++) {
      if (objects[i].color===find.color && objects[i].size===find.size) {
        return [objects[i].loc[0]+changes.x, objects[i].loc[1]+changes.y, objects[i].loc[2]+changes.z];
      }
    }

    for (var i=0; i<objects.length; i++) {
      if (objects[i].type===find.type || objects[i].color===find.color || objects[i].size===find.size) {
        return [objects[i].loc[0]+changes.x, objects[i].loc[1]+changes.y, objects[i].loc[2]+changes.z];
      }
    }

  };

  // create mappings for english words
  // to the correct object properties
  // e.g. 'small' = size: [0.2, 0.2, 0.2]
  //      'in front of' = loc: [x, y, z]
  //      'blue' = color: Color(50, 60, 160)
  var mapping = {

    // pass floor values into world
    floor: floor,

    random: [generateRandom(), generateRandom()],

    // basic object types
    objects: ['cube', 'pyramid'],
    objectsMultiple: ['cubes', 'pyramids', 'objects'],

    // basic object colors
    colors: {

      'default': new Color(219, 219, 219),
      'white': new Color(219, 219, 219),
      'red': new Color(160, 60, 50),
      'blue': new Color(50, 60, 160),
      'green': new Color(38, 199, 43),
      'yellow': new Color(227, 177, 50),
      'black': new Color(36, 36, 36),
      'gray': new Color(112, 112, 112),
      'pink': new Color(207, 33, 175),
      'teal': new Color(33, 201, 207),
      'orange': new Color(207, 117, 33),
      'purple': new Color(102, 33, 207)

    },

    // basic object sizes converted from
    // English to L W H
    sizes: {

      'default': [0.6, 0.6, 0.6],
      'normal': [0.6, 0.6, 0.6],
      'small': [0.4, 0.4, 0.4],
      'medium': [0.8, 0.8, 0.8],
      'large': [1.1, 1.1, 1.1],
      'big': [1.1, 1.1, 1.1],
      'long': [0.6, 0.6, 1.3],
      'wide': [1.1, 1.1, 0.5],
      'flat': [1.1, 1.1, 0.1],
      'tall': [0.6, 0.6, 1.1],
      'short': [0.5, 0.5, 0.3]

    },

    // basic locations in world
    locations: {

      // absolute in the world
      absolute: {

        front: function() { return [0, Math.random()*floor.size[1], 0.1]; },
        back: function() { return [floor.size[1], Math.random()*floor.size[1], 0.1]; },
        left: function() { return [Math.random()*floor.size[0], 0, 0.1]; },
        right: function() { return [Math.random()*floor.size[0], floor.size[0]-1, 0.1]; },
        center: function() { return [Math.random()*(((floor.size[0]/2)+1)-((floor.size[0]/2)-1))+((floor.size[0]/2)-1), Math.random()*(((floor.size[1]/2)+1)-((floor.size[1]/2)-1))+((floor.size[1]/2)-1), 0.1]; },
        middle: function() { return [Math.random()*(((floor.size[0]/2)+1)-((floor.size[0]/2)-1))+((floor.size[0]/2)-1), Math.random()*(((floor.size[1]/2)+1)-((floor.size[1]/2)-1))+((floor.size[1]/2)-1), 0.1]; },
        somewhere: function() { return [Math.random()*floor.size[0], Math.random()*floor.size[1], 0.1]; },
        anywhere: function() { return [Math.random()*floor.size[0], Math.random()*floor.size[1], 0.1]; },
        // lol hax
        near: function() { return [Math.random()*floor.size[0], Math.random()*floor.size[1], 0.1]; }

      },

      // relative compared to some object
      // these functions are based on semantics.js -> location
      relative: {

        front: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: -1.5, y: 0, z: 0});
        },

        back: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 1.5, y: 0, z: 0});
        },

        behind: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 1.5, y: 0, z: 0});
        },

        left: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: -1.5, z: 0});
        },

        right: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 1.5, z: 0});
        },

        above: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: 0.7});
        },

        top: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: 0.7});
        },

        on: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: 0.7});
        },

        under: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: -0.7});
        },

        beneath: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: -0.7});
        },

        below: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: -0.7});
        },

        over: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: 0, y: 0, z: 0.7});
        },

        near: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: (Math.random()*2)+1, y: (Math.random()*2)+1, z: 0});
        },

        next: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: (Math.random()*1.4)+1, y: (Math.random()*1.4)+1, z: 0});
        },

        around: function(relation, objects) { 
          var find = {type: relation.TYPE[0], color: relation.COLOR[0], size: relation.SIZE[0]};
          return findObject(find, objects, {x: (Math.random()*1.3)+1, y: (Math.random()*1.3)+1, z: 0});
        }

      },

      // relative sizes such as "smaller" are stored
      // as locations because the relation function in action.js
      // sorts them in such a way to make it a bit easier 
      // e.g. "...behind the tall cube" => relation: "tall cube"
      //      "...smaller than the tall cube" => relation: "tall cube"
      relativeSizes: {

        arr: [
          'smaller',
          'taller',
          'bigger',
          'shorter',
          'wider',
          'fatter',
          'larger'
        ],

        // "smaller" simply becomes "small"
        // "wider" becomes "wide" etc.
        map: {
          'smaller': 'small',
          'taller': 'tall',
          'bigger': 'big',
          'shorter': 'short',
          'wider': 'wide',
          'flatter': 'flat',
          'larger': 'large'
        }

      }

    }

  };

  return mapping;

};
