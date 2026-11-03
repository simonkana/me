const themeButton = document.querySelector(".theme-toggle");
const themeRoot = document.documentElement;
const themeMeta = document.querySelector('meta[name="theme-color"]');
const systemTheme = window.matchMedia("(prefers-color-scheme: dark)");

if (themeButton) {
  const updateThemeControl = (isDark) => {
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeButton.title = isDark ? "Switch to light mode" : "Switch to dark mode";
    themeButton.classList.toggle("is-dark", isDark);
    if (themeMeta) themeMeta.content = isDark ? "#202b37" : "#faf3e5";
  };

  const hasSavedTheme = themeRoot.dataset.theme === "dark" || themeRoot.dataset.theme === "light";
  updateThemeControl(themeRoot.dataset.theme === "dark" || (!hasSavedTheme && systemTheme.matches));
  document.querySelector(".site-header")?.classList.add("theme-enhanced");

  themeButton.addEventListener("click", () => {
    const nextTheme = themeButton.getAttribute("aria-pressed") === "true" ? "light" : "dark";
    themeRoot.dataset.theme = nextTheme;
    updateThemeControl(nextTheme === "dark");
    try {
      localStorage.setItem("site-theme", nextTheme);
    } catch (_) {}
  });

  systemTheme.addEventListener("change", (event) => {
    if (!themeRoot.hasAttribute("data-theme")) updateThemeControl(event.matches);
  });
}
