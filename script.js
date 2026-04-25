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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch {
    return false;
  }
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

function resizeImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const image = new Image();

      image.addEventListener("load", () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      });

      image.addEventListener("error", () => resolve(reader.result));
      image.src = reader.result;
    });
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
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

postForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    const formData = new FormData(postForm);
    const imageFile = formData.get("imageFile");
    writeOutput.textContent = imageFile?.size ? "사진을 작게 줄여 진열하는 중입니다." : "";

    let image = "";

    try {
      image = imageFile?.size ? await resizeImageFile(imageFile) : "";
    } catch {
      writeOutput.textContent = "사진을 읽지 못했지만 글은 진열합니다.";
    }

    const post = {
      title: formData.get("title").trim(),
      category: formData.get("category"),
      tag: formData.get("tag").trim() || "기록",
      excerpt: formData.get("excerpt").trim(),
      visual: formData.get("visual"),
      image,
      imageAlt: formData.get("title").trim(),
      likes: 0,
    };

    localPosts = [post, ...localPosts];
    const didSave = saveLocalPosts(localPosts);
    postForm.reset();
    writeOutput.textContent = didSave
      ? `"${post.title}" 글을 ${categoryLabel(post.category)} 매대에 올렸습니다.`
      : `"${post.title}" 글을 올렸습니다. 사진이 커서 새로고침 후에는 사라질 수 있습니다.`;
    renderPosts();
    document.querySelector("#ranking").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    writeOutput.textContent = `글을 올리지 못했습니다: ${error.message}`;
  }
});

clearLocalPostsButton.addEventListener("click", () => {
  localPosts = [];
  localStorage.removeItem(STORAGE_KEY);
  writeOutput.textContent = "브라우저에 저장된 임시 글을 비웠습니다.";
  renderPosts();
});

async function loadPublishedPosts() {
  try {
    const response = await fetch(`data/posts.json?v=${Date.now()}`, { cache: "no-store" });
    publishedPosts = response.ok ? await response.json() : [];
  } catch {
    publishedPosts = [];
  }

  localPosts = readLocalPosts();
  renderPosts();
}

loadPublishedPosts();
