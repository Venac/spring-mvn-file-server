const displayBtn = document.querySelector("#display");
const tbody = document.querySelector("#dir_contents_body")

displayBtn.addEventListener('click', async function () {
    await readParentDir();
});

async function readParentDir() {
//            const params = new URLSearchParams({
//                name: "alex"
//            });
            fetch(`http://localhost:8080/dir/parent`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    console.log(data);
                    for (let i = 0; i < data.length; i++) {
                        populateData(data[i]);
                    }
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                });
}

async function displayAllEmployees() {
    try {
        saveInfoParagraph.innerText = "";
        const res = await axios.get('http://localhost:8080/employees');
        const data = res.data;
        // TODO is data.length === 0, display no employees found in db
        for (let i = 0; i < data.length; i++) {
            populateEmployeeData(data[i]);
        }
    } catch (e) {
        console.log(e);
    }
}

function populateData(item) {
    console.log(item);
    const tr = document.createElement("tr");
    const tdItem = document.createElement("td");
    const tdCd = document.createElement("td");

    tdItem.innerText = item;
    tr.appendChild(tdItem);

    const cdBtn = document.createElement("button");
    cdBtn.innerHTML = "cd";
    cdBtn.addEventListener('click', async function () {
        return readDir(item)
    });

    tdCd.appendChild(cdBtn);
    tr.appendChild(tdCd);

    tbody.appendChild(tr);
}

function populateEmployeeData(employee) {
    const tr = document.createElement("tr");
    const tdId = document.createElement("td");
    const tdFirstName = document.createElement("td");
    const tdLastName = document.createElement("td");
    const tdEdit = document.createElement("td");
    const tdDelete = document.createElement("td");

    tdId.innerText = employee.id;
    tdFirstName.innerText = employee.firstName;
    tdLastName.innerText = employee.lastName;
    tr.setAttribute("id", employee.id);
    tr.appendChild(tdId);
    tr.appendChild(tdFirstName);
    tr.appendChild(tdLastName);

    const editBtn = document.createElement("button");
    editBtn.innerHTML = "edit";
    editBtn.addEventListener('click', async function () {
        return editFunction(employee)
    });
    const deleteBtn = document.createElement("button");
    deleteBtn.innerHTML = "delete";
    deleteBtn.addEventListener('click', async function () {
        return deleteFunction(employee);
    });
    editBttns.push(editBtn);
    deleteBttns.push(deleteBtn);

    tdEdit.appendChild(editBtn);
    tdDelete.appendChild(deleteBtn);
    tr.appendChild(tdEdit);
    tr.appendChild(tdDelete);

    tbody.appendChild(tr);
}

async function readDir(item) {
                  const params = new URLSearchParams({
                      path: item
                  }).toString();
    fetch(`http://localhost:8080/dir/absolute?${params}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Network response was not ok");
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log(data);
                        for (let i = 0; i < data.length; i++) {
                            populateData(data[i]);
                        }
                    })
                    .catch(error => {
                        console.error("Fetch error:", error);
                    });
}