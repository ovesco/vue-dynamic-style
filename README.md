# Vue-dynamic-style

A Vue plugin to declare dynamic style in your components. This is a work in progress that I'm using in side projects in production. I believe it is stable enough for that (although it's quite simple).

## Usage
First install the library using npm `npm install -S vue-dynamic-style`.
Then load the library
```js
import Vue from 'vue';
import DynamicStyle from 'vue-dynamic-style';

Vue.use(DynamicStyle, { /* config, see below */ });
```


In your components, you can now declare custom styles like this:
```js
export default {
  // Return a function if you use local state, store, computed, props...
  // This enable the plugin to react to data change
  styles() {
    return {
      scoped: true, // If you want your style to be scoped to this component
      h1: {
        background: 'red',
        marginTop: `${this.foo}px`, // data or props
        marginLeft: `${this.bar()}px`, // method
        paddingTop: `${this.$store.state.baz}px`, // vuex
      },
      '.my-div': {
        width: '100px',
        
        // Supports nested styles
        'p.my-text': {
          size: Math.random() * 10 + 'px',
          
          // And using the & cursor
          '&.danger': {
            color: this.dangerColor,
          },
        },
      }
    };
  },
  
  // Or simply declare an object if nothing is dynamically updated through your component's lifecycle
  // But in this case you should simply style your components with normal CSS...
  styles: {
    h1: {
      // ...
    },      
  },
}
```

## How does it work
Whenever you custom-style a component using this library, a new `<style>` node will be appended
to your page body. This node will follow your component lifecycle, when it dies, it will be removed
from the page.

This can result in quite a lot of `<style>` nodes being added, you can greatly minimize the amount
by setting your styles as `scoped: false`. Whenever a component gets rendered, it will check if another component
with the exact same dynamic style is already rendered (so scoped must be false), and if so will simply do nothing.

This implies the following:
1. If you remove a component whose dynamic style was rendered (an attached style node is loaded on page)
2. The library will iterate over all visible components where a dynamic style exist to see if it's the same style
3. If it finds one with same style which is rendered (should not happen but hey never too confident), does nothing
4. Otherwise, takes the last "candidat" and forces it to render.

## Manually updating a style
If you wish to manually update your component styles or adding dynamic rules, you can access
the `$styles` property which offers one "public" method:
```js
export default {
  methods: {
    myMethod() {
      this.$styles.update({ h1: { color: 'green' } });
    },
  },
}
```

Please note that using this will result in deep merging the defined style object (if any) with the given custom style before
rendering it.

## Configuration
The library can be easily customized with the following options.

### scoped
Default: `false`

If the component's style is scoped or not. If true, a uniqid class is added to the component root node and all style target
properties will be prepended with this class. Please note that the additional class will be added to the `$el` node.
```html
<template>
    <!-- this won't work -->
    <div>
        <div class="foo">
            <p>some text</p>
        </div>
    </div>
    
    <!-- this works -->
    <div class="foo">
        <p>some text</p>
    </div>
</template>
```
```js
{
  '.foo': {
    background: 'blue',
    'p': {
      color: 'red',
    }
  }
}
```

### prefix
Default: `'ds-'`
If scoped, the random class will be prefixed with this string.

### styleStringifier
The JS style object to CSS converter. It is lightweight and quite naive, doesn't check CSS rules validation or anything.
```json
{
  "h1": {
    "color": "green",
    "size": "10px"    
  },
  ".div": {
    "width": "calc(100% - 200px)"
  },
  ".div > .test foo + baz": {
    "height": "3px",
  }
}
```
Will be converted to
```css
 h1 {
   color: green;
   size: 10px;
 } 
 
 .div {
   width: calc(100% - 200px);
 }
 
 .div > .test foo + baz {
   height: 3px;
 }
```

### Flattenner
The JS style object flattener. This allows you to write nested styles and use the `&` operator easily as seen in the first example.
If you want to override it, you can provide a function which takes a single style object, and should return a two levels deep object.


## License
MIT
