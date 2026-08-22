(async function () {
  await initGreyToxPage("");
  const id = new URLSearchParams(location.search).get("id");
  const root = document.getElementById("productDetail");
  if (!id) {
    root.innerHTML = `<div class="empty-state">Product ID missing.</div>`;
    return;
  }
  try {
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists) {
      root.innerHTML = `<div class="empty-state">Ye product nahi mila — ho sakta hai remove ho gaya ho.</div>`;
      return;
    }
    const p = doc.data();
    const images = p.images && p.images.length ? p.images : [""];
    document.title = `${p.name} — GreyTox Surgical Instruments`;

    root.innerHTML = `
      <div class="pd-grid">
        <div>
          <div class="pd-main-img"><img id="pdMainImg" src="${images[0]}" alt="${escapeHtml(p.name)}" /></div>
          <div class="pd-thumbs" id="pdThumbs">
            ${images
              .map(
                (im, i) =>
                  `<img src="${im}" class="${i === 0 ? "active" : ""}" data-src="${im}" />`
              )
              .join("")}
          </div>
        </div>
        <div>
          <span class="card-product__cat">${escapeHtml(p.categoryName || "")}</span>
          <h1 style="font-size:32px;margin-top:6px">${escapeHtml(p.name)}</h1>
          ${p.studentOffer ? `<span class="badge off" style="position:static;display:inline-block;margin-bottom:10px">Student Offer -50%</span>` : ""}
          ${
            p.price != null
              ? `<div class="price" style="font-size:24px;margin-bottom:16px">${p.oldPrice ? `<span class="old">Rs ${p.oldPrice}</span>` : ""}Rs ${p.price}</div>`
              : ""
          }
          <div class="rich-content">${p.description || "<p>No description provided.</p>"}</div>
          <div style="display:flex;gap:12px;margin-top:26px;flex-wrap:wrap">
            <a class="btn btn-whatsapp" target="_blank" rel="noopener"
               href="${waLink(p.waPhone || "+17747341471", `Hello GreyTox, I'm interested in: ${p.name}`)}">
               💬 Order Now on WhatsApp
            </a>
            <a class="btn btn-outline" href="products.html">← Back to Products</a>
          </div>
        </div>
      </div>
    `;

    document.getElementById("pdThumbs").addEventListener("click", (e) => {
      if (e.target.tagName !== "IMG") return;
      document.getElementById("pdMainImg").src = e.target.dataset.src;
      document.querySelectorAll("#pdThumbs img").forEach((t) => t.classList.remove("active"));
      e.target.classList.add("active");
    });
  } catch (e) {
    root.innerHTML = `<div class="empty-state">Load error: ${escapeHtml(e.message)}</div>`;
  }
})();
