// Значение инжектируется при сборке через define в vite.config.js:
// версия из package.json, короткий хеш коммита git, время сборки,
// адрес репозитория (заполняется из GITHUB_REPOSITORY в CI).
const buildMeta = __BUILD_META__

export default buildMeta
