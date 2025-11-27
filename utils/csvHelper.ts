import { LinkedInProfile } from '../types';

export const downloadCSV = (data: LinkedInProfile[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = ['Nome', 'Cargo', 'Empresa', 'Tempo no Cargo', 'Localização', 'URL do Perfil'];
  
  const csvContent = [
    headers.join(','), 
    ...data.map(row => {
      const escape = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;
      return [
        escape(row.name),
        escape(row.role),
        escape(row.company),
        escape(row.tenure), // Novo campo
        escape(row.location),
        escape(row.profileUrl)
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
};

export const downloadExcel = (data: LinkedInProfile[], filename: string) => {
  if (!data || data.length === 0) return;

  // Excel no Brasil/Europa usa Ponto e Vírgula (;) como separador padrão e precisa do BOM (\uFEFF) para acentos
  const headers = ['Nome', 'Cargo', 'Empresa', 'Tempo no Cargo', 'Localização', 'URL do Perfil'];
  const separator = ';';
  const BOM = '\uFEFF'; 
  
  const csvContent = BOM + [
    headers.join(separator), 
    ...data.map(row => {
      // Remove quebras de linha que quebram o Excel e escapa aspas
      const clean = (str: string | undefined) => {
        if (!str) return '';
        return `"${str.replace(/"/g, '""').replace(/(\r\n|\n|\r)/gm, " ")}"`;
      };
      return [
        clean(row.name),
        clean(row.role),
        clean(row.company),
        clean(row.tenure), // Novo campo
        clean(row.location),
        clean(row.profileUrl)
      ].join(separator);
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
};

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};