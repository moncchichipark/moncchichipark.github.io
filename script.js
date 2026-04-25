const STORAGE_KEY = "moncchichi-local-posts";
const chips = document.querySelectorAll(".chip");
const postGrid = document.querySelector("#postGrid");
const searchInput = document.querySelector("#searchInput");
const postForm = document.querySelector("#postForm");
const writeOutput = document.querySelector("#writeOutput");
const clearLocalPostsButton = document.querySelector("#clearLocalPosts");

let activeFilter = "all";
let publishedPosts = [];
let localPosts = [];

function normalize(text) {
  return text.toLowerCase().trim();
}

function categoryLabel(category) {
  const labels = {
    cute: "CUTE",
    food: "FOOD",
    character: "CHARACTER",
    daily: "DAILY",
  };

  return labels[category] || "POST";
}

function readLocalPosts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLocalPosts(posts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function allPosts() {
  return [...localPosts, ...publishedPosts];
}

function createPostCard(post, index) {
  const card = document.createElement("article");
  card.className = "post-card";
  card.dataset.category = post.category;

  const rank = String(index + 1).padStart(2, "0");
  const likes = Number(post.likes || 0);
  const safeVisual = ["cake", "mascot", "pasta", "sticker"].includes(post.visual)
    ? post.visual
    : "sticker";

  card.innerHTML = `
    <span class="rank">${rank}</span>
    <div class="post-visual ${safeVisual}">
      <span>${safeVisual}</span>
    </div>
    <div class="post-body">
      <p class="post-meta">${categoryLabel(post.category)} · ${post.tag || "기록"}</p>
      <h3></h3>
      <p></p>
      <button class="like-btn" type="button" aria-label="글 좋아요">♡ ${likes}</button>
    </div>
  `;

  card.querySelector("h3").textContent = post.title;
  card.querySelector(".post-body p:not(.post-meta)").textContent = post.excerpt;
  card.querySelector(".like-btn").addEventListener("click", handleLike);

  return card;
}

function renderPosts() {
  postGrid.replaceChildren();
  const posts = allPosts();

  posts.forEach((post, index) => {
    postGrid.append(createPostCard(post, index));
  });

  if (!posts.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "아직 진열된 글이 없습니다.";
    postGrid.append(empty);
  }

  applyFilters();
}

function applyFilters() {
  const query = normalize(searchInput.value);
  const cards = document.querySelectorAll(".post-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category;
    const text = normalize(card.innerText);
    const matchesCategory = activeFilter === "all" || category.includes(activeFilter);
    const matchesQuery = !query || text.includes(query);
    const isVisible = matchesCategory && matchesQuery;

    card.classList.toggle("is-hidden", !isVisible);
    visibleCount += isVisible ? 1 : 0;
  });

  document.querySelector(".empty-state")?.remove();

  if (!visibleCount) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "이 조건에 맞는 글이 아직 없습니다.";
    postGrid.append(empty);
  }
}

function handleLike(event) {
  const button = event.currentTarget;
  const number = Number(button.textContent.replace(/[^0-9]/g, ""));
  const liked = button.classList.toggle("liked");

  button.textContent = `${liked ? "♥" : "♡"} ${liked ? number + 1 : number - 1}`;
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

postForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(postForm);
  const post = {
    title: formData.get("title").trim(),
    category: formData.get("category"),
    tag: formData.get("tag").trim() || "기록",
    excerpt: formData.get("excerpt").trim(),
    visual: formData.get("visual"),
    likes: 0,
  };

  localPosts = [post, ...localPosts];
  saveLocalPosts(localPosts);
  postForm.reset();
  writeOutput.textContent = `"${post.title}" 글을 ${categoryLabel(post.category)} 매대에 올렸습니다.`;
  renderPosts();
  document.querySelector("#ranking").scrollIntoView({ behavior: "smooth" });
});

clearLocalPostsButton.addEventListener("click", () => {
  localPosts = [];
  saveLocalPosts(localPosts);
  writeOutput.textContent = "브라우저에 저장된 임시 글을 비웠습니다.";
  renderPosts();
});

async function loadPublishedPosts() {
  try {
    const response = await fetch("data/posts.json");
    publishedPosts = response.ok ? await response.json() : [];
  } catch {
    publishedPosts = [];
  }

  localPosts = readLocalPosts();
  renderPosts();
}

loadPublishedPosts();
