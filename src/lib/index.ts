import * as path from 'path';
import * as webpack from 'webpack';
import * as loaderUtils from 'loader-utils';
import { RawSourceMap } from 'source-map';

/**
 * Type definition for loader options.
 */
type LoaderOptionsBase = {
    /**
     * Return commonjs or es6 module.
     */
    esModule: boolean,
    /**
     * Maximal content size to be loaded as content.
     */
    maxSize: number,
    /**
     * Name of the resource is loaded as an URL.
     */
    name: string,
    /**
     * Additional name regexp to be referenced in name.
     */
    nameRegExp: RegExp,
}

const defaultLoaderOptions: LoaderOptionsBase = {
    esModule: false,
    maxSize: 5120,
    name: '[contenthash].[ext]',
    nameRegExp: null,
}

export type LoaderOptionsWrapper = string | (($content: string) => string);

export type LoaderOptionsSerializer = 'string' | 'base64' | (($content: Buffer) => string);

/**
 * Type definition for loader options.
 */
export type ContentUrlLoaderOptions = {
    /**
     * Optional function to force load either as URL or as a content. `true` to load as URL, `false` for content loading
     * `null` for auto mode.
     */
    loadAsUrl?: (($target: string, $resource: string, $context: string, $query: string) => (boolean | null)),
    /**
     * Optional function or string to wrap emitted URL. If string is provided, `{{url}}` parameter will be replaced in
     * it. Ex. `<img src="{{url}}">` will return HTML element. Function MUST return valid JS code that will be evaluated
     * at runtime. Function argument is a value with JSON.stringify() applied to it.
     */
    urlWrapper?: LoaderOptionsWrapper,
    /**
     * Optional function or string to wrap content. String should contain `{{content}}` which will be replaced. Ex
     * `<span>{{content}}</span>` will return HTML element with a content. Function MUST return valid JS code that will
     * be evaluated.
     */
    contentWrapper?: LoaderOptionsWrapper,
    /**
     * Custom path when resource is treated as an URL.
     */
    outputPath?: string | (($target: string, $resource: string, $context: string) => string),
    /**
     * Custom public path for resource when loaded as an URL.
     */
    publicPath?: string | (($target: string, $resource: string, $context: string) => string),
    /**
     * Serialization method. By default content smaller than maxSize will be serialized to string with utf-8 encoding.
     * This behaviour could be overwritten by setting `serialize` param.
     */
    serialize?: LoaderOptionsSerializer,
} & Partial<LoaderOptionsBase>;

function areValidContentUrlLoaderOptions($value: any): $value is ContentUrlLoaderOptions {
    return typeof $value === 'object'
        && $value !== null
        && (typeof $value.esModule === 'boolean' || !('esModule' in $value))
        && (typeof $value.maxSize === 'number' || !('maxSize' in $value))
        && (typeof $value.name === 'string' || !('name' in $value))
        && ($value.nameRegExp instanceof RegExp || !('nameRegExp' in $value))
        && (typeof $value.outputPath === 'string' || typeof $value.outputPath === 'function' || !('outputPath' in $value))
        && (typeof $value.publicPath === 'string' || typeof $value.publicPath === 'function' || !('publicPath' in $value));
}

function serializerString($content: Buffer): string {
    return $content.toString('utf-8');
}

function serializerBase64($content: Buffer): string {
    return $content.toString('base64');
}

function normalizeSerializer($serializer: LoaderOptionsSerializer): (($content: Buffer) => string) {
    if (typeof $serializer === 'function') {
        return $serializer;
    } else if ($serializer === 'base64') {
        return serializerBase64;
    }
    return serializerString;
}

function stringToWrapper($string: string, $variable: string): (($: string) => string) {
    const expression = new RegExp(`{{\s*${$variable}\s*}}`, 'gi');
    return function ($: string): string {
        const [beginning, ending] = $string.split(expression, 2);
        return `${JSON.stringify(beginning)} + ${$} + ${JSON.stringify(ending)}`;
    }
}

function normalizePath($path: string): string {
    return $path.endsWith('/') ? $path : $path + '/';
}

function normalizeContentWrapper($variable: string, $wrapper?: LoaderOptionsWrapper): (($content: string) => string) {
    if (typeof $wrapper === 'function') {
        return $wrapper;
    } else if (typeof $wrapper === 'string') {
        return stringToWrapper($wrapper, $variable);
    }
    return function($) { return $; }
}

const loader = <webpack.loader.Loader>function(
    $source: Buffer,
    $sourceMap?: RawSourceMap,
    $meta?: any
) {
    const loaderOptions = loaderUtils.getOptions(this);

    if (loaderOptions === undefined || loaderOptions === null || areValidContentUrlLoaderOptions(loaderOptions)) {
        const options: ContentUrlLoaderOptions & LoaderOptionsBase = {
            ...defaultLoaderOptions,
            ...loaderOptions,
        };

        const moduleContentStart = options.esModule ? 'export default ' : 'module.exports = ';
        const targetUrl = loaderUtils.interpolateName(
            this,
            options.name,
            {
                context: this.rootContext,
                content: $source,
                regExp: options.nameRegExp,
            }
        );
        const loadAsUrl: boolean | null = typeof options.loadAsUrl === 'function'
            ? options.loadAsUrl(targetUrl, this.resourcePath, this.rootContext, this.resourceQuery)
            : null;

        if (loadAsUrl === true || (loadAsUrl !== false && $source.length > options.maxSize)) {
            const targetPath: string = typeof options.outputPath === 'function'
                ? options.outputPath(targetUrl, this.resourcePath, this.rootContext)
                : typeof options.outputPath === 'string'
                    ? path.posix.join(options.outputPath, targetUrl)
                    : targetUrl;

            this.emitFile(targetPath, $source, $sourceMap);

            const wrapper = normalizeContentWrapper('url', options.urlWrapper);

            if (typeof options.publicPath === 'function') {
                return moduleContentStart + wrapper(
                    JSON.stringify(options.publicPath(targetUrl, this.resourcePath, this.rootContext) + targetPath)
                );
            } else if (typeof options.publicPath === 'string') {
                return moduleContentStart + wrapper(
                    JSON.stringify(normalizePath(options.publicPath) + targetPath)
                );
            }

            return moduleContentStart + wrapper('__webpack_public_path__ + ' + JSON.stringify(targetPath));
        } else {
            const serializedContent = JSON.stringify(normalizeSerializer(options.serialize)($source));
            return moduleContentStart + normalizeContentWrapper('content', options.contentWrapper)(serializedContent);
        }
    } else {
        // TODO: Check what exactly is wrong.
        this.emitError(Error('Loader options are configured incorrectly.'));
    }

    return $source;
}

loader.raw = true;

module.exports = loader;
