import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LinkedInProfile } from "../types";

export const downloadPDF = (data: LinkedInProfile[], title: string) => {
  if (!data || data.length === 0) return;

  // Cria documento em Paisagem (Landscape) para caber mais colunas
  const doc = new jsPDF({ orientation: "landscape" });

  // Título do Documento
  doc.setFontSize(18);
  doc.setTextColor(124, 58, 237); // ISA Purple (Violet 600)
  doc.text("Relatório Sonda ISA", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Arquivo: ${title}`, 14, 30);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 36);

  // Definição das Colunas e Linhas
  const tableColumn = ["Nome", "Cargo", "Empresa", "Formação", "Estado", "Tempo", "URL"];
  const tableRows: any[][] = []; 

  data.forEach((profile) => {
    const rowData = [
      profile.name,
      profile.role,
      profile.company,
      profile.education || "-", 
      profile.state || "-",     
      profile.tenure || "-",
      profile.profileUrl || "" 
    ];
    tableRows.push(rowData);
  });

  // Geração da Tabela Interativa
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    styles: {
      fontSize: 7, 
      cellPadding: 2,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [124, 58, 237], // ISA Purple
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 243, 255] // Light Violet
    },
    columnStyles: {
      0: { cellWidth: 35 }, // Nome
      1: { cellWidth: 45 }, // Cargo
      2: { cellWidth: 35 }, // Empresa
      3: { cellWidth: 40 }, // Formação
      4: { cellWidth: 25 }, // Estado
      5: { cellWidth: 20 }, // Tempo
      6: { cellWidth: 20, textColor: [0, 0, 255] } // URL Azul
    },
    didParseCell: (data) => {
        // Tornar a URL clicável
        if (data.section === 'body' && data.column.index === 6) {
             const url = data.cell.raw as string;
             if (url && url.startsWith('http')) {
                 data.cell.text = ['Abrir Perfil']; // Texto visível
                 data.cell.link = url; // Link clicável
             } else {
                 data.cell.text = ['-'];
             }
        }
    }
  });

  // Salvar Arquivo
  const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${cleanTitle}.pdf`);
};