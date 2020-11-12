### @such-code/content-url-loader

A very specific loader which works similar to [url-loader](https://github.com/webpack-contrib/url-loader) but has different default behaviour and more settings.

#### Installation

```bash
npm i -D @such-code/content-url-loader
```

#### Options

```typescript
/**
 * Type definition for loader options.
 */
export declare type ContentUrlLoaderOptions = {
    /**
     * Return commonjs or es6 module (commonjs by default).
     */
    esModule?: boolean;
    /**
     * Maximal content size to be loaded as content.
     */
    maxSize?: number;
    /**
     * Name of the resource is loaded as an URL.
     */
    name?: string;
    /**
     * Additional name regexp to be referenced in name.
     */
    nameRegExp?: RegExp;
    /**
     * Optional function to force load either as URL or as a content. `true` to load as URL, `false` for content loading
     * `null` for auto mode.
     */
    loadAsUrl?: (($target: string, $resource: string, $context: string, $query: string) => (boolean | null));
    /**
     * Optional function or string to wrap emitted URL. If string is provided, `{{url}}` parameter will be replaced in
     * it. Ex. `<img src="{{url}}">` will return HTML element. Function MUST return valid JS code that will be evaluated
     * at runtime. Function argument is a value with JSON.stringify() applied to it.
     */
    urlWrapper?: string | (($content: string, $resource: string, $context: string, $query: string) => string);
    /**
     * Optional function or string to wrap content. String should contain `{{content}}` which will be replaced. Ex
     * `<span>{{content}}</span>` will return HTML element with a content. Function MUST return valid JS code that will
     * be evaluated.
     */
    contentWrapper?: string | (($content: string, $resource: string, $context: string, $query: string) => string);
    /**
     * Custom path when resource is treated as an URL.
     */
    outputPath?: string | (($target: string, $resource: string, $context: string) => string);
    /**
     * Custom public path for resource when loaded as an URL.
     */
    publicPath?: string | (($target: string, $resource: string, $context: string) => string);
    /**
     * Serialization method. By default content smaller than maxSize will be serialized to string with utf-8 encoding.
     * This behaviour could be overwritten by setting `serialize` param.
     */
    serialize?: 'string' | 'base64' | (($content: Buffer) => string);
};
```

#### Example configurations

In this example SVG image will be loaded as `<svg>` content or `<img>` with `src` emitted as separate file.

```javascript
/** @typedef { import(webpack/declarations/WebpackOptions).WebpackOptions } WebpackOptions */
/** @typedef { import(@such-code/content-url-loader).ContentUrlLoaderOptions } ContentUrlLoaderOptions */

/** @type WebpackOptions */
module.exports = {
    ...otherOptions,
    module: {
        rules: [
            {
                test: /\.svg(\?.*)?$/i,
                use: {
                    loader: '@such-code/content-html-loader',
                    /** @type ContentUrlLoaderOptions */
                    options: {
                        // Less then 5Kb will be loaded as content,
                        maxSize: 5 * 1024,
                        // Anything greater then maxSize will be loaded as url wrapped in <img> tag.
                        urlWrapper: '<img src="{{ url }}">',
                    }
                }
            }
        ]
    }
}
```

This configuration converts html file resource to two possible objects `{ template: <file content> }` or `{ templateUrl: <link to emitted resource> }`. 

```javascript
/** @typedef { import(webpack/declarations/WebpackOptions).WebpackOptions } WebpackOptions */
/** @typedef { import(@such-code/content-url-loader).ContentUrlLoaderOptions } ContentUrlLoaderOptions */

/** @type WebpackOptions */
module.exports = {
    ...otherOptions,
    module: {
        rules: [
            {
                test: /\.html(\?.*)?$/i,
                use: {
                    loader: '@such-code/content-html-loader',
                    /** @type ContentUrlLoaderOptions */
                    options: {
                        // Less then 10Kb will be loaded as content wrapped as { template: string }.
                        maxSize: 10 * 1024,
                        contentWrapper: $ => '{ "template": ' + $ + '}',
                        // Anything greater then maxSize will be loaded as url wrapped as { templateUrl: string }.
                        urlWrapper: $ => '{ "templateUrl": ' + $ + '}',
                    }
                }
            }
        ]
    }
}
```
