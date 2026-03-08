
let allissues = [];

async function openModal(id) {
    try {

        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const data = await res.json();
        const issue = data.data;

        document.getElementById("title").textContent = issue.title;

        const statusContainer = document.getElementById("status");
        statusContainer.innerHTML = `<span class="bg-green-400 rounded-lg px-1 text-center "> ${issue.status} </span>`;

        document.getElementById("author").textContent = `Opened by ${issue.author}`;

        document.getElementById("date").textContent = new Date(issue.createdAt).toLocaleDateString();

        document.getElementById("description").textContent = issue.description;

        document.getElementById("assignee").textContent = issue.assignee;

        const priorityEl = document.getElementById("priority");

        priorityEl.textContent = issue.priority.toUpperCase();

        let priorityClass = "";

        if (issue.priority === "high") {
            priorityClass = "bg-red-700 text-white font-bold text-xl ";
        }
        else if (issue.priority === "medium") {
            priorityClass = "bg-yellow-300 text-black rounded-lg font-bold";
        }
        else if (issue.priority === "low") {
            priorityClass = "bg-gray-300 text-black font-bold text-xl";
        }

        priorityEl.className = `px-2 py-1 rounded font-semibold text-xs w-fit ${priorityClass}`;

        const labelContainer = document.getElementById("label");

        labelContainer.innerHTML = (issue.labels || []).map(lab =>
            `<span class="px-2 py-1 bg-red-100 rounded font-semibold text-xs">${lab.toUpperCase()}</span>`
        ).join("");
        my_modal_5.showModal();

    } catch (error) {
        console.log(error);
    }
}

function setActiveButton(activeBtnId) {
    ["all-btn", "open-btn", "close-btn"].forEach(id => {
        const btn = document.getElementById(id);
        btn.classList.remove("bg-blue-400", "text-white");
        btn.classList.add("border-blue-400", "text-black");
    });

    const activeBtn = document.getElementById(activeBtnId);
    activeBtn.classList.add("bg-blue-400", "text-white");
    activeBtn.classList.remove("border-blue-400", "text-black");
}

document.getElementById("all-btn").addEventListener("click", () => {
    setActiveButton("all-btn");
    renderCards(allissues);

})

document.getElementById("open-btn").addEventListener("click", () => {
    setActiveButton("open-btn")
    const openIssue = allissues.filter(issue => issue.status === "open");
    renderCards(openIssue);
})

document.getElementById("close-btn").addEventListener("click", () => {
    setActiveButton("close-btn")
    const openIssue = allissues.filter(issue => issue.status === "closed");
    renderCards(openIssue);
})


const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", (event) => {
    const value = event.target.value.trim();
    if (value === "") {
        loadIssues();
    } else {
        searchIssue(value);
    }
})
const searchIssue = async (query) => {
    try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        allissues = data.data;
        renderCards(allissues);
    } catch (err) {
        console.error("Search error:", err);
    }
};


async function loadIssues() {
    try {
        const res = await fetch('https://phi-lab-server.vercel.app/api/v1/lab/issues');
        const data = await res.json();
        allissues = data.data || [];
        renderCards(data.data);
    } catch (err) {
        console.error(err);
        document.getElementById('issues').innerText = "Failed to load issues.";
    }
}

function renderCards(list) {
    const container = document.getElementById('issues');
    container.innerHTML = '';
    document.getElementById("issueCount").textContent = list.length;
    if (list.length === 0) {
        container.innerHTML = `
                 <p class="col-span-full text-center text-gray-500">
                No issues found
                 </p>
                `;
        return;
    }

    list.forEach(item => {

        const borderColor = item.status === 'open'
            ? 'border-t-4 border-[#00A96E]'
            : 'border-t-4 border-[#A855F7]';


        const statusImg = item.status === 'open'
            ? '/assets/Open-Status.png'
            : '/assets/Closed_Status.png';

        let priorityBg = '';
        if (item.priority === 'high') priorityBg = 'bg-red-100 text-red-800';
        else if (item.priority === 'medium') priorityBg = 'bg-yellow-100 text-yellow-800';
        else if (item.priority === 'low') priorityBg = 'bg-green-100 text-green-800';
        else priorityBg = 'bg-gray-100 text-gray-800';

        const date = item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—';
        const updatedDate = item.updatedAt
            ? new Date(item.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—';

        const html = `
                   <div class="bg-white rounded-xl shadow p-4 ${borderColor} cursor-pointer hover:shadow-lg transition-shadow duration-200" onclick="openModal(${item.id})">
            <div class="flex justify-between items-center">
                <img src="${statusImg}" alt="${item.status} status" class="w-6 h-6">
                <h2 class="${priorityBg} rounded-md font-semibold p-1">${item.priority.toUpperCase()}</h2>
            </div>
            <h3 class="text-lg text-black font-semibold mb-2">${item.title}</h3>
            <p class="text-gray-800 mb-3">${item.description}</p>
                    <div class="flex flex-wrap gap-2 mb-3">
                    ${(item.labels || []).map(label => {
            const lowerLabel = label.toLowerCase();
            const isRed = lowerLabel === 'bug' || lowerLabel === 'help wanted';
            const bgColor = isRed ? 'bg-red-100' : 'bg-green-100';
            const textColor = isRed ? 'text-red-700' : 'text-green-700';
            return `<span class="text-xs py-1 px-2 rounded-full font-semibold ${bgColor} ${textColor}">
                    ${label.toUpperCase()}
                    </span>`;
        }).join('')}
                </div>

                
            <hr class="border-t border-gray-300 my-4">
            <p class="text-sm text-gray-400">#${item.id} by ${item.author || 'Unknown'}</p>

        <div class="flex justify-around">  <p class="text-sm text-gray-400">Created: ${date}</p>
          <p class="text-sm text-gray-400">Updated: ${updatedDate}</p> </div>
        
        </div>
        `;

        container.insertAdjacentHTML('beforeend', html);
    });
}
loadIssues();
setActiveButton("all-btn");