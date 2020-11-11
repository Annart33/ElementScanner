chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.func == "validateSelector") {
        var selector = request.selector;
        localStorage.setItem("mainPatternSelector", selector);
        var numOfElm;
        try {
            var selectedElm = document.querySelectorAll(selector);
            numOfElm = selectedElm.length;
        } catch (error) {
            numOfElm = -1;
        }
        sendResponse({ numOfValidElm: numOfElm });
    }
    if (request.func == "setCount") {

        var homepage;
        var isCurrentHomepage = isHomepage();
        var homepageCheckbox = request.isHomePage;

        if (homepageCheckbox != undefined && homepageCheckbox == 1) {
            isCurrentHomepage = true;
        } else if (homepageCheckbox != undefined && homepageCheckbox == 0) {
            isCurrentHomepage = false;
        }

        if (isCurrentHomepage) {
            homepage = 1;
        } else {
            homepage = 0;
        }

        var mainPatternSelector = localStorage.getItem("mainPatternSelector");
        var mainElement = document.querySelectorAll(mainPatternSelector)[0];

        if (!isCurrentHomepage) {
            console.log("This is not the homepage");
            var iframes = mainElement.querySelectorAll("iframe:not(#u1st-menu-frame):not(#User1stCommFrame):not(#u1st-ActivationFrame):not(#exitPreviewContainer)");
            var videoElm = mainElement.querySelectorAll("video");
            var canvasElm = mainElement.querySelectorAll("canvas");
            var pdf = mainElement.querySelectorAll("a[href$='.pdf'], a[href*='javascript:submitAction_win0(document.win0']");
            var svgElm = mainElement.querySelectorAll("svg");
            var svgImg = mainElement.querySelectorAll("img[src$='svg']");

        } else {
            console.log("This is the homepage");
            var iframes = document.querySelectorAll("iframe:not(#u1st-menu-frame):not(#User1stCommFrame):not(#u1st-ActivationFrame):not(#exitPreviewContainer)");
            var videoElm = document.querySelectorAll("video");
            var canvasElm = document.querySelectorAll("canvas");
            var pdf = document.querySelectorAll("a[href$='.pdf'], a[href*='javascript:submitAction_win0(document.win0']");
            var svgElm = document.querySelectorAll("svg");
            var svgImg = document.querySelectorAll("img[src$='svg']");
        }

        var numOfVideosTags = 0;
        var numOfPDF = 0;
        var numOfSVGImage = 0;
        var numOfCanvas = 0;
        var numOfSVG = 0;
        var numOfIframes = 0;
        var numOfIMaps = 0;
        var numOfIVideos = 0;
        var numOfICpatcha = 0;
        var otherIframe = 0;

        //Element Scanning -check if is visible
        iframes.forEach((iframe) => {
            if (!isHidden(iframe)) {
                numOfIframes++;
                if (iframe.src.startsWith("https://www.google.com/maps/") || iframe.src.includes("maps.google")) {
                    numOfIMaps++;
                }
                else if (iframe.src.includes("www.youtube.com") || iframe.src.includes("video")) {
                    numOfIVideos++;
                } else if (iframe.src.includes("captcha")) {
                    numOfICpatcha++;
                } else {
                    otherIframe++;
                }
            }
        });

        svgElm.forEach((svg) => {
            if (!isHidden(svg)) {
                numOfSVG++;
            }
        });
       
        svgImg.forEach((img) => {
            if (!isHidden(img)) {
                numOfSVGImage++;
            }
        });

        canvasElm.forEach((can) => {
            if (!isHidden(can)) {
                numOfCanvas++;
            }
        });

        videoElm.forEach((vid) => {
            if (!isHidden(vid)) {
                numOfVideosTags++;
            }
        });

        pdf.forEach((pdfElm) => {
            if (!isHidden(pdfElm)) {
                numOfPDF++;
            }
        });

        sendResponse({ homepageRes: homepage, iframeRes: numOfIframes, iframeCptchaRes: numOfICpatcha, iframeMapRes: numOfIMaps, iframeVidRes: numOfIVideos, otherIframeRes: otherIframe, vidRes: numOfVideosTags, pdfRes: numOfPDF, canvasElmRes: numOfCanvas, svgElmRes: numOfSVG, svgImgRes: numOfSVGImage });
    }
});


function isHidden(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top == 0 && rect.left == 0 && rect.bottom == 0 && rect.right == 0 &&
        rect.height == 0 && rect.width == 0 &&
        rect.x == 0 && rect.y == 0
        ||
        element.style.display == "none"
        ||
        element.style.visibility == "hidden"
        ||
        rect.top <= 0 && rect.left <= 0
        ||
        element.style.height == "0px" && element.style.width == "0px"
    );
}

function isHomepage() {
    if (window.location.pathname == '/') {
        return true;
    } else {
        return false;
    }
}


