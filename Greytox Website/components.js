/* =========================================================
   GREYTOX — Shared header, top-slider, footer, admin gate
   Injected into every public page via #headerRoot / #footerRoot
   ========================================================= */

const NAV_LINKS = [
  { href: "index.html", label: "Home" },
  { href: "products.html", label: "Products" },
  { href: "certificates.html", label: "Certificates" },
  { href: "about.html", label: "About Us" },
  { href: "student-offers.html", label: "Student Offers" },
  { href: "make-a-deal.html", label: "Make a Deal" },
  { href: "catalogs.html", label: "Catalogs" },
  { href: "previous-orders.html", label: "Previous Orders" },
  { href: "contact.html", label: "Contact Us" },
];

async function renderHeader(activePage) {
  const settings = await getSiteSettings();
  const root = document.getElementById("headerRoot");
  if (!root) return;

  const slides = [
    `📍 ${escapeHtml(settings.address || "Sialkot 51010, Pakistan")}`,
    `✆ ${escapeHtml(settings.phone || "+923144122237")}`,
    `✉ ${escapeHtml(settings.email1 || "greytoxsurgical@gmail.com")}`,
    `Worldwide export with free custom branding on every order`,
  ];

  root.innerHTML = `
    <div class="top-slider">
      <div class="top-slider__track">
        ${[...slides, ...slides].map((s) => `<span>${s}</span>`).join("")}
      </div>
    </div>
    <header class="site-header">
      <div class="container nav">
        <a href="index.html" class="nav__logo">
          <img src="assets/logo/logo.png" alt="GreyTox Surgical Instruments" />
        </a>
        <nav>
          <ul class="nav__links" id="navLinks">
            ${NAV_LINKS.map(
              (l) =>
                `<li><a href="${l.href}" class="${l.href === activePage ? "active" : ""}">${l.label}</a></li>`
            ).join("")}
          </ul>
        </nav>
        <div class="nav__cta">
          <a class="btn btn-whatsapp btn-sm" target="_blank" rel="noopener"
             href="${waLink(settings.whatsapp, "Hello GreyTox, I'd like to inquire about your surgical instruments.")}">
            💬 <span>WhatsApp</span>
          </a>
          <button class="nav__burger" id="burgerBtn" aria-label="Menu">☰</button>
        </div>
      </div>
    </header>
  `;

  document.getElementById("burgerBtn")?.addEventListener("click", () => {
    document.getElementById("navLinks").classList.toggle("open");
  });

  // Floating WhatsApp button (site-wide)
  if (!document.getElementById("waFloat")) {
    const fab = document.createElement("a");
    fab.id = "waFloat";
    fab.className = "wa-float";
    fab.target = "_blank";
    fab.rel = "noopener";
    fab.href = waLink(settings.whatsapp, "Hello GreyTox, I'd like to inquire about your surgical instruments.");
    fab.innerHTML = `<img src="assets/icons/whatsapp.png" alt="WhatsApp" />`;
    document.body.appendChild(fab);
  }
}

async function renderFooter() {
  const settings = await getSiteSettings();
  const root = document.getElementById("footerRoot");
  if (!root) return;

  const socials = [
    { key: "facebook", icon: "assets/icons/facebook.png", label: "Facebook" },
    { key: "instagram", icon: "assets/icons/instagram.png", label: "Instagram" },
    { key: "tiktok", icon: "assets/icons/tiktok.png", label: "TikTok" },
    { key: "linkedin", icon: "assets/icons/linkedin.png", label: "LinkedIn" },
  ];

  root.innerHTML = `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-about">
            <div class="footer-logo" id="footerLogo" title="">
              <img src="assets/logo/logo.png" alt="GreyTox" />
            </div>
            <p style="margin-top:14px">Precision-forged surgical instruments manufactured in Sialkot, Pakistan — exported worldwide with free custom branding on every order.</p>
            <div class="footer-social">
              ${socials
                .map((s) => {
                  const val = settings[s.key];
                  const href = s.isWa ? waLink(val, "Hello GreyTox!") : val;
                  if (!href) return "";
                  return `<a href="${href}" target="_blank" rel="noopener" title="${s.label}"><img src="${s.icon}" alt="${s.label}"/></a>`;
                })
                .join("")}
            </div>
          </div>
          <div>
            <h4>Explore</h4>
            <ul>
              <li><a href="products.html">All Products</a></li>
              <li><a href="student-offers.html">Student Offers</a></li>
              <li><a href="catalogs.html">Download Catalogs</a></li>
              <li><a href="certificates.html">Certificates</a></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><a href="about.html">About Us</a></li>
              <li><a href="make-a-deal.html">Make a Deal</a></li>
              <li><a href="previous-orders.html">Previous Orders</a></li>
              <li><a href="contact.html">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4>Get in Touch</h4>
            <ul>
              <li>${escapeHtml(settings.address || "Sialkot 51010, Pakistan")}</li>
              <li>${escapeHtml(settings.phone || "+923144122237")}</li>
              <li>${escapeHtml(settings.email1 || "greytoxsurgical@gmail.com")}</li>
              <li>${escapeHtml(settings.email2 || "sales@greytox.com")}</li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} GreyTox Surgical Instruments. All rights reserved.</span>
          <span>Manufactured &amp; exported from Sialkot, Pakistan</span>
        </div>
      </div>
    </footer>

    <div class="modal-overlay" id="adminGateOverlay">
      <div class="modal-box">
        <h3>Admin Access</h3>
        <p class="hint">Yeh area sirf GreyTox staff ke liye hai. Password enter karen.</p>
        <form id="adminGateForm">
          <div class="field">
            <label for="adminGatePass">Password</label>
            <input type="password" id="adminGatePass" required autocomplete="current-password" />
          </div>
          <div class="modal-close-row">
            <button type="button" class="btn btn-outline" id="adminGateCancel">Cancel</button>
            <button type="submit" class="btn btn-primary">Unlock</button>
          </div>
        </form>
      </div>
    </div>
  `;

  wireAdminTrigger(document.getElementById("footerLogo"));
  wireAdminGateModal();
}

async function initGreyToxPage(activePage) {
  await applyThemeColors();
  await renderHeader(activePage);
  await renderFooter();
}
