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
    let snap;
    if (catId) {
      snap = await db.collection("products").where("categoryId", "==", catId).get();
    } else {
      snap = await db.collection("products").orderBy("createdAt", "desc").get();
    }
    if (snap.empty) {
      root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Is category mein abhi koi product nahi hai.</div>`;
      return;
    }
    let docs = snap.docs;
    if (catId) {
      docs = docs.slice().sort((a, b) => {
        const ta = a.data().createdAt?.toMillis ? a.data().createdAt.toMillis() : 0;
        const tb = b.data().createdAt?.toMillis ? b.data().createdAt.toMillis() : 0;
        return tb - ta;
      });
    }
    root.innerHTML = docs.map((d) => productCardHTML(d.id, d.data())).join("");
  } catch (e) {
    root.innerHTML = `<div class="empty-state" style="grid-column:1/-1">Products load nahi ho sake. (${escapeHtml(e.message)})</div>`;
  }
}
