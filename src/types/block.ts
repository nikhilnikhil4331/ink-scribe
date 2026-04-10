export type BlockType =
  | 'text'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bullet'
  | 'numbered'
  | 'todo'
  | 'quote'
  | 'callout'
  | 'divider'
  | 'code';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // for todo blocks
  color?: string;
  indent?: number;
}

export const generateBlockId = (): string =>
  `block-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

export const createBlock = (type: BlockType = 'text', content = ''): Block => ({
  id: generateBlockId(),
  type,
  content,
});

export interface SlashCommand {
  id: BlockType;
  label: string;
  description: string;
  icon: string;
  shortcut?: string;
}

export const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'text', label: 'Text', description: 'Plain text block', icon: '📝' },
  { id: 'heading1', label: 'Heading 1', description: 'Large section heading', icon: 'H₁', shortcut: '#' },
  { id: 'heading2', label: 'Heading 2', description: 'Medium section heading', icon: 'H₂', shortcut: '##' },
  { id: 'heading3', label: 'Heading 3', description: 'Small section heading', icon: 'H₃', shortcut: '###' },
  { id: 'bullet', label: 'Bullet List', description: 'Unordered list item', icon: '•', shortcut: '-' },
  { id: 'numbered', label: 'Numbered List', description: 'Ordered list item', icon: '1.', shortcut: '1.' },
  { id: 'todo', label: 'To-do', description: 'Checkbox item', icon: '☐', shortcut: '[]' },
  { id: 'quote', label: 'Quote', description: 'Block quote', icon: '❝', shortcut: '>' },
  { id: 'callout', label: 'Callout', description: 'Highlighted callout box', icon: '💡' },
  { id: 'divider', label: 'Divider', description: 'Horizontal rule', icon: '—', shortcut: '---' },
  { id: 'code', label: 'Code', description: 'Code block', icon: '<>' },
];

// Detect prefix shortcuts typed at the start of a line
export const detectBlockPrefix = (text: string): { type: BlockType; remaining: string } | null => {
  if (text.startsWith('### ')) return { type: 'heading3', remaining: text.slice(4) };
  if (text.startsWith('## ')) return { type: 'heading2', remaining: text.slice(3) };
  if (text.startsWith('# ')) return { type: 'heading1', remaining: text.slice(2) };
  if (text.startsWith('- ') || text.startsWith('* ')) return { type: 'bullet', remaining: text.slice(2) };
  if (/^\d+\.\s/.test(text)) return { type: 'numbered', remaining: text.replace(/^\d+\.\s/, '') };
  if (text.startsWith('[] ') || text.startsWith('[ ] ')) {
    const remaining = text.startsWith('[] ') ? text.slice(3) : text.slice(4);
    return { type: 'todo', remaining };
  }
  if (text.startsWith('[x] ') || text.startsWith('[X] ')) return { type: 'todo', remaining: text.slice(4) };
  if (text.startsWith('> ')) return { type: 'quote', remaining: text.slice(2) };
  if (text === '---' || text === '***') return { type: 'divider', remaining: '' };
  return null;
};
