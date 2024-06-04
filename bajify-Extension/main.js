(() => {
    const imageFilePath = "assets/images/";
    const numImages = 2;
    const flipRandomPercent = 2; // The number represents how many numbers to randomly choose. Bigger = less likely, smaller = more likely.
    let isEnabled = true;

    function getThumbnails() {
        const thumbnailQuery = "ytd-thumbnail:not(.ytd-video-preview, .ytd-rich-grid-slim-media) a > yt-image > img.yt-core-image:only-child:not(.yt-core-attributed-string__image-element),.ytp-videowall-still-image:not([style*='extension:'])";
        const thumbnails = document.querySelectorAll(thumbnailQuery);

        thumbnails.forEach((image) => {
            const index = getRandomImage();
            const flip = getImageState();
            const url = getImageURL(index);
            applyThumbnails(image, url, flip);
        });
    }

    function getImageURL(index) {
        return chrome.runtime.getURL(`${imageFilePath}${index}.png`);
    }

    function applyThumbnails(image, imageUrl, flip = false) {
        if (image.nodeName === "IMG") {
            const overlay = document.createElement("img");
            overlay.src = imageUrl;
            overlay.style.position = "absolute";
            overlay.style.top = "0";
            overlay.style.left = "0";
            overlay.style.width = "100%";
            overlay.style.height = "100%";
            overlay.style.zIndex = "0";
            overlay.style.opacity = "1";
            overlay.setAttribute("isEnabled", "true");

            if (imageUrl.includes("2.png")) {
                overlay.style.top = "20%";
            }
            if (flip) {
                overlay.style.transform = "scaleX(-1)"; // Flips the image
            }
            image.style.position = "relative";
            image.parentElement.appendChild(overlay);
        } else if (image.nodeName === "DIV") {
            image.style.backgroundImage = `url("${imageUrl}"), ` + image.style.backgroundImage;
        }
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function getRandomImage() {
        return getRandomInt(numImages + 1); // +1 because max is not inclusive
    }

    function getImageState() {
        return getRandomInt(flipRandomPercent) === 1;
    }

    async function doesImageExist(index) {
        const url = getImageURL(index);
        return fetch(url).then(() => true).catch(() => false);
    }

    // Toggle thumbnail visibility
    let thumbnailsVisible = true;
    function toggleThumbnailsVisibility() {
        const overlays = document.querySelectorAll('img[isEnabled="true"]');
        thumbnailsVisible = !thumbnailsVisible;
        overlays.forEach(overlay => {
            overlay.style.opacity = thumbnailsVisible ? "1" : "0";
        });
    }

    // Listen for messages from the popup script
    chrome.runtime.onMessage.addListener((request) => {
        if (request.action === "toggleThumbnails") {
            toggleThumbnailsVisibility();
        }
    });

    // Runs the functions
    if (isEnabled) {
        setInterval(getThumbnails, 100);
    }
})();
