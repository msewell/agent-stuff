export type Held = readonly string[]

declare module 'claude-code' {
  interface PluginState {
    'pi-queue': { held: Held }
  }
}
