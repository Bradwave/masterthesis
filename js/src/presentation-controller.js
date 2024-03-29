// patch all methods
seamless.polyfill();

/**
 * Presentation mode controller.
 */
let presentationController = new function () {

    /*_______________________________________
    |   Presentation config
    */

    /**
     * Index of the currently selected slide.
     */
    let currentSlideIndex = 0;

    /**
     * Ture if presentation mode is active, false otherwise.
     */
    let presentationMode = false;

    /*_______________________________________
    |   HTML elements
    */

    /**
     * Slides div elements.
     */
    let slides;

    /**
     * Hidden slides div elements.
     */
    let hiddenSlides;

    /**
     * Play presentation button.
     */
    let presentationPlay;

    /**
     * Pause presentation button.
     */
    let presentationPause;

    /**
     * Presentation controls panel.
     */
    let presentationControls;

    /**
     * Progress bar div element.
     */
    let progressBar;

    document.addEventListener("DOMContentLoaded", function (e) {

        // Initializes HTML elements and listeners
        initHTMLComponents();

        // Get the location hash property
        let hash = location.hash;

        // Executes if the hash exists, meaning the presentation was ongoing
        if (hash) {
            // Sets the current slide to the hash value
            currentSlideIndex = parseInt(hash.substring(1));
            presentationMode = true;
        }
    });

    window.onload = () => {
        // Removes the spinning loader
        document.getElementById("loading-container").style.opacity = 0;
        document.getElementById("loading-container").remove();
        // Makes page content visible 
        document.getElementById("page-container").style.visibility = "visible";
        document.getElementById("page-container").style.opacity = 1;

        if (presentationMode) {
            // Start the presentation
            togglePresentation(true);
        }
    }

    /**
     * Initializes the HTML elements and their listeners
     */
    function initHTMLComponents() {
        // Gets the slide div elements
        slides = [...document.querySelectorAll(".slide:not(.hidden)")];

        // Gets the hidden slide div elements
        hiddenSlides = [...document.querySelectorAll(".slide.hidden")];

        // Gets the presentation controls elements and the progress bar
        presentationPlay = document.getElementById("presentation-play");
        presentationPause = document.getElementById("presentation-pause");
        presentationControls = document.getElementById("presentation-controls");
        progressBar = document.getElementById("progress-bar");

        presentationPlay.onclick = () => {
            // Starts the presentation
            togglePresentation(true);
        };

        presentationPause.onclick = () => {
            // Pauses the presentation
            togglePresentation(false);
        };

        document.getElementById("next").onclick = () => {
            // Moves to next slide
            nextSlide();
        };

        document.getElementById("previous").onclick = () => {
            // Moves to previous slide
            previousSlide();
        };

        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case "KeyS":
                    // Toggles the presentation on and off
                    togglePresentation(!presentationMode);
                    break;
                case "ArrowRight":
                    // Moves to next slide
                    nextSlide();
                    break;
                case "ArrowLeft":
                    // Moves to previous slide
                    previousSlide();
                    break;
                default:
                    break;
            }
        });
    }

    /**
     * Starts or pauses the presentation.
     * @param {boolean} isActive Starts if true, pauses otherwise.
     */
    function togglePresentation(isActive) {
        presentationMode = isActive;

        // Sets the opacity of the hidden slides div elements
        hiddenSlides.forEach(slide => {
            slide.style.opacity = presentationMode ? "0.075" : "1";
        })

        // Shows or hides the controls for the presentation
        presentationControls.style.opacity = presentationMode ? "1" : "0";
        presentationPlay.style.opacity = presentationMode ? "0" : "1";
        presentationPause.style.opacity = presentationMode ? "1" : "0";
        presentationPause.style.visibility = presentationMode ? "visible" : "collapse";

        if (presentationMode) {
            // If presentation mode is active, updates the slides
            updateSlides();

            // Sets the hash as the currently selected slide index
            window.location.hash = currentSlideIndex;
        } else {
            // Lightens all the slides background
            slides.forEach(slide => {
                slide.style.opacity = "1";
            });

            // Deletes the hash
            history.replaceState("", "", location.pathname);
        }
    }

    /**
     * Moves to next slide.
     */
    function nextSlide() {
        // When presentation mode is active, increases the slide index
        if (presentationMode) {
            // Loops through to first slide if necessary
            if (++currentSlideIndex > slides.length - 1) {
                currentSlideIndex = 0;
            }
            updateSlides();
        }
    }

    /**
     * Moves to previous slide.
     */
    function previousSlide() {
        // When presentation mode is active, decreases the slide index
        if (presentationMode) {
            // Loops through to last slide if necessary
            if (--currentSlideIndex < 0) {
                currentSlideIndex = slides.length - 1;
            }
            updateSlides();
        }
    }

    /**
     * Updates the slides.
     */
    function updateSlides() {
        // Sets the hash to the currently selected slide index
        window.location.hash = currentSlideIndex;

        // Sets the background of each slide to hidden color, aside from the currently selected one
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.opacity = i == currentSlideIndex ? "1" : ".075";
        }

        // Updates the progress bar
        progressBar.style.width = currentSlideIndex / (slides.length - 1) * 100 + "%";

        // Scrolls to the correct slide position
        setTimeout(() => {
            slides[currentSlideIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }, 0);
    }
}