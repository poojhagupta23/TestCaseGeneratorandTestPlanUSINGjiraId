import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType } from "docx";
import Papa from "papaparse";

export async function generateDocx(markdownText: string, filename: string) {
  const lines = markdownText.split('\n');
  const children: any[] = [];
  
  let inTable = false;
  let tableRows: TableRow[] = [];

  const flushTable = () => {
    if (inTable && tableRows.length > 0) {
      children.push(new Table({
        rows: tableRows,
        width: { size: 100, type: WidthType.PERCENTAGE }
      }));
      children.push(new Paragraph({ text: "" }));
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();

    // Table parsing
    if (trimmedLine.startsWith('|') && trimmedLine.endsWith('|')) {
      inTable = true;
      if (trimmedLine.includes('---')) {
        continue; // Skip markdown table separator
      }
      
      const rawCells = trimmedLine.split('|').slice(1, -1);
      const isHeader = tableRows.length === 0;

      const cells = rawCells.map(cell => {
        let text = cell.trim();
        // bold parsing
        let bold = isHeader;
        if (text.startsWith('**') && text.endsWith('**')) {
           bold = true;
           text = text.replace(/\*\*/g, '');
        }

        // br parsing
        const textLines = text.split(/<br\s*\/?>/i);
        const paras = textLines.map(t => new Paragraph({ 
          children: [new TextRun({ text: t.trim(), bold })],
          spacing: { before: 50, after: 50 }
        }));

        return new TableCell({
          children: paras,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          shading: isHeader ? { fill: "F2F2F2" } : undefined
        });
      });

      tableRows.push(new TableRow({ children: cells }));
      continue;
    } else {
      flushTable();
    }

    // Normal markdown parsing
    if (trimmedLine.startsWith('# ')) {
      children.push(new Paragraph({ text: trimmedLine.replace('# ', ''), heading: HeadingLevel.HEADING_1 }));
    } else if (trimmedLine.startsWith('## ')) {
      children.push(new Paragraph({ text: trimmedLine.replace('## ', ''), heading: HeadingLevel.HEADING_2 }));
    } else if (trimmedLine.startsWith('### ')) {
      children.push(new Paragraph({ text: trimmedLine.replace('### ', ''), heading: HeadingLevel.HEADING_3 }));
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      const text = trimmedLine.substring(2);
      if (text.includes('**')) {
        const parts = text.split('**');
        const runs = parts.map((part, index) => new TextRun({ text: part, bold: index % 2 !== 0 }));
        children.push(new Paragraph({ children: runs, bullet: { level: 0 } }));
      } else {
        children.push(new Paragraph({ text, bullet: { level: 0 } }));
      }
    } else if (trimmedLine.length > 0) {
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        const runs = parts.map((part, index) => new TextRun({ text: part, bold: index % 2 !== 0 }));
        children.push(new Paragraph({ children: runs }));
      } else {
        children.push(new Paragraph({ children: [new TextRun(trimmedLine)] }));
      }
    } else {
      children.push(new Paragraph({ text: "" })); // Empty line
    }
  }
  flushTable(); // flush in case document ends with a table

  const doc = new Document({
    styles: {
      default: {
        heading1: {
          run: { size: 32, bold: true, color: "2E74B5", font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        heading2: {
          run: { size: 28, bold: true, color: "2E74B5", font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        heading3: {
          run: { size: 24, bold: true, color: "1F4D78", font: "Arial" },
          paragraph: { spacing: { before: 240, after: 120 } },
        },
        document: {
          run: { size: 22, font: "Arial" }, // 11pt
          paragraph: { spacing: { before: 120, after: 120 } },
        },
      },
    },
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Test Plan Document",
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
        }),
        new Paragraph({ text: "" }),
        ...children
      ],
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
