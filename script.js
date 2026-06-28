const app = document.getElementById("app");

document.getElementById("playButton").addEventListener("click", startGame);

function startGame() {

    app.innerHTML = `
        <h1>🐶 Pablo's Patisserie</h1>

        <h2>Today's Order</h2>

        <p>🍪 Draw a Cookie!</p>

        <div class="toolbar">

            <label>🎨 Colour</label><br>
            <input type="color" id="colourPicker" value="#4b2e1e">

            <br><br>

            <label>✏️ Brush Size</label><br>
            <input type="range" id="brushSize" min="2" max="30" value="6">

        </div>

        <canvas id="canvas" width="700" height="450"></canvas>

        <br>

        <button id="eraser">🧽 Eraser</button>
        <button id="undo">↩ Undo</button>
        <button id="redo">↪ Redo</button>
        <button id="clear">🗑 Clear</button>
        <button id="submit">🍰 Submit</button>

        <div id="message"></div>
    `;

    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const colourPicker = document.getElementById("colourPicker");
    const brushSize = document.getElementById("brushSize");

    let drawing = false;
    let currentColour = colourPicker.value;

    const history = [];
    let historyStep = -1;    function saveState() {
        historyStep++;
        history.splice(historyStep);
        history.push(canvas.toDataURL());
    }

    function restoreState(step) {
        const img = new Image();

        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
        };

        img.src = history[step];
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = currentColour;
    ctx.lineWidth = brushSize.value;

    saveState();

    colourPicker.addEventListener("input", () => {
        currentColour = colourPicker.value;
        ctx.strokeStyle = currentColour;
    });

    brushSize.addEventListener("input", () => {
        ctx.lineWidth = brushSize.value;
    });

    function getPosition(e) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    canvas.addEventListener("pointerdown", (e) => {
        drawing = true;

        const pos = getPosition(e);

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    });

    canvas.addEventListener("pointermove", (e) => {
        if (!drawing) return;

        const pos = getPosition(e);

        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    });    window.addEventListener("pointerup", () => {
        if (drawing) {
            drawing = false;
            ctx.beginPath();
            saveState();
        }
    });

    document.getElementById("eraser").addEventListener("click", () => {
        ctx.strokeStyle = "#ffffff";
    });

    document.getElementById("clear").addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        saveState();
    });

    document.getElementById("undo").addEventListener("click", () => {
        if (historyStep > 0) {
            historyStep--;
            restoreState(historyStep);
        }
    });

    document.getElementById("redo").addEventListener("click", () => {
        if (historyStep < history.length - 1) {
            historyStep++;
            restoreState(historyStep);
        }
    });    document.getElementById("submit").addEventListener("click", () => {

        const message = document.getElementById("message");
        const image = canvas.toDataURL("image/png");

console.log(image);

        message.innerHTML = `
            <div class="pabloMessage">
                <h2>🐶 Pablo</h2>
                <p>Hmm... let me check your bake...</p>
            </div>
        `;

     setTimeout(() => {

    const replies = [
        "🍪 Freshly baked!",
        "🥐 That looks delicious!",
        "🧁 Wonderful drawing!",
        "🍰 Hmm... I think that's a cake!",
        "🍞 Almost! Give it another try!"
    ];

    const randomReply =
        replies[Math.floor(Math.random() * replies.length)];

    message.innerHTML = `
        <div class="pabloMessage">
            <h2>🐶 Pablo</h2>
            <p>${randomReply}</p>
        </div>
    `;

}, 2000);

    });

}
