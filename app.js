// @author piercer
(() => {
  const KEY = "piercer_crypto_wallets_v1";
  const $ = (id) => document.getElementById(id);

  let state = (() => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY) || "{}");
      return {
        wallets: Array.isArray(s.wallets) ? s.wallets : [{ label: "Ledger Main", net: "Bitcoin", usd: 3500 }, { label: "Phantom", net: "Solana", usd: 850 }],
        airdrops: Array.isArray(s.airdrops) ? s.airdrops : [{ proto: "Abstract", task: "Bridge ETH + 3 interações semanais", gas: 6.5, done: false }],
        stkCap: s.stkCap ?? 2000,
        stkApy: s.stkApy ?? 14,
        stkMeses: s.stkMeses ?? 12,
      };
    } catch { return { wallets: [], airdrops: [], stkCap: 2000, stkApy: 14, stkMeses: 12 }; }
  })();

  $("stkCap").value = state.stkCap;
  $("stkApy").value = state.stkApy;
  $("stkMeses").value = state.stkMeses;

  function save() {
    state.stkCap = Number($("stkCap").value) || 0;
    state.stkApy = Number($("stkApy").value) || 0;
    state.stkMeses = Number($("stkMeses").value) || 12;
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function render() {
    save();
    const total = state.wallets.reduce((s, w) => s + w.usd, 0);
    $("walletTotal").textContent = `Patrimônio On-Chain: $${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    $("walletList").innerHTML = "";
    state.wallets.forEach((w, i) => {
      const row = document.createElement("div");
      row.className = "item-row";
      row.innerHTML = `<span><strong>${w.label}</strong> (${w.net})</span><span>$${w.usd.toLocaleString("en-US")} <button type="button" class="btn">×</button></span>`;
      row.querySelector("button").addEventListener("click", () => {
        state.wallets.splice(i, 1);
        render();
      });
      $("walletList").appendChild(row);
    });

    const cap = state.stkCap;
    const apy = state.stkApy / 100;
    const months = state.stkMeses;
    const finalStk = cap * Math.pow(1 + apy / 365, (months / 12) * 365);
    $("stkOut").textContent = `Final: $${finalStk.toFixed(2)} (Lucro: +$${(finalStk - cap).toFixed(2)})`;

    $("airList").innerHTML = "";
    state.airdrops.forEach((a, i) => {
      const row = document.createElement("div");
      row.className = `item-row ${a.done ? "done" : ""}`;
      row.innerHTML = `<label style="display:flex;gap:8px;align-items:center;cursor:pointer;"><input type="checkbox" style="width:auto;" ${a.done ? "checked" : ""}/><span><strong>${a.proto}</strong> — ${a.task} (Gás: $${a.gas})</span></label><button type="button" class="btn">×</button>`;
      row.querySelector("input").addEventListener("change", (ev) => {
        a.done = ev.target.checked;
        render();
      });
      row.querySelector("button").addEventListener("click", () => {
        state.airdrops.splice(i, 1);
        render();
      });
      $("airList").appendChild(row);
    });
  }

  $("walletForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.wallets.push({ label: $("wLabel").value.trim(), net: $("wNet").value, usd: Number($("wUsd").value) || 0 });
    $("wLabel").value = "";
    $("wUsd").value = "";
    render();
  });

  $("airForm").addEventListener("submit", (e) => {
    e.preventDefault();
    state.airdrops.unshift({ proto: $("airProto").value.trim(), task: $("airTask").value.trim(), gas: Number($("airGas").value) || 0, done: false });
    $("airProto").value = "";
    $("airTask").value = "";
    render();
  });

  ["stkCap", "stkApy", "stkMeses"].forEach((id) => $(id).addEventListener("input", render));
  render();
})();
