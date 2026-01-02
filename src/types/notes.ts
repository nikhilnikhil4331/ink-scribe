export type HandwritingFont = 
  | 'caveat'
  | 'kalam'
  | 'patrick-hand'
  | 'shadows-into-light'
  | 'indie-flower'
  | 'dancing-script'
  | 'architects-daughter'
  | 'satisfy'
  | 'gloria-hallelujah'
  | 'covered-by-your-grace'
  | 'rock-salt'
  | 'reenie-beanie'
  | 'homemade-apple'
  | 'nothing-you-could-do'
  | 'cedarville-cursive'
  | 'la-belle-aurore';

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

export const FONT_OPTIONS: { value: HandwritingFont; label: string; className: string; category: string }[] = [
  // Casual & Natural
  { value: 'caveat', label: 'Caveat', className: 'font-handwriting-1', category: 'Casual' },
  { value: 'kalam', label: 'Kalam', className: 'font-handwriting-2', category: 'Casual' },
  { value: 'patrick-hand', label: 'Patrick Hand', className: 'font-handwriting-3', category: 'Casual' },
  { value: 'architects-daughter', label: 'Architects Daughter', className: 'font-handwriting-7', category: 'Casual' },
  { value: 'gloria-hallelujah', label: 'Gloria Hallelujah', className: 'font-handwriting-9', category: 'Casual' },
  // Messy & Authentic  
  { value: 'shadows-into-light', label: 'Shadows Into Light', className: 'font-handwriting-4', category: 'Messy' },
  { value: 'indie-flower', label: 'Indie Flower', className: 'font-handwriting-5', category: 'Messy' },
  { value: 'covered-by-your-grace', label: 'Covered By Your Grace', className: 'font-handwriting-10', category: 'Messy' },
  { value: 'reenie-beanie', label: 'Reenie Beanie', className: 'font-handwriting-12', category: 'Messy' },
  { value: 'rock-salt', label: 'Rock Salt', className: 'font-handwriting-11', category: 'Messy' },
  // Cursive & Elegant
  { value: 'dancing-script', label: 'Dancing Script', className: 'font-handwriting-6', category: 'Cursive' },
  { value: 'satisfy', label: 'Satisfy', className: 'font-handwriting-8', category: 'Cursive' },
  { value: 'homemade-apple', label: 'Homemade Apple', className: 'font-handwriting-13', category: 'Cursive' },
  { value: 'nothing-you-could-do', label: 'Nothing You Could Do', className: 'font-handwriting-14', category: 'Cursive' },
  { value: 'cedarville-cursive', label: 'Cedarville Cursive', className: 'font-handwriting-15', category: 'Cursive' },
  { value: 'la-belle-aurore', label: 'La Belle Aurore', className: 'font-handwriting-16', category: 'Cursive' },
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
