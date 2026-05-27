var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fetchBricksetApi } from '@brickset-api/fetch';
export class InMemoryBricksetClientCache {
    constructor() {
        this.map = new Map();
    }
    get(key) {
        return this.map.get(key);
    }
    set(key, value) {
        this.map.set(key, value);
    }
}
export class BricksetApiClient {
    constructor(options = {}) {
        var _a, _b;
        this.defaultOptions = (_a = options.defaultOptions) !== null && _a !== void 0 ? _a : {};
        this.middlewares = (_b = options.middlewares) !== null && _b !== void 0 ? _b : [];
        this.cache = options.cache;
    }
    request(endpoint, options) {
        return __awaiter(this, void 0, void 0, function* () {
            const mergedOptions = Object.assign(Object.assign({}, this.defaultOptions), options);
            const request = {
                endpoint,
                options: mergedOptions,
            };
            const cacheKey = this.createCacheKey(request);
            if (this.cache) {
                const cached = this.cache.get(cacheKey);
                if (cached !== undefined) {
                    return cached;
                }
            }
            const result = yield this.runMiddlewares(request, (_a) => __awaiter(this, [_a], void 0, function* ({ endpoint: currentEndpoint, options: currentOptions }) { return fetchBricksetApi(currentEndpoint, currentOptions); }));
            if (this.cache) {
                this.cache.set(cacheKey, result);
            }
            return result;
        });
    }
    runMiddlewares(request, last) {
        const chain = this.middlewares.reduceRight((next, middleware) => {
            return (currentRequest) => middleware(currentRequest, next);
        }, last);
        return chain(request);
    }
    createCacheKey(request) {
        return JSON.stringify({
            endpoint: request.endpoint,
            options: request.options,
        });
    }
}
