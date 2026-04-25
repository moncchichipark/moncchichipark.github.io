const chips = document.querySelectorAll(".chip");
const postGrid = document.querySelector("#postGrid");
const searchInput = document.querySelector("#searchInput");
const heroScene = document.querySelector(".hero-scene");
const revealSections = document.querySelectorAll(".reveal-on-scroll");
const scrollTones = ["cute", "fresh", "ranking", "food", "character"];
const mascotFaces = ["•ᴗ•", "◕ᴗ◕", "˘ڡ˘", "♡ᴗ♡", "•ﻌ•"];
const mascotFace = document.querySelector(".mascot-face");

let activeFilter = "all";
let publishedPosts = [];
let dragStartY = 0;
let activeMoodIndex = 0;
const moods = ["cute", "food", "character"];

function updateScrollState() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  document.documentElement.style.setProperty("--scroll", progress.toFixed(3));
  document.documentElement.style.setProperty("--mascot-bob", `${Math.sin(progress * Math.PI * 8) * 18 - progress * 26}px`);
  document.documentElement.style.setProperty("--mascot-tilt", `${Math.sin(progress * Math.PI * 6) * 14}deg`);

  const toneIndex = Math.min(scrollTones.length - 1, Math.floor(progress * scrollTones.length));
  document.body.dataset.scrollTone = scrollTones[toneIndex];
  mascotFace.textContent = mascotFaces[toneIndex] || mascotFaces[0];
}

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

function allPosts() {
  return publishedPosts;
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
    <div class="post-visual ${safeVisual}${post.image ? " has-image" : ""}">
      <span>${safeVisual}</span>
    </div>
    <div class="post-body">
      <p class="post-meta">${categoryLabel(post.category)} · ${post.tag || "기록"}</p>
      <h3></h3>
      <p></p>
      <button class="like-btn" type="button" aria-label="글 좋아요">♡ ${likes}</button>
    </div>
  `;

  if (post.image) {
    const image = document.createElement("img");
    image.src = post.image;
    image.alt = post.imageAlt || post.title;
    image.loading = "lazy";
    card.querySelector(".post-visual").prepend(image);
  }

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

function setMood(index) {
  activeMoodIndex = (index + moods.length) % moods.length;
  heroScene.dataset.mood = moods[activeMoodIndex];
}

heroScene.addEventListener("pointerdown", (event) => {
  dragStartY = event.clientY;
  heroScene.classList.add("is-dragging");
  heroScene.setPointerCapture(event.pointerId);
});

heroScene.addEventListener("pointerup", (event) => {
  const distance = event.clientY - dragStartY;
  heroScene.classList.remove("is-dragging");

  if (Math.abs(distance) > 35) {
    setMood(activeMoodIndex + (distance > 0 ? 1 : -1));
  }
});

heroScene.addEventListener("pointercancel", () => {
  heroScene.classList.remove("is-dragging");
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle("is-visible", entry.isIntersecting);
    });
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
);

revealSections.forEach((section) => revealObserver.observe(section));

window.addEventListener("scroll", updateScrollState, { passive: true });
window.addEventListener("resize", updateScrollState);
updateScrollState();

async function loadPublishedPosts() {
  try {
    const response = await fetch(`data/posts.json?v=${Date.now()}`, { cache: "no-store" });
    publishedPosts = response.ok ? await response.json() : [];
  } catch {
    publishedPosts = [];
  }

  renderPosts();
}

loadPublishedPosts();
