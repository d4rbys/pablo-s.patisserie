const app = document.getElementById("app");

document.getElementById("playButton").addEventListener("click", startGame);

function startGame(){

app.innerHTML = `

<h1>🐶 Pablo's Patisserie</h1>

<h2>Today's Challenge</h2>

<p>🍪 Draw a Cookie!</p>

<canvas id="canvas" width="500" height="350"></canvas>

<br>

<button id="clear">🧽 Clear</button>

<button id="submit">🍰 Submit to Pablo</button>

<div id="message"></div>

`;

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.lineWidth = 6;
ctx.lineCap = "round";

let drawing = false;

canvas.addEventListener("mousedown", startDraw);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDraw);
canvas.addEventListener("mouseleave", stopDraw);

function startDraw(e){

drawing = true;

const rect = canvas.getBoundingClientRect();

ctx.beginPath();

ctx.moveTo(e.clientX-rect.left,e.clientY-rect.top);

}

function draw(e){

if(!drawing) return;

const rect = canvas.getBoundingClientRect();

ctx.lineTo(e.clientX-rect.left,e.clientY-rect.top);

ctx.stroke();

}

function stopDraw(){

drawing = false;

ctx.beginPath();

}

document.getElementById("clear").onclick = ()=>{

ctx.clearRect(0,0,canvas.width,canvas.height);

}

document.getElementById("submit").onclick = ()=>{

document.getElementById("message").innerHTML=`

<div class="pabloMessage">

<h2>🐶 Pablo</h2>

<p>Hmm... let me check...</p>

</div>

`;

setTimeout(()=>{

document.getElementById("message").innerHTML=`

<div class="pabloMessage">

<h2>🐶 Pablo</h2>

<p>That's not an item!</p>

</div>

`;

},2000);

}

}
