```javascript
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
// =====================================


// =====================================
// Teachable Machine AI
// =====================================

const MODEL_URL =
    "https://teachablemachine.withgoogle.com/models/_TaaPk0nP/";

let model = null;
let maxPredictions = 0;

async function loadAI() {

    const modelURL =
        MODEL_URL + "model.json";

    const metadataURL =
        MODEL_URL + "metadata.json";

    try {

        model =
            await tmImage.load(
                modelURL,
                metadataURL
            );

        maxPredictions =
            model.getTotalClasses();

        console.log(
            "Pablo AI is ready!"
        );

    } catch (error) {

        console.error(
            "AI failed to load:",
            error
        );

    }

}


// =====================================
// App
// =====================================

const app =
    document.getElementById("app");


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
        Math.floor(
            Math.random() *
            recipes.length
        )
    ];

}


let currentRecipe =
    getRandomRecipe();


// =====================================
// Drawing History
// =====================================

const drawingHistory = [];

let historyStep = -1;


function saveState(canvas) {

    historyStep++;

    drawingHistory.length =
        historyStep;

    drawingHistory.push(
        canvas.toDataURL()
    );

}


// =====================================
// Start Game
// =====================================

const playButton =
    document.getElementById(
        "playButton"
    );


if (playButton) {

    playButton.addEventListener(
        "click",
        startGame
    );

}


function startGame() {

    app.innerHTML = `

        <header>

            <h1>
                Pablo's Patisserie
            </h1>

        </header>

        <main>

            <h2>
                Today's Order
            </h2>

            <p id="recipe">
                Draw a
                <strong>
                    ${currentRecipe}
                </strong>
            </p>

            <div class="creatorDetails">

                <label for="creatorName">
                    Your Name
                </label>

                <br>

                <input
                    type="text"
                    id="creatorName"
                    placeholder="Your name"
                    maxlength="30"
                >

                <br><br>

                <label for="creationName">
                    What did you create?
                </label>

                <br>

                <input
                    type="text"
                    id="creationName"
                    placeholder="Name your creation"
                    maxlength="40"
                >

            </div>

            <br>

            <div class="toolbar">

                <label for="colourPicker">
                    Colour
                </label>

                <br>

                <input
                    type="color"
                    id="colourPicker"
                    value="#5B3A29"
                >

                <br><br>

                <label for="brushSize">
                    Brush Size
                </label>

                <br>

                <input
                    type="range"
                    id="brushSize"
                    min="2"
                    max="30"
                    value="6"
                >

            </div>

            <br>

            <canvas
                id="canvas"
                width="700"
                height="450"
            ></canvas>

            <br><br>

            <div class="drawingButtons">

                <button id="eraser">
                    Eraser
                </button>

                <button id="undo">
                    Undo
                </button>

                <button id="redo">
                    Redo
                </button>

                <button id="clear">
                    Clear
                </button>

                <button id="submit">
                    Submit
                </button>

            </div>

            <div id="message"></div>

        </main>

    `;

    setupCanvas();

}


// =====================================
// Canvas
// =====================================

function setupCanvas() {

    const canvas =
        document.getElementById(
            "canvas"
        );

    const ctx =
        canvas.getContext("2d");

    const colourPicker =
        document.getElementById(
            "colourPicker"
        );

    const brushSize =
        document.getElementById(
            "brushSize"
        );

    const eraser =
        document.getElementById(
            "eraser"
        );

    const undo =
        document.getElementById(
            "undo"
        );

    const redo =
        document.getElementById(
            "redo"
        );

    const clear =
        document.getElementById(
            "clear"
        );

    const submit =
        document.getElementById(
            "submit"
        );


    let drawing = false;

    let erasing = false;


    // Reset history for new drawing

    drawingHistory.length = 0;

    historyStep = -1;

    saveState(canvas);


    // =====================================
    // Drawing Settings
    // =====================================

    ctx.strokeStyle =
        colourPicker.value;

    ctx.lineWidth =
        Number(
            brushSize.value
        );

    ctx.lineCap =
        "round";

    ctx.lineJoin =
        "round";


    // =====================================
    // Colour
    // =====================================

    colourPicker.addEventListener(
        "input",
        () => {

            erasing = false;

            ctx.globalCompositeOperation =
                "source-over";

            ctx.strokeStyle =
                colourPicker.value;

        }
    );


    // =====================================
    // Brush Size
    // =====================================

    brushSize.addEventListener(
        "input",
        () => {

            ctx.lineWidth =
                Number(
                    brushSize.value
                );

        }
    );


    // =====================================
    // Mouse / Touch Position
    // =====================================

    function getPosition(event) {

        const rect =
            canvas.getBoundingClientRect();

        return {

            x:
                (event.clientX - rect.left)
                *
                (
                    canvas.width /
                    rect.width
                ),

            y:
                (event.clientY - rect.top)
                *
                (
                    canvas.height /
                    rect.height
                )

        };

    }


    // =====================================
    // Start Drawing
    // =====================================

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


    // =====================================
    // Draw
    // =====================================

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


    // =====================================
    // Stop Drawing
    // =====================================

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


    // =====================================
    // Eraser
    // =====================================

    eraser.addEventListener(
        "click",
        () => {

            erasing = true;

            ctx.globalCompositeOperation =
                "destination-out";

        }
    );


    // =====================================
    // Undo
    // =====================================

    undo.addEventListener(
        "click",
        () => {

            if (
                historyStep <= 0
            ) {

                return;

            }


            historyStep--;

            restoreState(
                canvas,
                ctx,
                drawingHistory[
                    historyStep
                ]
            );

        }
    );


    // =====================================
    // Redo
    // =====================================

    redo.addEventListener(
        "click",
        () => {

            if (
                historyStep >=
                drawingHistory.length - 1
            ) {

                return;

            }


            historyStep++;

            restoreState(
                canvas,
                ctx,
                drawingHistory[
                    historyStep
                ]
            );

        }
    );


    // =====================================
    // Clear
    // =====================================

    clear.addEventListener(
        "click",
        () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            saveState(canvas);

        }
    );


    // =====================================
    // Submit
    // =====================================

    submit.addEventListener(
        "click",
        async () => {

            const message =
                document.getElementById(
                    "message"
                );


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


            // =====================================
            // Check Names
            // =====================================

            if (
                !creatorName ||
                !creationName
            ) {

                message.innerHTML = `

                    <p>
                        Please add your name
                        and name your creation!
                    </p>

                `;

                return;

            }


            // =====================================
            // Check AI
            // =====================================

            message.innerHTML = `

                <p>
                    Pablo is checking
                    your drawing...
                </p>

            `;


            if (!model) {

                message.innerHTML = `

                    <p>
                        Pablo isn't ready yet.
                        Please wait a moment
                        and try again.
                    </p>

                `;

                return;

            }


            try {

                const prediction =
                    await model.predict(
                        canvas
                    );


                let highestProbability = 0;

                let predictedObject = "";


                for (
                    let i = 0;
                    i < prediction.length;
                    i++
                ) {

                    if (
                        prediction[i]
                            .probability >
                        highestProbability
                    ) {

                        highestProbability =
                            prediction[i]
                                .probability;

                        predictedObject =
                            prediction[i]
                                .className;

                    }

                }


                const confidence =
                    highestProbability;


                const MIN_CONFIDENCE =
                    0.75;


                console.log(
                    "Pablo predicted:",
                    predictedObject
                );

                console.log(
                    "Confidence:",
                    confidence
                );


                // =====================================
                // Pablo Responses
                // =====================================

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


                // =====================================
                // Correct Drawing
                // =====================================

                if (
                    predictedObject ===
                    currentRecipe
                    &&
                    confidence >=
                    MIN_CONFIDENCE
                ) {


                    const drawingData =
                        canvas.toDataURL(
                            "image/png"
                        );


                    // =====================================
                    // Save to Community Shelf
                    // =====================================

                    if (
                        !supabaseClient
                    ) {

                        message.innerHTML = `

                            <p>
                                Pablo couldn't
                                connect to the
                                Community Shelf.
                            </p>

                        `;

                        return;

                    }


                    const result =
                        await supabaseClient
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


                    if (
                        result.error
                    ) {

                        console.error(
                            "Upload failed:",
                            result.error
                        );


                        message.innerHTML = `

                            <p>
                                Pablo couldn't
                                put your drawing
                                on the Community Shelf.
                            </p>

                        `;

                        return;

                    }


                    message.innerHTML = `

                        <h2>
                            Well Done!
                        </h2>

                        <p>
                            ${randomResponse}
                        </p>

                    `;


                } else {


                    // =====================================
                    // Incorrect Drawing
                    // =====================================

                    message.innerHTML = `

                        <h2>
                            Almost!
                        </h2>

                        <p>
                            Pablo isn't sure
                            that's a
                            <strong>
                                ${currentRecipe}
                            </strong>.
                        </p>

                        <p>
                            Try drawing it again!
                        </p>

                    `;

                }


            } catch (error) {

                console.error(
                    "Drawing check failed:",
                    error
                );


                message.innerHTML = `

                    <p>
                        Pablo couldn't check
                        the drawing.
                    </p>

                `;

            }

        }
    );

}


// =====================================
// Restore Canvas State
// =====================================

function restoreState(
    canvas,
    ctx,
    state
) {

    const img =
        new Image();

    img.src = state;

    img.onload = () => {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.globalCompositeOperation =
            "source-over";

        ctx.drawImage(
            img,
            0,
            0
        );

    };

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


    if (!shelfDrawings) {

        return;

    }


    shelfDrawings.innerHTML =
        "<p>Loading...</p>";


    if (!supabaseClient) {

        shelfDrawings.innerHTML =
            "<p>Pablo couldn't connect to the Community Shelf.</p>";

        return;

    }


    try {

        const result =
            await supabaseClient
                .from(
                    "community_drawings"
                )
                .select(
                    "name, creation, drawing"
                )
                .order(
                    "id",
                    {
                        ascending: false
                    }
                );


        const data =
            result.data;

        const error =
            result.error;


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


        if (
            !data ||
            data.length === 0
        ) {

            shelfDrawings.innerHTML =
                "<p>No creations yet. Be the first!</p>";

            return;

        }


        // =====================================
        // Display Drawings
        // =====================================

        data.forEach(
            (item) => {

                const drawingBox =
                    document.createElement(
                        "div"
                    );


                const image =
                    document.createElement(
                        "img"
                    );


                const creator =
                    document.createElement(
                        "p"
                    );


                const creation =
                    document.createElement(
                        "h3"
                    );


                image.src =
                    item.drawing;

                image.alt =
                    item.creation;

                image.style.maxWidth =
                    "300px";

                image.style.borderRadius =
                    "15px";


                creator.textContent =
                    "Drawn by " +
                    item.name;


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

            }
        );

    } catch (error) {

        console.error(
            "Community Shelf error:",
            error
        );


        shelfDrawings.innerHTML =
            "<p>Pablo couldn't load the Community Shelf.</p>";

    }

}
```
