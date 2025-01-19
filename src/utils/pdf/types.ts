export interface PDFStyles {
  fonts: {
    normal: string;
    bold: string;
    italic: string;
  };
  fontSize: {
    h1: number;
    h2: number;
    h3: number;
    h4: number;
    body: number;
  };
  spacing: {
    margin: number;
    lineHeight: number;
    paragraph: number;
    list: number;
    table: number;
  };
  colors: {
    primary: string;
    text: string;
    lightGray: string;
    darkGray: string;
    table: {
      header: string;
      border: string;
    };
  };
}

export interface TextStyle {
  isBold?: boolean;
  isItalic?: boolean;
  isCode?: boolean;
}

export interface TextSegment {
  text: string;
  style: TextStyle;
}

export interface PDFElement {
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'blockquote' | 'code';
  content: string;
  segments?: TextSegment[];
  level?: number;
  items?: { content: string; segments: TextSegment[] }[];
  rows?: { cells: { content: string; segments: TextSegment[] }[] }[];
  isOrdered?: boolean;
}

export interface PDFMetadata {
  title: string;
  author: string;
  subject?: string;
  keywords?: string[];
  createdAt: Date;
}