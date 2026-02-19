/* ============================
   ملف الإعدادات Settings.js
   مسؤول عن:
   - الثيم (داكن / فاتح)
   - اللغة
   - فتح/إغلاق لوحة الإعدادات
   - حفظ الإعدادات في localStorage
============================ */

/* عناصر DOM */
const settingsPanel = document.getElementById("settingsPanel");
const settingsBtn = document.getElementById("settingsBtn");
const closeSettings = document.getElementById("closeSettings");

const themeSelect = document.getElementById("themeSelect");
const langSelect = document.getElementById("langSelect");

/* ============================
   فتح وإغلاق لوحة الإعدادات
============================ */
settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
});

closeSettings.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
});

/* ============================
   تطبيق الثيم
============================ */
function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light");
    } else {
        document.body.classList.remove("light");
    }
}

/* عند تغيير الثيم */
themeSelect.addEventListener("change", () => {
    const theme = themeSelect.value;
    applyTheme(theme);
    localStorage.setItem("theme", theme);
});

/* ============================
   اللغة (جاهزة للتوسّع لاحقاً)
============================ */
function applyLanguage(lang) {
    // يمكن إضافة ترجمة الواجهة لاحقاً
    console.log("Language set to:", lang);
}

/* عند تغيير اللغة */
langSelect.addEventListener("change", () => {
    const lang = langSelect.value;
    applyLanguage(lang);
    localStorage.setItem("lang", lang);
});

/* ============================
   تحميل الإعدادات عند تشغيل الموقع
============================ */
(function loadSettings() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const savedLang = localStorage.getItem("lang") || "ar";

    themeSelect.value = savedTheme;
    langSelect.value = savedLang;

    applyTheme(savedTheme);
    applyLanguage(savedLang);
})();

