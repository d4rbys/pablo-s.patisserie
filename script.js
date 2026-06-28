const playButton = document.getElementById("playButton");

playButton.addEventListener("click", () => {
    document.body.innerHTML = `
        <div class="hero">
            <h1>🍰 Pablo's Patisserie</h1>
            <h2>Today's Bakery</h2>

            <p>Draw today's baked item!</p>

            <button id="drawButton">Start Drawing ✏️</button>
        </div>
    `;
});
