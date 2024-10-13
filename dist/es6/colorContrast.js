class u {
  getColorFormat(e) {
    const o = /^#([A-Fa-f0-9]{3,4}){1,2}$/, t = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\s*\)$/, a = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;
    return o.test(e) ? "hex" : t.test(e) ? e.startsWith("rgba") ? "rgba" : "rgb" : a.test(e) ? e.startsWith("hsla") ? "hsla" : "hsl" : "unknown";
  }
  hexToRgba(e, o = 1) {
    e = e.replace(/^#/, ""), e.length === 3 && (e = e.split("").map((n) => n + n).join(""));
    const t = parseInt(e.substring(0, 2), 16), a = parseInt(e.substring(2, 4), 16), s = parseInt(e.substring(4, 6), 16);
    return `rgba(${t}, ${a}, ${s}, ${o})`;
  }
  hslToRgba(e, o, t, a = 1) {
    o /= 100, t /= 100;
    const s = (1 - Math.abs(2 * t - 1)) * o, n = t - s / 2;
    let r, i, l;
    e %= 360, e /= 60;
    const b = Math.floor(e), c = e - b, h = s * (1 - c * c), d = s * (1 - c * c * c);
    switch (b % 6) {
      case 0:
        r = s, i = d, l = 0;
        break;
      case 1:
        r = h, i = s, l = 0;
        break;
      case 2:
        r = 0, i = s, l = d;
        break;
      case 3:
        r = 0, i = h, l = s;
        break;
      case 4:
        r = d, i = 0, l = s;
        break;
      case 5:
        r = s, i = 0, l = h;
        break;
    }
    return r = Math.round((r + n) * 255), i = Math.round((i + n) * 255), l = Math.round((l + n) * 255), `rgba(${r}, ${i}, ${l}, ${a})`;
  }
  toRgba(e) {
    if (/^#/.test(e))
      return hexToRgba(e);
    if (/^hsl/.test(e))
      return hslToRgba(e);
    throw new Error("Unsupported color format");
  }
  parseColor(e) {
    this.getColorFormat(e) !== "rgb" && this.getColorFormat(e) !== "rgba" && (e = this.toRgba(this.getColorFormat(e)));
    const o = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/, t = e.match(o);
    if (t)
      return {
        r: parseInt(t[1], 10),
        g: parseInt(t[2], 10),
        b: parseInt(t[3], 10),
        a: t[4] ? parseFloat(t[4]) : 1
      };
    throw new Error(`Invalid color format: ${e}`);
  }
  isTransparent(e) {
    return this.parseColor(e).a === 0 || e === "rgba(0, 0, 0, 0)" || e === "transparent";
  }
  getRelativeLuminance({ r: e, g: o, b: t }) {
    const [a, s, n] = [e, o, t].map((r) => (r /= 255, r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)));
    return 0.2126 * a + 0.7152 * s + 0.0722 * n;
  }
  getElementStyle(e) {
    const o = window.getComputedStyle(e);
    return {
      bgColor: o.backgroundColor,
      color: o.color,
      fontSize: o.fontSize,
      fontWeight: o.fontWeight
    };
  }
  getEffectiveColor(e, o) {
    let t = e, a;
    for (; t && t !== document.body; ) {
      if (a = o === "bgColor" ? this.getBgColor(t) : this.getColor(t), !this.isTransparent(a))
        return a;
      t = t.parentElement;
    }
    const s = this.isTransparent(this.getBgColor(document.body)) ? this.getBgColor(document.documentElement) : this.getBgColor(document.body), n = this.isTransparent(this.getColor(document.body)) ? this.getColor(document.documentElement) : this.getColor(document.body);
    return o === "bgColor" ? s : n;
  }
  getBgColor(e) {
    return this.getElementStyle(e).bgColor;
  }
  getColor(e) {
    return this.getElementStyle(e).color;
  }
}
class C {
  constructor(e, o = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    this.colorUtil = new u(), e || console.info("since you didn't pass the container Element, we will use the document body"), this.containerElement = e || document.body, this.contrastThreshold = o.contrastThreshold, this.criteriaInfo = o;
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.checkContrastForChildren(), this.observer = new MutationObserver((e) => {
      for (var o of e)
        o.attributeName && (o.attributeName.startsWith("data-color-") || o.attributeName.startsWith("data-border-")) || this.checkContrastForChildren(o.target);
    }), this.observer.observe(this.containerElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    });
  }
  checkContrastForChildren(e = this.containerElement) {
    const o = e.children;
    for (const t of o)
      if (!t.hasAttribute("disabled") && !t.hasAttribute("hidden") && !t.hasAttribute("data-color-contrast")) {
        const s = Array.from(t.childNodes).some(
          (r) => r.nodeType === Node.TEXT_NODE && r.textContent.trim() !== ""
        ), n = "value" in t ? t.value !== "" && t.tagName.toLowerCase() === "li" && t.value !== 0 : s;
        if (n) {
          const r = this.colorUtil.getElementStyle(t), i = this.calculateContrastRatio(
            this.colorUtil.getEffectiveColor(t, "bgColor"),
            this.colorUtil.getEffectiveColor(t, "color")
          ), l = r.fontSize <= this.criteriaInfo.fontSize, b = r.fontWeight <= this.criteriaInfo.fontWeight;
          if (this.contrastThreshold = l && b ? 4.5 : 3.1, i < this.contrastThreshold) {
            console.log(s, "has text content", t.tagName, n, "value" in t);
            const c = window.getComputedStyle(t);
            t.setAttribute("data-color-contrast", i), t.setAttribute("data-border-width", c.borderWidth), t.setAttribute("data-border-style", c.borderStyle), t.setAttribute("data-border-color", c.borderColor), t.style.border = "2px solid red";
            const h = {
              class: `${t.tagName.toLowerCase()}.${t.classList.value}`,
              bgColor: this.colorUtil.getEffectiveColor(t, "bgColor"),
              color: this.colorUtil.getEffectiveColor(t, "color"),
              fontSize: r.fontSize,
              fontWeight: r.fontWeight,
              contrastRatio: i,
              content: t.textContent
            };
            console.table(h);
          } else if (t.hasAttribute("data-border-width")) {
            const c = t.attributes["data-border-width"], h = t.attributes["data-border-style"], d = t.attributes["data-border-color"];
            t.style.border = `${c} ${h} ${d}`;
          }
        }
        t.children.length > 0 && this.checkContrastForChildren(t);
      }
  }
  calculateContrastRatio(e, o) {
    const t = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(e)), a = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(o)), s = Math.max(t, a), n = Math.min(t, a);
    return (s + 0.05) / (n + 0.05);
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  C as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map
