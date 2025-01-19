import { jsPDF } from 'jspdf';
import { PDFElement, PDFStyles, PDFMetadata } from './types';
import { pdfStyles } from './styles';
import { logger } from '../../services/logging';

export class PDFRenderer {
  private doc: jsPDF;
  private currentY: number;
  private pageHeight: number;
  private pageWidth: number;
  private margin: number;
  private styles: PDFStyles;

  constructor(metadata: PDFMetadata) {
    this.doc = new jsPDF();
    this.styles = pdfStyles;
    this.currentY = this.styles.spacing.margin;
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margin = this.styles.spacing.margin;

    this.setMetadata(metadata);
  }

  private setMetadata(metadata: PDFMetadata) {
    this.doc.setProperties({
      title: metadata.title,
      author: metadata.author,
      subject: metadata.subject,
      keywords: metadata.keywords?.join(', '),
      creationDate: metadata.createdAt
    });
  }

  private addNewPage() {
    this.doc.addPage();
    this.currentY = this.margin;
  }

  private checkNewPage(height: number): boolean {
    if (this.currentY + height > this.pageHeight - this.margin) {
      this.addNewPage();
      return true;
    }
    return false;
  }

  private renderTextSegments(segments: PDFElement['segments'], x: number, y: number, maxWidth?: number) {
    if (!segments) return;

    let currentX = x;
    
    segments.forEach(segment => {
      if (!segment) return;

      // Set font style based on formatting
      if (segment.style?.isCode) {
        this.doc.setFont('Courier', 'normal');
      } else {
        this.doc.setFont(
          this.styles.fonts.normal,
          (segment.style?.isBold && segment.style?.isItalic) ? 'bolditalic' :
          segment.style?.isBold ? 'bold' :
          segment.style?.isItalic ? 'italic' : 'normal'
        );
      }

      const text = segment.text;
      if (maxWidth) {
        const lines = this.doc.splitTextToSize(text, maxWidth);
        lines.forEach((line: string, index: number) => {
          this.checkNewPage(this.styles.fontSize.body + this.styles.spacing.lineHeight);
          this.doc.text(line, currentX, y + (index * (this.styles.fontSize.body + this.styles.spacing.lineHeight)));
        });
      } else {
        this.doc.text(text, currentX, y);
        currentX += this.doc.getTextWidth(text);
      }
    });
  }

  private renderTable(element: PDFElement) {
    if (!element.rows?.length) return;

    const fontSize = this.styles.fontSize.table;
    this.doc.setFontSize(fontSize);
    
    const cellPadding = this.styles.spacing.table.padding;
    const availableWidth = this.pageWidth - (2 * this.margin);
    const columnCount = element.rows[0].cells.length;
    const columnWidth = availableWidth / columnCount;

    // Calculate row heights
    const rowHeights = element.rows.map(row => {
      let maxHeight = fontSize + (2 * cellPadding);
      row.cells.forEach(cell => {
        if (cell.segments) {
          const text = cell.segments.map(s => s.text).join('');
          const lines = this.doc.splitTextToSize(text, columnWidth - (2 * cellPadding));
          const height = (lines.length * (fontSize * this.styles.spacing.table.cellSpacing)) + (2 * cellPadding);
          maxHeight = Math.max(maxHeight, height);
        }
      });
      return maxHeight;
    });

    // Draw table
    element.rows.forEach((row, rowIndex) => {
      const rowHeight = rowHeights[rowIndex];
      this.checkNewPage(rowHeight);

      // Draw header background
      if (rowIndex === 0) {
        this.doc.setFillColor(this.styles.colors.table.header);
        this.doc.rect(
          this.margin,
          this.currentY,
          availableWidth,
          rowHeight,
          'F'
        );
      }

      // Draw cells
      row.cells.forEach((cell, colIndex) => {
        const x = this.margin + (colIndex * columnWidth);
        
        // Draw cell border
        this.doc.setDrawColor(this.styles.colors.table.border);
        this.doc.rect(x, this.currentY, columnWidth, rowHeight);

        // Render cell content
        if (cell.segments) {
          const isHeader = rowIndex === 0;
          this.doc.setFont(this.styles.fonts.normal, isHeader ? 'bold' : 'normal');
          
          const text = cell.segments.map(s => s.text).join('');
          const lines = this.doc.splitTextToSize(text, columnWidth - (2 * cellPadding));
          
          lines.forEach((line: string, lineIndex: number) => {
            this.doc.text(
              line,
              x + cellPadding,
              this.currentY + fontSize + cellPadding + 
                (lineIndex * (fontSize * this.styles.spacing.table.cellSpacing))
            );
          });
        }
      });

      this.currentY += rowHeight;
    });

    this.currentY += this.styles.spacing.table.afterTable;
  }

  // ... rest of the renderer implementation remains the same ...

  public render(elements: PDFElement[]): Blob {
    try {
      elements.forEach(element => {
        switch (element.type) {
          case 'table':
            this.renderTable(element);
            break;
          // ... other element type handling remains the same ...
        }
      });

      return this.doc.output('blob');
    } catch (error) {
      logger.error('Failed to render PDF:', error);
      throw new Error('Failed to render PDF');
    }
  }
}