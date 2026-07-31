declare module "takumi-js" {
  import type { ReactNode } from "react";

  interface RenderOptions {
    width: number;
    height: number;
    format?: "raw" | "png" | "jpeg";
    fonts?: unknown[];
  }

  export function render(node: ReactNode, options: RenderOptions): Promise<Buffer>;
}

declare module "takumi-js/helpers" {
  interface GoogleFont {
    name: string;
    weight?: string;
    style?: string;
  }

  export function googleFonts(fonts: GoogleFont[]): unknown[];
}
