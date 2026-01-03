const displayBtn = document.querySelector("#display");
const tbody = document.querySelector("#dir_contents_body")

displayBtn.addEventListener('click', async function () {
    await readParentDir();
});

async function readParentDir() {
    fetch(`http://localhost:8080/dir/parent`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            removeAllElements();
            for (let i = 0; i < data.length; i++) {
                populateData(data[i]);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
        });
}

function populateData(item) {
    const tr = document.createElement("tr");
    const tdItem = document.createElement("td");
    const tdCd = document.createElement("td");

    tdItem.innerText = item.path;
    tr.appendChild(tdItem);

    const btn = document.createElement("button");
    btn.innerHTML = item.isDir === true ? "enter" : "download";
    if (item.isDir) {
        btn.addEventListener('click', async function () {
            return readDir(item.path)
        });
    } else {
        btn.addEventListener('click', async function () {
            return downloadFile(item.path)
        });
    }
    tdCd.appendChild(btn);

    tr.appendChild(tdCd);

    tbody.appendChild(tr);
}

async function readDir(path) {
    removeAllElements();
    const params = new URLSearchParams({
        path: path
    }).toString();
    fetch(`http://localhost:8080/dir/absolute?${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            for (let i = 0; i < data.length; i++) {
                populateData(data[i]);
            }
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
    const response = await fetch(`http://localhost:8080/download/absolute?${params}`, {
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