/**
 * Plots of the Fourier transform visualization.
 * @param {Number} ids IDs of the plots.
 * @param {Array} options Options of the plot. 
 * @returns Public APIs.
 */
let ftvPlots = function (ids, options) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /*_______________________________________
    |   Resizing variables
    */

    /**
     * Width of the transform plot.
     */
    let tWidth;

    /**
     * Height of the transform plot.
     */
    let tHeight;

    /**
     * Width of the winding plot.
     */
    let wWidth;

    /**
     * Height of the winding plot.
     */
    let wHeight;

    /*_______________________________________
    |   General variables
    */

    /**
     * Sampled points of the function.
     */
    let functionPoints = [];

    /**
     * Points of the Fourier transformed function.
     */
    let transformPoints = [];

    /**
     * Number of sample points.
     */
    const N = 150;

    /**
     * Length of the function.
     */
    const L = 5;

    /**
     * Frequency increment.
     */
    const df = 0.005;

    /**
     * Max frequency.
     */
    const maxFreq = 6;

    /**
     * Number of sampled points for the Fourier transform.
     */
    const M = maxFreq / df;

    /**
     * Transform plot increment.
     */
    let dk;

    /**
     * Scale.
     */
    let scale;

    /**
     * Current winding frequency.
     */
    let frequency = 0;

    /**
     * True if running, false otherwise.
     */
    let running = false;

    const playButton = document.getElementById("play-pause-winding");

    playButton.onclick = () => {
        running = !running;
        toggleAnimation(running);
    }

    function toggleAnimation(isRunning) {
        playButton.innerHTML = isRunning ? "pause" : "play_arrow";
        if (isRunning) {
            // Starts the animation
            requestAnimationFrame(animate);
        }
    }

    let skipInterval;

    document.getElementById("skip-prev-winding").onmousedown = () => {
        running = false;
        if (!running) toggleAnimation(false);

        clearInterval(skipInterval)
        skipInterval = setInterval(function () {
            frequency = frequency - df < 0 ? 0 : frequency - df;
            publicAPIs.drawPlot();
        }, 50);
    }

    document.getElementById("skip-prev-winding").onmouseup = () => {
        clearInterval(skipInterval);
    }

    document.getElementById("skip-winding").onmousedown = () => {
        running = false;
        if (!running) toggleAnimation(false);

        clearInterval(skipInterval)
        skipInterval = setInterval(function () {
            frequency = (frequency + df) % maxFreq;
            publicAPIs.drawPlot();
        }, 50);
    }

    document.getElementById("skip-winding").onmouseup = () => {
        clearInterval(skipInterval);
    }

    /**
     * Init the plot.
     * @param {*} inputOptions 
     */
    publicAPIs.init = function (inputOptions) {
        // Resizes canvas
        publicAPIs.resizeCanvas();

        for (let n = 0; n < N; n++) {
            const t = L * n / N;
            functionPoints[n] = Math.exp(-((t - 2.5) ** 2) / 0.6)
                * (Math.cos(2 * Math.PI * 2 * t) + Math.cos(2 * Math.PI * 4 * t));
        }

        transformPoints = analysisTools.dft(functionPoints, L, maxFreq, df);

        scale = 1 / Math.max(...functionPoints);
    }

    /*_______________________________________
    |   Canvas
    */

    const transformPlot = new plotStructure(ids[0], { alpha: false });
    const tCtx = transformPlot.getCtx();

    const windingPlot = new plotStructure(ids[1], { alpha: false });
    const wCtx = windingPlot.getCtx();

    /**
     * Resize the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        transformPlot.resizeCanvas();
        windingPlot.resizeCanvas();

        tWidth = transformPlot.getWidth();
        tHeight = transformPlot.getHeight();

        wWidth = windingPlot.getWidth();
        wHeight = windingPlot.getHeight();

        dk = tWidth > M ? Math.floor(M / tWidth) : 1;
    }

    /**
     * A (probably poor) implementation of the pause-able loop.
     * @returns Early return if not playing.
     */
    function animate() {
        if (!running) {
            return;
        }
        // Updates the ring status
        frequency = (frequency + df) % maxFreq;
        // Draws the ring
        publicAPIs.drawPlot();
        // Keeps executing this function
        requestAnimationFrame(animate);
    }

    /**
     * Draws the plots.
     */
    publicAPIs.drawPlot = () => {
        // Clears the canvases
        publicAPIs.clearPlot();

        // -- Transform Plot --

        tCtx.strokeStyle = "#1484E6";
        tCtx.lineWidth = 3;

        tCtx.beginPath();

        let yPos = (0.8 - transformPoints[0].amp * 4);

        tCtx.moveTo(0, Math.round(tHeight * yPos));

        for (let k = 1; k < M; k += dk * 4) {
            const nextYPos = (0.8 - transformPoints[k].amp * 4);

            // tCtx.lineTo(Math.round(tWidth * k / M), Math.round(tHeight * nextYPos));

            tCtx.quadraticCurveTo(
                tWidth * k / M,
                tHeight * yPos,
                tWidth * (k + dk * 2) / M,
                tHeight * (yPos + nextYPos) / 2,
            );

            yPos = nextYPos;
        }

        tCtx.stroke();

        // Center of mass

        tCtx.fillStyle = "#333333";

        const k = frequency / maxFreq;

        tCtx.beginPath();
        tCtx.arc(
            tWidth * k,
            tHeight * (0.8 - transformPoints[Math.round(k * M)].amp * 4),
            5, 0, 2 * Math.PI);
        tCtx.fill();

        // -- Winding Plot --

        wCtx.strokeStyle = "#1484E6";
        wCtx.lineWidth = 3;

        wCtx.beginPath();

        let xPos = (1 + scale * functionPoints[0]);
        yPos = 1;

        wCtx.moveTo(Math.round(wWidth * 0.5 * xPos), Math.round(wHeight * 0.5 * yPos));

        for (let n = 1; n < N; n++) {
            const t = L * n / N;
            const nextXPos = (1 + Math.cos(2 * Math.PI * frequency * t) * scale * functionPoints[n]);
            const nextYPos = (1 + Math.sin(2 * Math.PI * frequency * t) * scale * functionPoints[n]);

            wCtx.quadraticCurveTo(
                wWidth * 0.5 * xPos,
                wHeight * 0.5 * yPos,
                wWidth * 0.25 * (xPos + nextXPos),
                wHeight * 0.25 * (yPos + nextYPos)
            );

            xPos = nextXPos;
            yPos = nextYPos;
        }

        wCtx.stroke();

        // Origin cross

        wCtx.strokeStyle = "#333333";
        wCtx.lineWidth = 1;

        wCtx.beginPath();
        wCtx.moveTo(wWidth * 0.45, wHeight * 0.5);
        wCtx.lineTo(wWidth * 0.55, wHeight * 0.5);
        wCtx.moveTo(wWidth * 0.5, wHeight * 0.45);
        wCtx.lineTo(wWidth * 0.5, wHeight * 0.55);
        wCtx.stroke();

        // Center of mass

        wCtx.fillStyle = "#333333";

        xPos = wWidth * 0.5 * (1 + 2 * transformPoints[Math.floor(frequency / df)].re);
        yPos = wHeight * 0.5 * (1 - 2 * transformPoints[Math.floor(frequency / df)].im);

        wCtx.beginPath();
        wCtx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
        wCtx.fill();
    }

    /**
     * Clears the plots.
     */
    publicAPIs.clearPlot = () => {
        tCtx.fillStyle = "#ffffff";

        tCtx.beginPath();
        tCtx.rect(0, 0, tWidth, tHeight);
        tCtx.fill();
        tCtx.closePath();

        wCtx.fillStyle = "#ffffff";

        wCtx.beginPath();
        wCtx.rect(0, 0, wWidth, wHeight);
        wCtx.fill();
        wCtx.closePath();
    }

    publicAPIs.init(options);

    // Returns public methods
    return publicAPIs;
}