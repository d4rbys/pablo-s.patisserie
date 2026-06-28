const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {

document.body.innerHTML = `

<div class="hero">

<h1>🐶 Pablo's Patisserie</h1>

<h2>Today's Challenge</h2>

<p>🍪 Draw a Cookie!</p>

<canvas id="canvas" width="500" height="350"></canvas>

<br><br>

<button id="clear">🧽 Clear</button>

<button id="submit">🍰 Submit to Pablo</button>

</div>

`;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 6;
ctx.lineCap = "round";

let drawing = false;

canvas.addEventListener("mousedown", () => drawing = true);
canvas.addEventListener("mouseup", () => drawing = false);

canvas.addEventListener("mousemove", draw);

function draw(e){

if(!drawing) return;

const rect = canvas.getBoundingClientRect();

ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);

ctx.stroke();

ctx.beginPath();

ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);

}

document.getElementById("submit").onclick = () => {

    const result = document.createElement("div");

    result.className = "pabloMessage";

    result.innerHTML = `
        <h2>🐶 Pablo</h2>
        <p>Hmm... let me check...</p>
    `;

    document.querySelector(".hero").appendChild(result);

    setTimeout(() => {

        result.innerHTML = `
            <h2>🐶 Pablo</h2>
            <p>That's not an item!</p>
        `;

    },2000);

}

document.getElementById("submit").onclick = () =>{

alert("🐶 Pablo is checking your drawing...");

}

});
