/**
 * Plots of the Gabor transform visualization.
 * @param {Number} ids IDs of the plots.
 * @param {Array} options Options of the plot. 
 * @returns Public APIs.
 */
let gtvPlots = function (ids, options) {

    /**
     * Public methods.
     */
    let publicAPIs = {};

    /*_______________________________________
    |   Resizing variables
    */

    /**
     * Width of the plot.
     */
    let width;

    /**
     * Height of the plot.
     */
    let height;

    /*_______________________________________
    |   General variables
    */

    /**
     * Sampled points of the function.
     */
    let functionPoints = [];

    /**
     * Sampled points of the window.
     */
    let windowPoints = [];

    /**
     * Sampled points of the function multiplied by the window.
     */
    let windowedFunctionPoints = [];

    /**
     * Points of the Gabor transformed function.
     */
    let transformPoints = [];

    /**
     * Number of sample points.
     */
    const N = 400;

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
     * Number of sampled points for the Gabor transform.
     */
    const M = maxFreq / df;

    /**
     * Current time.
     */
    let time = N / 2;

    /**
     * Time increment;
     */
    const dt = 2;

    /**
     * Scale.
     */
    const scale = 0.25;

    /**
     * True if running, false otherwise.
     */
    let running = false;

    const playButton = document.getElementById("play-pause-window");

    // Play/pause the animation
    playButton.onclick = () => {
        running = !running;
        toggleAnimation(running);
    }

    /**
     * Switch on or off the animation.
     * @param {Boolean} isRunning True if running, false otherwise.
     */
    function toggleAnimation(isRunning) {
        playButton.innerHTML = isRunning ? "pause" : "play_arrow";
        if (isRunning) {
            // Starts the animation
            requestAnimationFrame(animate);
        }
    }

    // Move to previous step.

    let skipInterval;

    document.getElementById("skip-prev-window").onclick = () => {
        skipPrev();
    }

    document.getElementById("skip-prev-window").onmousedown = () => {
        running = false;
        if (!running) toggleAnimation(false);

        clearInterval(skipInterval)
        skipInterval = setInterval(function () {
            skipPrev();
        }, 50);
    }

    document.getElementById("skip-prev-window").onmouseup = () => {
        clearInterval(skipInterval);
    }

    /**
     * Skips to previous point in time.
     */
    function skipPrev() {
        const newTime = time - dt;
        time = newTime < 0 ? N - newTime : newTime;

        updateGabor();
        publicAPIs.drawPlot();
    }

    // Move to next step

    document.getElementById("skip-next-window").onclick = () => {
        skipNext();
    }

    document.getElementById("skip-next-window").onmousedown = () => {
        running = false;
        if (!running) toggleAnimation(false);

        clearInterval(skipInterval)
        skipInterval = setInterval(function () {
            skipNext();
        }, 50);
    }

    document.getElementById("skip-next-window").onmouseup = () => {
        clearInterval(skipInterval);
    }

    // Move window

    document.getElementById("skip-next-window").onclick = () => {
        skipNext();
    }

    document.getElementById("skip-next-window").onmousedown = () => {
        running = false;
        if (!running) toggleAnimation(false);

        clearInterval(skipInterval)
        skipInterval = setInterval(function () {
            skipNext();
        }, 50);
    }

    document.getElementById("skip-next-window").onmouseup = () => {
        clearInterval(skipInterval);
    }

    /**
     * Skips to next moment in time.
     */
    function skipNext() {
        time = (time + dt) % N;

        updateGabor();
        publicAPIs.drawPlot();
    }

    /**
     * Inits the plot.
     * @param {*} inputOptions 
     */
    publicAPIs.init = function (inputOptions) {
        // Resizes canvas
        publicAPIs.resizeCanvas();

        for (let n = 0; n < N; n++) {
            const t = L * n / N;
            functionPoints[n] = Math.exp(-((t - 1.5) ** 2) / 0.6) * Math.cos(2 * Math.PI * 2 * t)
                + Math.exp(-((t - 3.5) ** 2) / 0.6) * Math.cos(2 * Math.PI * 4 * t);
        }

        for (let n = 0; n < 2 * N; n++) {
            const t = L * n / N;
            windowPoints[n] = Math.exp(-((t - L) ** 2) / 0.4);
        }

        updateGabor();
    }

    function updateGabor() {
        windowedFunctionPoints = [];

        for (let n = 0; n < N; n++) {
            windowedFunctionPoints[n] = functionPoints[n] * windowPoints[N + n - time]
        }

        transformPoints = analysisTools.dft(windowedFunctionPoints,
            { L: L, maxFreq: maxFreq, df: df, complex: false });
    }

    /**
     * Converts x to canvas coordinates.
     * @param {Number} x Coordinate x.
     * @param {Number} xMax Max value for the coordinate x.
     * @returns Coordinate x in the canvas.
     */
    const toCanvasX = (x, xMax) => {
        return width * (x / xMax);
    }

    /**
     * Converts x to canvas coordinates.
     * @param {Number} y Coordinate y.
     * @returns The canvas coordinates for y.
     */
    const toCanvasY = (y) => {
        return height * (0.5 - scale * y);
    }

    /*_______________________________________
    |   Canvas
    */

    const windowPlot = new plotStructure(ids[0], { alpha: false });
    const wCtx = windowPlot.getCtx();

    const gaborPlot = new plotStructure(ids[1], { alpha: false });
    const gCtx = gaborPlot.getCtx();

    /**
     * Resizes the canvas to fill the HTML canvas element.
     */
    publicAPIs.resizeCanvas = () => {
        windowPlot.resizeCanvas();
        gaborPlot.resizeCanvas();

        width = windowPlot.getWidth();
        height = windowPlot.getHeight();
    }

    /**
     * A (probably poor) implementation of the pause-able loop.
     * @returns Early return if not playing.
     */
    function animate() {
        if (!running) {
            return;
        }

        // Updates the time and the Gabor transform
        time = (time + dt) % N;
        updateGabor();
        // Draws the plots
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

        // -- Window Plot --

        // Function

        wCtx.strokeStyle = "#777777";
        wCtx.lineWidth = 1.5;

        wCtx.beginPath();

        wCtx.moveTo(0, toCanvasY(functionPoints[0]));

        for (let n = 1; n < N; n++) {
            wCtx.lineTo(toCanvasX(n, N), toCanvasY(functionPoints[n]));
        }

        wCtx.stroke();

        // Window

        wCtx.strokeStyle = "#888888";
        wCtx.lineWidth = 3;
        wCtx.setLineDash([3, 3]);

        wCtx.beginPath();

        wCtx.moveTo(0, toCanvasY(windowPoints[N - time]));

        for (let n = 1; n < N; n++) {
            wCtx.lineTo(toCanvasX(n, N), toCanvasY(windowPoints[N + n - time]));
        }

        wCtx.stroke();

        // Windowed function

        wCtx.strokeStyle = "#FD8B28";
        wCtx.lineWidth = 3;
        wCtx.setLineDash([]);

        wCtx.beginPath();

        wCtx.moveTo(0, toCanvasY(windowedFunctionPoints[0]));

        for (let n = 1; n < N; n++) {
            wCtx.lineTo(toCanvasX(n, N), toCanvasY(windowedFunctionPoints[n]));
        }

        wCtx.stroke();

        // -- Gabor/Fourier Plot --

        gCtx.strokeStyle = "#FD8B28";
        gCtx.lineWidth = 3;

        gCtx.beginPath();

        gCtx.moveTo(0, toCanvasY(transformPoints[0]));

        for (let m = 1; m < M; m++) {
            gCtx.lineTo(toCanvasX(m, M), height * (0.9 - 7.5 * transformPoints[m].amp));
        }

        gCtx.stroke();
    }

    /**
     * Clears the plots.
     */
    publicAPIs.clearPlot = () => {
        wCtx.fillStyle = "#ffffff";

        wCtx.beginPath();
        wCtx.rect(0, 0, width, height);
        wCtx.fill();
        wCtx.closePath();

        gCtx.fillStyle = "#ffffff";

        gCtx.beginPath();
        gCtx.rect(0, 0, width, height);
        gCtx.fill();
        gCtx.closePath();
    }

    publicAPIs.init(options);

    // Returns public methods
    return publicAPIs;
}