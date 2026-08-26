/* ---------- Home page ---------- */
(async function () {
  await initGreyToxPage("index.html");
  loadHomeCategories();
  loadHomeProducts();
  loadHomeFeedback();
})();

async function loadHomeCategories() {
  const root = document.getElementById("homeCategories");
  try {
    const snap = await db.collection("categories").orderBy("name").limit(8).get();
    if (snap.empty) {
      root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Categories jald hi add ki jayengi — Admin Panel se add karen.</div>`;
      return;
    }
    root.innerHTML = snap.docs
      .map((d) => {
        const c = d.data();
        return `
        <a href="products.html?cat=${encodeURIComponent(d.id)}" class="cat-card">
          <div class="cat-card__info">
            <b>${escapeHtml(c.name)}</b>
            <span>View instruments →</span>
          </div>
        </a>`;
      })
      .join("");
  } catch (e) {
    root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Categories load nahi ho saki. Firebase config check karen.</div>`;
  }
}

async function loadHomeProducts() {
  const root = document.getElementById("homeProducts");
  try {
    const snap = await db
      .collection("products")
      .orderBy("createdAt", "desc")
      .limit(4)
      .get();
    if (snap.empty) {
      root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Abhi koi product add nahi hua — Admin Panel se products add karen.</div>`;
      return;
    }
    root.innerHTML = snap.docs.map((d) => productCardHTML(d.id, d.data())).join("");
  } catch (e) {
    root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Products load nahi ho sake.</div>`;
  }
}

function productCardHTML(id, p) {
  const img = (p.images && p.images[0]) || "";
  const off = p.studentOffer ? `<span class="badge off">Student -50%</span>` : "";
  const price =
    p.price != null
      ? `<span class="price">${p.oldPrice ? `<span class="old">Rs ${p.oldPrice}</span>` : ""}Rs ${p.price}</span>`
      : `<span class="price muted" style="font-size:13px">Ask for price</span>`;
  return `
  <div class="card-product">
    <a href="product.html?id=${id}">
      <div class="card-product__img">
        ${off}
        ${img ? `<img src="${img}" alt="${escapeHtml(p.name)}" loading="lazy" />` : `<div class="skeleton" style="height:100%"></div>`}
      </div>
    </a>
    <div class="card-product__body">
      <span class="card-product__cat">${escapeHtml(p.categoryName || "")}</span>
      <a href="product.html?id=${id}" class="card-product__name">${escapeHtml(p.name)}</a>
      <p class="card-product__desc">${escapeHtml((p.shortDesc || stripHtml(p.description) || "").slice(0, 70))}</p>
      <div class="card-product__foot">
        ${price}
        <a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener"
           href="${waLink(p.waPhone || (window.__siteSettingsCache && window.__siteSettingsCache.whatsapp) || '+923144122237', `Hello GreyTox, I'm interested in: ${p.name}`)}">Order Now</a>
      </div>
    </div>
  </div>`;
}

function stripHtml(html = "") {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

async function loadHomeFeedback() {
  const root = document.getElementById("homeFeedback");
  try {
    const snap = await db.collection("feedbacks").orderBy("createdAt", "desc").limit(3).get();
    if (snap.empty) {
      root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">No feedback yet.</div>`;
      return;
    }
    root.innerHTML = snap.docs
      .map((d) => {
        const f = d.data();
        return `
        <div class="fb-card">
          <div class="fb-card__stars">${"★".repeat(f.rating || 5)}${"☆".repeat(5 - (f.rating || 5))}</div>
          <p>"${escapeHtml(f.message)}"</p>
          <div class="fb-card__who">
            <div class="fb-card__avatar">${(f.name || "G")[0]}</div>
            <div><b>${escapeHtml(f.name)}</b><span>${escapeHtml(f.country || "")}</span></div>
          </div>
        </div>`;
      })
      .join("");
  } catch (e) {
    root.innerHTML = "";
  }
}
