import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { parse } from 'yaml'
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


// Request validation schemas: the server and the forms use exactly what the contract declares.
const openApi = parse(await readFile(openApiTarget, 'utf8'))
const resolve = (node) => {
  if (Array.isArray(node)) return node.map(resolve)
  if (!node || typeof node !== 'object') return node
  if (typeof node.$ref === 'string') {
    const target = node.$ref.replace('#/', '').split('/').reduce((value, key) => value[key], openApi)
    return resolve(target)
  }
  return Object.fromEntries(Object.entries(node).map(([key, value]) => [key, resolve(value)]))
}

const requestSchemas = {}
for (const [path, item] of Object.entries(openApi.paths)) {
  for (const [method, operation] of Object.entries(item)) {
    const parts = {}
    const body = operation.requestBody?.content?.['application/json']?.schema
    if (body) parts.body = resolve(body)
    for (const location of ['path', 'query']) {
      const parameters = (operation.parameters ?? []).map(resolve).filter((parameter) => parameter.in === location)
      if (parameters.length === 0) continue
      parts[location === 'path' ? 'params' : 'querystring'] = {
        type: 'object',
        required: parameters.filter((parameter) => parameter.required).map((parameter) => parameter.name),
        properties: Object.fromEntries(parameters.map((parameter) => [parameter.name, parameter.schema])),
      }
    }
    requestSchemas[operation.operationId] = { method: method.toUpperCase(), path, ...parts }
  }
}

const schemasModule = `// Generated from docs/openapi/openapi.yaml by \`npm run api:generate\`. Do not edit manually.

export const schemas = ${JSON.stringify(resolve(openApi.components.schemas), null, 2)} as const

export const requestSchemas = ${JSON.stringify(requestSchemas, null, 2)} as const
`
await writeFile(join(root, 'server', 'generated', 'schemas.ts'), schemasModule)
await writeFile(join(clientTarget, 'schemas.ts'), schemasModule)
