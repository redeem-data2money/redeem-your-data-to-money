// Config
const pricePerMB = 1;           // ₦ per MB (change if needed)
const commissionRate = 0.20;    // 20%

// Generate options: MB options (100..900 step 100), plus common GB options
const mbOptions = Array.from({length:9}, (_,i) => (i+1)*100); // 100,200,...900
const gbOptions = [1,2,5,10]; // in GB

// Utility
const formatN = n => {
  // format number as Naira, e.g. ₦1,000
  return "₦" + Number(Math.round(n)).toLocaleString();
};

function calc(amountMB){
  const value = amountMB * pricePerMB;
  const commission = value * commissionRate;
  const payout = value - commission;
  return { value, commission, payout };
}

// Populate table
function buildTable(filter=""){
  const tbody = document.querySelector("#optionsTable tbody");
  tbody.innerHTML = "";

  const rows = [];

  // MB rows
  mbOptions.forEach(mb => {
    const {value, commission, payout} = calc(mb);
    const label = `${mb} MB`;
    if (filter && !label.toLowerCase().includes(filter.toLowerCase())) return;
    rows.push({label, value, commission, payout, amountMB: mb});
  });

  // GB rows
  gbOptions.forEach(gb => {
    const mb = gb * 1000;
    const {value, commission, payout} = calc(mb);
    const label = `${gb} GB`;
    if (filter && !label.toLowerCase().includes(filter.toLowerCase())) return;
    rows.push({label, value, commission, payout, amountMB: mb});
  });

  // Render rows
  rows.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${r.label}</td>
      <td>${formatN(r.value)}</td>
      <td>${formatN(r.commission)}</td>
      <td>${formatN(r.payout)}</td>
      <td><button class="action-btn" data-mb="${r.amountMB}" data-label="${r.label}">Redeem</button></td>
    `;
    tbody.appendChild(tr);
  });

  // hook redeem buttons
  document.querySelectorAll(".action-btn").forEach(btn => {
    btn.addEventListener("click", openRedeemModal);
  });
}

// Modal functions (simulated)
const modal = document.getElementById("redeemModal");
const modalBody = document.getElementById("modalBody");
let pendingRedeem = null;

function openRedeemModal(e){
  const btn = e.currentTarget;
  const amountMB = Number(btn.dataset.mb);
  const label = btn.dataset.label;
  const {value, commission, payout} = calc(amountMB);
  pendingRedeem = {amountMB, label, value, commission, payout};

  modalBody.innerHTML = `
    <p><strong>${label}</strong></p>
    <p>Value: ${formatN(value)}</p>
    <p>Commission (20%): ${formatN(commission)}</p>
    <p><strong>Payout: ${formatN(payout)}</strong></p>
    <p style="color:var(--muted);font-size:13px">This is a simulation. No real transfer will occur until backend & payment integration are added.</p>
  `;

  modal.setAttribute("aria-hidden", "false");
}

document.getElementById("closeModal").addEventListener("click", ()=> modal.setAttribute("aria-hidden","true"));
document.getElementById("cancelRedeem").addEventListener("click", ()=> modal.setAttribute("aria-hidden","true"));

document.getElementById("confirmRedeem").addEventListener("click", ()=>{
  if (!pendingRedeem) return;
  // Simulate success
  modalBody.innerHTML = `
    <p><strong>Success!</strong></p>
    <p>You requested to redeem <strong>${pendingRedeem.label}</strong>.</p>
    <p>Payout: <strong>${formatN(pendingRedeem.payout)}</strong></p>
    <p style="color:var(--success)">Note: This is a simulated confirmation. To actually pay users, integrate a payment provider (Paystack, Flutterwave, Stripe) and a backend.</p>
  `;
  // Clear pending after show
  pendingRedeem = null;
  // Change button behavior to close
  document.getElementById("confirmRedeem").textContent = "Close";
  document.getElementById("confirmRedeem").onclick = ()=> modal.setAttribute("aria-hidden","true");
});

// Custom calculator
document.getElementById("customCalcBtn").addEventListener("click", ()=>{
  const num = Number(document.getElementById("customAmount").value);
  const unit = document.getElementById("customUnit").value;
  if (!num || num <= 0) {
    document.getElementById("customResult").textContent = "Enter a valid number.";
    return;
  }
  const mb = unit === "GB" ? num * 1000 : num;
  const {value, commission, payout} = calc(mb);
  document.getElementById("customResult").innerHTML = `
    <div>Amount: <strong>${num} ${unit}</strong></div>
    <div>Value: <strong>${formatN(value)}</strong></div>
    <div>Commission: <strong>${formatN(commission)}</strong></div>
    <div>Payout: <strong>${formatN(payout)}</strong></div>
    <div style="margin-top:8px"><button class="action-btn" id="customRedeemBtn" data-mb="${mb}">Redeem ${num} ${unit}</button></div>
  `;
  document.getElementById("customRedeemBtn").addEventListener("click", (e)=>{
    openRedeemModal({ currentTarget: { dataset: { mb: mb, label: `${num} ${unit}` } } });
  });
});

// Search filter
document.getElementById("searchInput").addEventListener("input", (e)=>{
  buildTable(e.target.value.trim());
});

// Initial render
buildTable();
