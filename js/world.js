
var World = function(el, Mapping) { 

  // canvas setup
  var canvas = el;
  var iso = new Isomer(canvas);
  var ctx = canvas.getContext("2d");

  // setup isomer for world use
  var Point = Isomer.Point;
  var Path = Isomer.Path;
  var Shape = Isomer.Shape;
  var Vector = Isomer.Vector;

  // easy to use mappings
  var objects = Mapping.objects;
  var objectsMultiple = Mapping.objectsMultiple;
  var floor = Mapping.floor;
  var random = Mapping.random;
  var colors = Mapping.colors;
  var sizes = Mapping.sizes;
  var locations = Mapping.locations;

  var world = {

    // this array is manipulated to include new
    // objects, remove objects, change sizes, etc.
    objects: [random[0], random[1]],

    // convert the object created by Action
    // into actual world objects
    convert: function(formula) {

      // do not lose rest of formulas
      // but usually only the first one is needed
      // and only in some cases the second one
      var restOfFormulas = [];
      for (var i=2; i<formula.length; i++) {
        restOfFormulas.push(formula[i]);
      }

      var ACTION = formula[0].ACTION;
      var updateVerb = (formula[0].ACTION==='UPDATE') ? formula[0].VERB : undefined;
      var formula = formula[1];
      var objectIndex = 0;
      var objectMax = (formula.OBJECT.NUMBER[0]===undefined) ? 1 : formula.OBJECT.NUMBER[0];

      // limit of placing X objects down is 100
      (objectMax>100) ? objectMax = 100 : null;

      // if multiple objects are specified
      // e.g. "place three blue cubes in the middle"
      while (objectIndex < objectMax) {

        var newObject = {};

        // function to determine if location is 
        // relative to an object or absolute 
        var determineLocation = function(formula, newObject) {

          // if relation is not undefined, then figure out
          // how to setup the location relative to some other object
          // and return the location in form [x, y, z]
          if (formula.RELATION!==undefined && formula.LOCATION.LOCATION[0]!==undefined && locations.relative[formula.LOCATION.LOCATION[0]]!==undefined) {
              var temp = world.objects[0];
              world.objects.shift();
              world.objects.push(temp);
              newObject.loc = locations.relative[formula.LOCATION.LOCATION[0]](formula.RELATION, world.objects);
          } 

          // absolute positioning of location
          // returned in form [x, y, z]
          else if (locations.absolute[formula.LOCATION.LOCATION[0]]!==undefined) { 
            newObject.loc = (formula.LOCATION.LOCATION[0]!==undefined) ? 
                            (locations.absolute[formula.LOCATION.LOCATION[0]]()) : 
                            ([Math.random()*floor.size[0], Math.random()*floor.size[1], 0.1]);
          } 

          // encountered some problem assigning the location
          else {
            newObject.loc = [Math.random()*floor.size[0], Math.random()*floor.size[1], 0.1];
          }

          // make sure loc is never undefined
          if (newObject.loc===undefined) {
            newObject.loc = [Math.random()*floor.size[0], Math.random()*floor.size[1], 0.1];
          }

          // fix javascript decimal problems e.g. 0.077777778
          for (var r=0; r<newObject.loc.length; r++) {
            newObject.loc[r] = +newObject.loc[r].toFixed(3);
          }

        };

        // function to determine objects color, size and type
        var determineObject = function(index, newObject) {

          // assign what type of object
          if (ACTION==='PLACE') { 
            newObject.type = (formula.OBJECT.TYPE[index].indexOf('object')!==-1 || formula.OBJECT.TYPE[index]==='something' || formula.OBJECT.TYPE[index]==='anything') ? 
                             (objects[Math.floor(Math.random() * objects.length)]) : 
                             (formula.OBJECT.TYPE[index].replace('s', '')); 
          } else {
            newObject.type = (formula.OBJECT.TYPE[index].replace('s', '')); 
          }

          // assign the color
          newObject.color = formula.OBJECT.COLOR[index] || 'default';
          
          // assign the size
          newObject.size = formula.OBJECT.SIZE[index] || 'default';

          // if using a word to compare sizes when creating an object
          // e.g. "place a red cube that is **smaller** than the tall cube in the back"
          if (locations.relativeSizes.arr.indexOf(formula.LOCATION.LOCATION[0])!==-1) {
            newObject.size = locations.relativeSizes.map[formula.LOCATION.LOCATION[0]];
            (restOfFormulas[0]!==undefined) ? determineLocation(restOfFormulas[0], newObject) : newObject.loc = [0, 0, 0]; 
          } 

          // if not using a word such as "smaller" or "wider" when creating
          // and object, then just normally figure out the location
          else {
            determineLocation(formula, newObject);
          }

        };

        // if command is in some noncanonical form
        // we might have to swap the object and relation when updating
        // e.g. "behind the blue cube, move the green cube"
        if (ACTION==='UPDATE') {
          if (formula.OBJECT.TYPE[0]===undefined && formula.RELATION!==undefined && formula.RELATION.TYPE[0]!==undefined) { 
            for (var prop in formula.RELATION) {
              formula.OBJECT[prop] = formula.RELATION[prop];
            }  
            formula.RELATION = undefined;
          }
        }

        // loop through all objects specified in command
        for (var i=0; i<formula.OBJECT.TYPE.length; i++) {

          // special case if "removing all objects"
          if (formula.OBJECT.TYPE[i]==='objects' && ACTION!=='PLACE') {
            for (var o=0; o<objects.length; o++) {
              formula.OBJECT.TYPE.push(objects[o]);
            }
          } 

          // setup the new object
          newObject = {};
          determineObject(i, newObject);
          //console.log('NEW OBJECT', newObject);

          // store object for updating if an 
          // update command was parsed
          var foundObject;
          var foundArray = [];
          var storeObject = (ACTION==='UPDATE') ? true : false;

          // adding object(s) to world
          if (ACTION==='PLACE') { 

            world.objects.push(newObject);

          } 

          // removing object(s) from world
          // and if updating then store the object that will be removed
          if (ACTION==='REMOVE' || ACTION==='UPDATE') {

            var removed = false;
            var numRemoveMax = 100000;
            var numRemoved = 0;

            // do not remove all objects of specified type if a number is given
            // e.g. "remove 3 yellow cubes" opposed to "remove the yellow cubes"
            // normally would remove all yellow cubes, but not in this case
            // lol bunch of loops attempting to find the object below
            if (objectMax>1) { numRemoveMax = numRemoved+1; } 

            // find objects that match description
            for (var j=0; j<world.objects.length; j++) {
              if (world.objects[j].loc.toString()===newObject.loc.toString() && numRemoved<numRemoveMax) {
                if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                world.objects.splice(j, 1);
                numRemoved++; removed = true; j = j-1;
              }
            }
            if (!removed) {
              for (var j=0; j<world.objects.length; j++) {
                if (world.objects[j].type===newObject.type && world.objects[j].color===newObject.color && world.objects[j].size===newObject.size && numRemoved<numRemoveMax) {
                  if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                  world.objects.splice(j, 1);
                  numRemoved++; removed = true; j = j-1;
                }
              }
            }
            if (!removed) { 
              for (var j=0; j<world.objects.length; j++) {
                if (world.objects[j].type===newObject.type && world.objects[j].color===newObject.color && numRemoved<numRemoveMax) {
                  if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                  world.objects.splice(j, 1);
                  numRemoved++; removed = true; j = j-1;
                }
              }
            }
            if (!removed) { 
              for (var j=0; j<world.objects.length; j++) {
                if (world.objects[j].type===newObject.type && world.objects[j].size===newObject.size && numRemoved<numRemoveMax) {
                  if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                  world.objects.splice(j, 1);
                  numRemoved++; removed = true; j = j-1;
                }
              }
            }
            if (!removed) { 
              for (var j=0; j<world.objects.length; j++) {
                if (world.objects[j].color===newObject.color && world.objects[j].size===newObject.size && numRemoved<numRemoveMax) {
                  if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                  world.objects.splice(j, 1);
                  numRemoved++; removed = true; j = j-1;
                }
              }
            }
            if (!removed) {
              for (var j=0; j<world.objects.length; j++) {
                if ((world.objects[j].type===newObject.type) && numRemoved<numRemoveMax) {
                  if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                  world.objects.splice(j, 1);
                  numRemoved++; removed = true; j = j-1;
                }
              }
            }
            if (!removed) {
              for (var j=0; j<world.objects.length; j++) {
                if ((world.objects[j].color===newObject.color || world.objects[j].size===newObject.size) && numRemoved<numRemoveMax) {
                  if (storeObject) { foundObject = world.objects[j]; foundArray.push(world.objects[j]); }
                  world.objects.splice(j, 1);
                  numRemoved++; removed = true; j = j-1;
                }
              }
            }

          }

          // the logic for updating is:
          // 1. newObject creates a new object with the properties provided by user
          // 2. find the object in the world specified by the user e.g. "make the tall red cube..."
          // 3. store its properties then remove it from the world
          // 4. diff the stored object and newObject to see what should change
          // 5. check for multiple changes such as e.g. "make the blue cube wide and green"
          // 6. add the updated object back into the world
          if (ACTION==='UPDATE') {

            var updateProperties = function(foundObject) { 

              var foundObject = foundObject;
              var updatedObject = {};

              // update properties of the object in question
              for (var prop in foundObject) {

                // update color
                if (prop==='color' && formula.OBJECT.COLOR[1]!==undefined) { 
                  updatedObject['color'] = formula.OBJECT.COLOR[1]; 
                }

                // update type
                else if (prop==='type' && formula.OBJECT.TYPE[1]!==undefined) { 
                  updatedObject['type'] = formula.OBJECT.TYPE[1].replace('s', ''); 
                }

                // update color from relation
                else if (prop==='color' && formula.RELATION!==undefined && formula.RELATION.COLOR[0]!==undefined && locations.relative[formula.LOCATION.LOCATION[0]]===undefined) {
                  updatedObject['color'] = formula.RELATION.COLOR[0]; 
                }

                // properties of found and new object don't match
                else if (foundObject[prop]!==newObject[prop] && newObject[prop]!=='default' && newObject[prop]!=='object' && newObject[prop].toString()!=='0,0,0') { 
                  if (prop==='loc') { updatedObject[prop] = foundObject[prop]; }
                  else { updatedObject[prop] = newObject[prop]; }
                } 

                // keep old unchanged properties
                else {
                  updatedObject[prop] = foundObject[prop];
                }

                // fix random locations being cached
                if (updateVerb==='translate') {
                  determineLocation(formula, updatedObject);
                }

              }

              //console.log('UPDATED', updatedObject);

              // add the updated object into the world
              world.objects.push(updatedObject);

            };

            // update the properties for the one object found
            updateProperties(foundObject);

            //console.log('FOUND', foundObject);
            //console.log('FOUND ARR', foundArray);

            // if more objects in the world need to be updated
            // e.g. "make all the cubes yellow"
            if (foundArray.length>1) { 
              for (var n=0; n<foundArray.length; n++) {
                updateProperties(foundArray[n]);
              }
            }

          }

        }

        objectIndex++;

      }


    },

    // reset world
    reset: function() {

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      iso.add(Shape.Prism(Point(floor.loc[0], floor.loc[1], floor.loc[2]), floor.size[0]+2, floor.size[1]+2, floor.size[2]));

    },

    // update world by displaying all of the objects array
    // currently using isomer.js
    // could easily switch over to three.js by mapping
    // world.objects -> three.js objects
    // the world.objects array elements are always in the form: 
    // {type: X, loc: [x, y, z], color: Y, size: Z}
    update: function() {

      for (var i=0; i<world.objects.length; i++) {
        var ob = world.objects[i];
        if (ob.type==='cube') { 
          iso.add(Shape.Prism(Point(ob.loc[0], ob.loc[1], ob.loc[2]), sizes[ob.size][0], sizes[ob.size][1], sizes[ob.size][2]), colors[ob.color]); 
        }
        if (ob.type==='pyramid') { 
          iso.add(Shape.Pyramid(Point(ob.loc[0], ob.loc[1], ob.loc[2]), sizes[ob.size][0], sizes[ob.size][1], sizes[ob.size][2]), colors[ob.color]); 
        }
      }

    },

    // render updated world
    render: function() {

      world.reset();
      world.update();

    }
    
  };

  return world;

};
