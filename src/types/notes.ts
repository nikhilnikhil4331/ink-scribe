export type HandwritingFont = 
  | 'caveat'
  | 'kalam'
  | 'patrick-hand'
  | 'shadows-into-light'
  | 'indie-flower'
  | 'dancing-script';

export type PageStyle = 'plain' | 'ruled' | 'single-line';

export type InkColor = 'blue' | 'black';

export interface PageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HeaderFooter {
  name: string;
  rollNo: string;
  subject: string;
  showHeader: boolean;
  showFooter: boolean;
  showPageNumber: boolean;
}

export interface NoteSettings {
  font: HandwritingFont;
  fontSize: number;
  lineSpacing: number;
  wordSpacing: number;
  pageStyle: PageStyle;
  inkColor: InkColor;
  margins: PageMargins;
  headerFooter: HeaderFooter;
  baselineJitter: boolean;
  strokeRandomness: boolean;
}

export const DEFAULT_SETTINGS: NoteSettings = {
  font: 'caveat',
  fontSize: 24,
  lineSpacing: 32,
  wordSpacing: 4,
  pageStyle: 'ruled',
  inkColor: 'blue',
  margins: {
    top: 40,
    right: 30,
    bottom: 40,
    left: 50,
  },
  headerFooter: {
    name: '',
    rollNo: '',
    subject: '',
    showHeader: true,
    showFooter: false,
    showPageNumber: true,
  },
  baselineJitter: true,
  strokeRandomness: true,
};

export const FONT_OPTIONS: { value: HandwritingFont; label: string; className: string }[] = [
  { value: 'caveat', label: 'Caveat', className: 'font-handwriting-1' },
  { value: 'kalam', label: 'Kalam', className: 'font-handwriting-2' },
  { value: 'patrick-hand', label: 'Patrick Hand', className: 'font-handwriting-3' },
  { value: 'shadows-into-light', label: 'Shadows Into Light', className: 'font-handwriting-4' },
  { value: 'indie-flower', label: 'Indie Flower', className: 'font-handwriting-5' },
  { value: 'dancing-script', label: 'Dancing Script', className: 'font-handwriting-6' },
];

export const PAGE_STYLE_OPTIONS: { value: PageStyle; label: string }[] = [
  { value: 'plain', label: 'Plain' },
  { value: 'ruled', label: 'Ruled' },
  { value: 'single-line', label: 'Single Line' },
];

export const INK_COLOR_OPTIONS: { value: InkColor; label: string }[] = [
  { value: 'blue', label: 'Blue Ink' },
  { value: 'black', label: 'Black Ink' },
];
