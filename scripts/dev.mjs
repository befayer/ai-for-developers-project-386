import { spawn } from 'node:child_process'

const processes = [
  spawn('npx', ['tsx', 'watch', 'server/index.ts'], { stdio: 'inherit', shell: true }),
  spawn('npx', ['vite'], { stdio: 'inherit', shell: true }),
]

const stop = () => {
  for (const process of processes) process.kill('SIGTERM')
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)

for (const child of processes) {
  child.on('exit', (code) => {
    if (code && code !== 0) {
      stop()
      process.exit(code)
    }
  })
}
