/* eslint-disable no-param-reassign */
import merge from 'deepmerge';

class StyleManager {
  constructor(options) {
    this.styleNode = document.createElement('style');
    this.options = options;
    this.style = {};
    this.customStyle = {};
    this.launched = false;
  }

  update(style) {
    this.customStyle = merge(this.customStyle, style);
    this.$update();
  }

  $setStyle(style) {
    this.style = style;
    this.$update();
    this.$launch();
  }

  $launch() {
    if (this.launched) return;
    this.launched = true;
    document.body.append(this.styleNode);
  }

  $update() {
    const data = typeof this.style === 'function' ? this.style() : this.style;
    const style = merge(data, this.customStyle);
    this.styleNode.innerText = this.options.styleStringifier(style);
    this.$launch();
  }

  $destroy() {
    if (this.styleNode.parentNode) this.styleNode.parentNode.removeChild(this.styleNode);
  }
}

/**
 * Transforms a JSON object to a CSS string
 * @param style
 * @returns {string}
 */
const styleStringifier = style => Object.entries(style).reduce((txt, [key, values]) => {
  const valuesText = Object.entries(values).reduce((vt, [propName, propValue]) => {
    const propCssName = propName.replace(/([A-Z])/g, matches => `-${matches[0].toLowerCase()}`);
    return `${vt} ${propCssName}: ${propValue};`;
  }, '');
  return `${txt} ${key} { ${valuesText} }`;
}, '');

export default {
  install(Vue, options = {}) {
    const config = merge({
      styleStringifier,
    }, options);

    Vue.mixin({
      data() {
        return {
          $styles: null,
        };
      },
      mounted() {
        this.$styles = new StyleManager(config);
        const { styles } = this.$options;
        if (styles) {
          const styleObj = typeof styles === 'function' ? () => styles.call(this) : () => styles;
          this.$styles.$setStyle(styleObj);
          this.$watch(styleObj, () => {
            this.$styles.$update();
          });
        }
      },
      beforeDestroy() {
        this.$styles.$destroy();
      },
    });
  },
};
