// const ipAddress = "http://192.168.0.50";
// document.addEventListener("DOMContentLoaded", () => {
//     const favoriteColor = prompt("What is your favorite color?");
//     console.log(favoriteColor);
//   });
const ipAddress = "http://" + prompt("Enter the server IP address");
const port = "8080";
const downloadAbs = "/download/absolute?filename=";

const displayBtn = document.querySelector("#display");
const tbody = document.querySelector("#dir_contents_body")

displayBtn.addEventListener('click', async function () {
    await readParentDir();
});

async function readParentDir() {
    fetch(ipAddress + ":" + port + `/dir/parent`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            removeAllElements();
            populateData(data);
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
}

function populateSingleItem(item) {
    const tableRow = document.createElement("tr");
    const tdPath = document.createElement("td");
    // const aEncodedPath = document.createElement("a");
    tdPath.innerText = item.path;
    tableRow.appendChild(tdPath);
    // let encodedPathValue = ipAddress + ":" + port + downloadAbs + item.encodedPath;
    // console.log("encodedPathValue " + encodedPathValue);
    // aEncodedPath.innerHTML = "Download";
    // aEncodedPath.href = encodedPathValue;
    // // tdEncodedPath.innerText = item.encodedPath;
    // tdEncodedPath.appendChild(aEncodedPath);

    if (item.isDir) {
        const tdChangeDir = document.createElement("td");
        const btn = document.createElement("button");
        btn.innerHTML = "enter";
        btn.addEventListener('click', async function () {
            return readDir(item.path)
        });
        tdChangeDir.appendChild(btn);
        tableRow.appendChild(tdChangeDir);
    } else {
        const tdEncodedPath = document.createElement("td");
        const aEncodedPath = document.createElement("a");
        const encodedPathValue = ipAddress + ":" + port + downloadAbs + item.encodedPath;
        console.log("encodedPathValue " + encodedPathValue);
        aEncodedPath.innerHTML = "Download";
        aEncodedPath.href = encodedPathValue;
        // tdEncodedPath.innerText = item.encodedPath;
        tdEncodedPath.appendChild(aEncodedPath);
        tableRow.appendChild(tdEncodedPath);
        // btn.addEventListener('click', async function () {
        //     return downloadFile(item.path)
        // });
    }
    // tdChangeDir.appendChild(btn);

    // tableRow.appendChild(tdChangeDir);

    tbody.appendChild(tableRow);
}

function populateParent(path) {
    const tableRow = document.createElement("tr");
    const tdItem = document.createElement("td");
    const tdChangeDir = document.createElement("td");

    tdItem.innerText = "../";
    tableRow.appendChild(tdItem);

    const btn = document.createElement("button");
    btn.innerHTML = "enter";
    let separator = "";
    if (path.includes('/')) {
        separator = '/';
    } else {
        separator = '\\';
    }
    if (separator !== "") {
        let oneLevel = path.substring(0, path.lastIndexOf(separator));
        let twoLevels = oneLevel.substring(0, oneLevel.lastIndexOf(separator));
        btn.addEventListener('click', async function () {
            return readDir(twoLevels);
        });
    }
    tdChangeDir.appendChild(btn);

    tableRow.appendChild(tdChangeDir);

    tbody.appendChild(tableRow);
}

function populateData(data) {
    if (data.length > 0) {
        populateParent(data[0].path);
    }
    for (let i = 0; i < data.length; i++) {
        populateSingleItem(data[i]);
    }
}

async function readDir(path) {
    removeAllElements();
    const params = new URLSearchParams({
        path: path
    }).toString();
    fetch(ipAddress + ":" + port + `/dir/absolute?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            populateData(data);
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
}

async function downloadFile(filename) {
    removeAllElements();
    const params = new URLSearchParams({
        filename: filename
    }).toString();
    const response = await fetch(ipAddress + ":" + port + `/download/absolute?${params}`, {
        method: 'GET',
        headers: {
            'Accept': 'application/octet-stream'
        }
    });

    if (!response.ok) {
        throw new Error('Download failed');
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let contentDisposition = response.headers.get('Content-Disposition');
    let file = getFilename(contentDisposition);
    a.download = file;
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);
}

function removeAllElements() {
    for (let i = tbody.children.length - 1; i >= 0; i--) {
        tbody.removeChild(tbody.children[i]);
    }
}

function getFilename(disposition) {
    const utf8Match = disposition.match(/filename\*\=UTF-8''(.+)/);
    if (utf8Match) {
        return decodeURIComponent(utf8Match[1]);
    }

    const asciiMatch = disposition.match(/filename="?([^"]+)"?/);
    return asciiMatch ? asciiMatch[1] : 'download';
}