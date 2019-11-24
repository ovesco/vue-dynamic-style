# Vue-dynamic-style

A Vue plugin to declare dynamic style in your components. This is was an attempt to understand how Vue plugins work.

## Usage
First install the library using npm `npm install -S vue-dynamic-style`.
Then load the library
```js
import Vue from 'vue';
import DynamicStyle from 'vue-dynamic-style';

Vue.use(DynamicStyle);
```

In your components, you can now declare custom styles like the following:
```js
export default {
  // Return a function if you use local state, store, computed, props...
  styles() {
    return {
      h1: {
        background: 'red',
        marginTop: `${this.foo}px`,
        marginLeft: `${this.bar()}px`,
        paddingTop: `${this.$store.state.baz}px`,
      },
    };
  },
  
  // Or simply declare an object if nothing is dynamically updatable
  styles: {
    h1: {
      // ...
    },      
  },
}
```

In the case your `styles` is a function, it will be updated whenever it changes.

## Manually updating a style
If you want to update style manually, you do the following:
```js
export default {
  methods: {
    myMethod() {
      this.$styles.update({ h1: { color: 'green' } });
    },
  },
}
```

## Configuration
The library can be easily customized with the following options.

### scoped
Default: `true`

If the component's style are scoped or not. If true, a uniqid class is added to the component's root node and all style target
properties will be prepended with this class.

### prefix
Default: `'ds-'`

If scoped, the random class will be prefixed with this string.

### styleStringifier
The current JS to CSS renderer is very simple and lightweight and naive, it will convert objects of the following shape:
```json
{
  "h1": {
    "color": "green",
    "size": "10px"    
  },
  ".div": {
    "width": "calc(100% - 200px)"
  },
  ".div > .test & foo + baz": {
    "height": "3px",
  }
}
```
Will be transformed in
```css
 h1 {
   color: green;
   size: 10px;
 } 
 
 .div {
   width: calc(100% - 200px);
 }
 
 .div > .test & foo + baz {
   height: 3px;
 }
```

All first level keys will become CSS targeted elements, while next level will become CSS properties and corresponding values.
If you want to override this behavior, you can easily provide your own JS to CSS function like this:

```js
Vue.use(DynamicStyle, {
  /**
  * Responsible to transform the given style object to a CSS string
  * @param {object} style, the given style object
  * @return {string}
  */
  styleStringifier: (style) => // ...
});
```

The library makes no assumption as to what kind of structure is declared as your style. It could be literally anything, the only
important point is that whenever you declare a `styles()` property as well as use dynamic `this.$styles.update(...)`, both objects
will be merged using `deepmerge` library.

## Warning

Please note that each component where styles are defined will result in the generation of a `<script>` tag. As such, there is no concept of
scoped styles.

## License
MIT
