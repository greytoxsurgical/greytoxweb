/* =========================================================
   GREYTOX — Shared utilities (used by every page)
   ========================================================= */

/* ---------- Toast ---------- */
function toast(msg, type = "success") {
  let el = document.getElementById("gtToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "gtToast";
    el.className = "toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = "toast show " + type;
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 3200);
}

/* ---------- WhatsApp link builder ---------- */
function waLink(phone, message) {
  const clean = (phone || "").replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message || "")}`;
}

/* ---------- Image resize/crop to a perfect square (default 1080x1080) ----------
   Center-crops the shorter side, then scales to target size.
   Returns a Promise<Blob> (JPEG). */
function resizeImageToSquare(file, target = 1080, quality = 0.9) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target.result);
    reader.onerror = reject;
    img.onload = () => {
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      const canvas = document.createElement("canvas");
      canvas.width = target;
      canvas.height = target;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* Certificates: keep A4 portrait ratio (no crop to square), just cap max width */
function resizeImageA4(file, maxWidth = 1240, quality = 0.92) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => (img.src = e.target.result);
    reader.onerror = reject;
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
    };
    img.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ---------- Upload a blob/file to Firebase Storage, return download URL ---------- */
async function uploadToStorage(path, blobOrFile) {
  const ref = storage.ref(path);
  await ref.put(blobOrFile);
  return await ref.getDownloadURL();
}

/* ---------- Live theme colors (admin-editable) ---------- */
async function applyThemeColors() {
  try {
    const doc = await db.collection("settings").doc("theme").get();
    if (!doc.exists) return;
    const c = doc.data();
    const root = document.documentElement.style;
    if (c.green700) root.setProperty("--c-green-700", c.green700);
    if (c.green800) root.setProperty("--c-green-800", c.green800);
    if (c.green900) root.setProperty("--c-green-900", c.green900);
    if (c.green100) root.setProperty("--c-green-100", c.green100);
    if (c.ink) root.setProperty("--c-ink", c.ink);
  } catch (e) {
    console.warn("Theme load skipped:", e.message);
  }
}

/* ---------- Site settings (contact info, socials) shared across pages ---------- */
async function getSiteSettings() {
  const doc = await db.collection("settings").doc("general").get();
  return doc.exists
    ? doc.data()
    : {
        phone: "+17747341471",
        whatsapp: "+17747341471",
        email1: "greytoxsurgical@gmail.com",
        email2: "sales@greytox.com",
        address: "Sialkot 51010, Pakistan",
        facebook: "",
        instagram: "",
        tiktok: "",
        linkedin: "",
      };
}

/* ---------- Admin session ---------- */
function isAdminAuthed() {
  return sessionStorage.getItem("gt_admin") === "1";
}
function setAdminAuthed() {
  sessionStorage.setItem("gt_admin", "1");
}
function logoutAdmin() {
  sessionStorage.removeItem("gt_admin");
  location.href = "index.html";
}

/* ---------- Footer 5-click secret admin trigger ---------- */
function wireAdminTrigger(logoEl) {
  if (!logoEl) return;
  let clicks = 0;
  let timer = null;
  logoEl.addEventListener("click", () => {
    clicks++;
    clearTimeout(timer);
    timer = setTimeout(() => (clicks = 0), 1800);
    if (clicks >= 5) {
      clicks = 0;
      openAdminGate();
    }
  });
}

function openAdminGate() {
  const overlay = document.getElementById("adminGateOverlay");
  if (overlay) overlay.classList.add("open");
}

function wireAdminGateModal() {
  const overlay = document.getElementById("adminGateOverlay");
  if (!overlay) return;
  const form = document.getElementById("adminGateForm");
  const cancelBtn = document.getElementById("adminGateCancel");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pass = document.getElementById("adminGatePass").value;
    if (pass === ADMIN_PASSWORD) {
      setAdminAuthed();
      location.href = "admin.html";
    } else {
      toast("Ghalat password", "error");
    }
  });
  cancelBtn.addEventListener("click", () => overlay.classList.remove("open"));
}

/* ---------- Format helpers ---------- */
function escapeHtml(str = "") {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[m]));
}

function timeAgo(ts) {
  if (!ts) return "";
  const date = ts.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

/* ---------- Web3Forms submit (Contact Us / Make a Deal) ---------- */
async function submitToWeb3Forms(payload) {
  const body = {
    access_key: WEB3FORMS_ACCESS_KEY,
    to: NOTIFY_EMAILS,
    ...payload,
  };
  const res = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
