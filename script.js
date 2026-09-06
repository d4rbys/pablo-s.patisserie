
// =====================================
// Pablo's Patisserie
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

        console.log("pablo is ready");
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
    return recipes[Math.floor(Math.random() * recipes.length)];
}

let currentRecipe = getRandomRecipe();


// =====================================
// PLAY BUTTON
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

        <br><br>

        <div class="toolbar">

            <label>Colour</label>

            <br>

            <input
                type="color"
                id="colourPicker"
                value="#5B3A29"
            >

            <br><br>

            <label>Brush Size</label>

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
            width="700"
            height="450"
        ></canvas>

        <br>

        <button id="eraser">
            Eraser
        </button>

        <button id="clear">
            Clear
        </button>

        <button id="submit">
            Submit
        </button>

        <div id="message"></div>

    `;

    setupCanvas();
}


// =====================================
// CANVAS
// =====================================

function setupCanvas() {

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const colourPicker =
        document.getElementById("colourPicker");

    const brushSize =
        document.getElementById("brushSize");

    let drawing = false;

    ctx.strokeStyle = colourPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";


    // Colour

    colourPicker.addEventListener("input", () => {

        ctx.strokeStyle = colourPicker.value;

    });


    // Brush size

    brushSize.addEventListener("input", () => {

        ctx.lineWidth = brushSize.value;

    });


    // Position

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


    // Start drawing

    canvas.addEventListener("pointerdown", (event) => {

        event.preventDefault();

        drawing = true;

        canvas.setPointerCapture(event.pointerId);

        const pos = getPosition(event);

        ctx.beginPath();

        ctx.moveTo(pos.x, pos.y);

    });


    // Drawing

    canvas.addEventListener("pointermove", (event) => {

        if (!drawing) return;

        event.preventDefault();

        const pos = getPosition(event);

        ctx.lineTo(pos.x, pos.y);

        ctx.stroke();

    });


    // Stop drawing

    canvas.addEventListener("pointerup", () => {

        drawing = false;

        ctx.beginPath();

    });


    canvas.addEventListener("pointercancel", () => {

        drawing = false;

        ctx.beginPath();

    });


    // Eraser

    document
        .getElementById("eraser")
        .addEventListener("click", () => {

            ctx.strokeStyle = "#FFFFFF";

        });


    // Clear

    document
        .getElementById("clear")
        .addEventListener("click", () => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

        });


    // Submit

    document
        .getElementById("submit")
        .addEventListener("click", async () => {

            const message =
                document.getElementById("message");

            message.innerHTML = `
                <p>Pablo is checking your drawing...</p>
            `;


            if (!model) {

                message.innerHTML = `
                    <p>AI is still loading. Please try again.</p>
                `;

                return;

            }


            try {

                const prediction =
                    await model.predict(canvas);

                let highestPrediction =
                    prediction[0];


                for (
                    let i = 1;
                    i < prediction.length;
                    i++
                ) {

                    if (
                        prediction[i].probability >
                        highestPrediction.probability
                    ) {

                        highestPrediction =
                            prediction[i];

                    }

                }


                const predictedObject =
                    highestPrediction.className;

                const confidence =
                    highestPrediction.probability;


                // Pablo's responses
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


                const MIN_CONFIDENCE = 0.75;


                if (
                    predictedObject.toLowerCase() ===
                    currentRecipe.toLowerCase()

                    &&

                    confidence >= MIN_CONFIDENCE

                ) {

                    const creatorName =
                        document
                            .getElementById("creatorName")
                            .value
                            .trim();

                    const creationName =
                        document
                            .getElementById("creationName")
                            .value
                            .trim();


                    if (!creatorName || !creationName) {

                        message.innerHTML = `
                            <p>
                                Please add your name and name your creation first!
                            </p>
                        `;

                        return;

                    }


                    message.innerHTML = `
                        <h2>Well Done!</h2>
                        <p>${randomResponse}</p>
                    `;


                } else {

                    message.innerHTML = `

                        <p>
                            Pablo isn't sure that's a
                            <strong>${currentRecipe}</strong>.
                        </p>

                        <p>
                            Try drawing it again!
                        </p>

                    `;

                }


            } catch (error) {

                console.error(
                    "Prediction failed:",
                    error
                );

                message.innerHTML = `
                    <p>
                        Pablo couldn't check the drawing.
                    </p>
                `;

            }

        });

}


// =====================================
// Start AI
// =====================================

loadAI();

// =====================================
// Community Shelf
// =====================================

document.addEventListener("click", (event) => {

    if (event.target.id === "shelfButton") {

        document.getElementById("communityShelf").style.display = "block";

    }

    if (event.target.id === "closeShelf") {

        document.getElementById("communityShelf").style.display = "none";

    }

});
