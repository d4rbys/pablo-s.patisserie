// =====================================
// Supabase
// =====================================

const SUPABASE_URL =
    "https://bvlvexagwwzwitcuyttg.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_yG4ZpSU5nyiRMhqRXajclw_OvNWot7b";

let supabaseClient = null;

// Created only when needed, and wrapped in try/catch, so a
// Supabase problem can never stop the Play button working.
function getSupabase() {

    if (supabaseClient) return supabaseClient;

    try {

        if (window.supabase) {

            supabaseClient = window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_ANON_KEY
            );

        } else {

            console.error("Supabase library did not load.");

        }

    } catch (error) {

        console.error("Supabase setup failed:", error);

    }

    return supabaseClient;

}


// =====================================
// Recipes
// =====================================

// These names must match your Teachable Machine class names EXACTLY
const recipes = [
    "Cookie",
    "Cupcake",
    "Croissant",
    "Pie",
    "Bread",
    "Pretzel",
    "Doughnut",
    "Cake"
];

function getRandomRecipe() {
    return recipes[Math.floor(Math.random() * recipes.length)];
}

let currentRecipe = getRandomRecipe();


// =====================================
// Teachable Machine AI
// =====================================

const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/_TaaPk0nP/";

let model = null;

async function loadAI() {

    try {

        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );

        console.log("Pablo AI is ready!");

        // Helpful check: does the model know every recipe?
        const labels = model.getClassLabels();
        console.log("Model classes:", labels);

        recipes.forEach((recipe) => {
            if (!labels.includes(recipe)) {
                console.warn(
                    `Your model has no class called "${recipe}". ` +
                    `Pablo can never accept that drawing until you add it.`
                );
            }
        });

    } catch (error) {

        console.error("AI failed to load:", error);

    }
}


// =====================================
// App
// =====================================

const app = document.getElementById("app");

// Show today's recipe on the home screen (this was missing,
// which is why it said "Loading..." forever)
const recipeNameEl = document.getElementById("recipeName");

if (recipeNameEl) {
    recipeNameEl.textContent = currentRecipe;
}


// =====================================
// Drawing History
// =====================================

const drawingHistory = [];

let historyStep = -1;

function saveState(canvas) {

    historyStep++;

    drawingHistory.length = historyStep;

    drawingHistory.push(canvas.toDataURL());

}


// Fill the canvas with solid white. The AI needs a white
// background, because a transparent canvas is read as BLACK.
function fillWhite(canvas, ctx) {

    ctx.globalCompositeOperation = "source-over";

    ctx.fillStyle = "#ffffff";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

}


// =====================================
// Start Game
// =====================================

const playButton = document.getElementById("playButton");

if (playButton) {
    playButton.addEventListener("click", startGame);
}

function startGame() {

    app.innerHTML = `

        <header>

            <img src="images/pablo.png" alt="Pablo" id="pablo">

            <h1>Pablo's Patisserie</h1>

        </header>

        <main>

            <h2>Today's Order</h2>

            <p id="recipe">
                Draw a
                <strong>${currentRecipe}</strong>
            </p>

            <label for="creatorName">Your Name</label>
            <br>
            <input
                type="text"
                id="creatorName"
                placeholder="Your name"
                maxlength="30"
            >

            <br><br>

            <label for="creationName">What did you create?</label>
            <br>
            <input
                type="text"
                id="creationName"
                placeholder="Name your creation"
                maxlength="40"
            >

            <br><br>

            <div class="toolbar">

                <label for="colourPicker">Colour</label>
                <br>
                <input
                    type="color"
                    id="colourPicker"
                    value="#5B3A29"
                >

                <br><br>

                <label for="brushSize">Brush Size</label>
                <br>
                <input
                    type="range"
                    id="brushSize"
                    min="2"
                    max="30"
                    value="6"
                >

            </div>

            <canvas
                id="canvas"
                width="600"
                height="600"
            ></canvas>

            <br><br>

            <button id="brush">Brush</button>
            <button id="eraser">Eraser</button>
            <button id="undo">Undo</button>
            <button id="redo">Redo</button>
            <button id="clear">Clear</button>
            <button id="submit">Submit</button>

            <div id="message"></div>

        </main>

    `;

    setupCanvas();

    window.scrollTo(0, 0);

}


// =====================================
// Canvas
// =====================================

function setupCanvas() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const colourPicker = document.getElementById("colourPicker");
    const brushSize = document.getElementById("brushSize");
    const brush = document.getElementById("brush");
    const eraser = document.getElementById("eraser");
    const undo = document.getElementById("undo");
    const redo = document.getElementById("redo");
    const clear = document.getElementById("clear");
    const submit = document.getElementById("submit");

    let drawing = false;
    let erasing = false;

    // Stops the page scrolling while drawing on a phone/tablet
    canvas.style.touchAction = "none";

    // White background to start
    fillWhite(canvas, ctx);

    // Reset history
    drawingHistory.length = 0;
    historyStep = -1;

    saveState(canvas);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";


    // Apply the current tool (brush or eraser) to the canvas
    function applyTool() {

        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle =
            erasing ? "#ffffff" : colourPicker.value;

        ctx.lineWidth = Number(brushSize.value);

    }

    applyTool();


    // ---- Colour ----

    colourPicker.addEventListener("input", () => {

        erasing = false;

        applyTool();

    });


    // ---- Brush size ----

    brushSize.addEventListener("input", applyTool);


    // ---- Brush / Eraser buttons ----

    brush.addEventListener("click", () => {

        erasing = false;

        applyTool();

    });

    eraser.addEventListener("click", () => {

        erasing = true;

        applyTool();

    });


    // ---- Position ----

    function getPosition(event) {

        const rect = canvas.getBoundingClientRect();

        return {

            x: (event.clientX - rect.left) * (canvas.width / rect.width),

            y: (event.clientY - rect.top) * (canvas.height / rect.height)

        };

    }


    // ---- Start drawing ----

    canvas.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        drawing = true;

        canvas.setPointerCapture(event.pointerId);

        const pos = getPosition(event);

        ctx.beginPath();

        ctx.moveTo(pos.x, pos.y);

        // Tiny line so a single tap makes a dot
        ctx.lineTo(pos.x + 0.01, pos.y);

        ctx.stroke();

    });


    // ---- Draw ----

    canvas.addEventListener("pointermove", (event) => {

        if (!drawing) return;

        event.preventDefault();

        const pos = getPosition(event);

        ctx.lineTo(pos.x, pos.y);

        ctx.stroke();

    });


    // ---- Stop drawing ----

    function stopDrawing(event) {

        if (!drawing) return;

        drawing = false;

        ctx.beginPath();

        if (
            event &&
            canvas.hasPointerCapture(event.pointerId)
        ) {
            canvas.releasePointerCapture(event.pointerId);
        }

        saveState(canvas);

    }

    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);


    // ---- Undo ----

    undo.addEventListener("click", () => {

        if (historyStep <= 0) return;

        historyStep--;

        restoreState(canvas, ctx, drawingHistory[historyStep]);

    });


    // ---- Redo ----

    redo.addEventListener("click", () => {

        if (historyStep >= drawingHistory.length - 1) return;

        historyStep++;

        restoreState(canvas, ctx, drawingHistory[historyStep]);

    });


    // ---- Clear ----

    clear.addEventListener("click", () => {

        fillWhite(canvas, ctx);

        applyTool();

        saveState(canvas);

    });


    // ---- Submit ----

    let saved = false;

    submit.addEventListener("click", async () => {

        const message = document.getElementById("message");

        const creatorName =
            document.getElementById("creatorName").value.trim();

        const creationName =
            document.getElementById("creationName").value.trim();


        if (!creatorName || !creationName) {

            message.innerHTML =
                `<p>Please add your name and name your creation!</p>`;

            return;

        }

        if (!model) {

            message.innerHTML =
                `<p>Pablo isn't ready yet. Please wait a moment and try again.</p>`;

            return;

        }

        // Stop double-clicks creating duplicate shelf entries
        submit.disabled = true;

        message.innerHTML =
            `<p>Pablo is checking your drawing...</p>`;


        try {

            const prediction = await model.predict(canvas);

            // Find the class the AI is most sure about
            let best = prediction[0];

            prediction.forEach((p) => {
                if (p.probability > best.probability) best = p;
            });

            const predictedObject = best.className;
            const confidence = best.probability;

            const MIN_CONFIDENCE = 0.55;

            // Set to false once everything works
            const DEBUG = true;

            // Full list so you can see what the AI is thinking
            console.log(
                "Pablo's guesses:",
                prediction.map(
                    (p) => `${p.className}: ${p.probability.toFixed(2)}`
                )
            );


            const responses = [
                "majestic!",
                "yummy!",
                "nicely drawn!",
                "the customers will love that!",
                "yayy!"
            ];

            const randomResponse =
                responses[Math.floor(Math.random() * responses.length)];


            const isMatch =
                predictedObject.trim().toLowerCase() ===
                currentRecipe.toLowerCase();

            if (isMatch && confidence >= MIN_CONFIDENCE) {

                // JPEG keeps the file much smaller for the database
                const drawingData =
                    canvas.toDataURL("image/jpeg", 0.8);

                if (!getSupabase()) {

                    message.innerHTML =
                        `<p>Pablo couldn't connect to the Community Shelf.</p>`;

                    return;

                }

                const result =
                    await getSupabase()
                        .from("community_drawings")
                        .insert({
                            name: creatorName,
                            creation: creationName,
                            drawing: drawingData
                        });

                if (result.error) {

                    console.error("Upload failed:", result.error);

                    message.innerHTML =
                        `<p>Pablo couldn't put your drawing on the Community Shelf.</p>`;

                    return;

                }

                saved = true;

                message.innerHTML = `

                    <h2>Well Done!</h2>

                    <p>${randomResponse}</p>

                    <button onclick="location.reload()">
                        Back to the bakery
                    </button>

                `;

            } else {

                message.innerHTML = `

                    <p>
                        Pablo isn't sure that's a
                        <strong>${currentRecipe}</strong>.
                    </p>

                    <p>Try drawing it again!</p>

                    ${DEBUG
                        ? `<p><em>Debug: Pablo saw a ${predictedObject},
                           ${Math.round(confidence * 100)}% sure</em></p>`
                        : ""}

                `;

            }

        } catch (error) {

            console.error("Drawing check failed:", error);

            message.innerHTML =
                `<p>Pablo couldn't check the drawing.</p>`;

        } finally {

            // Only keep the button locked after a successful save
            submit.disabled = saved;

        }

    });

}


// =====================================
// Restore Canvas (undo / redo)
// =====================================

function restoreState(canvas, ctx, state) {

    const img = new Image();

    img.onload = () => {

        fillWhite(canvas, ctx);

        ctx.drawImage(img, 0, 0);

    };

    img.src = state;

}


// =====================================
// Start AI
// =====================================

window.addEventListener("load", () => {

    loadAI();

});


// =====================================
// Community Shelf
// =====================================

async function loadCommunityShelf() {

    const shelfDrawings = document.getElementById("shelfDrawings");

    if (!shelfDrawings) return;

    shelfDrawings.innerHTML = "<p>Loading...</p>";

    if (!getSupabase()) {

        shelfDrawings.innerHTML =
            "<p>Pablo couldn't connect to the Community Shelf.</p>";

        return;

    }

    try {

        const result =
            await getSupabase()
                .from("community_drawings")
                .select("name, creation, drawing")
                .order("id", { ascending: false })
                .limit(50);

        if (result.error) {

            console.error("Shelf failed to load:", result.error);

            shelfDrawings.innerHTML =
                "<p>Pablo couldn't load the Community Shelf.</p>";

            return;

        }

        shelfDrawings.innerHTML = "";

        if (!result.data || result.data.length === 0) {

            shelfDrawings.innerHTML =
                "<p>No creations yet. Be the first!</p>";

            return;

        }

        result.data.forEach((item) => {

            const drawingBox = document.createElement("div");
            const image = document.createElement("img");
            const creator = document.createElement("p");
            const creation = document.createElement("h3");

            image.src = item.drawing;
            image.alt = item.creation;
            image.style.maxWidth = "300px";
            image.style.borderRadius = "15px";

            creator.textContent = "Drawn by " + item.name;
            creation.textContent = item.creation;

            drawingBox.appendChild(creation);
            drawingBox.appendChild(image);
            drawingBox.appendChild(creator);

            shelfDrawings.appendChild(drawingBox);

        });

    } catch (error) {

        console.error("Community Shelf error:", error);

        shelfDrawings.innerHTML =
            "<p>Pablo couldn't load the Community Shelf.</p>";

    }

}
