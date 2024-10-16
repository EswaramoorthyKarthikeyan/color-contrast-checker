class C {
  getColorFormat(t) {
    const r = /^#([A-Fa-f0-9]{3,4}){1,2}$/, e = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\s*\)$/, n = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;
    return r.test(t) ? "hex" : e.test(t) ? t.startsWith("rgba") ? "rgba" : "rgb" : n.test(t) ? t.startsWith("hsla") ? "hsla" : "hsl" : "unknown";
  }
  hexToRgba(t, r = 1) {
    t = t.replace(/^#/, ""), t.length === 3 && (t = t.split("").map((a) => a + a).join(""));
    const e = parseInt(t.substring(0, 2), 16), n = parseInt(t.substring(2, 4), 16), o = parseInt(t.substring(4, 6), 16);
    return `rgba(${e}, ${n}, ${o}, ${r})`;
  }
  hslToRgba(t, r, e, n = 1) {
    r /= 100, e /= 100;
    const o = (1 - Math.abs(2 * e - 1)) * r, a = e - o / 2;
    let i, l, s;
    t %= 360, t /= 60;
    const d = Math.floor(t), h = t - d, g = o * (1 - h * h), c = o * (1 - h * h * h);
    switch (d % 6) {
      case 0:
        i = o, l = c, s = 0;
        break;
      case 1:
        i = g, l = o, s = 0;
        break;
      case 2:
        i = 0, l = o, s = c;
        break;
      case 3:
        i = 0, l = g, s = o;
        break;
      case 4:
        i = c, l = 0, s = o;
        break;
      case 5:
        i = o, l = 0, s = g;
        break;
    }
    return i = Math.round((i + a) * 255), l = Math.round((l + a) * 255), s = Math.round((s + a) * 255), `rgba(${i}, ${l}, ${s}, ${n})`;
  }
  toRgba(t) {
    if (/^#/.test(t))
      return hexToRgba(t);
    if (/^hsl/.test(t))
      return hslToRgba(t);
    throw new Error("Unsupported color format");
  }
  parseColor(t) {
    this.getColorFormat(t) !== "rgb" && this.getColorFormat(t) !== "rgba" && (t = this.toRgba(this.getColorFormat(t)));
    const r = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/, e = t.match(r);
    if (e)
      return {
        r: parseInt(e[1], 10),
        g: parseInt(e[2], 10),
        b: parseInt(e[3], 10),
        a: e[4] ? parseFloat(e[4]) : 1
      };
    throw new Error(`Invalid color format: ${t}`);
  }
  isTransparent(t) {
    return this.parseColor(t).a === 0 || t === "rgba(0, 0, 0, 0)" || t === "transparent";
  }
  getRelativeLuminance({ r: t, g: r, b: e }) {
    const [n, o, a] = [t, r, e].map((i) => (i /= 255, i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4)));
    return 0.2126 * n + 0.7152 * o + 0.0722 * a;
  }
  getElementStyle(t) {
    const r = window.getComputedStyle(t);
    return {
      bgColor: r.backgroundColor,
      color: r.color,
      fontSize: r.fontSize,
      fontWeight: r.fontWeight
    };
  }
  getEffectiveColor(t, r) {
    let e = t, n;
    for (; e && e !== document.body; ) {
      if (n = r === "bgColor" ? this.getBgColor(e) : this.getColor(e), !this.isTransparent(n))
        return n;
      e = e.parentElement;
    }
    const o = this.isTransparent(this.getBgColor(document.body)) ? this.isTransparent(this.getBgColor(document.documentElement)) ? "rgba(255,255,255,1)" : this.getBgColor(document.documentElement) : this.getBgColor(document.body), a = this.isTransparent(this.getColor(document.body)) ? this.isTransparent(this.getColor(document.documentElement)) ? "rgba(255,255,255,1)" : this.getColor(document.documentElement) : this.getColor(document.body);
    return r === "bgColor" ? o : a;
  }
  getBgColor(t) {
    return this.getElementStyle(t).bgColor;
  }
  getColor(t) {
    return this.getElementStyle(t).color;
  }
  setStyle(t, r) {
    for (const e in r)
      t.style[e] = r[e];
  }
}
class f {
  constructor(t, r, e) {
    this.criteriaInfo = r || { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }, this.styleObj = e || {
      "border-width": "2px",
      "border-style": "dashed",
      "border-color": "red"
    }, this.colorUtil = new C(), t || console.info("since you didn't pass the container Element, we will use the document body"), this.containerElement = t || document.body, this.startCheck;
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.startCheck = setTimeout(() => {
      this.checkContrastForChildren(), this.observer = new MutationObserver((t) => {
        for (var r of t)
          r.type === "childList" ? this.checkContrastForChildren(r.target) : r.type === "attributes" && (r.attributeName === "style" || r.attributeName === "class") && this.checkContrastForChildren(r.target);
      }), this.observer.observe(this.containerElement, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["style"],
        attributeOldValue: !0
      });
    }, 1);
  }
  checkContrastForChildren(t = this.containerElement) {
    const r = t.children;
    for (const e of r) {
      const n = !e.hasAttribute("disabled"), o = !e.hasAttribute("hidden");
      if (n && o) {
        const i = Array.from(e.childNodes).some(
          (s) => s.nodeType === Node.TEXT_NODE && s.textContent.trim() !== ""
        );
        if ("value" in e ? e.value !== "" && e.tagName.toLowerCase() === "li" && e.value !== 0 : i && e.textContent !== "") {
          const s = this.colorUtil.getElementStyle(e), d = this.calculateContrastRatio(
            this.colorUtil.getEffectiveColor(e, "bgColor"),
            s.color
          ), h = s.fontSize <= this.criteriaInfo.fontSize, g = s.fontWeight <= this.criteriaInfo.fontWeight;
          if (this.criteriaInfo.contrastThreshold = h && g ? 4.5 : 3.1, d < this.criteriaInfo.contrastThreshold) {
            const c = window.getComputedStyle(e);
            e.setAttribute("data-color-contrast", d), c.borderWidth !== "0px" && e.setAttribute(
              "data-border",
              `${c.borderWidth} ${c.borderStyle} ${c.borderColor}`
            ), this.colorUtil.setStyle(e, this.styleObj);
            const u = {
              class: `${e.tagName.toLowerCase()}.${e.classList.value}`,
              bgColor: this.colorUtil.getEffectiveColor(e, "bgColor"),
              color: this.colorUtil.getEffectiveColor(e, "color"),
              fontSize: s.fontSize,
              fontWeight: s.fontWeight,
              contrastRatio: d,
              content: e.textContent
            };
            console.table(u);
          } else if (e.hasAttribute("data-border")) {
            const c = e.attributes["data-border"];
            e.style.border = `${c.value}`;
          }
        }
        e.children.length > 0 && this.checkContrastForChildren(e);
      }
    }
  }
  calculateContrastRatio(t, r) {
    const e = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(t)), n = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(r)), o = Math.max(e, n), a = Math.min(e, n);
    return (o + 0.05) / (a + 0.05);
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  f as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map
