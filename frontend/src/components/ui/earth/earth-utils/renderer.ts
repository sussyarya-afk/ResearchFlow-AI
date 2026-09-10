/**
 * Minimal placeholder renderer for the Earth component.
 * Replace with the real implementation when available.
 */

export interface Renderer {
  ready: Promise<void>;
  dispose(): void;
}

export function createRenderer(opts: { canvas: HTMLCanvasElement }): Renderer {
  const ctx = opts.canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, opts.canvas.width, opts.canvas.height);
  }
  return {
    ready: Promise.resolve(),
    dispose() {
      // No ongoing animation in the stub.
    },
  };
}
