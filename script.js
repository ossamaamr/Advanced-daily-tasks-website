// ============ DATA STRUCTURE ============

let tasks = [];
let trash = [];
let timerInterval = null;
let timerSeconds = 25 * 60;

// ============ DOM ELEMENTS ============

const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const trashList = document.getElementById("trashList");

const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const todayTasksEl = document.getElementById("todayTasks");
const progressBar = document.getElementById("progressBar");

const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const resetTimerBtn = document.getElementById("resetTimer");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettingsBtn = document.getElementById("closeSettings");

const themeSelect = document.getElementById("themeSelect");
const langSelect = document.getElementById("langSelect");
const soundSelect = document.getElementById("soundSelect");

const categorySelect = document.getElementById("category");
const customCategoryInput = document.getElementById("customCategory");
const reminderCheckbox = document.getElementById("reminder");

// ============ SOUNDS (Premium Online Sounds) ============

// صوت إضافة مهمة
const soundAdd = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_7b1e1b3243.mp3?filename=click-124467.mp3");

// صوت إكمال مهمة
const soundDone = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_5e8c6f6d9f.mp3?filename=success-1-6297.mp3");

// صوت انتهاء البومودورو
const soundTimer = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_1e8e7a69a3.mp3?filename=notification-113724.mp3");

// صوت حذف مهمة
const soundDelete = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_2b3f4e6c2a.mp3?filename=delete-14803.mp3");

// صوت استعادة مهمة
const soundRestore = new Audio("https://cdn.pixabay.com/download/audio/2022/03/15/audio_3a9e7c4d1b.mp3?filename=pop-94319.mp3");

function playSound(type) {
    if (!soundSelect || soundSelect.value === "off") return;

    switch(type) {
        case "add": soundAdd.play().catch(()=>{}); break;
        case "done": soundDone.play().catch(()=>{}); break;
        case "timer": soundTimer.play().catch(()=>{}); break;
        case "delete": soundDelete.play().catch(()=>{}); break;
        case "restore": soundRestore.play().catch(()=>{}); break;
    }
}

// ============ LOCAL STORAGE ============

function saveData() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("trash", JSON.stringify(trash));
}

function loadData() {
    tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
    trash = JSON.parse(localStorage.getItem("trash") || "[]");
}

// ============ RENDERING ============

function renderTasks() {
    taskList.innerHTML = "";

    const statusVal = statusFilter.value;
    const priorityVal = priorityFilter.value;
    const categoryVal = categoryFilter.value;
    const searchVal = searchInput.value.toLowerCase();

    const filtered = tasks.filter(task => {
        if (statusVal === "completed" && !task.completed) return false;
        if (statusVal === "pending" && task.completed) return false;
        if (priorityVal !== "all" && task.priority !== priorityVal) return false;
        if (categoryVal !== "all" && task.category !== categoryVal) return false;
        if (searchVal && !(
            task.title.toLowerCase().includes(searchVal) ||
            (task.description || "").toLowerCase().includes(searchVal)
        )) return false;
        return true;
    });

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = "task" + (task.completed ? " completed" : "");

        li.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div>
                    <span class="badge">${task.priority}</span>
                    <span class="badge">${task.category}</span>
                </div>
            </div>
            <div class="task-meta">
                ${task.dueDate ? `تاريخ: ${task.dueDate}` : "بدون تاريخ"} 
                ${task.reminder ? " • تذكير مفعّل" : ""}
            </div>
            ${task.description ? `<div class="task-meta">${task.description}</div>` : ""}
            <div class="task-actions">
                <button class="btn" data-action="toggle" data-id="${task.id}">
                    ${task.completed ? "إلغاء الإكمال" : "تحديد كمكتملة"}
                </button>
                <button class="btn" data-action="delete" data-id="${task.id}">
                    حذف
                </button>
            </div>
        `;

        taskList.appendChild(li);
    });

    renderTrash();
    updateStats();
}

function renderTrash() {
    trashList.innerHTML = "";

    trash.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";

        li.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div>
                    <span class="badge">محذوفة</span>
                </div>
            </div>
            <div class="task-meta">
                ${task.dueDate ? `تاريخ: ${task.dueDate}` : "بدون تاريخ"}
            </div>
            <div class="task-actions">
                <button class="btn" data-action="restore" data-id="${task.id}">
                    استعادة
                </button>
                <button class="btn" data-action="remove" data-id="${task.id}">
                    حذف نهائي
                </button>
            </div>
        `;

        trashList.appendChild(li);
    });
}

// ============ STATS ============

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    const todayStr = new Date().toISOString().slice(0,10);
    const todayCount = tasks.filter(t => t.dueDate === todayStr).length;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    todayTasksEl.textContent = todayCount;

    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressBar.style.width = percent + "%";
}

// ============ ADD TASK ============

taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    let category = categorySelect.value;
    const reminder = reminderCheckbox.checked;

    if (category === "custom") {
        const custom = customCategoryInput.value.trim();
        if (custom) category = custom;
    }

    if (!title) return;

    const newTask = {
        id: Date.now(),
        title,
        description,
        dueDate,
        priority,
        category,
        reminder,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    saveData();
    renderTasks();
    playSound("add");

    taskForm.reset();
    customCategoryInput.style.display = "none";
});

// ============ CATEGORY CUSTOM FIELD ============

categorySelect.addEventListener("change", () => {
    if (categorySelect.value === "custom") {
        customCategoryInput.style.display = "block";
    } else {
        customCategoryInput.style.display = "none";
    }
});

// ============ TASK ACTIONS ============

taskList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "toggle") {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        task.completed = !task.completed;
        saveData();
        renderTasks();
        if (task.completed) playSound("done");
    }

    if (action === "delete") {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return;
        const removed = tasks.splice(index, 1)[0];
        trash.push(removed);
        saveData();
        renderTasks();
        playSound("delete");
    }
});

trashList.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const id = Number(btn.dataset.id);
    const action = btn.dataset.action;

    if (action === "restore") {
        const index = trash.findIndex(t => t.id === id);
        if (index === -1) return;
        const restored = trash.splice(index, 1)[0];
        tasks.push(restored);
        saveData();
        renderTasks();
        playSound("restore");
    }

    if (action === "remove") {
        const index = trash.findIndex(t => t.id === id);
        if (index === -1) return;
        trash.splice(index, 1);
        saveData();
        renderTrash();
    }
});

// ============ FILTERS & SEARCH ============

[statusFilter, priorityFilter, categoryFilter].forEach(el => {
    el.addEventListener("change", renderTasks);
});

searchInput.addEventListener("input", renderTasks);

// ============ POMODORO ============

function updateTimerDisplay() {
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, "0");
    const s = String(timerSeconds % 60).padStart(2, "0");
    timerDisplay.textContent = `${m}:${s}`;
}

startTimerBtn.addEventListener("click", () => {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        timerSeconds--;
        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            timerSeconds = 25 * 60;
            playSound("timer");
        }
        updateTimerDisplay();
    }, 1000);
});

resetTimerBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSeconds = 25 * 60;
    updateTimerDisplay();
});

// ============ SETTINGS PANEL ============

settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.add("visible");
});

closeSettingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("visible");
});

// ============ INIT ============

window.addEventListener("load", () => {
    loadData();
    updateTimerDisplay();
    renderTasks();

    setTimeout(() => {
        const splash = document.getElementById("splashScreen");
        if (splash) splash.style.display = "none";
    }, 3000);
});
