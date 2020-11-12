"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const loaderUtils = require("loader-utils");
const defaultLoaderOptions = {
    esModule: false,
    maxSize: 5120,
    name: '[contenthash].[ext]',
    nameRegExp: null,
};
function areValidContentUrlLoaderOptions($value) {
    return typeof $value === 'object'
        && $value !== null
        && (typeof $value.esModule === 'boolean' || !('esModule' in $value))
        && (typeof $value.maxSize === 'number' || !('maxSize' in $value))
        && (typeof $value.name === 'string' || !('name' in $value))
        && ($value.nameRegExp instanceof RegExp || !('nameRegExp' in $value))
        && (typeof $value.outputPath === 'string' || typeof $value.outputPath === 'function' || !('outputPath' in $value))
        && (typeof $value.publicPath === 'string' || typeof $value.publicPath === 'function' || !('publicPath' in $value));
}
function serializerString($content) {
    return $content.toString('utf-8');
}
function serializerBase64($content) {
    return $content.toString('base64');
}
function normalizeSerializer($serializer) {
    if (typeof $serializer === 'function') {
        return $serializer;
    }
    else if ($serializer === 'base64') {
        return serializerBase64;
    }
    return serializerString;
}
function stringToWrapper($string, $variable) {
    const expression = new RegExp(`{{\s*${$variable}\s*}}`, 'gi');
    return function ($, ...ignore) {
        const [beginning, ending] = $string.split(expression, 2);
        return `${JSON.stringify(beginning)} + ${$} + ${JSON.stringify(ending)}`;
    };
}
function normalizePath($path) {
    return $path.endsWith('/') ? $path : $path + '/';
}
function normalizeContentWrapper($variable, $wrapper) {
    if (typeof $wrapper === 'function') {
        return $wrapper;
    }
    else if (typeof $wrapper === 'string') {
        return stringToWrapper($wrapper, $variable);
    }
    return function ($) { return $; };
}
const loader = function ($source, $sourceMap, $meta) {
    const loaderOptions = loaderUtils.getOptions(this);
    if (loaderOptions === undefined || loaderOptions === null || areValidContentUrlLoaderOptions(loaderOptions)) {
        const options = Object.assign(Object.assign({}, defaultLoaderOptions), loaderOptions);
        const moduleContentStart = options.esModule ? 'export default ' : 'module.exports = ';
        const targetUrl = loaderUtils.interpolateName(this, options.name, {
            context: this.rootContext,
            content: $source,
            regExp: options.nameRegExp,
        });
        const loadAsUrl = typeof options.loadAsUrl === 'function'
            ? options.loadAsUrl(targetUrl, this.resourcePath, this.rootContext, this.resourceQuery)
            : null;
        if (loadAsUrl === true || (loadAsUrl !== false && $source.length > options.maxSize)) {
            const targetPath = typeof options.outputPath === 'function'
                ? options.outputPath(targetUrl, this.resourcePath, this.rootContext)
                : typeof options.outputPath === 'string'
                    ? path.posix.join(options.outputPath, targetUrl)
                    : targetUrl;
            this.emitFile(targetPath, $source, $sourceMap);
            const wrapper = normalizeContentWrapper('url', options.urlWrapper);
            if (typeof options.publicPath === 'function') {
                return moduleContentStart + wrapper(JSON.stringify(options.publicPath(targetUrl, this.resourcePath, this.rootContext) + targetPath), this.resourcePath, this.rootContext, this.resourceQuery);
            }
            else if (typeof options.publicPath === 'string') {
                return moduleContentStart + wrapper(JSON.stringify(normalizePath(options.publicPath) + targetPath), this.resourcePath, this.rootContext, this.resourceQuery);
            }
            return moduleContentStart + wrapper('__webpack_public_path__ + ' + JSON.stringify(targetPath), this.resourcePath, this.rootContext, this.resourceQuery);
        }
        else {
            const serializedContent = JSON.stringify(normalizeSerializer(options.serialize)($source));
            return moduleContentStart + normalizeContentWrapper('content', options.contentWrapper)(serializedContent, this.resourcePath, this.rootContext, this.resourceQuery);
        }
    }
    else {
        // TODO: Check what exactly is wrong.
        this.emitError(Error('Loader options are configured incorrectly.'));
    }
    return $source;
};
loader.raw = true;
module.exports = loader;
//# sourceMappingURL=index.js.map