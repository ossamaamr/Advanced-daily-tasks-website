document.getElementById("userName").textContent = localStorage.getItem("username") || "مستخدم";
/* تسجيل الخروج */
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("loggedIn");
    window.location.href = "login.html";
});
/* حماية الصفحة */
if (localStorage.getItem("loggedIn") !== "true") {
    window.location.href = "login.html";
}
/* ============================
   عناصر DOM
============================ */
const taskForm = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");

const totalTasksEl = document.getElementById("totalTasks");
const completedTasksEl = document.getElementById("completedTasks");
const pendingTasksEl = document.getElementById("pendingTasks");
const progressBar = document.getElementById("progressBar");

const statusFilter = document.getElementById("statusFilter");
const priorityFilter = document.getElementById("priorityFilter");
const categoryFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("searchInput");

const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");
const closeSettings = document.getElementById("closeSettings");

const themeSelect = document.getElementById("themeSelect");
const langSelect = document.getElementById("langSelect");

/* ============================
   مؤقت بومودورو
============================ */
let timerInterval;
let timeLeft = 25 * 60; // 25 دقيقة
const timerDisplay = document.getElementById("timerDisplay");
const startTimerBtn = document.getElementById("startTimer");
const resetTimerBtn = document.getElementById("resetTimer");

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent =
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

startTimerBtn.addEventListener("click", () => {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            alert("انتهى وقت التركيز!");
            timeLeft = 25 * 60;
            updateTimerDisplay();
        }
    }, 1000);
});

resetTimerBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    updateTimerDisplay();
});

/* ============================
   نظام الإعدادات
============================ */
settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
});

/* الثيم */
themeSelect.addEventListener("change", () => {
    document.body.className = themeSelect.value === "light" ? "light" : "";
    localStorage.setItem("theme", themeSelect.value);
});

/* اللغة */
langSelect.addEventListener("change", () => {
    localStorage.setItem("lang", langSelect.value);
    alert("سيتم دعم تغيير اللغة في التحديث القادم");
});

/* تحميل الإعدادات */
(function loadSettings() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light");
        themeSelect.value = "light";
    }

    const savedLang = localStorage.getItem("lang");
    if (savedLang) langSelect.value = savedLang;
})();

/* ============================
   نظام المهام
============================ */
let tasks = [];

/* تحميل المهام */
window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("tasks");
    if (saved) tasks = JSON.parse(saved);
    renderTasks();
});

/* حفظ المهام */
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

/* إنشاء ID */
function generateId() {
    return Date.now().toString();
}

/* إضافة مهمة */
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const dueDate = document.getElementById("dueDate").value;
    const priority = document.getElementById("priority").value;
    const category = document.getElementById("category").value;

    if (!title) return;

    const newTask = {
        id: generateId(),
        title,
        description,
        dueDate,
        priority,
        category,
        completed: false
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    taskForm.reset();

    showNotification("تمت إضافة مهمة جديدة");
});

/* إشعار بسيط */
function showNotification(msg) {
    const div = document.createElement("div");
    div.textContent = msg;
    div.style.position = "fixed";
    div.style.bottom = "20px";
    div.style.right = "20px";
    div.style.background = "#38bdf8";
    div.style.color = "#000";
    div.style.padding = "10px 16px";
    div.style.borderRadius = "8px";
    div.style.fontWeight = "bold";
    div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    div.style.zIndex = "999";

    document.body.appendChild(div);

    setTimeout(() => div.remove(), 2000);
}

/* فلترة المهام */
function getFilteredTasks() {
    const statusValue = statusFilter.value;
    const priorityValue = priorityFilter.value;
    const categoryValue = categoryFilter.value;
    const searchValue = searchInput.value.trim().toLowerCase();

    return tasks.filter(task => {
        let ok = true;

        if (statusValue === "completed") ok = task.completed;
        else if (statusValue === "pending") ok = !task.completed;

        if (priorityValue !== "all") ok = ok && task.priority === priorityValue;

        if (categoryValue !== "all") ok = ok && task.category === categoryValue;

        if (searchValue) ok = ok && task.title.toLowerCase().includes(searchValue);

        return ok;
    });
}

/* تحديث الإحصائيات */
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;

    const progress = total === 0 ? 0 : completed / total;
    progressBar.style.transform = `scaleX(${progress})`;
}

/* عرض المهام */
function renderTasks() {
    taskList.innerHTML = "";

    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        const li = document.createElement("li");
        li.textContent = "لا توجد مهام مطابقة";
        li.style.color = "#9ca3af";
        li.style.fontSize = "0.9rem";
        taskList.appendChild(li);
        updateStats();
        return;
    }

    filtered.forEach(task => {
        const li = document.createElement("li");
        li.className = "task-item";
        if (task.completed) li.classList.add("completed");

        /* checkbox */
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.addEventListener("change", () => toggleComplete(task.id));

        /* main */
        const main = document.createElement("div");
        main.className = "task-main";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const desc = document.createElement("div");
        desc.className = "task-desc";
        desc.textContent = task.description || "لا يوجد وصف";

        const meta = document.createElement("div");
        meta.className = "task-meta";

        /* priority */
        const pBadge = document.createElement("span");
        pBadge.classList.add("badge");
        pBadge.classList.add(`badge-priority-${task.priority}`);
        pBadge.textContent =
            task.priority === "low" ? "منخفضة" :
            task.priority === "medium" ? "متوسطة" : "عالية";

        meta.appendChild(pBadge);

        /* category */
        const cBadge = document.createElement("span");
        cBadge.classList.add("badge", "badge-category");
        cBadge.textContent =
            task.category === "work" ? "عمل" :
            task.category === "study" ? "دراسة" :
            task.category === "personal" ? "شخصي" : "مخصص";

        meta.appendChild(cBadge);

        /* date */
        if (task.dueDate) {
            const dBadge = document.createElement("span");
            dBadge.classList.add("badge", "badge-date");
            dBadge.textContent = `تاريخ: ${task.dueDate}`;
            meta.appendChild(dBadge);
        }

        main.appendChild(title);
        main.appendChild(desc);
        main.appendChild(meta);

        /* actions */
        const actions = document.createElement("div");
        actions.className = "task-actions";

        const completeBtn = document.createElement("button");
        completeBtn.className = "action-btn action-complete";
        completeBtn.textContent = task.completed ? "إلغاء الإكمال" : "وضع كمكتملة";
        completeBtn.addEventListener("click", () => toggleComplete(task.id));

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "action-btn action-delete";
        deleteBtn.textContent = "حذف";
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        actions.appendChild(completeBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(checkbox);
        li.appendChild(main);
        li.appendChild(actions);

        taskList.appendChild(li);
    });

    updateStats();
}

/* تغيير حالة الإكمال */
function toggleComplete(id) {
    tasks = tasks.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
    );
    saveTasks();
    renderTasks();
}

/* حذف مهمة */
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

/* إعادة العرض عند تغيير الفلاتر */
statusFilter.addEventListener("change", renderTasks);
priorityFilter.addEventListener("change", renderTasks);
categoryFilter.addEventListener("change", renderTasks);
searchInput.addEventListener("input", renderTasks);
