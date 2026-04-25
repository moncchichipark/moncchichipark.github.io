const chips = document.querySelectorAll(".chip");
const cards = document.querySelectorAll(".post-card");
const searchInput = document.querySelector("#searchInput");
const likeButtons = document.querySelectorAll(".like-btn");

let activeFilter = "all";

function normalize(text) {
  return text.toLowerCase().trim();
}

function applyFilters() {
  const query = normalize(searchInput.value);

  cards.forEach((card) => {
    const category = card.dataset.category;
    const text = normalize(card.innerText);
    const matchesCategory = activeFilter === "all" || category.includes(activeFilter);
    const matchesQuery = !query || text.includes(query);

    card.classList.toggle("is-hidden", !(matchesCategory && matchesQuery));
  });
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chips.forEach((item) => item.classList.remove("active"));
    chip.classList.add("active");
    activeFilter = chip.dataset.filter;
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

likeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const number = Number(button.textContent.replace(/[^0-9]/g, ""));
    const liked = button.classList.toggle("liked");
    button.textContent = `${liked ? "♥" : "♡"} ${liked ? number + 1 : number - 1}`;
  });
});
