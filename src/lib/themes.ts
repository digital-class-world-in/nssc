
export type Theme = {
  name: string;
  cssVariables: {
    '--primary': string;
    '--secondary': string;
    '--accent': string;
    '--destructive': string;
  };
};

export const fonts = [
    { name: 'Default', value: 'var(--font-montserrat)' },
    { name: 'Inter', value: 'var(--font-inter)' },
    { name: 'Source Code Pro', value: 'var(--font-source-code-pro)' },
    { name: 'Space Mono', value: 'var(--font-space-mono)' },
    { name: 'Work Sans', value: 'var(--font-work-sans)' },
]

export const themes: Theme[] = [
  {
    name: 'Default Teal',
    cssVariables: {
      '--primary': '178 63% 46%', // #2FBDB7
      '--secondary': '178 65% 39%', // #26A59F
      '--accent': '140 50% 52%', // #3FBF6B
      '--destructive': '2 70% 54%', // #D9534F
    },
  },
  {
    name: 'Midnight Blue',
    cssVariables: {
      '--primary': '221 44% 41%', // #3A5F9F
      '--secondary': '218 30% 53%', // #627A9E
      '--accent': '265 63% 60%', // #7C60DE
      '--destructive': '351 79% 54%', // #E84C55
    },
  },
  {
    name: 'Forest Green',
    cssVariables: {
      '--primary': '120 39% 44%', // #4C914C
      '--secondary': '120 25% 60%', // #80B380
      '--accent': '45 88% 60%', // #F7C35B
      '--destructive': '0 72% 51%', // #E63946
    },
  },
  {
    name: 'Sunrise Orange',
    cssVariables: {
      '--primary': '24 94% 52%', // #F77F00
      '--secondary': '13 95% 62%', // #F99837
      '--accent': '197 100% 43%', // #00A6FB
      '--destructive': '340 82% 52%', // #E63984
    },
  },
  {
    name: 'Royal Purple',
    cssVariables: {
      '--primary': '265 47% 49%', // #6A4C9C
      '--secondary': '265 35% 62%', // #8874A7
      '--accent': '320 78% 65%', // #E573C4
      '--destructive': '0 100% 67%', // #FF5959
    },
  },
  {
    name: 'Crimson Red',
    cssVariables: {
      '--primary': '350 78% 52%', // #E63946
      '--secondary': '350 60% 65%', // #ED6B75
      '--accent': '204 90% 55%', // #45A2F3
      '--destructive': '2 70% 54%', // #D9534F
    }
  },
  {
    name: 'Ocean Blue',
    cssVariables: {
        '--primary': '207 90% 54%', // #2196F3
        '--secondary': '207 70% 65%', // #5CACEE
        '--accent': '170 50% 50%', // #40C080
        '--destructive': '0 80% 60%', // #F34444
    }
  },
  {
    name: 'Charcoal Slate',
    cssVariables: {
        '--primary': '210 9% 31%', // #4A5568
        '--secondary': '210 10% 45%', // #6A7587
        '--accent': '25 80% 55%', // #F0A04B
        '--destructive': '0 65% 55%', // #E04B4B
    }
  }
];
