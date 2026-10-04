import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const tspOutput = join(root, 'tsp-output')
const openApiSource = join(tspOutput, '@typespec', 'openapi3', 'openapi.yaml')
const openApiTarget = join(root, 'docs', 'openapi', 'openapi.yaml')
const clientSource = join(tspOutput, '@typespec', 'http-client-js', 'src')
const clientTarget = join(root, 'src', 'api', 'generated')
const executable = (name) => join(root, 'node_modules', '.bin', process.platform === 'win32' ? `${name}.cmd` : name)

const compile = spawnSync(executable('tsp'), ['compile', 'api/main.tsp'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if (compile.status !== 0) process.exit(compile.status ?? 1)

if (!existsSync(openApiSource) || !existsSync(clientSource)) {
  throw new Error('TypeSpec did not create all expected artifacts')
}

await mkdir(dirname(openApiTarget), { recursive: true })
await cp(openApiSource, openApiTarget)
await rm(clientTarget, { recursive: true, force: true })
await mkdir(clientTarget, { recursive: true })
await cp(clientSource, clientTarget, { recursive: true })
await writeFile(join(clientTarget, 'README.md'), '# Generated API client\n\nCreated from `api/main.tsp` by `npm run api:generate`. Do not edit manually.\n')

await mkdir(join(root, 'server', 'generated'), { recursive: true })
const serverTypes = spawnSync(executable('openapi-typescript'), [openApiTarget, '-o', 'server/generated/api-types.ts'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
})
if (serverTypes.status !== 0) process.exit(serverTypes.status ?? 1)

