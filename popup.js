//Global variables for all functions
var currentUrl = "";
var urlMap = new Map();

window.addEventListener('DOMContentLoaded', function () {

    //Global variables for after DOM is loaded
    var slide1 = document.querySelector(".step-1");
    var slide2 = document.querySelector(".step-2");
    var slideNum = localStorage.getItem("slideStep");

    //Step 2 slide
    if (slideNum == "2") {
        slide1.style.transition = "none";
        slide1.style.marginLeft = "-67%";
        startScan({ func: "setCount" });
    }

    //Slide step 3
    if (slideNum == "3") {
        slide2.style.transition = "none";
        slide2.style.marginLeft = "-233.5%";
        extractElementsFromLocalStorageIntoTextarea();
    }

    //Form validation
    const form = document.querySelector("form.form");
    const selectorInput = form.querySelector("#main-selector");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        checkInputs();
    });

    function checkInputs() {
        var inputValue = selectorInput.value.trim();
        if (inputValue === "") {
            form.querySelector("small").innerText = "Please enter a selector";
            form.classList.add("error");
        } else {

            chrome.tabs.query({ currentWindow: true, active: true },
                function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, { func: 'validateSelector', selector: inputValue }, validateSelector);
                });

            function validateSelector(res) {
                var numOfSelectors = res.numOfValidElm;
                if (numOfSelectors == -1) {
                    form.querySelector("small").innerText = "Use a JavaScript query selector";
                    form.classList.add("error");
                } else if (numOfSelectors > 0) {
                    form.classList.remove("error");
                    slide1.style.marginLeft = "-67%";
                    localStorage.setItem("slideStep", "2");
                    startScan({ func: "setCount" });
                } else {
                    form.querySelector("small").innerText = "This selector doesn't exist";
                    form.classList.add("error");
                }
            }

        }
    }

    //Click event for stop scan button
    var stopScan = document.querySelector("button.stop-scan");
    stopScan.addEventListener("click", function () {
        slide2.style.marginLeft = "-166.5%";
        localStorage.setItem("slideStep", "3");
        extractElementsFromLocalStorageIntoTextarea();
    });

    var copyBtn = document.getElementById("copyText");
    copyBtn.addEventListener("click", function () {
        copyText();
    });

    var doneBtn = document.getElementById("finishSession");
    doneBtn.addEventListener("click", function () {
        var isOk = confirm("Are you sure? All data will be deleted.");
        if (isOk == true) {
            localStorage.setItem("slideStep", "1");
            localStorage.removeItem("foundElements");
            slide2.style.marginLeft = "0px";
            slide2.style.transition = "none";
            slide1.style.marginLeft = "0px";
            slide1.style.transition = "none";
        } else {
            return false;
        }
    });

    //Page functions
    //Click event for arrows
    var arrowContainers = document.querySelectorAll(".element-count>div");
    arrowContainers.forEach((element) => {
        element.addEventListener("click", function () {
            var list = this.parentElement.parentElement.nextElementSibling.getElementsByTagName("ul")[0];
            var arrow = this.querySelector("i");
            if (arrow.classList.contains("closed")) {
                list.style.display = "block";
                arrow.classList.remove("closed");
                arrow.classList.add("opened");
            } else {
                list.style.display = "none";
                arrow.classList.remove("opened");
                arrow.classList.add("closed");
            }
        });
    });

    //Add click event to checkboxes
    var checkboxes = document.querySelectorAll(".check--label");
    checkboxes.forEach((label) => {
        label.addEventListener("click", function () {
            var checkMark = this.querySelector(".check--label-box");
            var id = this.getAttribute("for");
            var realCheckbox = document.getElementById(id);
            if (realCheckbox.hasAttribute("checked")) {
                //Not checked
                realCheckbox.removeAttribute("checked");
                checkMark.classList.remove("checked");
                if (id == "home-page") {
                    startScan({ func: "setCount", isHomePage: 0 });
                } else if (id == "save") {
                    chrome.tabs.query({ currentWindow: true, active: true },
                        function (tabs) {
                            currentUrl = tabs[0].url;
                        });

                    var oldMap = new Map(JSON.parse(localStorage.getItem("foundElements")));
                    if (oldMap) {
                        urlMap = oldMap;
                        urlMap.delete(currentUrl);
                        localStorage.setItem("foundElements", JSON.stringify(Array.from(urlMap.entries())));
                    }
                }
            } else {
                //Checked
                realCheckbox.setAttribute("checked", "");
                checkMark.classList.add("checked");
                if (id == "home-page") {
                    startScan({ func: "setCount", isHomePage: 1 });
                }
                else if (id == "save") {
                    if (document.getElementById("home-page").hasAttribute("checked")) {
                        startScan({ func: "setCount", isHomePage: 1 });
                    } else {
                        startScan({ func: "setCount" });
                    }
                }
            }
        });
    });

});

function startScan(msg) {

    chrome.tabs.query({ currentWindow: true, active: true },
        function (tabs) {
            chrome.tabs.sendMessage(tabs[0].id, msg, setCount);
            currentUrl = tabs[0].url;
        });

    //Element count
    function setCount(res) {

        let elementsMap = new Map();

        //Check / uncheck homepage checkbox
        var homepageCheckbox = document.querySelector(".check--label[for='home-page']");
        var checkMark = homepageCheckbox.querySelector(".check--label-box");
        var id = homepageCheckbox.getAttribute("for");
        var realCheckbox = document.getElementById(id);
        var isHomePage = res.homepageRes;
        if (isHomePage == 1) {
            //Check
            realCheckbox.setAttribute("checked", "");
            checkMark.classList.add("checked");
        } else {
            //Uncheck
            realCheckbox.removeAttribute("checked");
            checkMark.classList.remove("checked");
        }

        //Check save checkbox
        var saveCheckbox = document.querySelector(".check--label[for='save']");
        var checkMark2 = saveCheckbox.querySelector(".check--label-box");
        var id2 = saveCheckbox.getAttribute("for");
        var realCheckbox2 = document.getElementById(id2);
        realCheckbox2.setAttribute("checked", "");
        checkMark2.classList.add("checked");


        //Iframes
        var numOfIframes = res.iframeRes;
        var numOfImaps = res.iframeMapRes;
        var numOfIVideos = res.iframeVidRes;
        var numOfICaptcha = res.iframeCptchaRes;
        var otherIframe = res.otherIframeRes;
        document.querySelector(".iframe-elm .element-count span").textContent = numOfIframes;
        document.querySelector(".iframe-elm .element-count-type1 span").textContent = numOfIVideos;
        document.querySelector(".iframe-elm .element-count-type2 span").textContent = numOfImaps;
        document.querySelector(".iframe-elm .element-count-type3 span").textContent = numOfICaptcha;
        document.querySelector(".iframe-elm .element-count-type4 span").textContent = otherIframe;
        var iframeCheck = document.querySelector(".iframe-elm .check");
        if (numOfIframes > 0) {
            iframeCheck.style.display = "inline-block";
            elementsMap.set("Total iframes", numOfIframes);
            if (numOfImaps > 0) {
                elementsMap.set("Map iframes", numOfImaps);
            }
            if (numOfIVideos > 0) {
                elementsMap.set("Video iframes", numOfIVideos);
            }
            if (numOfICaptcha > 0) {
                elementsMap.set("Captcha iframes", numOfICaptcha);
            }
            if (otherIframe > 0) {
                elementsMap.set("Other iframes", otherIframe);
            }
        } else {
            iframeCheck.style.display = "none";
        }

        //PDF files
        var numOfPDF = res.pdfRes;
        document.querySelector(".pdf-elm span").textContent = numOfPDF;
        var pdfCheck = document.querySelector(".pdf-elm .check");
        if (numOfPDF > 0) {
            pdfCheck.style.display = "inline-block";
            elementsMap.set("PDF", numOfPDF);
        } else {
            pdfCheck.style.display = "none";
        }

        //CANVAS tag
        var numOfCanvas = res.canvasElmRes;
        document.querySelector(".canvas-elm span").textContent = numOfCanvas;
        var canvasCheck = document.querySelector(".canvas-elm .check");
        if (numOfCanvas > 0) {
            canvasCheck.style.display = "inline-block";
            elementsMap.set("Canvas", numOfCanvas);
        } else {
            canvasCheck.style.display = "none";
        }

        //Video tag
        var numOfVideosTags = res.vidRes;
        document.querySelector(".video-elm span").textContent = numOfVideosTags;
        var videoCheck = document.querySelector(".video-elm .check");
        if (numOfVideosTags > 0) {
            videoCheck.style.display = "inline-block";
            elementsMap.set("Video Tags", numOfVideosTags);
        } else {
            videoCheck.style.display = "none";
        }

        //SVG
        var numOfSVG = res.svgElmRes;
        var numOfSVGImage = res.svgImgRes;
        var totalSVG = numOfSVG + numOfSVGImage;
        document.querySelector(".svg-elm .element-count span").textContent = totalSVG;
        document.querySelector(".svg-elm .element-count-type1 span").textContent = numOfSVG;
        document.querySelector(".svg-elm .element-count-type2 span").textContent = numOfSVGImage;
        var svgCheck = document.querySelector(".svg-elm .check");
        if (totalSVG > 0) {
            svgCheck.style.display = "inline-block";
            elementsMap.set("Total SVG", totalSVG);
            if (numOfSVGImage > 0) {
                elementsMap.set("SVG Images", numOfSVGImage);
            }
            if (numOfSVG > 0) {
                elementsMap.set("SVG Tags", numOfSVG);
            }
        } else {
            svgCheck.style.display = "none";
        }

        if (elementsMap.size > 0) {
            var oldMap = new Map(JSON.parse(localStorage.getItem("foundElements")));
            if (oldMap) {
                urlMap = oldMap;
            }
            urlMap.set(currentUrl, JSON.stringify(Array.from(elementsMap.entries())));
            localStorage.setItem("foundElements", JSON.stringify(Array.from(urlMap.entries())));
        }

    }

}

function copyText() {
    var copyText = document.getElementById("foundElements");
    copyText.select();
    document.execCommand("copy");
    alert("Text copied!");
}

function extractElementsFromLocalStorageIntoTextarea() {
    var outerMap = new Map(JSON.parse(localStorage.getItem("foundElements")));
    var textarea = document.getElementById("foundElements");
    const originalText = "The following URL's contain elements we don't support, therefore they might not be fully accessible: \n";
    var newText = originalText;

    function createNewTextForFoundElms(value, key, map) {
        var innerMap = JSON.parse(outerMap.get(key));
        newText += "\n" + key + " \nContains: " + "\n";
        innerMap.forEach((innerVal) =>
            newText += "&#8226; " + innerVal[0] + ": " + innerVal[1] + " elements. \n"
        )
    }

    outerMap.forEach(createNewTextForFoundElms);

    textarea.innerHTML = newText;
}

