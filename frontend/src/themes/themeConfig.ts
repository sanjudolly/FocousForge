import { Theme } from '../types';

export interface ThemeConfig {
  id: Theme;
  name: string;
  tagline: string;
  // CSS variable values (for inline styles)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  // Tailwind gradient classes
  bgGradient: string;         // whole page
  heroGradient: string;
  cardGradient: string;
  primaryBtn: string;         // for bg-gradient-to-r
  primaryBtnHover: string;
  secondaryBtn: string;
  navbarClass: string;
  badge: string;
  ring: string;
  glow: string;
  // 3D scene
  particleColor: string;
  ambientColor: string;
  orbitColor: string;
  crystalColor: string;
  characterType: 'fairy' | 'warrior' | 'sage';
  environmentType: 'garden' | 'chamber' | 'universe';
  // Misc
  emoji: string;
}

export const THEMES: Record<Theme, ThemeConfig> = {

  // ─── FEMININE — Cherry Blossom × Midnight Plum ───────────────────────────
  // Deep berry-purple backgrounds, hot rose accents, warm gold highlights
  feminine: {
    id: 'feminine',
    name: 'Blossom',
    tagline: 'Elegant · Radiant · Unstoppable',
    primary: '#e11d8f',
    primaryLight: '#f472b6',
    primaryDark: '#9d1b6e',
    secondary: '#7c3aed',
    accent: '#fbbf24',
    bgGradient: 'from-[#1a0630] via-[#2d0a4e] to-[#1a0630]',
    heroGradient: 'from-[#2d0a4e]/90 via-[#4a0e6e]/70 to-[#1a0630]/90',
    cardGradient: 'from-[#2d0a4e]/60 via-[#4a0e6e]/40 to-[#3d0a5e]/60',
    primaryBtn: 'from-[#e11d8f] to-[#7c3aed]',
    primaryBtnHover: 'hover:from-[#ec4899] hover:to-[#8b5cf6]',
    secondaryBtn: 'border border-[#e11d8f]/50 text-[#f472b6] hover:bg-[#e11d8f]/10',
    navbarClass: 'from-[#1a0630]/95 to-[#2d0a4e]/95',
    badge: 'bg-[#e11d8f]/20 text-[#f9a8d4] border border-[#e11d8f]/30',
    ring: 'ring-[#e11d8f]',
    glow: 'shadow-[#e11d8f]/30',
    particleColor: '#f9a8d4',
    ambientColor: '#e11d8f',
    orbitColor: '#c084fc',
    crystalColor: '#f472b6',
    characterType: 'fairy',
    environmentType: 'garden',
    emoji: '🌸',
  },

  // ─── MASCULINE — Obsidian × Electric Teal ────────────────────────────────
  // True dark charcoal base, electric cyan-teal accent, amber energy
  masculine: {
    id: 'masculine',
    name: 'Apex',
    tagline: 'Focused · Relentless · Elite',
    primary: '#06b6d4',
    primaryLight: '#22d3ee',
    primaryDark: '#0e7490',
    secondary: '#f59e0b',
    accent: '#10b981',
    bgGradient: 'from-[#040d14] via-[#071a2c] to-[#040d14]',
    heroGradient: 'from-[#071a2c]/90 via-[#0c2744]/70 to-[#040d14]/90',
    cardGradient: 'from-[#071a2c]/60 via-[#0c2744]/40 to-[#071a2c]/60',
    primaryBtn: 'from-[#06b6d4] to-[#0891b2]',
    primaryBtnHover: 'hover:from-[#22d3ee] hover:to-[#06b6d4]',
    secondaryBtn: 'border border-[#06b6d4]/50 text-[#22d3ee] hover:bg-[#06b6d4]/10',
    navbarClass: 'from-[#040d14]/95 to-[#071a2c]/95',
    badge: 'bg-[#06b6d4]/20 text-[#67e8f9] border border-[#06b6d4]/30',
    ring: 'ring-[#06b6d4]',
    glow: 'shadow-[#06b6d4]/30',
    particleColor: '#22d3ee',
    ambientColor: '#06b6d4',
    orbitColor: '#f59e0b',
    crystalColor: '#06b6d4',
    characterType: 'warrior',
    environmentType: 'chamber',
    emoji: '⚡',
  },

  // ─── NEUTRAL — Deep Space Violet × Neon Lime ─────────────────────────────
  // Midnight indigo canvas, vivid lime-green accents, orange warmth
  neutral: {
    id: 'neutral',
    name: 'Zenith',
    tagline: 'Balanced · Universal · Powerful',
    primary: '#84cc16',
    primaryLight: '#a3e635',
    primaryDark: '#65a30d',
    secondary: '#f97316',
    accent: '#a78bfa',
    bgGradient: 'from-[#060618] via-[#0d0d2b] to-[#060618]',
    heroGradient: 'from-[#0d0d2b]/90 via-[#14143d]/70 to-[#060618]/90',
    cardGradient: 'from-[#0d0d2b]/60 via-[#14143d]/40 to-[#0d0d2b]/60',
    primaryBtn: 'from-[#84cc16] to-[#65a30d]',
    primaryBtnHover: 'hover:from-[#a3e635] hover:to-[#84cc16]',
    secondaryBtn: 'border border-[#84cc16]/50 text-[#a3e635] hover:bg-[#84cc16]/10',
    navbarClass: 'from-[#060618]/95 to-[#0d0d2b]/95',
    badge: 'bg-[#84cc16]/20 text-[#bef264] border border-[#84cc16]/30',
    ring: 'ring-[#84cc16]',
    glow: 'shadow-[#84cc16]/30',
    particleColor: '#a3e635',
    ambientColor: '#84cc16',
    orbitColor: '#f97316',
    crystalColor: '#84cc16',
    characterType: 'sage',
    environmentType: 'universe',
    emoji: '✨',
  },
};

export const getTheme = (theme: Theme): ThemeConfig => THEMES[theme];

// Category pill colors
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  coding:   { bg: 'bg-cyan-500/20',    text: 'text-cyan-300',    icon: '💻' },
  study:    { bg: 'bg-amber-500/20',   text: 'text-amber-300',   icon: '📚' },
  fitness:  { bg: 'bg-emerald-500/20', text: 'text-emerald-300', icon: '💪' },
  career:   { bg: 'bg-violet-500/20',  text: 'text-violet-300',  icon: '🚀' },
  personal: { bg: 'bg-rose-500/20',    text: 'text-rose-300',    icon: '🌟' },
  other:    { bg: 'bg-slate-500/20',   text: 'text-slate-300',   icon: '🎯' },
};

// Badge rarity gradients
export const RARITY_COLORS: Record<string, string> = {
  common:    'from-slate-400 to-slate-600',
  rare:      'from-cyan-400 to-blue-600',
  epic:      'from-violet-400 to-purple-600',
  legendary: 'from-amber-400 to-orange-500',
};
