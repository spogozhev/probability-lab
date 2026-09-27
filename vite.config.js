import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import pkg from './package.json'

// Базовый путь можно переопределить переменной VITE_BASE (например, в CI для GitHub Pages),
// по умолчанию приложение живёт в /probability-lab/

// Метаданные сборки: версия из package.json, коммит git и время сборки.
// Они показываются в футере сайта и пишутся в dist/version.json — так видно,
// какая версия развернута на удалённом сервере и собрана ли она из свежего кода.
function gitRepoUrl() {
  if (process.env.GITHUB_REPOSITORY) {
    return `https://github.com/${process.env.GITHUB_REPOSITORY}`
  }
  try {
    const url = execSync('git remote get-url origin').toString().trim()
    const m = url.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/)
    return m ? `https://github.com/${m[1]}` : null
  } catch {
    return null
  }
}

function buildMeta() {
  let commit = 'unknown'
  let branch = 'local'
  try {
    commit = execSync('git rev-parse --short HEAD').toString().trim()
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
  } catch {
    // вне git-репозитория (например, до первого push) — оставляем заглушки
  }
  return {
    version: pkg.version,
    commit,
    branch,
    builtAt: new Date().toISOString(),
    repoUrl: gitRepoUrl(),
  }
}

const meta = buildMeta()

// Кладёт в корень сборки машиночитаемую запись о версии:
// curl -s https://<сайт>/version.json  и сравнить commit с `git rev-parse HEAD`
function versionJsonPlugin() {
  return {
    name: 'version-json',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify(meta, null, 2) + '\n',
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), versionJsonPlugin()],
  base: process.env.VITE_BASE || '/probability-lab/',
  define: {
    __BUILD_META__: JSON.stringify(meta),
  },
})
