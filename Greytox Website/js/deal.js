let dealRowCount = 0;

(async function () {
  await initGreyToxPage("make-a-deal.html");
  addDealRow();

  document.getElementById("addRowBtn").addEventListener("click", addDealRow);

  document.getElementById("dealForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("dealSubmit");
    const fd = new FormData(e.target);
    const base = Object.fromEntries(fd.entries());

    const rows = [...document.querySelectorAll(".deal-row")].map((row) => ({
      product: row.querySelector('[name="p_name"]').value,
      quantity: row.querySelector('[name="p_qty"]').value,
    })).filter((r) => r.product.trim());

    if (!rows.length) {
      toast("Kam az kam ek product add karen.", "error");
      return;
    }

    btn.disabled = true; btn.textContent = "Sending...";

    const productsText = rows.map((r, i) => `${i + 1}. ${r.product} — Qty: ${r.quantity || "N/A"}`).join("\n");

    try {
      await db.collection("dealInquiries").add({
        ...base,
        products: rows,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        status: "new",
      });
      const r = await submitToWeb3Forms({
        subject: `New Deal Inquiry from ${base.name}`,
        name: base.name,
        email: base.email,
        phone: base.phone,
        company: base.company,
        location: base.location,
        notes: base.notes,
        products_requested: productsText,
      });
      if (r.success) {
        toast("Aapki inquiry bhej di gayi hai — hum jald contact karenge.");
        e.target.reset();
        document.getElementById("dealRows").innerHTML = "";
        dealRowCount = 0;
        addDealRow();
        document.getElementById("dealForm").style.display = "none";
        document.getElementById("dealThankYou").style.display = "block";
      } else {
        console.error("Web3Forms response:", r);
        toast("Save ho gaya lekin email nahi ja saka.", "error");
      }
    } catch (err) {
      toast("Error: " + err.message, "error");
    } finally {
      btn.disabled = false; btn.textContent = "Send Query";
    }
  });
})();

function addDealRow() {
  dealRowCount++;
  const wrap = document.getElementById("dealRows");
  const row = document.createElement("div");
  row.className = "deal-row";
  row.innerHTML = `
    <div class="field"><label>Product Name</label><input type="text" name="p_name" placeholder="e.g. Mayo Scissors Curved 6.5&quot;" /></div>
    <div class="field"><label>Quantity</label><input type="number" name="p_qty" min="1" placeholder="100" /></div>
    <div class="field"><label>Unit</label><input type="text" name="p_unit" placeholder="pcs / sets / boxes" /></div>
    <button type="button" class="icon-x" title="Remove">✕</button>
  `;
  row.querySelector(".icon-x").addEventListener("click", () => row.remove());
  wrap.appendChild(row);
}
