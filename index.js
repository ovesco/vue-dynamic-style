/* eslint-disable no-param-reassign */
import merge from 'deepmerge';

class StyleManager {
  constructor(options, managers, node) {
    const className = (new Date().getTime() + Math.floor((Math.random()*10000)+1)).toString(16);
    this.managers = managers;
    this.node = node;
    this.className = `${options.prefix}${className}`;
    this.styleNode = document.createElement('style');
    this.options = options;
    this.style = {};
    this.customStyle = {};
    this.launched = false;
    this.styleString = null;
  }

  update(style) {
    this.customStyle = merge(this.customStyle, style);
    this.$update();
  }

  $setStyle(style) {
    this.style = style;
    this.$update();
  }

  $launch() {
    if (this.launched) return;
    this.launched = true;
    this.node.$el.classList.add(this.className);
    document.body.append(this.styleNode);
  }

  $update(force) {
    const data = typeof this.style === 'function' ? this.style() : this.style;
    let style = merge(data, this.customStyle);
    const scoped = style.scoped === true || (style.scoped !== false && this.options.scoped === true);
    if (style.scoped) delete style.scoped;

    style = this.options.flattener(style);

    if (scoped) {
      style = Object.entries(style)
        .reduce((obj, [key, value]) => {
          obj[`.${this.className}${key}`] = value;
          return obj;
        }, {});
    }

    this.styleString = this.options.styleStringifier(style);
    let found = false;
    if (!scoped) {

      this.managers.forEach((manager) => {
        if (manager !== this && manager.styleString === this.styleString) found = true;
      });
    }
    if (force === true || !found) {
      this.styleNode.innerText = this.styleString;
      this.$launch();
    }
  }

  $destroy() {
    this.managers.splice(this.managers.indexOf(this), 1);
    // If we are in the case of multiple components having the same style, and remove the only one
    // where the style node exist, we must find another and render it.
    let candidat = null, rendered = false;
    for (const manager of this.managers) {
      if (manager.styleString === this.styleString) {
        candidat = manager;
        if (manager.launched) rendered = true;
      }
    }
    if (!rendered && candidat) candidat.$update(true); // The candidat becomes the next launched manager
    if (this.styleNode.parentNode) this.styleNode.parentNode.removeChild(this.styleNode);
  }
}

/**
 * Flattens the given style object
 * @param target
 */
const flattener = (target) => {
  const output = {};
  const step = (object, parentKey) => {
    Object.entries(object).forEach(([key, value]) => {
      if (typeof value === 'object') {
        const newKey = parentKey + (key.charAt(0) === '&' ? key.slice(1, key.length) : ' ' + key);
        return step(value, newKey.trim());
      }
      else {
        if (!output[parentKey]) output[parentKey] = {};
        output[parentKey][key] = value;
      }
    });
  };

  step(target, '');
  return output;
};

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
      flattener,
      prefix: 'ds-',
      scoped: false,
    }, options);

    const managers = [];

    Vue.mixin({
      data() {
        return {
          $styles: null,
        };
      },
      mounted() {
        this.$styles = new StyleManager(config, managers, this);
        managers.push(this.$styles);
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
