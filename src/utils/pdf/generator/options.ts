export interface PDFOptions {
  title: string;
  author: string;
  subject?: string;
  keywords?: string[];
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'letter';
  margins?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  fonts?: {
    normal?: string;
    bold?: string;
    italic?: string;
  };
  styles?: {
    fontSize?: {
      h1?: number;
      h2?: number;
      h3?: number;
      body?: number;
    };
    spacing?: {
      paragraph?: number;
      line?: number;
    };
  };
}

export const DEFAULT_PDF_OPTIONS: PDFOptions = {
  orientation: 'portrait',
  format: 'a4',
  margins: {
    top: 40,
    bottom: 40,
    left: 40,
    right: 40
  },
  fonts: {
    normal: 'helvetica',
    bold: 'helvetica-bold',
    italic: 'helvetica-oblique'
  },
  styles: {
    fontSize: {
      h1: 24,
      h2: 20,
      h3: 16,
      body: 12
    },
    spacing: {
      paragraph: 10,
      line: 5
    }
  }
};