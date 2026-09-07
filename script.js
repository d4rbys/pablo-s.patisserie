// =====================================
// Supabase
// =====================================

const SUPABASE_URL =
    "https://bvlvexagwwzwitcuyttg.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_yG4ZpSU5nyiRMhqRXajclw_OvNWot7b";

let supabaseClient = null;

if (window.supabase) {

    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );

} else {

    console.error("Supabase library did not load.");

}
// =====================================
// Pablo's Patisserie
// Version 2.0
// =====================================

// =====================================
// Teachable Machine AI
// =====================================

const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/_TaaPk0nP/";

let model;
let maxPredictions;

async function loadAI() {

    const modelURL = MODEL_URL + "model.json";
    const metadataURL = MODEL_URL + "metadata.json";

    try {

        model = await tmImage.load(modelURL, metadataURL);

        maxPredictions = model.getTotalClasses();

        alert("pablo is ready ");

    } catch (error) {

        console.error("AI failed to load:", error);

    }

}

// =====================================
// App
// =====================================

const app = document.getElementById("app");

// =====================================
// Recipes
// =====================================

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

    return recipes[
        Math.floor(Math.random() * recipes.length)
    ];

}

let currentRecipe = getRandomRecipe();

// =====================================
// Drawing history
// =====================================

const drawingHistory = [];

let historyStep = -1;

function saveState(canvas) {

    historyStep++;

    drawingHistory.length = historyStep;

    drawingHistory.push(
        canvas.toDataURL()
    );

}

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

        <label for="creatorName">Your Name</label>

        <br>

        <input
            type="text"
            id="creatorName"
            placeholder="Your name"
            maxlength="30">

        <br><br>

        <label for="creationName">What did you create?</label>

        <br>

        <input
            type="text"
            id="creationName"
            placeholder="Name your creation"
            maxlength="40">

        <br><br>

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

}

// =====================================
// Canvas
// =====================================

function setupCanvas() {

    const canvas =
        document.getElementById("canvas");

    const ctx =
        canvas.getContext("2d");

    const colourPicker =
        document.getElementById("colourPicker");

    const brushSize =
        document.getElementById("brushSize");

    let drawing = false;

    drawingHistory.length = 0;
    historyStep = -1;

    saveState(canvas);

    ctx.strokeStyle = colourPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    colourPicker.addEventListener("input", () => {

        ctx.strokeStyle =
            colourPicker.value;

    });

    brushSize.addEventListener("input", () => {

        ctx.lineWidth =
            brushSize.value;

    });

    function getPosition(event) {

        const rect =
            canvas.getBoundingClientRect();

        return {

            x:
                (event.clientX - rect.left)
                * (canvas.width / rect.width),

            y:
                (event.clientY - rect.top)
                * (canvas.height / rect.height)

        };

    }

    canvas.addEventListener(
        "pointerdown",
        (event) => {

            event.preventDefault();

            drawing = true;

            canvas.setPointerCapture(
                event.pointerId
            );

            const pos =
                getPosition(event);

            ctx.beginPath();

            ctx.moveTo(
                pos.x,
                pos.y
            );

        }
    );

    canvas.addEventListener(
        "pointermove",
        (event) => {

            if (!drawing) return;

            event.preventDefault();

            const pos =
                getPosition(event);

            ctx.lineTo(
                pos.x,
                pos.y
            );

            ctx.stroke();

        }
    );

    function stopDrawing(event) {

        if (!drawing) return;

        drawing = false;

        ctx.beginPath();

        if (
            event &&
            canvas.hasPointerCapture(
                event.pointerId
            )
        ) {

            canvas.releasePointerCapture(
                event.pointerId
            );

        }

        saveState(canvas);

    }

    canvas.addEventListener(
        "pointerup",
        stopDrawing
    );

    canvas.addEventListener(
        "pointercancel",
        stopDrawing
    );

    canvas.addEventListener(
        "pointerleave",
        (event) => {

            if (
                drawing &&
                !canvas.hasPointerCapture(
                    event.pointerId
                )
            ) {

                stopDrawing(event);

            }

        }
    );

    // =====================================
    // Eraser
    // =====================================

    document
        .getElementById("eraser")
        .addEventListener("click", () => {

            ctx.strokeStyle = "#FFFFFF";

        });

    // =====================================
    // Clear
    // =====================================

    document
        .getElementById("clear")
        .addEventListener("click", () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            saveState(canvas);

        });

    // =====================================
    // Undo
    // =====================================

    document
        .getElementById("undo")
        .addEventListener("click", () => {

            if (historyStep <= 0) return;

            historyStep--;

            const img =
                new Image();

            img.src =
                drawingHistory[historyStep];

            img.onload = () => {

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                ctx.drawImage(
                    img,
                    0,
                    0
                );

            };

        });

    // =====================================
    // Redo
    // =====================================

    document
        .getElementById("redo")
        .addEventListener("click", () => {

            if (
                historyStep >=
                drawingHistory.length - 1
            ) return;

            historyStep++;

            const img =
                new Image();

            img.src =
                drawingHistory[historyStep];

            img.onload = () => {

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                ctx.drawImage(
                    img,
                    0,
                    0
                );

            };

        });

    // =====================================
    // Submit Drawing
    // =====================================

    document
        .getElementById("submit")
        .addEventListener(
            "click",
            async () => {

                const message =
                    document.getElementById(
                        "message"
                    );

                message.innerHTML =
                    `<p>Pablo is checking your drawing...</p>`;

                try {

                    if (!model) {

                        message.innerHTML =
                            `<p>Pablo isn't ready yet.</p>`;

                        return;

                    }

                    const prediction =
                        await model.predict(canvas);

                    let highestProbability = 0;
                    let predictedObject = "";

                    for (
                        let i = 0;
                        i < prediction.length;
                        i++
                    ) {

                        if (
                            prediction[i].probability >
                            highestProbability
                        ) {

                            highestProbability =
                                prediction[i].probability;

                            predictedObject =
                                prediction[i].className;

                        }

                    }

                    const confidence =
                        highestProbability;

                    const MIN_CONFIDENCE = 0.75;

                    const creatorName =
                        document
                            .getElementById(
                                "creatorName"
                            )
                            .value
                            .trim();

                    const creationName =
                        document
                            .getElementById(
                                "creationName"
                            )
                            .value
                            .trim();

                    if (
                        !creatorName ||
                        !creationName
                    ) {

                        message.innerHTML =
                            `<p>Please add your name and name your creation!</p>`;

                        return;

                    }

                    const responses = [
                        "majestic!",
                        "yummy!",
                        "nicely drawn!",
                        "the customers will love that!",
                        "yayy!"
                    ];

                    const randomResponse =
                        responses[
                            Math.floor(
                                Math.random() *
                                responses.length
                            )
                        ];

                    if (
                        predictedObject ===
                        currentRecipe &&
                        confidence >=
                        MIN_CONFIDENCE
                    ) {

                        const drawingData =
                            canvas.toDataURL(
                                "image/png"
                            );

                        const {
                            error
                        } = await supabase
                            .from(
                                "community_drawings"
                            )
                            .insert({
                                name:
                                    creatorName,

                                creation:
                                    creationName,

                                drawing:
                                    drawingData
                            });

                        if (error) {

                            console.error(
                                "Upload failed:",
                                error
                            );

                            message.innerHTML =
                                `<p>Pablo couldn't put your drawing on the Community Shelf.</p>`;

                            return;

                        }

                        message.innerHTML = `
                            <h2>Well Done!</h2>
                            <p>${randomResponse}</p>
                        `;

                    } else {

                        message.innerHTML = `
                            <p>Pablo isn't sure that's a <strong>${currentRecipe}</strong>.</p>
                            <p>Try drawing it again!</p>
                        `;

                    }

                } catch (error) {

                    console.error(error);

                    message.innerHTML =
                        `<p>Pablo couldn't check the drawing.</p>`;

                }

            }
        );

}

// =====================================
// Start AI
// =====================================

window.addEventListener(
    "load",
    () => {
        loadAI();
    }
);

// =====================================
// Community Shelf
// =====================================

async function loadCommunityShelf() {

    const shelfDrawings =
        document.getElementById(
            "shelfDrawings"
        );

    if (!shelfDrawings) return;

    shelfDrawings.innerHTML =
        "<p>Loading...</p>";

    const {
        data,
        error
    } = await supabase
        .from("community_drawings")
        .select(
            "name, creation, drawing"
        )
        .order(
            "id",
            {
                ascending: false
            }
        );

    if (error) {

        console.error(
            "Shelf failed to load:",
            error
        );

        shelfDrawings.innerHTML =
            "<p>Pablo couldn't load the Community Shelf.</p>";

        return;

    }

    shelfDrawings.innerHTML = "";

    if (!data || data.length === 0) {

        shelfDrawings.innerHTML =
            "<p>No creations yet. Be the first!</p>";

        return;

    }

    data.forEach((item) => {

        const drawingBox =
            document.createElement("div");

        const image =
            document.createElement("img");

        const creator =
            document.createElement("p");

        const creation =
            document.createElement("h3");

        image.src =
            item.drawing;

        image.alt =
            item.creation;

        image.style.maxWidth =
            "300px";

        image.style.borderRadius =
            "15px";

        creator.textContent =
            "Drawn by " + item.name;

        creation.textContent =
            item.creation;

        drawingBox.appendChild(
            creation
        );

        drawingBox.appendChild(
            image
        );

        drawingBox.appendChild(
            creator
        );

        shelfDrawings.appendChild(
            drawingBox
        );

    });

}
