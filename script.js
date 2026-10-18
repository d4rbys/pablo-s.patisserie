// =====================================
// SUPABASE
// =====================================

const SUPABASE_URL =
    "https://bvlvexagwwzwitcuyttg.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_yG4ZpSU5nyiRMhqRXajclw_OvNWot7b";

let supabaseClient = null;

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
// RECIPES
// =====================================

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
// TEACHABLE MACHINE AI
// =====================================

const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/_TaaPk0nP/";

let model = null;

async function loadAI() {
    try {
        if (!window.tmImage) {
            throw new Error("Teachable Machine library did not load.");
        }

        model = await tmImage.load(
            MODEL_URL + "model.json",
            MODEL_URL + "metadata.json"
        );

        console.log("Pablo AI is ready!");

        const labels = model.getClassLabels();

        console.log("Model classes:", labels);

        recipes.forEach((recipe) => {
            if (!labels.includes(recipe)) {
                console.warn(
                    `The AI model has no class called "${recipe}".`
                );
            }
        });
    } catch (error) {
        console.error("AI failed to load:", error);
    }
}


// =====================================
// STOREFRONT MENU
// =====================================

const app = document.getElementById("app");

const doorButton = document.getElementById("doorButton");
const doorMenu = document.getElementById("doorMenu");
const playButton = document.getElementById("playButton");
const shelfButton = document.getElementById("shelfButton");
const communityShelf = document.getElementById("communityShelf");
const closeShelf = document.getElementById("closeShelf");

if (doorButton && doorMenu) {
    doorButton.addEventListener("click", () => {
        doorMenu.hidden = false;
    });
}

if (playButton) {
    playButton.addEventListener("click", startGame);
}

if (shelfButton && communityShelf) {
    shelfButton.addEventListener("click", () => {
        communityShelf.hidden = false;
        loadCommunityShelf();
    });
}

if (closeShelf && communityShelf) {
    closeShelf.addEventListener("click", () => {
        communityShelf.hidden = true;
    });
}


// =====================================
// DRAWING HISTORY
// =====================================

const drawingHistory = [];

let historyStep = -1;

function saveState(canvas) {
    historyStep++;

    drawingHistory.length = historyStep;

    drawingHistory.push(canvas.toDataURL("image/png"));
}

function fillWhite(canvas, ctx) {
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}


// =====================================
// START GAME
// =====================================

function startGame() {
    app.innerHTML = `
        <main class="game-screen">

            <header class="game-header">
                <img
                    src="images/pablo.png"
                    alt="Pablo"
                    id="pablo"
                    onerror="this.style.display='none'"
                >

                <h1>Pablo's Patisserie</h1>
            </header>

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

            <br>

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

            <div class="tool-buttons">
                <button id="brush">Brush</button>
                <button id="eraser">Eraser</button>
                <button id="undo">Undo</button>
                <button id="redo">Redo</button>
                <button id="clear">Clear</button>
                <button id="submit">Submit</button>
                <button id="backToBakery">Back to bakery</button>
            </div>

            <div id="message" aria-live="polite"></div>

        </main>
    `;

    setupCanvas();

    document
        .getElementById("backToBakery")
        .addEventListener("click", () => location.reload());

    window.scrollTo(0, 0);
}


// =====================================
// CANVAS
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
    const message = document.getElementById("message");

    let drawing = false;
    let erasing = false;
    let saved = false;

    canvas.style.touchAction = "none";

    fillWhite(canvas, ctx);

    drawingHistory.length = 0;
    historyStep = -1;

    saveState(canvas);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function applyTool() {
        ctx.globalCompositeOperation = "source-over";

        ctx.strokeStyle = erasing
            ? "#ffffff"
            : colourPicker.value;

        ctx.lineWidth = Number(brushSize.value);
    }

    function getPosition(event) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) *
                (canvas.width / rect.width),

            y: (event.clientY - rect.top) *
                (canvas.height / rect.height)
        };
    }

    colourPicker.addEventListener("input", () => {
        erasing = false;
        applyTool();
    });

    brushSize.addEventListener("input", applyTool);

    brush.addEventListener("click", () => {
        erasing = false;
        applyTool();
    });

    eraser.addEventListener("click", () => {
        erasing = true;
        applyTool();
    });

    canvas.addEventListener("pointerdown", (event) => {
        event.preventDefault();

        drawing = true;

        canvas.setPointerCapture(event.pointerId);

        const pos = getPosition(event);

        applyTool();

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + 0.01, pos.y);
        ctx.stroke();
    });

    canvas.addEventListener("pointermove", (event) => {
        if (!drawing) return;

        event.preventDefault();

        const pos = getPosition(event);

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    });

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

    undo.addEventListener("click", () => {
        if (historyStep <= 0) return;

        historyStep--;

        restoreState(
            canvas,
            ctx,
            drawingHistory[historyStep]
        );
    });

    redo.addEventListener("click", () => {
        if (historyStep >= drawingHistory.length - 1) return;

        historyStep++;

        restoreState(
            canvas,
            ctx,
            drawingHistory[historyStep]
        );
    });

    clear.addEventListener("click", () => {
        fillWhite(canvas, ctx);
        applyTool();
        saveState(canvas);
    });

    // =====================================
    // SUBMIT DRAWING
    // =====================================

    submit.addEventListener("click", async () => {
        const creatorName =
            document.getElementById("creatorName").value.trim();

        const creationName =
            document.getElementById("creationName").value.trim();

        if (!creatorName || !creationName) {
            message.innerHTML =
                "<p>Please add your name and name your creation!</p>";
            return;
        }

        if (!model) {
            message.innerHTML =
                "<p>Pablo isn't ready yet. Please wait a moment and try again.</p>";
            return;
        }

        submit.disabled = true;

        message.innerHTML =
            "<p>Pablo is checking your drawing...</p>";

        try {
            const prediction = await model.predict(canvas);

            let best = prediction[0];

            prediction.forEach((p) => {
                if (p.probability > best.probability) {
                    best = p;
                }
            });

            const predictedObject = best.className;
            const confidence = best.probability;
            const MIN_CONFIDENCE = 0.55;
            const DEBUG = true;

            console.log(
                "Pablo's guesses:",
                prediction.map(
                    (p) =>
                        `${p.className}: ${p.probability.toFixed(2)}`
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
                responses[
                    Math.floor(Math.random() * responses.length)
                ];

            const isMatch =
                predictedObject.trim().toLowerCase() ===
                currentRecipe.toLowerCase();

            if (isMatch && confidence >= MIN_CONFIDENCE) {
                const drawingData =
                    canvas.toDataURL("image/jpeg", 0.8);

                const client = getSupabase();

                if (!client) {
                    message.innerHTML =
                        "<p>Pablo couldn't connect to the Community Shelf.</p>";
                    return;
                }

                const result = await client
                    .from("community_drawings")
                    .insert({
                        name: creatorName,
                        creation: creationName,
                        drawing: drawingData
                    });

                if (result.error) {
                    console.error("Upload failed:", result.error);

                    message.innerHTML =
                        "<p>Pablo couldn't put your drawing on the Community Shelf.</p>";
                    return;
                }

                saved = true;

                message.innerHTML = `
                    <h2>Well Done!</h2>
                    <p>${randomResponse}</p>
                    <button id="successBack">Back to the bakery</button>
                `;

                document
                    .getElementById("successBack")
                    .addEventListener("click", () => location.reload());

            } else {
                message.innerHTML = `
                    <p>
                        Pablo isn't sure that's a
                        <strong>${escapeHtml(currentRecipe)}</strong>.
                    </p>

                    <p>Try drawing it again!</p>

                    ${
                        DEBUG
                            ? `<p class="status-note"><em>
                                Debug: Pablo saw a
                                ${escapeHtml(predictedObject)},
                                ${Math.round(confidence * 100)}% sure
                            </em></p>`
                            : ""
                    }
                `;
            }

        } catch (error) {
            console.error("Drawing check failed:", error);

            message.innerHTML =
                "<p>Pablo couldn't check the drawing.</p>";

        } finally {
            submit.disabled = saved;
        }
    });

    applyTool();
}


// =====================================
// RESTORE CANVAS — UNDO / REDO
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
// SAFE TEXT FOR DEBUG MESSAGE
// =====================================

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}


// =====================================
// COMMUNITY SHELF
// =====================================

async function loadCommunityShelf() {
    const shelfDrawings =
        document.getElementById("shelfDrawings");

    if (!shelfDrawings) return;

    shelfDrawings.innerHTML = "<p>Loading...</p>";

    const client = getSupabase();

    if (!client) {
        shelfDrawings.innerHTML =
            "<p>Pablo couldn't connect to the Community Shelf.</p>";
        return;
    }

    try {
        const result = await client
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
            const card = document.createElement("article");
            card.className = "shelf-card";

            const title = document.createElement("h3");
            const image = document.createElement("img");
            const creator = document.createElement("p");

            title.textContent =
                item.creation || "Untitled creation";

            image.src = item.drawing;
            image.alt = item.creation || "Community drawing";

            creator.textContent =
                "Drawn by " + (item.name || "A baker");

            card.append(title, image, creator);
            shelfDrawings.appendChild(card);
        });

    } catch (error) {
        console.error("Community Shelf error:", error);

        shelfDrawings.innerHTML =
            "<p>Pablo couldn't load the Community Shelf.</p>";
    }
}


// =====================================
// START AI WHEN THE PAGE LOADS
// =====================================

window.addEventListener("load", loadAI);
