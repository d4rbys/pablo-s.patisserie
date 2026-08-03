const MODEL_URL =
"https://teachablemachine.withgoogle.com/models/_TaaPk0nP/";
async function loadAI() {

    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    model = await tmImage.load(modelURL, metadataURL);

    maxPredictions = model.getTotalClasses();

    alert("pablo is ready ");

}

let model;
let maxPredictions;
// =====================================
// Pablo's Patisserie
// Version 2.0
// =====================================

const app = document.getElementById("app");
// =====================================
// Future AI Recognition
// =====================================

async function recogniseDrawing(image) {

    // We will replace this with real AI later.

    return {

        correct: true,

        object: todayRecipe,

        confidence: 100,

        feedback: "Looks good!"

    };

}

// Today's recipe
const recipes = [
    "Cookie",
    "Cupcake",
    "Croissant",
    "Cake",
    "Pie",
    "Bread",
    "Pretzel",
    "Doughnut",
    "Baguette",
    "Birthday Cake"
];

function getRandomRecipe() {

    return recipes[Math.floor(Math.random() * recipes.length)];

}

let currentRecipe = getRandomRecipe();

// =====================================
// Start Game
// =====================================

document
    .getElementById("playButton")
    .addEventListener("click", startGame);

function startGame() {

    app.innerHTML = `

        <h1>Pablo's Patisserie</h1>

        <h2>Today's Order</h2>

        <p id="recipe">
            Draw a <strong>${currentRecipe}</strong>
        </p>

        <div class="toolbar">

            <label>Colour</label>

            <br>

            <input
                type="color"
                id="colourPicker"
                value="#5B3A29">

            <br><br>

            <label>Brush Size</label>

            <br>

            <input
                type="range"
                id="brushSize"
                min="2"
                max="30"
                value="6">

        </div>

        <canvas
            id="canvas"
            width="700"
            height="450">
        </canvas>

        <br>

        <button id="eraser">Eraser</button>

        <button id="undo">Undo</button>

        <button id="redo">Redo</button>

        <button id="clear">Clear</button>

        <button id="submit">Submit</button>

        <div id="message"></div>

    `;

    setupCanvas();

}// =====================================
// Canvas
// =====================================

function setupCanvas() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const colourPicker =
        document.getElementById("colourPicker");

    const brushSize =
        document.getElementById("brushSize");

    let drawing = false;
    saveState(canvas);

    // Drawing settings

    ctx.strokeStyle = colourPicker.value;

    ctx.lineWidth = brushSize.value;

    ctx.lineCap = "round";

    ctx.lineJoin = "round";

    // Update colour

    colourPicker.addEventListener("input", () => {

        ctx.strokeStyle = colourPicker.value;

    });
    // =====================================
// Submit Drawing
// =====================================

document.getElementById("submit").addEventListener("click", () => {

    const message = document.getElementById("message");

    message.innerHTML = `
        <div class="loading"></div>
        <p>Pablo is checking your drawing...</p>
    `;

    setTimeout(() => {

        const responses = [

            "majestic!",

            "yummy!",

            "nicely drawn!",

            "the customers will love that!",

            "yayy!"

        ];

        const randomResponse =

            responses[Math.floor(Math.random() * responses.length)];

        message.innerHTML = `

            <h2>Well Done!</h2>

            <p>${randomResponse}</p>

        `;

    },1500);

});

    // Update brush size

    brushSize.addEventListener("input", () => {

        ctx.lineWidth = brushSize.value;

    });

    // Mouse Position

    function getPosition(event) {

        const rect = canvas.getBoundingClientRect();

        return {

            x: event.clientX - rect.left,

            y: event.clientY - rect.top

        };

    }

    // Start Drawing

    canvas.addEventListener("pointerdown", (event) => {

        drawing = true;

        const pos = getPosition(event);

        ctx.beginPath();

        ctx.moveTo(pos.x, pos.y);

    });

    // Draw

    canvas.addEventListener("pointermove", (event) => {

        if (!drawing) return;

        const pos = getPosition(event);

        ctx.lineTo(pos.x, pos.y);

        ctx.stroke();

    });

    // Stop Drawing

   window.addEventListener("pointerup", () => {

    if (drawing) {

        saveState(canvas);

    }

    drawing = false;

    ctx.beginPath();// =====================
// Eraser
// =====================

document.getElementById("eraser").addEventListener("click", () => {

    ctx.strokeStyle = "#FFFFFF";

});

// =====================
// Clear
// =====================

document.getElementById("clear").addEventListener("click", () => {

    ctx.clearRect(0,0,canvas.width,canvas.height);

    saveState(canvas);

});

// =====================
// Undo
// =====================

document.getElementById("undo").addEventListener("click", () => {

    if(historyStep <= 0) return;

    historyStep--;

    const img = new Image();

    img.src = history[historyStep];

    img.onload = () => {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.drawImage(img,0,0);

    };

});

// =====================
// Redo
// =====================

document.getElementById("redo").addEventListener("click", () => {

    if(historyStep >= history.length-1) return;

    historyStep++;

    const img = new Image();

    img.src = history[historyStep];

    img.onload = () => {

        ctx.clearRect(0,0,canvas.width,canvas.height);

        ctx.drawImage(img,0,0);

    };

});

// Switch back to colour

colourPicker.addEventListener("input", () => {

    ctx.strokeStyle = colourPicker.value;

});

});

}// =====================================
// Undo / Redo / Eraser / Clear
// =====================================

// Drawing history

const history = [];

let historyStep = -1;

// Save canvas state

function saveState(canvas) {

    historyStep++;

    history.length = historyStep;

    history.push(canvas.toDataURL());

}
loadAI();
