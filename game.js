const CircularJSON=function(JSON,RegExp){var specialChar="~",safeSpecialChar="\\x"+("0"+specialChar.charCodeAt(0).toString(16)).slice(-2),escapedSafeSpecialChar="\\"+safeSpecialChar,specialCharRG=new RegExp(safeSpecialChar,"g"),safeSpecialCharRG=new RegExp(escapedSafeSpecialChar,"g"),safeStartWithSpecialCharRG=new RegExp("(?:^|([^\\\\]))"+escapedSafeSpecialChar),indexOf=[].indexOf||function(v){for(var i=this.length;i--&&this[i]!==v;);return i},$String=String;function generateReplacer(value,replacer,resolve){var doNotIgnore=false,inspect=!!replacer,path=[],all=[value],seen=[value],mapp=[resolve?specialChar:"[Circular]"],last=value,lvl=1,i,fn;if(inspect){fn=typeof replacer==="object"?function(key,value){return key!==""&&replacer.indexOf(key)<0?void 0:value}:replacer}return function(key,value){if(inspect)value=fn.call(this,key,value);if(doNotIgnore){if(last!==this){i=lvl-indexOf.call(all,this)-1;lvl-=i;all.splice(lvl,all.length);path.splice(lvl-1,path.length);last=this}if(typeof value==="object"&&value){if(indexOf.call(all,value)<0){all.push(last=value)}lvl=all.length;i=indexOf.call(seen,value);if(i<0){i=seen.push(value)-1;if(resolve){path.push((""+key).replace(specialCharRG,safeSpecialChar));mapp[i]=specialChar+path.join(specialChar)}else{mapp[i]=mapp[0]}}else{value=mapp[i]}}else{if(typeof value==="string"&&resolve){value=value.replace(safeSpecialChar,escapedSafeSpecialChar).replace(specialChar,safeSpecialChar)}}}else{doNotIgnore=true}return value}}function retrieveFromPath(current,keys){for(var i=0,length=keys.length;i<length;current=current[keys[i++].replace(safeSpecialCharRG,specialChar)]);return current}function generateReviver(reviver){return function(key,value){var isString=typeof value==="string";if(isString&&value.charAt(0)===specialChar){return new $String(value.slice(1))}if(key==="")value=regenerate(value,value,{});if(isString)value=value.replace(safeStartWithSpecialCharRG,"$1"+specialChar).replace(escapedSafeSpecialChar,safeSpecialChar);return reviver?reviver.call(this,key,value):value}}function regenerateArray(root,current,retrieve){for(var i=0,length=current.length;i<length;i++){current[i]=regenerate(root,current[i],retrieve)}return current}function regenerateObject(root,current,retrieve){for(var key in current){if(current.hasOwnProperty(key)){current[key]=regenerate(root,current[key],retrieve)}}return current}function regenerate(root,current,retrieve){return current instanceof Array?regenerateArray(root,current,retrieve):current instanceof $String?current.length?retrieve.hasOwnProperty(current)?retrieve[current]:retrieve[current]=retrieveFromPath(root,current.split(specialChar)):root:current instanceof Object?regenerateObject(root,current,retrieve):current}var CircularJSON={stringify:function stringify(value,replacer,space,doNotResolve){return CircularJSON.parser.stringify(value,generateReplacer(value,replacer,!doNotResolve),space)},parse:function parse(text,reviver){return CircularJSON.parser.parse(text,generateReviver(reviver))},parser:JSON};return CircularJSON}(JSON,RegExp);

// Initialize the Babylon.js engine
const canvas = document.getElementById("renderCanvas");
let engine = undefined;
// Create a new scene
let scene = undefined;
// Define an array to hold all the constructed objects
let objects = [];


let selectedObject = null;

//select object in explorer
function generatePropertyEditor() {
  const propertyEditor = document.getElementById("property-list");
  propertyEditor.innerHTML = "";

  if (!selectedObject) {
    return;
  }
  const properties = Object.getOwnPropertyNames(selectedObject);
  for (let i = 0; i < properties.length; i++) {
    const propertyName = properties[i];
    const propertyValue = selectedObject[propertyName];

    // Create a label and input for the property
    const label = document.createElement("label");
    label.innerText = propertyName;
    const input = document.createElement("input");
    input.value = propertyValue;

    // Add an event listener to update the object's property when the input changes
    input.addEventListener("change", function () {
      // selectedObject[propertyName] = input.value;
      // saveToFile();
    });

    // Add the label and input to the property editor
    propertyEditor.appendChild(label);
    propertyEditor.appendChild(input);
  }
}

function generateObjectExplorer() {
  // Clear the object explorer
  let objectExplorer = document.getElementById("object-list");
  objectExplorer.innerHTML = "";

  // Create a header for the object explorer
  let header = document.createElement("h3");
  header.innerText = "Objects";
  objectExplorer.appendChild(header);

  // Loop through the objects array and create a button for each object
  for (let i = 0; i < objects.length; i++) {
    let obj = objects[i];
    let button = document.createElement("button");
    button.innerText = obj.name;
    button.onclick = function () {
      // When the button is clicked, set the selected object and update the property editor
      selectedObject = obj;
      generatePropertyEditor();
    };
    objectExplorer.appendChild(button);
  }
}

function createObject(type, position, rotation, scaling, material) {
  let newObj;

  // Use a switch statement to create the object based on the provided type
  switch (type) {
    case "box":
      newObj = new BABYLON.MeshBuilder.CreateBox("box", { size: 2 }, scene);
      break;
    case "sphere":
      newObj = new BABYLON.MeshBuilder.CreateSphere(
        "sphere",
        { diameter: 2 },
        scene
      );
      break;
    case "cylinder":
      newObj = new BABYLON.MeshBuilder.CreateCylinder(
        "cylinder",
        { height: 2, diameterTop: 0, diameterBottom: 2 },
        scene
      );
      break;
    // Add more cases for additional object types as needed
    default:
      console.log("Error: Invalid object type.");
      return;
  }

  // Set the object's properties based on the provided parameters
  newObj.position = position ?? new BABYLON.Vector3(0, 0, 0);
  newObj.rotation = rotation ? new BABYLON.Vector3(rotation[0], rotation[1], rotation[2]) : new BABYLON.Vector3(0, 0, 0);
  newObj.scaling = scaling ? new BABYLON.Vector3(scaling[0], scaling[1], scaling[2]) : new BABYLON.Vector3(1, 1, 1);
  newObj.material = material || new BABYLON.StandardMaterial("material", scene);
  newObj.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
  newObj.type = type;
  newObj.name = "New Object";
  // Add the object to the objects array
  objects.push(newObj);
  generateObjectExplorer();
  // Return the new object
  return newObj;
}



function saveToFile() {
  try {
    // Exclude the _scene property from each object
    let filteredObjects = objects.map(function(obj) {
      let newObj = Object.assign({}, obj);
      delete newObj._scene;
      return newObj;
    });

    // Convert the filtered objects array to a JSON string
    //let serializedData = CircularJSON.stringify(filteredObjects);
    // Serialize the object to JSON with custom serialization for position
    let serializedData = CircularJSON.stringify(filteredObjects, function(key, value) {
      if (key === "_position" && value instanceof BABYLON.Vector3) {
        return [value.x, value.y, value.z];
      }
      return value;
    });
    // Save the serialized data to local storage
    localStorage.setItem("objects", serializedData);

    console.log("Scene saved successfully");
  } catch (error) {
    console.error("Error saving scene:", error);
  }
}

function newScene() {
  objects = []
  generateObjectExplorer();
  
  // Clear the existing scene
  if (scene) {
    scene.dispose();
  }


  engine = new BABYLON.Engine(canvas, true);
  scene = new BABYLON.Scene(engine);

  // Add a camera to the scene
  const camera = new BABYLON.FreeCamera(
    "camera",
    new BABYLON.Vector3(0, 5, -10),
    scene
  );
  camera.attachControl(canvas, true);
  
  // Add a light to the scene
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  
  
  // Listen for pointer down events on the scene
scene.onPointerDown = function (evt, pickResult) {
  // Check if an object was clicked
  if (pickResult.hit) {
    // Get the clicked object
    let clickedObject = pickResult.pickedMesh;

    // Set the currently selected object
    selectedObject = clickedObject;

    // Update the property editor with information about the selected object
    generatePropertyEditor(clickedObject);
  } else {
    // If nothing was clicked, deselect the current object
    selectedObject = null;

    // Clear the property editor
    generatePropertyEditor(null);
  }
};


// Start the game loop
engine.runRenderLoop(function () {
scene.render();
});

// Resize the canvas when the window is resized
window.addEventListener("resize", function () {
engine.resize();
});
// Resize the canvas to a larger size
canvas.width = 800;
canvas.height = 600;

// Resize the engine to fit the new canvas size
engine.resize();



}

function loadScene() {
  try {
    // Retrieve the serialized data from local storage
    let serializedData = localStorage.getItem("objects");

    // Parse the serialized data into an array of objects
    let loadedObjects = JSON.parse(serializedData, function(key, value) {
      if (key === "_position" && value instanceof Array) {
        console.log("Loadeing data postion")
        return new BABYLON.Vector3(value[0], value[1], value[2]);
      }
      return value;
    });
 

    newScene()

    // Create the objects in the scene
    loadedObjects.forEach(function(objData) {
      console.log(objData)
      createObject(
        objData.type,
        objData._position,
        objData.rotation,
        objData.scaling,
        objData.material
      );
    });

    console.log("Scene loaded successfully");
  } catch (error) {
    console.error("Error loading scene:", error);
  }
}

//move objects

document.addEventListener("keydown", function(event) {
    switch(event.key) {
      case "a":
        if (selectedObject) {
          selectedObject.position.x -= 1;
        }
        break;
      case "w":
        if (selectedObject) {
          selectedObject.position.z += 1;
        }
        break;
      case "d":
        if (selectedObject) {
          selectedObject.position.x += 1;
        }
        break;
      case "s":
        if (selectedObject) {
          selectedObject.position.z -= 1;
        }
        break;
    }
  });
  

  // add buttons
  const boxButton = document.getElementById('box-button');
  const sphereButton = document.getElementById('sphere-button');
  const cylinderButton = document.getElementById('cylinder-button');
  
  boxButton.addEventListener('click', function() {
    createObject('box');
  });
  
  sphereButton.addEventListener('click', function() {
    createObject('sphere');
  });
  
  cylinderButton.addEventListener('click', function() {
    createObject('cylinder');
  });
  
  const saveButton = document.getElementById('save-button');
  const loadButton = document.getElementById('load-button');
  const newButton = document.getElementById('new-button');

  newButton.addEventListener('click', function() {
    newScene();
  });

  saveButton.addEventListener('click', function() {
    saveToFile()
  });
  
  loadButton.addEventListener('click', function() {
    loadScene();
  });
  