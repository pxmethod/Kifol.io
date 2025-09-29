import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-inter-tight)", "Inter Tight", "sans-serif"],
        tight: ["var(--font-inter-tight)", "Inter Tight", "sans-serif"],
      },
      fontSize: {
        'xs': '0.75rem',    /* 12px */
        'sm': '0.875rem',   /* 14px */
        'base': '1rem',     /* 16px */
        'lg': '1.125rem',   /* 18px */
        'xl': '1.25rem',    /* 20px */
        '2xl': '1.5rem',    /* 24px */
        '3xl': '1.875rem',  /* 30px */
        '4xl': '2.25rem',   /* 36px */
      },
      colors: {
        // Discovery Template Color System (for marketing website)
        discovery: {
          // Primary brand colors
          primary: "#00664e",      // Main green
          "primary-light": "#008a6b", // Lighter green for hovers
          "primary-dark": "#004d3a",  // Darker green for active states
          black: "#1b1b1b",        // Main black
          grey: "#2e2e2e",         // Main grey
          yellow: "#ffe549",       // Main yellow
          "yellow-dark": "#dabe16", // Darker yellow for hovers
          orange: "#ff5938",       // Main orange
          "orange-light": "#ff7a59", // Lighter orange for hovers
          "orange-dark": "#e55a2b", // Darker orange for active states
          
          // Blue palette
          blue: {
            100: "#9fdbcd",        // Light teal-blue
            200: "#7fc0b1",        // Medium teal-blue
            900: "#385f56",        // Dark teal-green
          },
          
          // Beige palette
          beige: {
            100: "#f6f5f3",        // Very light beige
            200: "#fcf9eb",        // Light beige
            300: "#dfd6d2",        // Medium beige
            800: "#747271",        // Dark beige
            900: "#625e5b",        // Darkest beige
          },
          
          // White variations
          white: {
            100: "#ffffff",        // Pure white
            80: "#ffffffcc",       // 80% opacity
            40: "#ffffff66",       // 40% opacity
          },
          
          // Grey palette
          gray: {
            400: "#3c3c3fb3",      // Medium grey with transparency
            600: "#363636",         // Dark grey
            700: "#7d7d88",         // Medium warm grey
          },
        },
        
        // Kifolio App Color System (for application)
        kifolio: {
          bg: "#f0f8f6",           // Light green background
          header: "#1a5f5f",       // Dark teal header
          cta: "#ff6b35",          // Orange CTA
          text: "#2d5a5a",         // Dark teal text
          primary: "#ff6b35",      // Primary orange
          "primary-dark": "#e55a2b", // Darker orange
          "primary-hover": "rgba(255, 107, 53, 0.9)", // Orange hover
          "primary-light": "rgba(255, 107, 53, 0.1)", // Light orange
        },
        
        // Shared color system (common colors used across both)
        shared: {
          white: "#ffffff",        // Pure white
          black: "#1b1b1b",        // Pure black
          gray: {
            50: "#f9fafb",         // Very light gray
            100: "#f3f4f6",        // Light gray
            200: "#e5e7eb",        // Lighter gray
            300: "#d1d5db",        // Light gray
            400: "#9ca3af",        // Medium gray
            500: "#6b7280",        // Gray
            600: "#4b5563",        // Dark gray
            700: "#374151",        // Darker gray
            800: "#1f2937",        // Very dark gray
            900: "#111827",        // Darkest gray
          },
        },
        
        // Status colors (consistent across both systems)
        success: {
          DEFAULT: "#16a34a",
          light: "rgba(22, 163, 74, 0.1)",
        },
        danger: {
          DEFAULT: "#dc2626",
          light: "rgba(220, 38, 38, 0.1)",
        },
        warning: "#f59e0b",
        info: "#3b82f6",
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        // Custom spacing to match CSS variables
        '0': '0',
        '1': '0.25rem',   // 4px
        '2': '0.5rem',    // 8px
        '3': '0.75rem',   // 12px
        '4': '1rem',      // 16px
        '5': '1.25rem',   // 20px
        '6': '1.5rem',    // 24px
        '8': '2rem',      // 32px
        '10': '2.5rem',   // 40px
        '12': '3rem',     // 48px
        '16': '4rem',     // 64px
        '20': '5rem',     // 80px
        '24': '6rem',     // 96px
      },
      boxShadow: {
        'kifolio': '0 4px 6px -1px rgba(255, 107, 53, 0.1), 0 2px 4px -1px rgba(255, 107, 53, 0.06)',
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',    // 6px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
        'full': '9999px',
        'pill': '9rem',      // 144px - fully rounded pill shape
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
        'bold': '700',
      },
      lineHeight: {
        'tight': '1.25',
        'normal': '1.5',
        'relaxed': '1.75',
      },
      zIndex: {
        'dropdown': '99999',
        'modal': '100000',
        'popover': '100001',
        'tooltip': '100002',
        'toast': '100003',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-in-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(1rem)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [],
};

export default config; 