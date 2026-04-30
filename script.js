const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const viewerContainer = document.getElementById('viewer-container');
let rendition;

dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        openBook(e.target.files[0]);
    }
});

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "#252525";
    dropZone.style.borderColor = "#007bff";
});

dropZone.addEventListener('dragleave', () => {
    dropZone.style.backgroundColor = "transparent";
    dropZone.style.borderColor = "#444";
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.backgroundColor = "transparent";
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith('.epub')) {
        openBook(file);
    } else {
        alert("Please upload a valid EPUB file!");
    }
});

function openBook(file) {
    console.log("Loading file:", file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const data = e.target.result;
        displayBook(data);
    };

    reader.onerror = () => {
        console.error("Error reading file");
        alert("Could not read the file!");
    };

    reader.readAsArrayBuffer(file);
}

function displayBook(data) {
    console.log("Checking if epub.js is loaded...");
    
    if (typeof ePub === 'undefined') {
        alert("The reader library is not loaded yet. Please refresh the page!");
        return;
    }

    dropZone.style.display = 'none';
    viewerContainer.style.display = 'block';

    const book = ePub(data);

    const viewerElement = document.getElementById('viewer');
    if (!viewerElement) {
        console.error("Critical error: Element with ID 'viewer' not found!");
        return;
    }

    rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
        flow: "paginated",
        manager: "default"
    });

    rendition.display().then(() => {
        console.log("Success! Book is now visible.");
    }).catch(err => {
        console.error("Error while displaying:", err);
    });

    document.getElementById('next').onclick = (e) => {
        e.preventDefault();
        if(rendition) rendition.next();
    };
    document.getElementById('prev').onclick = (e) => {
        e.preventDefault();
        if(rendition) rendition.prev();
    };
}