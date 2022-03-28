import pathToRegexp from 'path-to-regexp';

const cache = {};
const cacheLimit: number = 10000;
let cacheCount = 0;

interface CompileOptions {
  end?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

function compilePath(path: string, options: CompileOptions) {
  const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
  const pathCache = cache[cacheKey] || (cache[cacheKey] = {});

  if (pathCache[path]) return pathCache[path];

  const keys = [];
  const regexp = pathToRegexp(path, keys, options);
  const result = { regexp, keys };

  if (cacheCount < cacheLimit) {
    pathCache[path] = result;
    cacheCount++;
  }

  return result;
}

interface MatchOptions {
  path?: string | string[];
  end?: boolean;
  exact?: boolean;
  strict?: boolean;
  sensitive?: boolean;
}

type Options = MatchOptions | string | string[];

interface PathParams {
  [name: string]: any;
}

export interface matchPathValues {
  path: string;
  url: string;
  isExact: boolean;
  params: PathParams;
}

function matchPath(pathname: string, options: Options = {}): matchPathValues {
  if (typeof options === 'string' || Array.isArray(options)) {
    options = { path: options };
  }

  const {
    path,
    end,
    exact = false,
    strict = false,
    sensitive = false,
  } = options;

  const paths = [].concat(path);

  return paths.reduce((matched, path) => {
    if (!path && path !== '') return null;
    if (matched) return matched;

    const { regexp, keys } = compilePath(path, {
      end: end || exact,
      strict,
      sensitive,
    });
    const match = regexp.exec(pathname);

    if (!match) return null;

    const [url, ...values] = match;
    const isExact = pathname === url;

    if (exact && !isExact) return null;

    return {
      path,
      url: path === '/' && url === '' ? '/' : url,
      isExact,
      params: keys.reduce((memo, key, index) => {
        memo[key.name] = values[index];
        return memo;
      }, {}),
    };
  }, null);
}

export default matchPath;
