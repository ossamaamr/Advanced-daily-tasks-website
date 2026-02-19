const loginBtn = document.getElementById("loginBtn");

loginBtn.addEventListener("click", () => {
    const name = document.getElementById("username").value.trim();

    if (name.length < 2) {
        alert("الرجاء إدخال اسم صحيح");
        return;
    }

    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("username", name);

    window.location.href = "index.html";
});

if (localStorage.getItem("loggedIn") === "true") {
    window.location.href = "index.html";
}
