class h {
  constructor(r, e = { fontSize: "23.994px", fontWeight: 700, contrastThreshold: 4.5 }) {
    if (this.containerElement = r, this.contrastThreshold = e.contrastThreshold, this.criteriaInfo = e, !this.containerElement)
      throw new Error(`Container element with selector "${containerSelector}" not found.`);
  }
  init() {
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => this.startObserving()) : this.startObserving();
  }
  startObserving() {
    this.checkContrastForChildren(), this.observer = new MutationObserver((r, e) => {
      for (var t of r)
        t.type === "childList" ? console.log("A child node has been added or removed.") : t.type === "attributes" && console.log("The " + t.attributeName + " attribute was modified."), this.checkContrastForChildren();
    }), this.observer.observe(this.containerElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    });
  }
  getElementStyle(r) {
    const e = window.getComputedStyle(r);
    return {
      bgColor: e.backgroundColor,
      color: e.color,
      fontSize: e.fontSize,
      fontWeight: e.fontWeight
    };
  }
  getEffectiveBackgroundColor(r) {
    let e = r, t;
    for (; e && e !== document.body; ) {
      if (t = this.getElementStyle(e).bgColor, !this.isTransparent(t))
        return t;
      e = e.parentElement;
    }
    return this.getElementStyle(document.body).bgColor;
  }
  checkContrastForChildren(r = this.containerElement) {
    const e = r.children;
    for (const t of e) {
      let n;
      if ("value" in t ? n = t.value !== "" : n = t.textContent !== "", console.log(t, t.tagName, n), n) {
        const o = this.getElementStyle(t), s = this.calculateContrastRatio(this.getEffectiveBackgroundColor(t), o.color);
        let i = !1;
        const a = o.fontSize <= this.criteriaInfo.fontSize, l = o.fontWeight <= this.criteriaInfo.fontWeight;
        this.contrastThreshold = a && l ? 4.5 : 3.1, s < this.contrastThreshold && (t.style.border = "2px solid red"), s > this.contrastThreshold && (i = !0, t.style.border = "2px solid green"), `${t.tagName.toLowerCase()}${t.classList.value}`, this.getEffectiveBackgroundColor(t), o.color, o.fontSize, o.fontWeight;
      }
      t.children.length > 0 && this.checkContrastForChildren(t);
    }
  }
  isTransparent(r) {
    return this.parseColor(r).a === 0 || r === "rgba(0, 0, 0, 0)" || r === "transparent";
  }
  calculateContrastRatio(r, e) {
    const t = this.getRelativeLuminance(this.parseColor(r)), n = this.getRelativeLuminance(this.parseColor(e)), o = Math.max(t, n), s = Math.min(t, n);
    return (o + 0.05) / (s + 0.05);
  }
  parseColor(r) {
    const e = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/, t = r.match(e);
    if (t)
      return {
        r: parseInt(t[1], 10),
        g: parseInt(t[2], 10),
        b: parseInt(t[3], 10),
        a: t[4] ? parseFloat(t[4]) : 1
      };
    throw new Error(`Invalid color format: ${r}`);
  }
  getRelativeLuminance({ r, g: e, b: t }) {
    const [n, o, s] = [r, e, t].map((i) => (i /= 255, i <= 0.03928 ? i / 12.92 : Math.pow((i + 0.055) / 1.055, 2.4)));
    return 0.2126 * n + 0.7152 * o + 0.0722 * s;
  }
  destroy() {
    this.observer && this.observer.disconnect();
  }
}
export {
  h as ColorContrastChecker
};
//# sourceMappingURL=colorContrast.js.map
