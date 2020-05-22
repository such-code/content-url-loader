/// <reference types="node" />
/**
 * Type definition for loader options.
 */
declare type LoaderOptionsBase = {
    /**
     * Return commonjs or es6 module.
     */
    esModule: boolean;
    /**
     * Maximal content size to be loaded as content.
     */
    maxSize: number;
    /**
     * Name of the resource is loaded as an URL.
     */
    name: string;
    /**
     * Additional name regexp to be referenced in name.
     */
    nameRegExp: RegExp;
};
export declare type LoaderOptionsWrapper = string | (($content: string) => string);
export declare type LoaderOptionsSerializer = 'string' | 'base64' | (($content: Buffer) => string);
/**
 * Type definition for loader options.
 */
export declare type ContentUrlLoaderOptions = {
    /**
     * Optional function to force load either as URL or as a content. `true` to load as URL, `false` for content loading
     * `null` for auto mode.
     */
    loadAsUrl?: (($target: string, $resource: string, $context: string) => (boolean | null));
    /**
     * Optional function or string to wrap emitted URL. If string is provided, `{{url}}` parameter will be replaced in
     * it. Ex. `<img src="{{url}}">` will return HTML element. Function MUST return valid JS code that will be evaluated
     * at runtime. Function argument is a value with JSON.stringify() applied to it.
     */
    urlWrapper?: LoaderOptionsWrapper;
    /**
     * Optional function or string to wrap content. String should contain `{{content}}` which will be replaced. Ex
     * `<span>{{content}}</span>` will return HTML element with a content. Function MUST return valid JS code that will
     * be evaluated.
     */
    contentWrapper?: LoaderOptionsWrapper;
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
    serialize?: LoaderOptionsSerializer;
} & Partial<LoaderOptionsBase>;
export {};
//# sourceMappingURL=index.d.ts.map