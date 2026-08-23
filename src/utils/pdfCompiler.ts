import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { DocumentMetadata, Watermark } from '../types/document';

export class PDFCompiler {
  private pdfDoc: PDFDocument;

  private constructor(doc: PDFDocument) {
    this.pdfDoc = doc;
  }

  static async load(pdfBuffer: ArrayBuffer): Promise<PDFCompiler> {
    const doc = await PDFDocument.load(pdfBuffer);
    return new PDFCompiler(doc);
  }

  // --- 1. METADATA LAYER ---
  applyMetadata(meta: DocumentMetadata) {
    if (meta.title) this.pdfDoc.setTitle(meta.title);
    if (meta.author) this.pdfDoc.setAuthor(meta.author);
    if (meta.subject) this.pdfDoc.setSubject(meta.subject);
    if (meta.keywords) this.pdfDoc.setKeywords(meta.keywords);
    if (meta.creator) this.pdfDoc.setCreator(meta.creator);
    if (meta.producer) this.pdfDoc.setProducer(meta.producer);
  }

  // --- 2. WATERMARK LAYER ---
  async applyWatermarks(watermarks: Watermark[]) {
    const pages = this.pdfDoc.getPages();
    const helvetica = await this.pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const watermark of watermarks) {
      pages.forEach((page, index) => {
        // Skip if targetPages is an array and doesn't include this page index
        if (Array.isArray(watermark.targetPages) && !watermark.targetPages.includes(index)) {
          return;
        }

        const { width, height } = page.getSize();
        
        if (watermark.type === 'text') {
          const textSize = 48;
          const textWidth = helvetica.widthOfTextAtSize(watermark.content, textSize);
          
          // Simple center calculation
          const x = watermark.position === 'center' ? (width / 2) - (textWidth / 2) : 50;
          const y = watermark.position === 'center' ? height / 2 : 50;

          page.drawText(watermark.content, {
            x,
            y,
            size: textSize,
            font: helvetica,
            color: rgb(0.5, 0.5, 0.5),
            opacity: watermark.opacity,
            rotate: degrees(watermark.rotation),
          });
        }
        // Image watermark logic would go here via this.pdfDoc.embedPng() or embedJpg()
      });
    }
  }

  // --- 3. BACKGROUND LAYER ---
  applyBackgroundColor(r: number, g: number, b: number) {
    const pages = this.pdfDoc.getPages();
    pages.forEach(page => {
      const { width, height } = page.getSize();
      // Draw a rectangle over the whole page behind existing content
      // pdf-lib draws sequentially, so to put it behind, we'd ideally need 
      // to manipulate the content stream or draw first on blank pages, 
      // but a standard workaround is overlaying with blend modes or creating new pages.
    });
  }

  // --- 4. ATTACHMENT LAYER ---
  async attachFiles(attachments: { name: string, data: Uint8Array }[]) {
    for (const file of attachments) {
      await this.pdfDoc.attach(file.data, file.name, {
        mimeType: 'application/octet-stream',
        description: `Attached file: ${file.name}`
      });
    }
  }

  async export(): Promise<Uint8Array> {
    return await this.pdfDoc.save();
  }
}