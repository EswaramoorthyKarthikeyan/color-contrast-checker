class u {
  getColorFormat(t) {
    const r = /^#([A-Fa-f0-9]{3,4}){1,2}$/, e = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\s*\)$/, a = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;
    return r.test(t) ? "hex" : e.test(t) ? t.startsWith("rgba") ? "rgba" : "rgb" : a.test(t) ? t.startsWith("hsla") ? "hsla" : "hsl" : "unknown";
  }
  hexToRgba(t, r = 1) {
    t = t.replace(/^#/, ""), t.length === 3 && (t = t.split("").map((i) => i + i).join(""));
    const e = parseInt(t.substring(0, 2), 16), a = parseInt(t.substring(2, 4), 16), s = parseInt(t.substring(4, 6), 16);
    return `rgba(${e}, ${a}, ${s}, ${r})`;
  }
  hslToRgba(t, r, e, a = 1) {
    r /= 100, e /= 100;
    const s = (1 - Math.abs(2 * e - 1)) * r, i = e - s / 2;
    let o, n, l;
    t %= 360, t /= 60;
    const b = Math.floor(t), c = t - b, h = s * (1 - c * c), d = s * (1 - c * c * c);
    switch (b % 6) {
      case 0:
        o = s, n = d, l = 0;
        break;
      case 1:
        o = h, n = s, l = 0;
        break;
      case 2:
        o = 0, n = s, l = d;
        break;
      case 3:
        o = 0, n = h, l = s;
        break;
      case 4:
        o = d, n = 0, l = s;
        break;
      case 5:
        o = s, n = 0, l = h;
        break;
    }
    return o = Math.round((o + i) * 255), n = Math.round((n + i) * 255), l = Math.round((l + i) * 255), `rgba(${o}, ${n}, ${l}, ${a})`;
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
    const [a, s, i] = [t, r, e].map((o) => (o /= 255, o <= 0.03928 ? o / 12.92 : Math.pow((o + 0.055) / 1.055, 2.4)));
    return 0.2126 * a + 0.7152 * s + 0.0722 * i;
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
    let e = t, a;
    for (; e && e !== document.body; ) {
      if (a = r === "bgColor" ? this.getBgColor(e) : this.getColor(e), !this.isTransparent(a))
        return a;
      e = e.parentElement;
    }
    return r === "bgColor" ? this.getBgColor(document.body) : this.getColor(document.body);
  }
  getBgColor(t) {
    return this.getElementStyle(t).bgColor;
  }
  getColor(t) {
    return this.getElementStyle(t).color;
  }
}
class f {
  constructor(t, r = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    this.colorUtil = new u(), t || console.info("since you didn't pass the container Element, we will use the document body"), this.containerElement = t || document.body, this.contrastThreshold = r.contrastThreshold, this.criteriaInfo = r;
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.checkContrastForChildren(), this.observer = new MutationObserver((t) => {
      for (var r of t)
        r.attributeName && (r.attributeName.startsWith("data-color-") || r.attributeName.startsWith("data-border-")) || this.checkContrastForChildren(r.target);
    }), this.observer.observe(this.containerElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    });
  }
  checkContrastForChildren(t = this.containerElement) {
    const r = t.children;
    for (const e of r)
      if (!e.hasAttribute("disabled") && !e.hasAttribute("hidden") && !e.hasAttribute("data-color-contrast")) {
        const s = Array.from(e.childNodes).some(
          (o) => o.nodeType === Node.TEXT_NODE && o.textContent.trim() !== ""
        );
        if ("value" in e ? e.value !== "" : s) {
          const o = this.colorUtil.getElementStyle(e), n = this.calculateContrastRatio(
            this.colorUtil.getEffectiveColor(e, "bgColor"),
            this.colorUtil.getEffectiveColor(e, "color")
          ), l = o.fontSize <= this.criteriaInfo.fontSize, b = o.fontWeight <= this.criteriaInfo.fontWeight;
          if (this.contrastThreshold = l && b ? 4.5 : 3.1, n < this.contrastThreshold) {
            const c = window.getComputedStyle(e);
            e.setAttribute("data-color-contrast", n), e.setAttribute("data-border-width", c.borderWidth), e.setAttribute("data-border-style", c.borderStyle), e.setAttribute("data-border-color", c.borderColor), e.style.border = "2px solid red";
            const h = {
              class: `${e.tagName.toLowerCase()}.${e.classList.value}`,
              bgColor: this.colorUtil.getEffectiveColor(e, "bgColor"),
              color: this.colorUtil.getEffectiveColor(e, "color"),
              fontSize: o.fontSize,
              fontWeight: o.fontWeight,
              contrastRatio: n,
              content: e.textContent
            };
            console.table(h);
          } else if (e.hasAttribute("data-border-width")) {
            const c = e.attributes["data-border-width"], h = e.attributes["data-border-style"], d = e.attributes["data-border-color"];
            e.style.border = `${c} ${h} ${d}`;
          }
        }
        e.children.length > 0 && this.checkContrastForChildren(e);
      }
  }
  calculateContrastRatio(t, r) {
    const e = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(t)), a = this.colorUtil.getRelativeLuminance(this.colorUtil.parseColor(r)), s = Math.max(e, a), i = Math.min(e, a);
    return (s + 0.05) / (i + 0.05);
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  f as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map
