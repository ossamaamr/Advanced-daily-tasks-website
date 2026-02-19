/* ============================
   نظام تسجيل الدخول المحلي
============================ */

/* بيانات الدخول الثابتة */
const VALID_USERNAME = "admin";
const VALID_PASSWORD = "12345";

/* عناصر DOM */
const loginBtn = document.getElementById("loginBtn");
const errorMsg = document.getElementById("errorMsg");

loginBtn.addEventListener("click", () => {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();

    if (user === VALID_USERNAME && pass === VALID_PASSWORD) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "index.html";
    } else {
        errorMsg.style.display = "block";
    }
});

/* إذا كان المستخدم مسجلاً دخول بالفعل → ادخله مباشرة */
if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "index.html";
}
