const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
const currentTheme = localStorage.getItem("theme");
if (currentTheme === "dark" || (!currentTheme && prefersDarkScheme.matches)) {
    document.documentElement.classList.toggle("dark-theme");
} else if (currentTheme === "light" || (!currentTheme && !prefersDarkScheme.matches)) {
    document.documentElement.classList.toggle("light-theme");
}

document.addEventListener('DOMContentLoaded', function() {
    const checkbox = document.getElementById("theme-switcher");
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
        checkbox.checked = true;
    } 
    checkbox.addEventListener("change", function () {
        document.documentElement.classList.toggle('dark-theme');
        document.documentElement.classList.toggle('light-theme');
        var theme = document.documentElement.classList.contains("light-theme")
        ? "light"
        : "dark";
      localStorage.setItem("theme", theme);
    }, {passive: true});
}, {passive: true});
