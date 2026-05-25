const downloadLink = document.getElementById("download-link");
const repoLink = document.getElementById("repo-link");

if (downloadLink) {
  downloadLink.addEventListener("click", () => {
    downloadLink.setAttribute("aria-label", "Abrir página de downloads do Miamono Desktop");
  });
}

if (repoLink) {
  repoLink.addEventListener("click", () => {
    repoLink.setAttribute("aria-label", "Abrir repositório do Miamono Desktop no GitHub");
  });
}