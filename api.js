// Supabase bilan ishlash uchun umumiy funksiyalar
(function () {
  const CFG = window.APP_CONFIG;

  async function request(path, { method = "POST", body, token } = {}) {
    const headers = { "Content-Type": "application/json", apikey: CFG.SUPABASE_KEY };
    if (token) headers.Authorization = "Bearer " + token;
    const res = await fetch(CFG.SUPABASE_URL + path, {
      method, headers, body: body === undefined ? undefined : JSON.stringify(body)
    });
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
    if (!res.ok) {
      const msg = (data && (data.message || data.error_description || data.msg || data.error)) || ("Xato: " + res.status);
      const err = new Error(msg); err.status = res.status; throw err;
    }
    return data;
  }

  window.API = {
    rpc(fn, args = {}, jwt) {
      return request("/rest/v1/rpc/" + fn, { body: args, token: jwt });
    },
    authLogin(email, password) {
      return request("/auth/v1/token?grant_type=password", { body: { email, password } });
    },
    authRefresh(refresh_token) {
      return request("/auth/v1/token?grant_type=refresh_token", { body: { refresh_token } });
    }
  };

  // Yordamchilar
  window.U = {
    esc(s) {
      return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    },
    shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
      return a;
    },
    dt(iso) {
      if (!iso) return "—";
      const d = new Date(iso);
      const p = n => String(n).padStart(2, "0");
      return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
    },
    time(iso) {
      if (!iso) return "—";
      const d = new Date(iso); const p = n => String(n).padStart(2, "0");
      return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
    },
    dur(sec) {
      if (sec == null || isNaN(sec)) return "—";
      sec = Math.max(0, Math.round(sec));
      const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
      if (h) return `${h} soat ${m} daq`;
      if (m) return `${m} daq ${s} son`;
      return `${s} son`;
    },
    store: {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
      del(k) { try { localStorage.removeItem(k); } catch (e) {} }
    }
  };
})();
