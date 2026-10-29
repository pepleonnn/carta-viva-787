/* 7vuit7 · Carta viva — app */
(() => {
  "use strict";

  const MENU = window.MENU, UI = window.UI, R = window.RESTAURANT, VIDEOS = window.VIDEOS || {};
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem("787:" + k); return v ? JSON.parse(v) : d; } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem("787:" + k, JSON.stringify(v)); } catch (_) {} }
  };
  const ss = {
    get(k) { try { return sessionStorage.getItem("787:" + k); } catch (_) { return null; } },
    set(k, v) { try { sessionStorage.setItem("787:" + k, v); } catch (_) {} }
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state ---------- */
  let lang = store.get("lang", "ca"); // la carta sempre arrenca en català

  /* ---------- index ---------- */
  const DISHES = [];
  MENU.forEach((c, ci) => c.dishes.forEach(d => {
    d.cat = c; d.ci = ci; d.gi = DISHES.length; DISHES.push(d);
    if (!d.media && VIDEOS[d.id]) d.media = { type: "youtube", ids: [].concat(VIDEOS[d.id]), demo: true };
  }));
  const byId = Object.fromEntries(DISHES.map(d => [d.id, d]));

  /* ---------- helpers ---------- */
  const t = k => (UI[lang] && UI[lang][k]) || UI.ca[k] || k;
  const L = o => (o && (o[lang] != null ? o[lang] : o.ca)) || "";
  // format de restaurant: 9,50 (sense símbol; la nota del peu indica que són euros)
  const money = n => n.toLocaleString(lang === "en" ? "en-GB" : lang === "es" ? "es-ES" : "ca-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = n => String(n).padStart(2, "0");
  const shortName = s => s.replace(/^(Les|Els|Las|Los|La|El)\s/i, "");
  const ICON = {
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke-linecap="round"/></svg>',
    minus: '<svg viewBox="0 0 24 24"><path d="M5 12h14" stroke-linecap="round"/></svg>',
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    play: '<svg viewBox="0 0 24 24"><path d="M7 4.5v15l13-7.5z"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.6 6.4 6.9.5-5.3 4.4 1.7 6.7L12 16.8l-5.9 3.7 1.7-6.7L2.5 9.4l6.9-.5z"/></svg>',
    info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5"/><path d="M12 11v6M12 7.5v.5" stroke-linecap="round"/></svg>',
    phone: '<svg viewBox="0 0 24 24" style="fill:none;stroke:currentColor;stroke-width:1.6"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z"/></svg>'
  };

  /* ---------- media (YouTube demo / vídeo propi / foto) ---------- */
  const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  // A vertical Short inside a 4:3 thumbnail fills only the central 42%: scale it so the
  // food fills the frame instead of the black bars.
  // Sense vídeo no hi ha imatge: el plat es queda en negre (.void).
  function thumbImg(d, kb = 1, eager = false) {
    const m = d.media;
    if (m && m.type === "youtube") {
      return `<img class="thumb yt-thumb ${kb ? "kb v" + kb : ""}" ${eager ? "" : 'loading="lazy"'} src="${ytThumb(m.ids[0])}" alt="">`;
    }
    if (m && m.poster) return `<img class="thumb ${kb ? "kb v" + kb : ""}" loading="lazy" src="${m.poster}" alt="">`;
    return "";
  }
  const hasMedia = d => !!(d && d.media);
  // The hqdefault of a Short is letterboxed 4:3; .is-short crops it to the vertical frame.
  function fixThumb(img) {
    const drop = () => img.remove();
    img.addEventListener("error", drop, { once: true });
    const apply = () => { if (img.naturalWidth === 120) drop(); else img.classList.add("is-short"); };
    if (img.complete) { img.naturalWidth ? apply() : drop(); }
    else img.addEventListener("load", apply, { once: true });
  }
  const thumbObs = new MutationObserver(() => $$("img.yt-thumb:not([data-fx])").forEach(i => { i.dataset.fx = 1; fixThumb(i); }));
  thumbObs.observe(document.body, { childList: true, subtree: true });

  // YouTube iframe player, muted loop, fades in only once it is really playing
  const players = new Map(); // iframe.contentWindow -> iframe
  function ytIframe(ids, horizontal) {
    const f = document.createElement("iframe");
    const id = ids[0];
    f.className = "yt" + (horizontal ? " is-h" : "");
    f.allow = "autoplay; encrypted-media; picture-in-picture";
    f.referrerPolicy = "strict-origin-when-cross-origin"; // YouTube exigeix el referer (error 153 si falta)
    f.setAttribute("tabindex", "-1");
    f.setAttribute("aria-hidden", "true");
    f.dataset.ids = ids.join(",");
    f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${id}&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
    f.addEventListener("load", () => {
      players.set(f.contentWindow, f);
      const ping = () => { try { f.contentWindow.postMessage(JSON.stringify({ event: "listening", id: id }), "*"); } catch (_) {} };
      ping(); setTimeout(ping, 600); setTimeout(ping, 1500);
    });
    return f;
  }
  function ytCmd(f, func) { try { f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: [] }), "*"); } catch (_) {} }
  addEventListener("message", e => {
    if (!/youtube(-nocookie)?\.com$/.test(new URL(e.origin || "http://x").hostname)) return;
    const f = players.get(e.source); if (!f) return;
    let data; try { data = typeof e.data === "string" ? JSON.parse(e.data) : e.data; } catch (_) { return; }
    const st = data && (data.event === "onStateChange" ? data.info : data.info && data.info.playerState);
    if (st === 1) f.classList.add("is-on");
    if (data && data.event === "onError") {
      f.remove();
    }
  });
  function mountVideo(container, d) {
    if (!container || container.querySelector("iframe, video")) return;
    const m = d && d.media; if (!m) return;
    if (m.type === "youtube") container.appendChild(ytIframe(m.ids));
    if (m.type === "video") {
      const v = document.createElement("video");
      Object.assign(v, { src: m.src, muted: true, loop: true, playsInline: true, autoplay: true });
      v.className = "yt"; v.addEventListener("playing", () => v.classList.add("is-on")); container.appendChild(v);
    }
  }
  function unmountVideo(container) { const f = container && container.querySelector("iframe, video"); if (f) { players.delete(f.contentWindow); f.remove(); } }

  /* ---------- hours ---------- */
  const toMin = s => { const [h, m] = s.split(":").map(Number); return h * 60 + m; };
  const fmtH = s => { let [h, m] = s.split(":").map(Number); h = h % 24; return `${pad(h)}:${pad(m)}`; };
  function todayInfo(now = new Date()) {
    const table = now.getMonth() === 7 ? R.augustHours : R.hours;
    const d = now.getDay(), slots = table[d] || [];
    const mins = now.getHours() * 60 + now.getMinutes();
    let open = slots.some(([a, b]) => mins >= toMin(a) && mins < toMin(b));
    const y = table[(d + 6) % 7] || [];
    if (!open) open = y.some(([, b]) => toMin(b) > 1440 && mins < toMin(b) - 1440);
    return { slots, open, label: slots.map(([a, b]) => `${fmtH(a)}–${fmtH(b)}`).join(" · ") };
  }
  const DAYS = { ca: ["Diumenge", "Dilluns", "Dimarts", "Dimecres", "Dijous", "Divendres", "Dissabte"], es: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] };
  const SINCE = { ca: "des de", es: "desde", en: "since" };

  /* ---------- i18n static ---------- */
  function applyStatic() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(el => { const k = el.dataset.i18n; el.textContent = k === "claim" ? L(R.claim).join(" ") : t(k); });
    $(".lang").dataset.lang = lang;
    $(".lang").style.setProperty("--i", ["ca", "es", "en"].indexOf(lang));
    $$(".lang button").forEach(b => b.classList.toggle("is-on", b.dataset.lang === lang));
  }

  /* ---------- markup pieces ---------- */
  function tagsHTML(d) {
    const out = [];
    (d.tags || []).forEach(tg => {
      if (tg === "signature") out.push(`<span class="tag tag--sig">${ICON.star}${esc(t("signature"))}</span>`);
      if (tg === "share") out.push(`<span class="tag">${esc(t("share"))}</span>`);
      if (tg === "min2") out.push(`<span class="tag">${esc(t("min2"))}</span>`);
    });
    if (d.sides) out.push(`<span class="tag">${esc(t("sides"))}</span>`);
    return out.join("");
  }
  // Al·lèrgens: si el plat en té informats, es llisten; si no, s'indica on consultar-los (RD 126/2015).
  const allergensHTML = d => `<div class="allerg">${ICON.info}<span><b>${esc(t("allergens"))}</b>${d.allergens && d.allergens.length ? ` <em>(${esc(t("allergensDemo"))})</em>` : ""} · ${
    d.allergens && d.allergens.length ? d.allergens.map(a => esc(L(window.ALLERGENS[a] || { ca: a }))).join(", ") : esc(t("allergenAsk"))}</span></div>`;
  const pairingHTML = c => c.pairing ? `<div class="pairing"><span>${esc(t("pairing"))}</span>${esc(L(c.pairing))}</div>` : "";
  const originHTML = d => d.origin ? `<div class="origin"><span>${esc(t("product"))}</span>${esc(d.origin)}</div>` : "";
  const priceSub = d => d.unit ? `/ ${esc(L(d.unit))}` : d.perPerson ? esc(t("perPerson")) : "";
  const demoBadge = d => d.media && d.media.demo ? `<span class="demo-badge">${esc(t("demoMedia"))}</span>` : "";

  /* ---------- HOME ---------- */
  function renderHome() {
    const td = todayInfo();
    const amb = VIDEOS._ambience;
    const hero = `
    <section class="hero" id="top">
      <div class="wrap">
        <div class="hero__logo reveal is-in">
          <span class="glow"></span>
          <img src="assets/img/logo-dark.png" alt="7vuit7 · 787matadepera">
        </div>
        <div class="kicker hero__kicker">Matadepera · ${SINCE[lang]} ${R.since}</div>
        <h1 class="hero__title">${L(R.claim).map(w => `<span><i>${esc(w)}</i></span>`).join("<br>")}</h1>
        <span class="status"><span class="dot ${td.slots.length ? (td.open ? "" : "soon") : "off"}"></span>${esc(td.slots.length ? (td.open ? t("openNow") : t("openToday")) : t("closedToday"))}${td.slots.length ? " · " + td.label : ""}</span>
        <div class="hero__ctas">
          <button class="btn btn--ink" data-open-feed="0">${esc(t("videoMenu"))}<span class="play">${ICON.play}</span></button>
          <a class="link" href="#carta" data-scroll="carta">${esc(t("viewAll"))}${ICON.arrow}</a>
        </div>
      </div>
      <div class="showcase reveal" data-open-feed="0" id="showcase">
        <div class="media">${amb ? `<img class="thumb yt-thumb kb" src="${ytThumb(amb)}" alt="" fetchpriority="high">` : ""}</div>
        <div class="shade"></div>
        <div class="showcase__cap">
          <div><div class="kicker">${esc(t("videoMenuSub"))}</div><h3>${esc(t("videoMenu"))}</h3></div>
          <span class="showcase__play">${ICON.play}</span>
        </div>
      </div>
    </section>`;

    // índex de la carta: només text, cap imatge
    const index = `
    <section class="section wrap" id="carta">
      <div class="section__head reveal">
        <div class="kicker">La carta</div>
        <h2>${esc(t("whatFancy")).replace(/(\S+)\?$/, "<em>$1?</em>")}</h2>
      </div>
      <ol class="index">
        ${MENU.map((c, i) => `
          <li class="reveal"><a href="#c-${c.id}" data-scroll="c-${c.id}">
            <span class="index__n">${pad(i + 1)}</span>
            <span class="index__t"><b>${esc(L(c.name))}</b><small>${esc(L(c.kicker))} · ${c.dishes.length} ${esc(c.dishes.length === 1 ? t("dish") : t("dishes"))}</small></span>
            <span class="index__a">${ICON.arrow}</span>
          </a></li>`).join("")}
      </ol>
    </section>`;

    const chipnav = `<nav class="chipnav" id="chipnav"><div class="chipnav__in">${MENU.map(c => `<a href="#c-${c.id}" data-scroll="c-${c.id}" data-chip="${c.id}">${esc(shortName(L(c.name)))}</a>`).join("")}</div></nav>`;

    const blocks = MENU.map((c, i) => `
      <section class="block ${c.compact ? "block--compact" : ""}" id="c-${c.id}" data-block="${c.id}">
        <div class="wrap">
          <div class="block__head reveal">
            <div class="block__num">${pad(i + 1)} · ${esc(L(c.kicker))}</div>
            <h2 class="block__title">${esc(L(c.name))}</h2>
            <p class="block__intro">${esc(L(c.intro))}</p>
            ${c.note ? `<div class="note">${ICON.info}<span>${esc(L(c.note))}</span></div>` : ""}
            ${pairingHTML(c)}
          </div>
          <ul class="dishes">
            ${c.dishes.map(d => `
              <li class="dish reveal" data-open-feed="${d.gi}" ${hasMedia(d) ? `data-video-dish="${d.id}"` : ""}>
                ${c.compact ? "" : `<div class="dish__thumb"><div class="media">${thumbImg(d, 0)}</div>${hasMedia(d) ? `<span class="pi">${ICON.play}</span>` : ""}</div>`}
                <div class="dish__name">${esc(L(d.name))}</div>
                <div class="dish__side"><div class="dish__price">${money(d.price)}${priceSub(d) ? `<small>${priceSub(d)}</small>` : ""}</div></div>
                ${L(d.desc) ? `<p class="dish__desc">${esc(L(d.desc))}</p>` : ""}
                ${originHTML(d)}
                ${tagsHTML(d) ? `<div class="tags">${tagsHTML(d)}</div>` : ""}
              </li>`).join("")}
          </ul>
        </div>
      </section>`).join("");

    const about = `
    <section class="about wrap">
      <div class="reveal">
        <div class="kicker">${esc(t("origin"))}</div>
        <h2 class="about__title">${esc(t("originTitle")).replace(/(2019\.?)$/, "<em>$1</em>")}</h2>
        <p class="about__text">${esc(t("originText"))}</p>
      </div>
    </section>`;

    const now = new Date(), table = now.getMonth() === 7 ? R.augustHours : R.hours;
    const foot = `
    <footer class="foot">
      <div class="wrap">
        <img class="foot__logo reveal" src="assets/img/logo-dark.png" alt="7vuit7 · 787matadepera">
        <div class="foot__btns reveal">
          <a class="btn btn--ink" href="tel:+34${R.phone}">${ICON.phone}${esc(t("book"))} · ${R.phoneLabel}</a>
          <a class="btn btn--line" href="tel:+34${R.mobile}">${esc(t("call"))} · ${R.mobileLabel}</a>
        </div>
        <div class="foot__list reveal">
          <a href="${R.mapsUrl}" target="_blank" rel="noopener">${esc(R.address)}</a>
          <span><a href="mailto:${R.email}">${R.email}</a> · <a href="${R.instagram}" target="_blank" rel="noopener">${R.instagramLabel}</a></span>
        </div>
        <div class="hours reveal">
          ${[1, 2, 3, 4, 5, 6, 0].map(d => `<div class="${d === now.getDay() ? "is-today" : ""}"><span>${DAYS[lang][d]}</span><span>${(table[d] || []).length ? table[d].map(([a, b]) => `${fmtH(a)}–${fmtH(b)}`).join(" · ") : "—"}</span></div>`).join("")}
        </div>
        <p class="allergen reveal">${esc(t("allergenNote"))}</p>
        <p class="allergen">${esc(t("pricesNote"))}</p>
        <p class="allergen demo-note">${esc(t("demoNote"))}</p>
        <p class="credits">787matadepera · ${SINCE[lang]} ${R.since}</p>
      </div>
    </footer>`;

    $("#view").innerHTML = hero + index + chipnav + blocks + about + foot;
    observeReveals(); observeBlocks(); observeInline();
  }

  /* Vídeos dins la pàgina: la portada, i el plat que queda al centre de la pantalla
     es posa en moviment dins la seva miniatura (un de cada vegada, per no carregar el mòbil). */
  let inlineIO, rowIO;
  function observeInline() {
    inlineIO && inlineIO.disconnect(); rowIO && rowIO.disconnect();
    inlineIO = new IntersectionObserver(es => es.forEach(e => {
      const media = e.target.querySelector(".media"), id = VIDEOS._ambience;
      if (e.isIntersecting && id) mountVideo(media, { media: { type: "youtube", ids: [id] } }); else unmountVideo(media);
    }), { threshold: .35 });
    const sc = $("#showcase"); sc && inlineIO.observe(sc);
    rowIO = new IntersectionObserver(es => es.forEach(e => {
      const row = e.target, media = row.querySelector(".dish__thumb .media");
      if (!media) return;
      row.classList.toggle("is-live", e.isIntersecting);
      if (e.isIntersecting) mountVideo(media, byId[row.dataset.videoDish]); else unmountVideo(media);
    }), { rootMargin: "-42% 0px -42% 0px" });
    $$(".dish[data-video-dish]").forEach(r => rowIO.observe(r));
  }

  /* ---------- scroll fx ---------- */
  let revealIO;
  function observeReveals() {
    revealIO && revealIO.disconnect();
    revealIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } }), { rootMargin: "0px 0px -6% 0px" });
    $$(".reveal:not(.is-in)").forEach(el => revealIO.observe(el));
  }
  let blockIO;
  function observeBlocks() {
    blockIO && blockIO.disconnect();
    blockIO = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.dataset.block;
      $$("[data-chip]").forEach(a => a.classList.toggle("is-on", a.dataset.chip === id));
      const on = $(`[data-chip="${id}"]`);
      if (on) { const p = on.parentElement; p.scrollTo({ left: on.offsetLeft - p.clientWidth / 2 + on.clientWidth / 2, behavior: "smooth" }); }
    }), { rootMargin: "-45% 0px -50% 0px" });
    $$("[data-block]").forEach(b => blockIO.observe(b));
  }
  let ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { $("#topbar").classList.toggle("is-solid", scrollY > 260); ticking = false; });
  }

  /* ---------- FEED ---------- */
  let feedBuilt = false, feedIO, activeIdx = -1;
  function slideHTML(d, i) {
    let extra = "";
    if (d.pair && d.pair.length) {
      extra = d.pair.map(pid => { const p = byId[pid]; return p ? `<div class="pair"><div class="pair__txt"><div class="pair__lbl">${esc(t("weRecommend"))}</div><div class="pair__name">${esc(L(p.name))}</div></div><span class="pair__price">${money(p.price)}</span></div>` : ""; }).join("");
    } else if (d.pairGroup) {
      const g = MENU.find(c => c.id === d.pairGroup);
      extra = `<div class="pair__lbl">${esc(t("pairWine"))}</div><div class="wines">${g.dishes.map(w => `<div class="wine"><div><b>${esc(L(w.name))}</b><span>${esc(L(w.desc))} · ${money(w.price)}</span></div></div>`).join("")}</div>`;
    } else if (d.sides) {
      extra = `<div class="pair"><div class="pair__txt"><div class="pair__lbl">${esc(t("sides"))}</div><div class="pair__name" style="white-space:normal;font-size:16px">${esc(L(d.cat.note).replace(/^[^:]+:\s*/, ""))}</div></div></div>`;
    } else if (d.cat.pairing && !d.sides) {
      extra = `<div class="pair"><div class="pair__txt"><div class="pair__lbl">${esc(t("pairing"))}</div><div class="pair__name" style="white-space:normal;font-size:16px">${esc(L(d.cat.pairing))}</div></div></div>`;
    } else if (d.perPerson && d.cat.note) {
      extra = `<div class="pair"><div class="pair__txt"><div class="pair__lbl">${esc(L(d.cat.kicker))}</div><div class="pair__name" style="white-space:normal;font-size:16px">${esc(L(d.cat.note))}</div></div></div>`;
    }
    const tags = tagsHTML(d);
    return `<article class="slide" data-i="${i}" data-cat="${d.cat.id}">
      <div class="media">${thumbImg(d, (i % 4) + 1, true)}</div>
      <div class="slide__shade"></div>
      <div class="slide__card">
        <div class="slide__k">${esc(L(d.cat.name))}</div>
        <div class="slide__head">
          <h2 class="slide__name">${esc(L(d.name))}</h2>
          <div class="slide__price">${money(d.price)}${priceSub(d) ? `<small>${priceSub(d)}</small>` : ""}</div>
        </div>
        ${L(d.desc) ? `<p class="slide__desc">${esc(L(d.desc))}</p>` : ""}
        ${originHTML(d)}
        ${tags ? `<div class="slide__tags">${tags}</div>` : ""}
        ${allergensHTML(d)}
        ${extra ? `<div class="slide__extra">${extra}</div>` : ""}
      </div>
    </article>`;
  }
  function buildFeed() {
    const sc = $("#feedScroller");
    sc.innerHTML = DISHES.map(slideHTML).join("") + `
      <article class="slide slide--end" data-i="${DISHES.length}" data-cat="end">
        <div>
          <img class="foot__logo" src="assets/img/logo-dark.png" alt="">
          <p>${esc(L(R.claim).join(" "))}</p>
          <div class="btns">
            <button class="btn btn--ink" data-close-feed>${esc(t("backToMenu"))}</button>
            <a class="btn btn--line" href="tel:+34${R.phone}">${esc(t("book"))}</a>
          </div>
        </div>
      </article>`;
    $("#feedCats").innerHTML = MENU.map(c => `<button data-feed-cat="${c.id}">${esc(shortName(L(c.name)))}</button>`).join("");
    feedIO && feedIO.disconnect();
    feedIO = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) setActive(+e.target.dataset.i); }), { root: sc, threshold: .6 });
    $$(".slide", sc).forEach(s => feedIO.observe(s));
    feedBuilt = true;
  }
  function setActive(i) {
    if (i === activeIdx) return;
    activeIdx = i;
    const slides = $$("#feedScroller .slide");
    slides.forEach(s => {
      const k = +s.dataset.i, on = k === i, media = s.querySelector(".media");
      s.classList.toggle("is-active", on);
      if (!media) return;
      // keep a player only on the active slide and its neighbours
      if (Math.abs(k - i) <= 1 && DISHES[k]) mountVideo(media, DISHES[k]); else unmountVideo(media);
      const f = media.querySelector("iframe"), v = media.querySelector("video");
      if (f) ytCmd(f, on ? "playVideo" : "pauseVideo");
      if (v) on ? v.play().catch(() => {}) : v.pause();
    });
    const d = DISHES[i];
    $("#feedCount").textContent = d ? `${i + 1}/${DISHES.length}` : "";
    const prog = $("#feedProg");
    if (d) {
      const sib = d.cat.dishes, pos = sib.indexOf(d);
      prog.innerHTML = sib.map((_, k) => `<i class="${k < pos ? "done" : k === pos ? "done now" : ""}"></i>`).join("");
    } else prog.innerHTML = "";
    $$("#feedCats button").forEach(b => b.classList.toggle("is-on", d && b.dataset.feedCat === d.cat.id));
    const on = d && $(`#feedCats [data-feed-cat="${d.cat.id}"]`);
    if (on) { const p = on.parentElement; p.scrollTo({ left: on.offsetLeft - p.clientWidth / 2 + on.clientWidth / 2, behavior: "smooth" }); }
    if (i > 0) $("#feedHint").classList.add("is-gone");
  }
  function openFeed(i = 0, push = true) {
    if (!feedBuilt) buildFeed();
    const f = $("#feed"); f.classList.add("is-open"); f.setAttribute("aria-hidden", "false");
    document.body.classList.add("lock", "feed-open");
    $$(".media iframe", $("#view")).forEach(fr => ytCmd(fr, "pauseVideo"));
    const sc = $("#feedScroller"); activeIdx = -1;
    requestAnimationFrame(() => { sc.scrollTop = i * sc.clientHeight; setActive(i); });
    $("#feedHint").classList.toggle("is-gone", i > 0 || !!ss.get("hint"));
    setTimeout(() => { $("#feedHint").classList.add("is-gone"); ss.set("hint", "1"); }, 2600);
    if (push) history.pushState({ feed: i }, "", `#v-${DISHES[i] ? DISHES[i].id : ""}`);
  }
  function closeFeed(fromPop) {
    const f = $("#feed"); if (!f.classList.contains("is-open")) return;
    f.classList.remove("is-open"); f.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lock", "feed-open");
    $$("#feedScroller .media").forEach(unmountVideo);
    $$(".media iframe", $("#view")).forEach(fr => ytCmd(fr, "playVideo"));
    const d = DISHES[activeIdx]; activeIdx = -1;
    if (d) { const row = $(`.dish[data-open-feed="${d.gi}"]`); if (row) { const r = row.getBoundingClientRect(); document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, Math.max(0, r.top + window.pageYOffset - innerHeight / 2 + r.height / 2)); document.documentElement.style.scrollBehavior = ""; } }
    if (!fromPop && location.hash.startsWith("#v-")) history.back();
  }

  /* ---------- intro ---------- */
  function intro() {
    const el = $("#intro");
    if (ss.get("intro") || reduced) { el.remove(); return; }
    const out = () => { if (!el.isConnected) return; el.classList.add("is-out"); ss.set("intro", "1"); setTimeout(() => el.remove(), 1100); };
    el.addEventListener("click", out);
    setTimeout(out, 2200);
  }

  /* ---------- navegació dins la pàgina ----------
     Desplaçament suau amb garantia: si el navegador no l'acaba (pestanyes en segon pla,
     navegadors integrats com el de WhatsApp), salta directament a la secció. */
  function goTo(id) {
    const tg = document.getElementById(id); if (!tg) return;
    const bar = $("#topbar"), nav = $("#chipnav");
    const offset = (bar ? bar.offsetHeight : 0) + (nav && id !== "carta" && id !== "top" ? nav.offsetHeight : 0) + 8;
    const top = Math.max(0, tg.getBoundingClientRect().top + window.pageYOffset - offset);
    try { window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" }); } catch (_) { window.scrollTo(0, top); }
    setTimeout(() => { if (Math.abs(window.pageYOffset - top) > 40) { document.documentElement.style.scrollBehavior = "auto"; window.scrollTo(0, top); document.documentElement.style.scrollBehavior = ""; } }, 900);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const of = e.target.closest("[data-open-feed]");
    if (of) { openFeed(+of.dataset.openFeed); return; }
    const sc = e.target.closest("[data-scroll]");
    if (sc) { e.preventDefault(); goTo(sc.dataset.scroll); return; }
    if (e.target.closest("[data-close-feed]")) { closeFeed(); return; }
    const fc = e.target.closest("[data-feed-cat]");
    if (fc) { const first = DISHES.find(d => d.cat.id === fc.dataset.feedCat); const s = $("#feedScroller"); s.scrollTo({ top: first.gi * s.clientHeight, behavior: "smooth" }); return; }
    const lb = e.target.closest("button[data-lang]");
    if (lb) { setLang(lb.dataset.lang); return; }
  });
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("popstate", () => { if (!location.hash.startsWith("#v-")) closeFeed(true); });
  addEventListener("keydown", e => {
    if (e.key === "Escape") closeFeed();
    if ($("#feed").classList.contains("is-open") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault(); const s = $("#feedScroller"); s.scrollBy({ top: (e.key === "ArrowDown" ? 1 : -1) * s.clientHeight, behavior: "smooth" });
    }
  });
  function setLang(l) {
    if (l === lang) return;
    lang = l; store.set("lang", l); applyStatic();
    const y = scrollY; renderHome(); scrollTo(0, y);
    const open = $("#feed").classList.contains("is-open"), i = activeIdx;
    feedBuilt = false; $("#feedScroller").innerHTML = "";
    if (open) { buildFeed(); activeIdx = -1; const sc = $("#feedScroller"); sc.scrollTop = i * sc.clientHeight; setActive(i); }
  }

  /* ---------- boot ---------- */
  try { history.scrollRestoration = "manual"; } catch (_) {}
  applyStatic();
  intro();
  renderHome();
  onScroll();
  // deep link: #v-<dish-id>  (QR per plat o compartir un plat)
  const m = location.hash.match(/^#v-(.+)$/);
  if (m && byId[m[1]]) { const id = m[1]; history.replaceState(null, "", location.pathname); history.pushState({}, "", `#v-${id}`); openFeed(byId[id].gi, false); }
})();
