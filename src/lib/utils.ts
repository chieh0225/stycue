import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Our globals.css @theme defines a custom semantic type scale (see DR-013:
// text-display-lg/headline-md/headline-sm/body-lg/body-md/label-md). Stock
// tailwind-merge doesn't know these names, so it can't tell they're font-size
// utilities — it falls back to lumping any unrecognized `text-*` class into
// the text-color group, which silently drops the size class whenever a call
// site also passes a `text-{color}` token (e.g. `text-foreground`) in the
// same cn() call. Registering them under the built-in `font-size` group fixes
// this without changing how real conflicts (two sizes, or two colors) dedupe.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display-lg', 'headline-md', 'headline-sm', 'body-lg', 'body-md', 'label-md'] },
      ],
    },
  },
});

// Standard shadcn class-merge helper: clsx resolves conditionals, tailwind-merge
// dedupes conflicting Tailwind utilities so later classes win.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
