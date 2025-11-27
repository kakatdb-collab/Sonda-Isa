import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { LinkedInProfile } from "../types";

export const downloadPDF = (data: LinkedInProfile[], title: string) => {
  if (!data || data.length === 0) return;

  // Cria documento em Paisagem (Landscape) para caber mais colunas
  const doc = new jsPDF({ orientation: "landscape" });

  // Título do Documento
  doc.setFontSize(18);
  doc.setTextColor(0, 115, 177); // LinkedIn Blue
  doc.text("Relatório Sonda ISA", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Arquivo: ${title}`, 14, 30);
  doc.text(`Data: ${new Date().toLocaleDateString()}`, 14, 36);

  // Definição das Colunas e Linhas
  const tableColumn = ["Nome", "Cargo", "Empresa", "Tempo Cargo", "Localização", "Perfil LinkedIn"];
  const tableRows: string[][] = [];

  data.forEach((profile) => {
    const rowData = [
      profile.name,
      profile.role,
      profile.company,
      profile.tenure || "-",
      profile.location,
      profile.profileUrl || "-"
    ];
    tableRows.push(rowData);
  });

  // Geração da Tabela
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      overflow: 'linebreak'
    },
    headStyles: {
      fillColor: [0, 115, 177], // LinkedIn Blue Header
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [240, 247, 253]
    },
    columnStyles: {
      0: { cellWidth: 40 }, // Nome
      1: { cellWidth: 50 }, // Cargo
      2: { cellWidth: 40 }, // Empresa
      3: { cellWidth: 30 }, // Tempo
      4: { cellWidth: 40 }, // Local
      5: { cellWidth: 'auto' } // URL
    },
  });

  // Salvar Arquivo
  const cleanTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`${cleanTitle}.pdf`);
};