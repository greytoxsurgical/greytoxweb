(async function () {
  await initGreyToxPage("products.html");
  const params = new URLSearchParams(location.search);
  const activeCat = params.get("cat") || "";
  await loadCatChips(activeCat);
  await loadProducts(activeCat);
})();

async function loadCatChips(activeCat) {
  const root = document.getElementById("catChips");
  try {
    const snap = await db.collection("categories").orderBy("name").get();
    const chips = snap.docs
      .map(
        (d) =>
          `<button class="chip ${d.id === activeCat ? "active" : ""}" data-cat="${d.id}">${escapeHtml(d.data().name)}</button>`
      )
      .join("");
    root.innerHTML = `<button class="chip ${activeCat ? "" : "active"}" data-cat="">All Products</button>` + chips;

    root.querySelectorAll(".chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        root.querySelectorAll(".chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const cat = btn.dataset.cat;
        const url = new URL(location.href);
        if (cat) url.searchParams.set("cat", cat);
        else url.searchParams.delete("cat");
        history.replaceState(null, "", url);
        loadProducts(cat);
      });
    });
  } catch (e) {
    console.warn(e);
  }
}

async function loadProducts(catId) {
  const root = document.getElementById("productsGrid");
  root.innerHTML = `<div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div><div class="skeleton" style="height:300px"></div>`;
  try {
    let q = db.collection("products").orderBy("createdAt", "desc");
    if (catId) q = db.collection("products").where("categoryId", "==", catId).orderBy("createdAt", "desc");
    const snap = await q.get();
    if (snap.empty) {
      root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Is category mein abhi koi product nahi hai.</div>`;
      return;
    }
    root.innerHTML = snap.docs.map((d) => productCardHTML(d.id, d.data())).join("");
  } catch (e) {
    root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Products load nahi ho sake. (${escapeHtml(e.message)})</div>`;
  }
}
