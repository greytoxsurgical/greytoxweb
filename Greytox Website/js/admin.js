/* =========================================================
   GREYTOX — Admin Panel
   ========================================================= */

let quillEditor = null;
let currentImages = []; // working array of image URLs while editing a product

/* ---------- Boot ---------- */
(function boot() {
  if (isAdminAuthed()) showShell();
  document.getElementById("gateForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("gatePass").value;
    if (pass === ADMIN_PASSWORD) {
      setAdminAuthed();
      showShell();
    } else {
      toast("Ghalat password", "error");
    }
  });
  document.getElementById("logoutBtn").addEventListener("click", logoutAdmin);

  document.querySelectorAll(".admin-nav-btn[data-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".admin-nav-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderTab(btn.dataset.tab);
    });
  });

  document.getElementById("drawerOverlay").addEventListener("click", (e) => {
    if (e.target.id === "drawerOverlay") closeDrawer();
  });
})();

function showShell() {
  document.getElementById("adminGate").style.display = "none";
  document.getElementById("adminShell").style.display = "grid";
  renderTab("dashboard");
}

/* ---------- Drawer ---------- */
function openDrawer(html) {
  document.getElementById("drawerBody").innerHTML = html;
  document.getElementById("drawerOverlay").classList.add("open");
}
function closeDrawer() {
  document.getElementById("drawerOverlay").classList.remove("open");
  quillEditor = null;
  currentImages = [];
}

/* ---------- Router ---------- */
const TAB_TITLES = {
  dashboard: "Dashboard", products: "Products", categories: "Categories",
  certificates: "Certificates", about: "About Us", catalogs: "Catalogs",
  feedbacks: "Feedbacks", orders: "Previous Orders", deals: "Deal Inquiries",
  messages: "Contact Messages", settings: "Site Settings", theme: "Theme Colors",
};

async function renderTab(tab) {
  document.getElementById("tabTitle").textContent = TAB_TITLES[tab] || tab;
  const root = document.getElementById("tabContent");
  root.innerHTML = `<div class="skeleton" style="height:300px"></div>`;
  const fn = {
    dashboard: renderDashboard, products: renderProductsTab, categories: renderCategoriesTab,
    certificates: renderCertificatesTab, about: renderAboutTab, catalogs: renderCatalogsTab,
    feedbacks: renderFeedbacksTab, orders: renderOrdersTab, deals: renderDealsTab,
    messages: renderMessagesTab, settings: renderSettingsTab, theme: renderThemeTab,
  }[tab];
  if (fn) fn(root);
}

/* =========================================================
   DASHBOARD
   ========================================================= */
async function renderDashboard(root) {
  const [products, categories, deals, messages] = await Promise.all([
    db.collection("products").get(), db.collection("categories").get(),
    db.collection("dealInquiries").get(), db.collection("contactMessages").get(),
  ]);
  root.innerHTML = `
    <div class="stat-cards">
      <div class="stat-card"><b>${products.size}</b><span>Products</span></div>
      <div class="stat-card"><b>${categories.size}</b><span>Categories</span></div>
      <div class="stat-card"><b>${deals.size}</b><span>Deal Inquiries</span></div>
      <div class="stat-card"><b>${messages.size}</b><span>Contact Messages</span></div>
    </div>
    <div class="admin-panel">
      <h3 style="margin-top:0">Getting Started</h3>
      <p class="muted">Naya Firebase project connect karne ke baad, neeche button se starter categories, 4 student-offer sample products (scissors, dental pliers, forceps, bone cutter), aur sample feedbacks auto add ho jayenge. Sirf ek dafa chalayen.</p>
      <button class="btn btn-primary" id="seedBtn">⚡ Seed Starter Data</button>
    </div>
  `;
  document.getElementById("seedBtn").addEventListener("click", seedStarterData);
}

async function seedStarterData() {
  if (!confirm("Starter categories, sample products aur feedbacks add kar diye jayenge. Continue?")) return;
  toast("Seeding started...");
  try {
    const cats = [
      { id: "ortho", name: "Orthopedic", icon: "🦴" },
      { id: "dental", name: "Dental", icon: "🦷" },
      { id: "veterinary", name: "Veterinary", icon: "🐾" },
      { id: "general-surgery", name: "General Surgery", icon: "⚕" },
    ];
    for (const c of cats) {
      await db.collection("categories").doc(c.id).set({ name: c.name, icon: c.icon });
    }

    const products = [
      {
        name: "Mayo Dissecting Scissors 6.5\"",
        categoryId: "general-surgery", categoryName: "General Surgery",
        shortDesc: "Straight surgical-grade stainless steel dissecting scissors.",
        description: "<p>Precision-forged <b>Mayo Dissecting Scissors</b>, straight blade, 6.5 inch. Manufactured from surgical-grade stainless steel for durability and a lifetime of sharpness.</p><ul><li>Surgical grade stainless steel</li><li>Autoclavable</li><li>Free custom branding available</li></ul>",
        price: 1200, oldPrice: 2400, studentOffer: true, featured: true, images: [],
      },
      {
        name: "Dental Extraction Forceps #150",
        categoryId: "dental", categoryName: "Dental",
        shortDesc: "Upper universal dental extraction forceps.",
        description: "<p><b>Dental Extraction Forceps #150</b> — upper universal pattern, precision-ground beaks for a secure grip during extraction.</p>",
        price: 1500, oldPrice: 3000, studentOffer: true, featured: true, images: [],
      },
      {
        name: "Adson Tissue Forceps 1x2 Teeth",
        categoryId: "general-surgery", categoryName: "General Surgery",
        shortDesc: "Fine-tip Adson tissue forceps, serrated with 1x2 teeth.",
        description: "<p><b>Adson Tissue Forceps</b>, 1x2 teeth pattern for secure, atraumatic tissue handling in delicate procedures.</p>",
        price: 900, oldPrice: 1800, studentOffer: true, featured: false, images: [],
      },
      {
        name: "Orthopedic Bone Cutting Forceps",
        categoryId: "ortho", categoryName: "Orthopedic",
        shortDesc: "Double-action bone cutting forceps for orthopedic procedures.",
        description: "<p>Heavy-duty <b>double-action Bone Cutting Forceps</b> engineered for clean, controlled cuts during orthopedic surgery.</p>",
        price: 3200, oldPrice: 6400, studentOffer: true, featured: false, images: [],
      },
    ];
    for (const p of products) {
      await db.collection("products").add({ ...p, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }

    const feedbacks = [
      { name: "Dr. Ahmed Raza", country: "Pakistan", rating: 5, message: "Excellent build quality and the free branding on our export order was a great touch." },
      { name: "Dr. Sarah Mitchell", country: "United Kingdom", rating: 5, message: "GreyTox instruments have held up perfectly in our clinic for over a year now." },
      { name: "Dr. Klaus Weber", country: "Germany", rating: 4, message: "Reliable supplier, on-time DHL shipping, and responsive sales team." },
      { name: "Dr. Amara Okafor", country: "Nigeria", rating: 5, message: "Best value surgical instruments we've imported from Sialkot so far." },
      { name: "Dr. Liam Turner", country: "Australia", rating: 5, message: "Great communication throughout our bulk order and consistent quality." },
    ];
    for (const f of feedbacks) {
      await db.collection("feedbacks").add({ ...f, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
    }

    const aboutDoc = await db.collection("settings").doc("about").get();
    if (!aboutDoc.exists) {
      await db.collection("settings").doc("about").set({
        content: `<p><b>GreyTox Surgical Instruments</b> is a Sialkot, Pakistan-based manufacturer and worldwide exporter of precision surgical, orthopedic, dental and veterinary instruments.</p><p>Every instrument is forged, hand-finished and quality-checked at our in-house facility, then shipped globally via FedEx, DHL and UPS — with free custom branding on every export order.</p><p>From individual clinics to large distributors, GreyTox is trusted by buyers across 50+ countries for consistent quality and reliable delivery.</p>`,
      });
    }

    toast("Starter data add ho gaya! ✅");
    renderTab("dashboard");
  } catch (e) {
    toast("Seed error: " + e.message, "error");
  }
}

/* =========================================================
   CATEGORIES
   ========================================================= */
async function renderCategoriesTab(root) {
  const snap = await db.collection("categories").orderBy("name").get();
  root.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="addCatBtn">+ Add Category</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Name</th><th></th></tr></thead>
        <tbody>
          ${snap.docs.map((d) => {
            const c = d.data();
            return `<tr>
              <td>${escapeHtml(c.name)}</td>
              <td class="row-actions">
                <button class="edit" onclick="editCategory('${d.id}')">Edit</button>
                <button class="del" onclick="deleteItem('categories','${d.id}','categories')">Delete</button>
              </td>
            </tr>`;
          }).join("") || `<tr><td colspan="2" class="muted">Koi category nahi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addCatBtn").addEventListener("click", () => categoryDrawer());
}

function categoryDrawer(id, data) {
  openDrawer(`
    <h3>${id ? "Edit" : "Add"} Category</h3>
    <form id="catForm">
      <div class="field"><label>Name</label><input type="text" id="catName" value="${escapeHtml(data?.name || "")}" required /></div>
      <button type="submit" class="btn btn-primary btn-block">${id ? "Save Changes" : "Add Category"}</button>
    </form>
  `);
  document.getElementById("catForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("catName").value.trim();
    try {
      if (id) await db.collection("categories").doc(id).update({ name });
      else await db.collection("categories").add({ name });
      toast("Category saved.");
      closeDrawer();
      renderTab("categories");
    } catch (err) { toast(err.message, "error"); }
  });
}
async function editCategory(id) {
  const doc = await db.collection("categories").doc(id).get();
  categoryDrawer(id, doc.data());
}

/* Generic delete */
async function deleteItem(collection, id, refreshTab) {
  if (!confirm("Pakka delete karna hai?")) return;
  try {
    await db.collection(collection).doc(id).delete();
    toast("Deleted.");
    renderTab(refreshTab);
  } catch (e) { toast(e.message, "error"); }
}

/* =========================================================
   PRODUCTS
   ========================================================= */
async function renderProductsTab(root) {
  const [snap, catSnap] = await Promise.all([
    db.collection("products").orderBy("createdAt", "desc").get(),
    db.collection("categories").orderBy("name").get(),
  ]);
  window._gtCategories = catSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  root.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="addProdBtn">+ Add Product</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Flags</th><th></th></tr></thead>
        <tbody>
          ${snap.docs.map((d) => {
            const p = d.data();
            return `<tr>
              <td><img class="thumb" src="${(p.images && p.images[0]) || ""}" /></td>
              <td>${escapeHtml(p.name)}</td>
              <td>${escapeHtml(p.categoryName || "")}</td>
              <td>${p.price != null ? "Rs " + p.price : "-"}</td>
              <td>${p.studentOffer ? '<span class="pill">Student</span>' : ""} ${p.featured ? '<span class="pill gray">Featured</span>' : ""}</td>
              <td class="row-actions">
                <button class="edit" onclick="editProduct('${d.id}')">Edit</button>
                <button class="del" onclick="deleteItem('products','${d.id}','products')">Delete</button>
              </td>
            </tr>`;
          }).join("") || `<tr><td colspan="6" class="muted">Koi product nahi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addProdBtn").addEventListener("click", () => productDrawer());
}

function productDrawer(id, data) {
  currentImages = (data?.images || []).slice();
  const cats = window._gtCategories || [];
  openDrawer(`
    <h3>${id ? "Edit" : "Add"} Product</h3>
    <form id="prodForm">
      <div class="field"><label>Product Name</label><input type="text" id="pName" value="${escapeHtml(data?.name || "")}" required /></div>
      <div class="field">
        <label>Category</label>
        <select id="pCategory" required>
          <option value="">Select category</option>
          ${cats.map((c) => `<option value="${c.id}" data-name="${escapeHtml(c.name)}" ${data?.categoryId === c.id ? "selected" : ""}>${escapeHtml(c.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>Short Description (used on cards)</label><input type="text" id="pShort" value="${escapeHtml(data?.shortDesc || "")}" /></div>

      <div class="field">
        <label>Full Description</label>
        <div id="pQuill" style="background:#fff">${data?.description || ""}</div>
      </div>

      <div class="form-grid">
        <div class="field"><label>Price (Rs, optional)</label><input type="number" id="pPrice" value="${data?.price ?? ""}" /></div>
        <div class="field"><label>Old / Strike Price (optional)</label><input type="number" id="pOldPrice" value="${data?.oldPrice ?? ""}" /></div>
      </div>
      <div class="form-grid">
        <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" id="pStudent" ${data?.studentOffer ? "checked" : ""}/> Student Offer (50% off)</label>
        <label style="display:flex;align-items:center;gap:8px;font-size:14px"><input type="checkbox" id="pFeatured" ${data?.featured ? "checked" : ""}/> Featured on Home</label>
      </div>
      <div class="field"><label>Custom WhatsApp number for this product (optional)</label><input type="text" id="pWaPhone" value="${data?.waPhone || ""}" placeholder="+17747341471" /></div>

      <div class="field">
        <label>Product Images (auto-cropped to 1080×1080)</label>
        <div class="img-upload-grid" id="imgGrid"></div>
        <input type="file" id="imgFile" accept="image/*" multiple />
        <div style="display:flex;gap:8px;margin-top:8px">
          <input type="text" id="imgUrl" placeholder="or paste image URL" style="flex:1;padding:10px;border:1px solid var(--c-silver-400);border-radius:8px" />
          <button type="button" class="btn btn-outline btn-sm" id="addImgUrlBtn">Add URL</button>
        </div>
      </div>

      <button type="submit" class="btn btn-primary btn-block" id="prodSaveBtn" style="margin-top:16px">${id ? "Save Changes" : "Add Product"}</button>
    </form>
  `);

  quillEditor = new Quill("#pQuill", {
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        ["blockquote", "link"],
        [{ align: [] }],
        ["clean"],
      ],
    },
  });

  renderImgGrid();
  document.getElementById("imgFile").addEventListener("change", handleImgFiles);
  document.getElementById("addImgUrlBtn").addEventListener("click", () => {
    const val = document.getElementById("imgUrl").value.trim();
    if (val) { currentImages.push(val); document.getElementById("imgUrl").value = ""; renderImgGrid(); }
  });

  document.getElementById("prodForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("prodSaveBtn");
    btn.disabled = true; btn.textContent = "Saving...";
    try {
      const catSel = document.getElementById("pCategory");
      const payload = {
        name: document.getElementById("pName").value.trim(),
        categoryId: catSel.value,
        categoryName: catSel.selectedOptions[0]?.dataset.name || "",
        shortDesc: document.getElementById("pShort").value.trim(),
        description: quillEditor.root.innerHTML,
        price: document.getElementById("pPrice").value ? Number(document.getElementById("pPrice").value) : null,
        oldPrice: document.getElementById("pOldPrice").value ? Number(document.getElementById("pOldPrice").value) : null,
        studentOffer: document.getElementById("pStudent").checked,
        featured: document.getElementById("pFeatured").checked,
        waPhone: document.getElementById("pWaPhone").value.trim(),
        images: currentImages,
      };
      if (id) {
        await db.collection("products").doc(id).update(payload);
      } else {
        payload.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await db.collection("products").add(payload);
      }
      toast("Product saved.");
      closeDrawer();
      renderTab("products");
    } catch (err) {
      toast(err.message, "error");
    } finally {
      btn.disabled = false; btn.textContent = id ? "Save Changes" : "Add Product";
    }
  });
}

function renderImgGrid() {
  const grid = document.getElementById("imgGrid");
  grid.innerHTML = currentImages.map((url, i) => `
    <div class="thumb-wrap">
      <img src="${url}" />
      <button type="button" onclick="removeImg(${i})">✕</button>
    </div>`).join("");
}
function removeImg(i) { currentImages.splice(i, 1); renderImgGrid(); }

async function handleImgFiles(e) {
  const files = [...e.target.files];
  for (const file of files) {
    try {
      const blob = await resizeImageToSquare(file, 1080);
      const path = `products/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.jpg`;
      const url = await uploadToStorage(path, blob);
      currentImages.push(url);
      renderImgGrid();
    } catch (err) {
      toast("Image upload failed: " + err.message, "error");
    }
  }
  e.target.value = "";
}

async function editProduct(id) {
  const doc = await db.collection("products").doc(id).get();
  productDrawer(id, doc.data());
}

/* =========================================================
   CERTIFICATES
   ========================================================= */
async function renderCertificatesTab(root) {
  const snap = await db.collection("certificates").orderBy("createdAt", "desc").get();
  root.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="addCertBtn">+ Upload Certificate (A4)</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Preview</th><th>Title</th><th></th></tr></thead>
        <tbody>
          ${snap.docs.map((d) => {
            const c = d.data();
            return `<tr>
              <td><img class="thumb" src="${c.imageUrl}" /></td>
              <td>${escapeHtml(c.title)}</td>
              <td class="row-actions"><button class="del" onclick="deleteItem('certificates','${d.id}','certificates')">Delete</button></td>
            </tr>`;
          }).join("") || `<tr><td colspan="3" class="muted">Koi certificate nahi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addCertBtn").addEventListener("click", () => {
    openDrawer(`
      <h3>Upload Certificate</h3>
      <form id="certForm">
        <div class="field"><label>Title</label><input type="text" id="certTitle" required placeholder="e.g. ISO 13485:2016" /></div>
        <div class="field"><label>Certificate Image (A4, auto blur-protected on site)</label><input type="file" id="certFile" accept="image/*" required /></div>
        <button type="submit" class="btn btn-primary btn-block" id="certSaveBtn">Upload</button>
      </form>
    `);
    document.getElementById("certForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("certSaveBtn");
      const file = document.getElementById("certFile").files[0];
      if (!file) return;
      btn.disabled = true; btn.textContent = "Uploading...";
      try {
        const blob = await resizeImageA4(file);
        const path = `certificates/${Date.now()}.jpg`;
        const url = await uploadToStorage(path, blob);
        await db.collection("certificates").add({
          title: document.getElementById("certTitle").value.trim(),
          imageUrl: url,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        toast("Certificate uploaded.");
        closeDrawer();
        renderTab("certificates");
      } catch (err) { toast(err.message, "error"); }
      finally { btn.disabled = false; btn.textContent = "Upload"; }
    });
  });
}

/* =========================================================
   ABOUT US
   ========================================================= */
async function renderAboutTab(root) {
  const doc = await db.collection("settings").doc("about").get();
  const data = doc.exists ? doc.data() : {};
  root.innerHTML = `
    <div class="admin-panel">
      <div class="field"><label>Company Image</label>
        <div class="img-upload-grid"><div class="thumb-wrap" style="width:140px;height:140px"><img id="aboutImgPreview" src="${data.imageUrl || "assets/logo/logo.png"}" /></div></div>
        <input type="file" id="aboutImgFile" accept="image/*" />
      </div>
      <div class="field"><label>About Content</label><div id="aboutQuill" style="background:#fff">${data.content || ""}</div></div>
      <button class="btn btn-primary" id="aboutSaveBtn" style="margin-top:14px">Save About Us</button>
    </div>
  `;
  quillEditor = new Quill("#aboutQuill", {
    theme: "snow",
    modules: { toolbar: [[{ header: [1, 2, 3, false] }], ["bold", "italic", "underline"], [{ color: [] }, { background: [] }], [{ list: "ordered" }, { list: "bullet" }], ["blockquote", "link"], ["clean"]] },
  });

  let newImageUrl = data.imageUrl || "";
  document.getElementById("aboutImgFile").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const blob = await resizeImageA4(file, 1000);
      const url = await uploadToStorage(`about/${Date.now()}.jpg`, blob);
      newImageUrl = url;
      document.getElementById("aboutImgPreview").src = url;
    } catch (err) { toast(err.message, "error"); }
  });

  document.getElementById("aboutSaveBtn").addEventListener("click", async () => {
    try {
      await db.collection("settings").doc("about").set({ content: quillEditor.root.innerHTML, imageUrl: newImageUrl }, { merge: true });
      toast("About Us saved.");
    } catch (e) { toast(e.message, "error"); }
  });
}

/* =========================================================
   CATALOGS
   ========================================================= */
async function renderCatalogsTab(root) {
  const snap = await db.collection("catalogs").orderBy("createdAt", "desc").get();
  root.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="addCatalogBtn">+ Upload Catalog (PDF)</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Title</th><th>File</th><th></th></tr></thead>
        <tbody>
          ${snap.docs.map((d) => {
            const c = d.data();
            return `<tr>
              <td>${escapeHtml(c.title)}</td>
              <td><a href="${c.fileUrl}" target="_blank">View PDF ↗</a></td>
              <td class="row-actions">
                <button class="edit" onclick="reuploadCatalog('${d.id}')">Reupload</button>
                <button class="del" onclick="deleteItem('catalogs','${d.id}','catalogs')">Delete</button>
              </td>
            </tr>`;
          }).join("") || `<tr><td colspan="3" class="muted">Koi catalog nahi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addCatalogBtn").addEventListener("click", () => catalogDrawer());
}

function catalogDrawer(id) {
  openDrawer(`
    <h3>${id ? "Reupload" : "Upload"} Catalog</h3>
    <form id="catalogForm">
      <div class="field"><label>Title</label><input type="text" id="catalogTitle" required placeholder="e.g. GreyTox Full Catalog 2026" /></div>
      <div class="field"><label>PDF File</label><input type="file" id="catalogFile" accept="application/pdf" required /></div>
      <button type="submit" class="btn btn-primary btn-block" id="catalogSaveBtn">Upload</button>
    </form>
  `);
  document.getElementById("catalogForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("catalogSaveBtn");
    const file = document.getElementById("catalogFile").files[0];
    if (!file) return;
    btn.disabled = true; btn.textContent = "Uploading...";
    try {
      const path = `catalogs/${Date.now()}_${file.name}`;
      const url = await uploadToStorage(path, file);
      const payload = { title: document.getElementById("catalogTitle").value.trim(), fileUrl: url, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
      if (id) await db.collection("catalogs").doc(id).update(payload);
      else await db.collection("catalogs").add(payload);
      toast("Catalog saved.");
      closeDrawer();
      renderTab("catalogs");
    } catch (err) { toast(err.message, "error"); }
    finally { btn.disabled = false; btn.textContent = "Upload"; }
  });
}
async function reuploadCatalog(id) { catalogDrawer(id); }

/* =========================================================
   FEEDBACKS
   ========================================================= */
async function renderFeedbacksTab(root) {
  const snap = await db.collection("feedbacks").orderBy("createdAt", "desc").get();
  root.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="addFbBtn">+ Add Feedback</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Country</th><th>Rating</th><th>Message</th><th></th></tr></thead>
        <tbody>
          ${snap.docs.map((d) => {
            const f = d.data();
            return `<tr>
              <td>${escapeHtml(f.name)}</td><td>${escapeHtml(f.country || "")}</td><td>${"★".repeat(f.rating || 5)}</td>
              <td style="max-width:260px">${escapeHtml((f.message || "").slice(0, 60))}...</td>
              <td class="row-actions"><button class="del" onclick="deleteItem('feedbacks','${d.id}','feedbacks')">Delete</button></td>
            </tr>`;
          }).join("") || `<tr><td colspan="5" class="muted">Koi feedback nahi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addFbBtn").addEventListener("click", () => {
    openDrawer(`
      <h3>Add Feedback</h3>
      <form id="fbForm">
        <div class="field"><label>Name</label><input type="text" id="fbName" required /></div>
        <div class="field"><label>Country</label><input type="text" id="fbCountry" /></div>
        <div class="field"><label>Rating</label><select id="fbRating">${[5,4,3,2,1].map(n=>`<option value="${n}">${n} Stars</option>`).join("")}</select></div>
        <div class="field"><label>Message</label><textarea id="fbMessage" required></textarea></div>
        <button type="submit" class="btn btn-primary btn-block">Add</button>
      </form>
    `);
    document.getElementById("fbForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        await db.collection("feedbacks").add({
          name: document.getElementById("fbName").value.trim(),
          country: document.getElementById("fbCountry").value.trim(),
          rating: Number(document.getElementById("fbRating").value),
          message: document.getElementById("fbMessage").value.trim(),
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        toast("Feedback added.");
        closeDrawer();
        renderTab("feedbacks");
      } catch (err) { toast(err.message, "error"); }
    });
  });
}

/* =========================================================
   PREVIOUS ORDERS
   ========================================================= */
async function renderOrdersTab(root) {
  const snap = await db.collection("previousOrders").orderBy("createdAt", "desc").get();
  root.innerHTML = `
    <div class="admin-panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:16px">
        <button class="btn btn-primary btn-sm" id="addOrderBtn">+ Add Order</button>
      </div>
      <table class="admin-table">
        <thead><tr><th>Image</th><th>Product</th><th>Qty</th><th>Country</th><th>Status</th><th></th></tr></thead>
        <tbody>
          ${snap.docs.map((d) => {
            const o = d.data();
            return `<tr>
              <td><img class="thumb" src="${o.imageUrl || ""}" /></td>
              <td>${escapeHtml(o.productName)}</td><td>${escapeHtml(o.quantity || "")}</td><td>${escapeHtml(o.country || "")}</td>
              <td><span class="pill">${escapeHtml(o.status || "Delivered")}</span></td>
              <td class="row-actions"><button class="del" onclick="deleteItem('previousOrders','${d.id}','orders')">Delete</button></td>
            </tr>`;
          }).join("") || `<tr><td colspan="6" class="muted">Koi order record nahi.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
  document.getElementById("addOrderBtn").addEventListener("click", () => {
    openDrawer(`
      <h3>Add Previous Order</h3>
      <form id="orderForm">
        <div class="field"><label>Product Name</label><input type="text" id="ordProduct" required /></div>
        <div class="form-grid">
          <div class="field"><label>Quantity</label><input type="text" id="ordQty" placeholder="e.g. 500 pcs" /></div>
          <div class="field"><label>Country</label><input type="text" id="ordCountry" /></div>
        </div>
        <div class="field"><label>Status</label>
          <select id="ordStatus"><option>Delivered</option><option>In Transit</option><option>Processing</option></select>
        </div>
        <div class="field"><label>Image</label><input type="file" id="ordImgFile" accept="image/*" /></div>
        <button type="submit" class="btn btn-primary btn-block" id="ordSaveBtn">Add</button>
      </form>
    `);
    document.getElementById("orderForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = document.getElementById("ordSaveBtn");
      btn.disabled = true; btn.textContent = "Saving...";
      try {
        let imageUrl = "";
        const file = document.getElementById("ordImgFile").files[0];
        if (file) {
          const blob = await resizeImageToSquare(file, 400);
          imageUrl = await uploadToStorage(`orders/${Date.now()}.jpg`, blob);
        }
        await db.collection("previousOrders").add({
          productName: document.getElementById("ordProduct").value.trim(),
          quantity: document.getElementById("ordQty").value.trim(),
          country: document.getElementById("ordCountry").value.trim(),
          status: document.getElementById("ordStatus").value,
          imageUrl, createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
        toast("Order added.");
        closeDrawer();
        renderTab("orders");
      } catch (err) { toast(err.message, "error"); }
      finally { btn.disabled = false; btn.textContent = "Add"; }
    });
  });
}

/* =========================================================
   DEAL INQUIRIES (read-only + status)
   ========================================================= */
async function renderDealsTab(root) {
  const snap = await db.collection("dealInquiries").orderBy("createdAt", "desc").get();
  root.innerHTML = `
    <div class="admin-panel">
      ${snap.docs.map((d) => {
        const i = d.data();
        const products = (i.products || []).map(p => `${p.product} (${p.quantity || "?"})`).join(", ");
        return `
        <div style="border-bottom:1px solid var(--c-silver-200);padding:14px 0">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <b>${escapeHtml(i.name)} — ${escapeHtml(i.email)} / ${escapeHtml(i.phone || "")}</b>
            <span class="muted" style="font-size:12.5px">${timeAgo(i.createdAt)}</span>
          </div>
          <p class="muted" style="margin:6px 0"><b>Products:</b> ${escapeHtml(products)}</p>
          <p class="muted" style="margin:6px 0"><b>Location:</b> ${escapeHtml(i.location || "")}</p>
          ${i.notes ? `<p class="muted" style="margin:6px 0"><b>Notes:</b> ${escapeHtml(i.notes)}</p>` : ""}
          <div class="row-actions"><button class="del" onclick="deleteItem('dealInquiries','${d.id}','deals')">Delete</button></div>
        </div>`;
      }).join("") || `<div class="muted">Koi inquiry nahi aayi abhi.</div>`}
    </div>
  `;
}

/* =========================================================
   CONTACT MESSAGES (read-only)
   ========================================================= */
async function renderMessagesTab(root) {
  const snap = await db.collection("contactMessages").orderBy("createdAt", "desc").get();
  root.innerHTML = `
    <div class="admin-panel">
      ${snap.docs.map((d) => {
        const m = d.data();
        return `
        <div style="border-bottom:1px solid var(--c-silver-200);padding:14px 0">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px">
            <b>${escapeHtml(m.name)} — ${escapeHtml(m.email)}</b>
            <span class="muted" style="font-size:12.5px">${timeAgo(m.createdAt)}</span>
          </div>
          <p style="margin:6px 0"><b>${escapeHtml(m.subject || "")}</b></p>
          <p class="muted" style="margin:6px 0">${escapeHtml(m.message || "")}</p>
          <div class="row-actions"><button class="del" onclick="deleteItem('contactMessages','${d.id}','messages')">Delete</button></div>
        </div>`;
      }).join("") || `<div class="muted">Koi message nahi aaya abhi.</div>`}
    </div>
  `;
}

/* =========================================================
   SITE SETTINGS
   ========================================================= */
async function renderSettingsTab(root) {
  const doc = await db.collection("settings").doc("general").get();
  const s = doc.exists ? doc.data() : {};
  root.innerHTML = `
    <div class="admin-panel">
      <div class="form-grid">
        <div class="field"><label>Phone Number</label><input type="text" id="sPhone" value="${escapeHtml(s.phone || "+17747341471")}" /></div>
        <div class="field"><label>WhatsApp Number</label><input type="text" id="sWhatsapp" value="${escapeHtml(s.whatsapp || "+17747341471")}" /></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>Email 1</label><input type="email" id="sEmail1" value="${escapeHtml(s.email1 || "greytoxsurgical@gmail.com")}" /></div>
        <div class="field"><label>Email 2</label><input type="email" id="sEmail2" value="${escapeHtml(s.email2 || "sales@greytox.com")}" /></div>
      </div>
      <div class="field"><label>Address</label><input type="text" id="sAddress" value="${escapeHtml(s.address || "Sialkot 51010, Pakistan")}" /></div>

      <h3 style="margin-top:24px">Social Media Links</h3>
      <div class="form-grid">
        <div class="field"><label>Facebook URL</label><input type="text" id="sFacebook" value="${escapeHtml(s.facebook || "")}" placeholder="https://facebook.com/greytox" /></div>
        <div class="field"><label>Instagram URL</label><input type="text" id="sInstagram" value="${escapeHtml(s.instagram || "")}" placeholder="https://instagram.com/greytox" /></div>
      </div>
      <div class="form-grid">
        <div class="field"><label>TikTok URL</label><input type="text" id="sTiktok" value="${escapeHtml(s.tiktok || "")}" placeholder="https://tiktok.com/@greytox" /></div>
        <div class="field"><label>LinkedIn URL</label><input type="text" id="sLinkedin" value="${escapeHtml(s.linkedin || "")}" placeholder="https://linkedin.com/company/greytox" /></div>
      </div>
      <p class="muted" style="font-size:13px">WhatsApp icon apne aap "${s.whatsapp || "+17747341471"}" number khol dega — alag URL ki zaroorat nahi.</p>

      <button class="btn btn-primary" id="settingsSaveBtn" style="margin-top:10px">Save Settings</button>
    </div>
  `;
  document.getElementById("settingsSaveBtn").addEventListener("click", async () => {
    try {
      await db.collection("settings").doc("general").set({
        phone: document.getElementById("sPhone").value.trim(),
        whatsapp: document.getElementById("sWhatsapp").value.trim(),
        email1: document.getElementById("sEmail1").value.trim(),
        email2: document.getElementById("sEmail2").value.trim(),
        address: document.getElementById("sAddress").value.trim(),
        facebook: document.getElementById("sFacebook").value.trim(),
        instagram: document.getElementById("sInstagram").value.trim(),
        tiktok: document.getElementById("sTiktok").value.trim(),
        linkedin: document.getElementById("sLinkedin").value.trim(),
      }, { merge: true });
      toast("Settings saved.");
    } catch (e) { toast(e.message, "error"); }
  });
}

/* =========================================================
   THEME COLORS
   ========================================================= */
async function renderThemeTab(root) {
  const doc = await db.collection("settings").doc("theme").get();
  const t = doc.exists ? doc.data() : {};
  root.innerHTML = `
    <div class="admin-panel">
      <p class="muted">Colors turant live preview hote hain is site ke liye jab aap save karte hain.</p>
      <div class="color-row"><label>Primary Green</label><input type="color" id="tGreen700" value="${t.green700 || "#128257"}" /></div>
      <div class="color-row"><label>Dark Green (hover)</label><input type="color" id="tGreen800" value="${t.green800 || "#0c6a44"}" /></div>
      <div class="color-row"><label>Deep Green (banners)</label><input type="color" id="tGreen900" value="${t.green900 || "#0a4f34"}" /></div>
      <div class="color-row"><label>Light Green (tints)</label><input type="color" id="tGreen100" value="${t.green100 || "#e6f6ef"}" /></div>
      <div class="color-row"><label>Text / Ink Color</label><input type="color" id="tInk" value="${t.ink || "#14181a"}" /></div>
      <button class="btn btn-primary" id="themeSaveBtn">Save Colors</button>
      <button class="btn btn-outline" id="themeResetBtn">Reset to Default</button>
    </div>
  `;
  document.getElementById("themeSaveBtn").addEventListener("click", async () => {
    const payload = {
      green700: document.getElementById("tGreen700").value,
      green800: document.getElementById("tGreen800").value,
      green900: document.getElementById("tGreen900").value,
      green100: document.getElementById("tGreen100").value,
      ink: document.getElementById("tInk").value,
    };
    try {
      await db.collection("settings").doc("theme").set(payload);
      applyThemeColors();
      toast("Theme saved.");
    } catch (e) { toast(e.message, "error"); }
  });
  document.getElementById("themeResetBtn").addEventListener("click", async () => {
    try {
      await db.collection("settings").doc("theme").delete();
      location.reload();
    } catch (e) { toast(e.message, "error"); }
  });
}
