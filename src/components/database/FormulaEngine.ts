// ============================================================
// NikNote 4.0 — Formula Engine for Database Properties
// Notion-style formulas with rollups and aggregations
// ============================================================

export type FormulaType = 'number' | 'text' | 'boolean' | 'date';

export interface FormulaProperty {
  id: string;
  name: string;
  expression: string;
  type: FormulaType;
  result?: string | number | boolean;
}

// Built-in formula functions
export const FORMULA_FUNCTIONS: Record<string, {
  description: string;
  syntax: string;
  returns: FormulaType;
  example: string;
}> = {
  // Math
  sum: { description: 'Sum of values', syntax: 'sum(prop)', returns: 'number', example: 'sum(Score)' },
  avg: { description: 'Average of values', syntax: 'avg(prop)', returns: 'number', example: 'avg(Score)' },
  min: { description: 'Minimum value', syntax: 'min(prop)', returns: 'number', example: 'min(Price)' },
  max: { description: 'Maximum value', syntax: 'max(prop)', returns: 'number', example: 'max(Price)' },
  count: { description: 'Count of items', syntax: 'count(prop)', returns: 'number', example: 'count(Tasks)' },
  abs: { description: 'Absolute value', syntax: 'abs(num)', returns: 'number', example: 'abs(-5)' },
  round: { description: 'Round to N decimals', syntax: 'round(num, N)', returns: 'number', example: 'round(3.14, 1)' },
  ceil: { description: 'Round up', syntax: 'ceil(num)', returns: 'number', example: 'ceil(3.1)' },
  floor: { description: 'Round down', syntax: 'floor(num)', returns: 'number', example: 'floor(3.9)' },
  
  // Text
  concat: { description: 'Join texts', syntax: 'concat(a, b, ...)', returns: 'text', example: 'concat(First, " ", Last)' },
  upper: { description: 'Uppercase', syntax: 'upper(text)', returns: 'text', example: 'upper(name)' },
  lower: { description: 'Lowercase', syntax: 'lower(text)', returns: 'text', example: 'lower(name)' },
  length: { description: 'Text length', syntax: 'length(text)', returns: 'number', example: 'length(name)' },
  contains: { description: 'Check if text contains', syntax: 'contains(text, search)', returns: 'boolean', example: 'contains(name, "test")' },
  
  // Logic
  if: { description: 'Conditional', syntax: 'if(cond, trueVal, falseVal)', returns: 'number', example: 'if(Score > 50, "Pass", "Fail")' },
  and: { description: 'Logical AND', syntax: 'and(a, b)', returns: 'boolean', example: 'and(a > 0, b > 0)' },
  or: { description: 'Logical OR', syntax: 'or(a, b)', returns: 'boolean', example: 'or(a > 0, b > 0)' },
  not: { description: 'Logical NOT', syntax: 'not(a)', returns: 'boolean', example: 'not(done)' },
  
  // Date
  now: { description: 'Current date', syntax: 'now()', returns: 'date', example: 'now()' },
  dateAdd: { description: 'Add days to date', syntax: 'dateAdd(date, days)', returns: 'date', example: 'dateAdd(startDate, 7)' },
  dateDiff: { description: 'Days between dates', syntax: 'dateDiff(start, end)', returns: 'number', example: 'dateDiff(start, end)' },
  formatDate: { description: 'Format date', syntax: 'formatDate(date, format)', returns: 'text', example: 'formatDate(now(), "DD/MM/YYYY")' },
  
  // Rollup
  rollup: { description: 'Aggregate related data', syntax: 'rollup(relation, prop, aggregation)', returns: 'number', example: 'rollup(Tasks, Status, "count")' },
};

// Evaluate a simple formula expression
export function evaluateFormula(
  expression: string,
  properties: Record<string, string | number | boolean>
): string | number | boolean {
  try {
    // Replace property references with their values
    let expr = expression;
    for (const [key, value] of Object.entries(properties)) {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      if (typeof value === 'string') {
        expr = expr.replace(regex, `"${value}"`);
      } else {
        expr = expr.replace(regex, String(value));
      }
    }

    // Handle basic functions
    // sum, avg, min, max, count are handled separately for rollups
    
    // Simple arithmetic evaluation (safe subset)
    if (/^[\d\s+\-*/().%]+$/.test(expr)) {
      const result = new Function(`return ${expr}`)();
      if (typeof result === 'number') return Math.round(result * 100) / 100;
      return result;
    }

    // String concatenation
    if (expr.includes('concat(')) {
      return expr.replace(/concat\((.*?)\)/g, (_, args) => {
        return args.split(',').map(a => a.trim().replace(/"/g, '')).join('');
      });
    }

    // Conditional
    if (expr.includes('if(')) {
      // Simple if: if(condition, trueVal, falseVal)
      const match = expr.match(/if\((.+?),\s*(.+?),\s*(.+?)\)/);
      if (match) {
        const [, condition, trueVal, falseVal] = match;
        try {
          const condResult = new Function(`return ${condition}`)();
          return condResult ? trueVal.replace(/"/g, '') : falseVal.replace(/"/g, '');
        } catch {
          return 'Error';
        }
      }
    }

    return expr;
  } catch {
    return 'Error';
  }
}

// Get formula suggestions for autocomplete
export function getFormulaSuggestions(input: string): string[] {
  if (!input.trim()) return Object.keys(FORMULA_FUNCTIONS);
  const q = input.toLowerCase();
  return Object.entries(FORMULA_FUNCTIONS)
    .filter(([name, fn]) => 
      name.toLowerCase().includes(q) || 
      fn.description.toLowerCase().includes(q)
    )
    .map(([name]) => name);
}
