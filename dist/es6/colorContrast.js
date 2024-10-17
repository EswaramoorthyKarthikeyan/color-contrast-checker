class b {
  getColorFormat(t) {
    const r = /^#([A-Fa-f0-9]{3,4}){1,2}$/, e = /^rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([01]?\.?\d*))?\s*\)$/, n = /^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(?:,\s*([01]?\.?\d*))?\s*\)$/;
    if (r.test(t))
      return "hex";
    if (e.test(t))
      return t.startsWith("rgba") ? "rgba" : "rgb";
    if (n.test(t))
      return t.startsWith("hsla") ? "hsla" : "hsl";
    if (t != "") {
      let o = document.querySelector("#temp");
      o || (o = document.createElement("div"), o.setAttribute("id", "temp")), o.style.backgroundColor = t;
      const a = window.getComputedStyle(o).backgroundColor;
      return this.parseColor(a);
    } else
      throw new Error(`Invalid color format: ${color}`);
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
    const h = Math.floor(t), c = t - h, d = o * (1 - c * c), g = o * (1 - c * c * c);
    switch (h % 6) {
      case 0:
        i = o, l = g, s = 0;
        break;
      case 1:
        i = d, l = o, s = 0;
        break;
      case 2:
        i = 0, l = o, s = g;
        break;
      case 3:
        i = 0, l = d, s = o;
        break;
      case 4:
        i = g, l = 0, s = o;
        break;
      case 5:
        i = o, l = 0, s = d;
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
    if (t == "")
      return "transparent";
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
    return !t || t == "" ? "transparent" : this.parseColor(t).a === 0 || t === "rgba(0, 0, 0, 0)" || t === "transparent";
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
class C {
  constructor(t, r, e) {
    this.criteriaInfo = r || { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }, this.styleObj = e || {
      "border-width": "2px",
      "border-style": "dashed",
      "border-color": "red"
    }, this.colorUtil = new b(), t || console.info("since you didn't pass the container Element, we will use the document body"), this.containerElement = t || document.body, this.startCheck;
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.startCheck = setTimeout(() => {
      this.checkContrastForChildren(), this.observer = new MutationObserver((t) => {
        for (var r of t)
          r.type === "childList" ? this.checkContrastForChildren(r.target) : r.type === "attributes" && (r.attributeName === "style" || r.attributeName === "class") && setTimeout(() => this.checkContrastForChildren(r.target), 5e3);
      }), this.observer.observe(this.containerElement, {
        childList: !0,
        subtree: !0,
        attributes: !0,
        attributeFilter: ["class", "style"]
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
          const s = this.colorUtil.getElementStyle(e), h = this.calculateContrastRatio(
            this.colorUtil.getEffectiveColor(e, "bgColor"),
            s.color
          ), c = s.fontSize <= this.criteriaInfo.fontSize, d = s.fontWeight <= this.criteriaInfo.fontWeight;
          this.criteriaInfo.contrastThreshold = c && d ? 4.5 : 3.1, h < this.criteriaInfo.contrastThreshold ? (window.getComputedStyle(e), e.setAttribute("data-color-contrast", h), this.colorUtil.setStyle(e, this.styleObj), `${e.tagName.toLowerCase()}${e.classList.value}`, this.colorUtil.getEffectiveColor(e, "bgColor"), this.colorUtil.getEffectiveColor(e, "color"), s.fontSize, s.fontWeight, e.textContent) : e.hasAttribute("data-color-contrast") && (e.style.border = "unset");
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
    this.observer && this.observer.disconnect(), this.startCheck;
  }
}
export {
  C as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map
