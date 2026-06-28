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

const history = [];
let historyStep = -1;saveState();

function saveState(){

    historyStep++;

    history.length = historyStep;

    history.push(canvas.toDataURL());

}
    ctx.strokeStyle = colourPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    colourPicker.addEventListener("input", () => {
        ctx.strokeStyle = colourPicker.value;
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

    });

  window.addEventListener("pointerup", () => {

    if(drawing){
        saveState();
    }

    drawing = false;
    ctx.beginPath();

});

    document.getElementById("eraser").onclick = () => {
        ctx.strokeStyle = "#ffffff";
    };

    document.getElementById("clear").onclick = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    document.getElementById("submit").onclick = () => {

        const message = document.getElementById("message");

        message.innerHTML = `
            <div class="pabloMessage">
                <h2>🐶 Pablo</h2>
                <p>Hmm... let me check...</p>
            </div>
        `;

        setTimeout(() => {

            message.innerHTML = `
                <div class="pabloMessage">
                    <h2>🐶 Pablo</h2>
                    <p>That's not an item!</p>
                </div>
            `;

        }, 2000);

    };

}
