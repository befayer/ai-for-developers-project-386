declare module 'uri-template' {
  export function parse(template: string): {
    expand(values: Record<string, unknown>): string
  }
}
