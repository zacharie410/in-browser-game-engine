const CircularJSON=function(JSON,RegExp){var specialChar="~",safeSpecialChar="\\x"+("0"+specialChar.charCodeAt(0).toString(16)).slice(-2),escapedSafeSpecialChar="\\"+safeSpecialChar,specialCharRG=new RegExp(safeSpecialChar,"g"),safeSpecialCharRG=new RegExp(escapedSafeSpecialChar,"g"),safeStartWithSpecialCharRG=new RegExp("(?:^|([^\\\\]))"+escapedSafeSpecialChar),indexOf=[].indexOf||function(v){for(var i=this.length;i--&&this[i]!==v;);return i},$String=String;function generateReplacer(value,replacer,resolve){var doNotIgnore=false,inspect=!!replacer,path=[],all=[value],seen=[value],mapp=[resolve?specialChar:"[Circular]"],last=value,lvl=1,i,fn;if(inspect){fn=typeof replacer==="object"?function(key,value){return key!==""&&replacer.indexOf(key)<0?void 0:value}:replacer}return function(key,value){if(inspect)value=fn.call(this,key,value);if(doNotIgnore){if(last!==this){i=lvl-indexOf.call(all,this)-1;lvl-=i;all.splice(lvl,all.length);path.splice(lvl-1,path.length);last=this}if(typeof value==="object"&&value){if(indexOf.call(all,value)<0){all.push(last=value)}lvl=all.length;i=indexOf.call(seen,value);if(i<0){i=seen.push(value)-1;if(resolve){path.push((""+key).replace(specialCharRG,safeSpecialChar));mapp[i]=specialChar+path.join(specialChar)}else{mapp[i]=mapp[0]}}else{value=mapp[i]}}else{if(typeof value==="string"&&resolve){value=value.replace(safeSpecialChar,escapedSafeSpecialChar).replace(specialChar,safeSpecialChar)}}}else{doNotIgnore=true}return value}}function retrieveFromPath(current,keys){for(var i=0,length=keys.length;i<length;current=current[keys[i++].replace(safeSpecialCharRG,specialChar)]);return current}function generateReviver(reviver){return function(key,value){var isString=typeof value==="string";if(isString&&value.charAt(0)===specialChar){return new $String(value.slice(1))}if(key==="")value=regenerate(value,value,{});if(isString)value=value.replace(safeStartWithSpecialCharRG,"$1"+specialChar).replace(escapedSafeSpecialChar,safeSpecialChar);return reviver?reviver.call(this,key,value):value}}function regenerateArray(root,current,retrieve){for(var i=0,length=current.length;i<length;i++){current[i]=regenerate(root,current[i],retrieve)}return current}function regenerateObject(root,current,retrieve){for(var key in current){if(current.hasOwnProperty(key)){current[key]=regenerate(root,current[key],retrieve)}}return current}function regenerate(root,current,retrieve){return current instanceof Array?regenerateArray(root,current,retrieve):current instanceof $String?current.length?retrieve.hasOwnProperty(current)?retrieve[current]:retrieve[current]=retrieveFromPath(root,current.split(specialChar)):root:current instanceof Object?regenerateObject(root,current,retrieve):current}var CircularJSON={stringify:function stringify(value,replacer,space,doNotResolve){return CircularJSON.parser.stringify(value,generateReplacer(value,replacer,!doNotResolve),space)},parse:function parse(text,reviver){return CircularJSON.parser.parse(text,generateReviver(reviver))},parser:JSON};return CircularJSON}(JSON,RegExp);

// Initialize the Babylon.js engine
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

// Create a new scene
const scene = new BABYLON.Scene(engine);

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

// Define a function to create a new object
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
  newObj.position = position || new BABYLON.Vector3(0, 0, 0);
  newObj.rotation = rotation || new BABYLON.Vector3(0, 0, 0);
  newObj.scaling = scaling || new BABYLON.Vector3(1, 1, 1);
  newObj.material = material || new BABYLON.StandardMaterial("material", scene);
  newObj.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
  newObj.type = type;
  newObj.name = "New Object";
  // Add the object to the objects array
  objects.push(newObj);
  generateObjectExplorer();
  saveToFile();
  // Return the new object
  return newObj;
}

function saveToFile() {
  // Serialize each object and add it to the array
  let serializedObjects = [];
  for (let i = 0; i < objects.length; i++) {
    serializedObjects.push(
      CircularJSON.stringify(objects[i], (key, value) => {
        if (key == "_scene") {
          return undefined;
        } else {
          return value;
        }
      })
    );
  }

  // Join the serialized objects into a single string and save to localStorage
  let serializedData = serializedObjects.join(";");
  localStorage.setItem("objects", serializedData);
}

function loadScene(jsonData) {
  if (jsonData) {
    try {
        // Clear the existing scene
        scene.meshes.forEach(function(mesh) {
            mesh.dispose();
        });
        // Split the data into an array of serialized objects
        let serializedObjects = jsonData.split(";");
        objects = []
        // Deserialize each object and add it to the scene
        serializedObjects.forEach(function (serializedObject) {
            let objData = CircularJSON.parse(serializedObject);
            createObject(
            objData.type,
            objData.position,
            objData.rotation,
            objData.scaling,
            objData.material
            );
        });
    } catch (error) {
      console.log("Error loading scene:", error);
    }
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

  // copy and paste
  document.addEventListener("keydown", function(event) {
    switch(event.code) {
      case "KeyC":
        if (event.ctrlKey && selectedObject) {
          // Create a deep copy of the selected object using JSON.parse and JSON.stringify
          let copiedObject = CircularJSON.parse(CircularJSON.stringify(selectedObject));
          // Set the new object's name and position
         // copiedObject.name = "Copy of " + selectedObject.name;
          //copiedObject.position.x += 2;
          // Add the new object to the scene and to the objects array
          //scene.addMesh(copiedObject);
          //objects.push(copiedObject);
          // Set the copied object as the selected object and update the object explorer and property editor
          selectedObject = copiedObject;
          generateObjectExplorer();
          generatePropertyEditor();

        }
        break;
      case "KeyV":
        if (event.ctrlKey && selectedObject) {
          // Create a deep copy of the selected object using JSON.parse and JSON.stringify
          let copiedObject = CircularJSON.parse(CircularJSON.stringify(selectedObject));
          // Set the new object's name and position
          copiedObject.name = "Copy of " + selectedObject.name;
          copiedObject.position.x -= 2;
          // Add the new object to the scene and to the objects array
          scene.addMesh(copiedObject);
          objects.push(copiedObject);
          // Set the copied object as the selected object and update the object explorer and property editor
          selectedObject = copiedObject;
          generateObjectExplorer();
          generatePropertyEditor();

        }
        break;
    }
  });
  

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

const myObject = createObject("box")

loadScene(localStorage.getItem("objects"));
