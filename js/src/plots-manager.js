/**
 * Manages plots, sort of...
 */
let plotsManager = new function () {

    /**
     * Number of milliseconds to wait after resizing.
     * @type {Number}
     */
    const waitTime = 200;

    let resizeTimeout;

    /**
     * Plots.
     */
    plots = new Map();

    /**
     * Spinning loaders
     */
    let loaders = [...document.getElementsByClassName("plot loader")];

    let canvases = [...document.getElementsByName("plot")];

    function init() {
        // Fourier transform visualization
        plots.set('ft-winding', new ftvPlots(["ft-transform", "ft-winding"]));

        // Fourier series visualization
        plots.set('fs-epicycles', new fsvPlots(["fs-path", "fs-epicycles"]));

        // Gabor transform visualization
        plots.set('gt-window', new gtvPlots(["gt-window", "gt-gabor"]));

        plots.forEach((plot) => {
            plot.drawPlot();
        });
    }

    window.onresize = () => {
        plots.forEach(plot => {
            // Clear the canvas
            plot.clearPlot();
        });

        canvases.forEach(canvas => {
            canvas.style.opacity = 0;
            canvas.style.visibility = "collapse";
        })

        loaders.forEach(loader => {
            // Displays the loader while waiting
            loader.style.visibility = "visible";
            loader.style.animationPlayState = "running";
        });

        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            loaders.forEach(loader => {
                // Displays the loader while waiting
                loader.style.visibility = "collapse";
                loader.style.animationPlayState = "paused";
            });

            canvases.forEach(canvas => {
                canvas.style.visibility = "visible";
                canvas.style.opacity = 1;
            })

            plots.forEach(plot => {
                // Resize the after waiting (for better performances)
                plot.resizeCanvas();
                // Draws the plot
                plot.drawPlot();
            });
        }, waitTime);
    }

    window.onclick = (e) => {
        e.target.focus();
    }

    /**
     * Converts the input value to float and sets the input box value.
     * @param {*} id Id of the input box. 
     * @returns Returns the float value of the input box.
     */
    const getInputNumber = (inputsMap, id) => {
        let newValue = parseFloat(inputsMap.get(id).value);
        inputsMap.get(id).value = newValue;
        return newValue;
    }

    init();
}