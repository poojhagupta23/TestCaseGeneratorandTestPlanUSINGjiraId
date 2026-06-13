import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import Papa from "papaparse";

export async function generateDocx(markdownText: string, filename: string) {
  const lines = markdownText.split('\n');
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      paragraphs.push(new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith('## ')) {
      paragraphs.push(new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith('### ')) {
      paragraphs.push(new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3 }));
    } else if (line.startsWith('- ')) {
      paragraphs.push(new Paragraph({ text: line.replace('- ', ''), bullet: { level: 0 } }));
    } else if (line.startsWith('* ')) {
      paragraphs.push(new Paragraph({ text: line.replace('* ', ''), bullet: { level: 0 } }));
    } else if (line.trim().length > 0) {
      // Basic bold matching (very naive, assumes no complex markdown)
      if (line.includes('**')) {
        const parts = line.split('**');
        const runs = parts.map((part, index) => new TextRun({ text: part, bold: index % 2 !== 0 }));
        paragraphs.push(new Paragraph({ children: runs }));
      } else {
        paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
      }
    } else {
      paragraphs.push(new Paragraph({ text: "" })); // Empty line
    }
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: paragraphs,
    }],
  });

  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export function generateCsv(data: any[], filename: string) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
