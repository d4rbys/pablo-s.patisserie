
const SUPABASE_URL =
  "https://bvlvexagwwzwitcuyttg.supabase.co";

const SUPABASE_ANON_KEY =
  "sb_publishable_yG4ZpSU5nyiRMhqRXajclw_OvNWot7b";

const MODEL_URL =
  "https://teachablemachine.withgoogle.com/models/_TaaPk0nP/";

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

let currentRecipe = getRandomRecipe();
let model = null;
let supabaseClient = null;

function getRandomRecipe() {
  return recipes[Math.floor(Math.random() * recipes.length)];
}

function getSupabase() {
  if (supabaseClient) return supabaseClient;

  try {
    if (window.supabase) {
      supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );
    }
  } catch (error) {
    console.error("Supabase setup failed:", error);
  }

  return supabaseClient;
}

// -------------------------------------
// DOOR MENU
// -------------------------------------

const homeScreen = document.getElementById("homeScreen");
const doorButton = document.getElementById("doorButton");
const doorMenu = document.getElementById("doorMenu");
const playButton = document.getElementById("playButton");
const shelfButton = document.getElementById("shelfButton");
const communityShelf = document.getElementById("communityShelf");
const closeShelf = document.getElementById("closeShelf");

doorButton.addEventListener("click", () => {
  doorMenu.hidden = false;
});

playButton.addEventListener("click", startGame);

shelfButton.addEventListener("click", () => {
  homeScreen.hidden = true;
  communityShelf.hidden = false;
  loadCommunityShelf();
});

closeShelf.addEventListener("click", () => {
  communityShelf.hidden = true;
  homeScreen.hidden = false;
});

// -------------------------------------
// AI
// -------------------------------------

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
    console.log("Model classes:", model.getClassLabels());
  } catch (error) {
    console.error("AI failed to load:", error);
  }
}

window.addEventListener("load", loadAI);

// -------------------------------------
// DRAWING HISTORY
// -------------------------------------

let drawingHistory = [];
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

function restoreState(canvas, ctx, state) {
  const image = new Image();

  image.onload = () => {
    fillWhite(canvas, ctx);
    ctx.drawImage(image, 0, 0);
  };

  image.src = state;
}

// -------------------------------------
// START GAME
// -------------------------------------

function startGame() {
  homeScreen.hidden = true;

  const game = document.createElement("section");
  game.id = "drawingGame";
  game.className = "game-screen";

  game.innerHTML = `
    <header>
      <img
        src="images/pablo.png"
        alt="Pablo"
        id="pablo"
        onerror="this.style.display='none'"
      >
      <h1>Pablo's Patisserie</h1>
    </header>

    <h2>Today's Order</h2>

    <p id="recipe">Draw a <strong>${currentRecipe}</strong></p>

    <label for="creatorName">Your Name</label><br>
    <input id="creatorName" type="text"
      placeholder="Your name" maxlength="30">

    <br><br>

    <label for="creationName">What did you create?</label><br>
    <input id="creationName" type="text"
      placeholder="Name your creation" maxlength="40">

    <div class="toolbar">
      <label for="colourPicker">Colour</label><br>
      <input id="colourPicker" type="color" value="#5B3A29">

      <br><br>

      <label for="brushSize">Brush Size</label><br>
      <input id="brushSize" type="range" min="2" max="30" value="6">
    </div>

    <canvas id="canvas" width="600" height="600"></canvas>

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
  `;

  document.getElementById("app").appendChild(game);

  document.getElementById("backToBakery").addEventListener("click", () => {
    game.remove();
    homeScreen.hidden = false;
    doorMenu.hidden = false;
  });

  setupCanvas();
  window.scrollTo(0, 0);
}

// -------------------------------------
// CANVAS TOOLS
// -------------------------------------

function setupCanvas() {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const colourPicker = document.getElementById("colourPicker");
  const brushSize = document.getElementById("brushSize");
  const message = document.getElementById("message");
  const submit = document.getElementById("submit");

  let drawing = false;
  let erasing = false;
  let saved = false;

  canvas.style.touchAction = "none";
  fillWhite(canvas, ctx);

  drawingHistory = [];
  historyStep = -1;
  saveState(canvas);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  function applyTool() {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = erasing ? "#ffffff" : colourPicker.value;
    ctx.lineWidth = Number(brushSize.value);
  }

  function getPosition(event) {
    const rect = canvas.getBoundingClientRect();

    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  colourPicker.addEventListener("input", () => {
    erasing = false;
    applyTool();
  });

  brushSize.addEventListener("input", applyTool);

  document.getElementById("brush").addEventListener("click", () => {
    erasing = false;
    applyTool();
  });

  document.getElementById("eraser").addEventListener("click", () => {
    erasing = true;
    applyTool();
  });

  canvas.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    drawing = true;
    canvas.setPointerCapture(event.pointerId);

    const position = getPosition(event);
    applyTool();

    ctx.beginPath();
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(position.x + 0.01, position.y);
    ctx.stroke();
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!drawing) return;

    event.preventDefault();
    const position = getPosition(event);
    ctx.lineTo(position.x, position.y);
    ctx.stroke();
  });

  function stopDrawing(event) {
    if (!drawing) return;

    drawing = false;
    ctx.beginPath();

    if (event && canvas.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId);
    }

    saveState(canvas);
  }

  canvas.addEventListener("pointerup", stopDrawing);
  canvas.addEventListener("pointercancel", stopDrawing);

  document.getElementById("undo").addEventListener("click", () => {
    if (historyStep <= 0) return;
    historyStep--;
    restoreState(canvas, ctx, drawingHistory[historyStep]);
  });

  document.getElementById("redo").addEventListener("click", () => {
    if (historyStep >= drawingHistory.length - 1) return;
    historyStep++;
    restoreState(canvas, ctx, drawingHistory[historyStep]);
  });

  document.getElementById("clear").addEventListener("click", () => {
    fillWhite(canvas, ctx);
    applyTool();
    saveState(canvas);
  });

  submit.addEventListener("click", async () => {
    const creatorName =
      document.getElementById("creatorName").value.trim();

    const creationName =
      document.getElementById("creationName").value.trim();

    if (!creatorName || !creationName) {
      message.textContent =
        "Please add your name and name your creation!";
      return;
    }

    if (!model) {
      message.textContent =
        "Pablo isn't ready yet. Please wait a moment and try again.";
      return;
    }

    submit.disabled = true;
    message.textContent = "Pablo is checking your drawing...";

    try {
      const predictions = await model.predict(canvas);

      let best = predictions[0];

      predictions.forEach((prediction) => {
        if (prediction.probability > best.probability) {
          best = prediction;
        }
      });

      console.log(
        "Pablo's guesses:",
        predictions.map(p =>
          `${p.className}: ${p.probability.toFixed(2)}`
        )
      );

      const matches =
        best.className.trim().toLowerCase() ===
        currentRecipe.toLowerCase();

      if (matches && best.probability >= 0.55) {
        const client = getSupabase();

        if (!client) {
          message.textContent =
            "Pablo couldn't connect to the Community Shelf.";
          return;
        }

        const result = await client
          .from("community_drawings")
          .insert({
            name: creatorName,
            creation: creationName,
            drawing: canvas.toDataURL("image/jpeg", 0.8)
          });

        if (result.error) {
          console.error(result.error);
          message.textContent =
            "Pablo couldn't put your drawing on the Community Shelf.";
          return;
        }

        saved = true;

        const heading = document.createElement("h2");
        heading.textContent = "Well Done!";

        const replies = [
          "majestic!",
          "yummy!",
          "nicely drawn!",
          "the customers will love that!",
          "yayy!"
        ];

        const reply = document.createElement("p");
        reply.textContent =
          replies[Math.floor(Math.random() * replies.length)];

        message.replaceChildren(heading, reply);

      } else {
        message.innerHTML = `
          <p>Pablo isn't sure that's a
            <strong>${escapeHtml(currentRecipe)}</strong>.
          </p>
          <p>Try drawing it again!</p>
          <p class="status-note">
            Pablo saw: ${escapeHtml(best.className)},
            ${Math.round(best.probability * 100)}% sure.
          </p>
        `;
      }

    } catch (error) {
      console.error("Drawing check failed:", error);
      message.textContent = "Pablo couldn't check the drawing.";
    } finally {
      submit.disabled = saved;
    }
  });

  applyTool();
}

// -------------------------------------
// SAFE TEXT
// -------------------------------------

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

// -------------------------------------
// COMMUNITY SHELF
// -------------------------------------

async function loadCommunityShelf() {
  const container = document.getElementById("shelfDrawings");

  container.replaceChildren();

  const client = getSupabase();

  if (!client) {
    container.textContent =
      "Pablo couldn't connect to the Community Shelf.";
    return;
  }

  const loading = document.createElement("p");
  loading.textContent = "Loading...";
  container.appendChild(loading);

  try {
    const result = await client
      .from("community_drawings")
      .select("name, creation, drawing")
      .order("id", { ascending: false })
      .limit(50);

    if (result.error) throw result.error;

    container.replaceChildren();

    if (!result.data || result.data.length === 0) {
      container.textContent = "No creations yet. Be the first!";
      return;
    }

    result.data.forEach(item => {
      const card = document.createElement("article");
      card.className = "shelf-card";

      const title = document.createElement("h3");
      title.textContent = item.creation || "Untitled creation";

      const image = document.createElement("img");
      image.src = item.drawing;
      image.alt = item.creation || "Community drawing";

      const creator = document.createElement("p");
      creator.textContent = "Drawn by " + (item.name || "A baker");

      card.append(title, image, creator);
      container.appendChild(card);
    });

  } catch (error) {
    console.error("Community Shelf error:", error);
    container.textContent = "Pablo couldn't load the Community Shelf.";
  }
}
