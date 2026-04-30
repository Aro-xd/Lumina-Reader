const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const landingPage = document.getElementById('landing-page');
const viewerContainer = document.getElementById('viewer-container');
const pageInfo = document.getElementById('page-info');

let book;
let rendition;

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        openBook(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#38bdf8";
    dropZone.style.backgroundColor = "rgba(56, 189, 248, 0.1)";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.borderColor = "rgba(56, 189, 248, 0.3)";
    dropZone.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "rgba(56, 189, 248, 0.3)";
    dropZone.style.backgroundColor = "rgba(30, 41, 59, 0.5)";
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.epub')) {
        openBook(file);
    } else {
        alert("Please upload a valid EPUB file!");
    }
});


function openBook(file) {
    pageInfo.innerText = "Loading...";

    const reader = new FileReader();
    reader.onload = (e) => {
        const data = e.target.result;
        displayBook(data);
    };
    reader.readAsArrayBuffer(file);
}

function displayBook(data) {

    landingPage.style.display = 'none';
    viewerContainer.style.display = 'flex';

    book = ePub(data);
    rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated",
        manager: "default"
    });

    rendition.hooks.content.register(function(contents) {
        contents.addStylesheetRules({
            "body": {
                "font-family": "'Georgia', serif !important",
                "padding": "40px !important",
                "background-color": "white !important",
                "color": "#333 !important",
                "line-height": "1.6 !important",
                "font-size": "18px !important"
            },
            "p": {
                "margin-bottom": "1.2em !important",
                "text-align": "justify !important"
            },
            "img": {
                "max-width": "100% !important",
                "height": "auto !important"
            }
        });
    });

    rendition.display().catch(err => {
        console.error("Render error:", err);
        alert("Wystąpił błąd podczas ładowania książki.");
    });
    book.ready.then(() => {
        return book.locations.generate(1600); 
    }).then((locations) => {
        console.log("Książka zmapowana! Procenty będą działać.");
        pageInfo.innerText = "0% read";
    });

    rendition.on("relocated", function(location) {
        let percent = book.locations.percentageFromCfi(location.start.cfi);
        let percentage = Math.round(percent * 100);

        if (percent >= 0) {
            pageInfo.innerText = percentage + "% read";
        }
    });
    document.getElementById('next').onclick = (e) => {
        e.preventDefault();
        rendition.next();
    };

    document.getElementById('prev').onclick = (e) => {
        e.preventDefault();
        rendition.prev();
    };

    document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft") rendition.prev();
        if (e.key === "ArrowRight") rendition.next();
    }, false);
}