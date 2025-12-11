import {
  Inter,
  Lusitana,
  Noto_Serif,
  Noto_Sans_Georgian,
  JetBrains_Mono,
} from "next/font/google";

export const inter = Inter({ subsets: ["latin"] });

export const lusitana = Lusitana({
  weight: ["400", "700"],
  subsets: ["latin"],
});
export const serif = Noto_Serif({ subsets: ["latin"] });
export const georgian = Noto_Sans_Georgian({ subsets: ["latin"] });
export const JetBrain = JetBrains_Mono({ subsets: ["latin"] });
export const system = {
  system:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Inconsolata, "Roboto Mono", monospace',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
};
