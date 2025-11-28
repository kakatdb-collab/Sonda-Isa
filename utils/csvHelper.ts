import { LinkedInProfile } from '../types';

const cleanForExcel = (str: string | undefined): string => {
  if (str === null || str === undefined) return '""';
  // Convert to string, replace quotes with double quotes, remove line breaks
  let content = String(str);
  content = content.replace(/"/g, '""'); 
  content = content.replace(/(\r\n|\n|\r)/gm, " "); 
  return `"${content}"`;
};

const cleanForCSV = (str: string | undefined): string => {
  if (str === null || str === undefined) return '""';
  let content = String(str);
  content = content.replace(/"/g, '""');
  // CSV also doesn't like random newlines breaking records
  content = content.replace(/(\r\n|\n|\r)/gm, " ");
  return `"${content}"`;
};

export const downloadCSV = (data: LinkedInProfile[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = ['Nome', 'Cargo', 'Empresa', 'Tempo no Cargo', 'Formação', 'Estado', 'Localização', 'URL do Perfil'];
  
  const csvContent = [
    headers.map(h => cleanForCSV(h)).join(','), 
    ...data.map(row => {
      return [
        cleanForCSV(row.name),
        cleanForCSV(row.role),
        cleanForCSV(row.company),
        cleanForCSV(row.tenure),
        cleanForCSV(row.education), 
        cleanForCSV(row.state),     
        cleanForCSV(row.location),
        cleanForCSV(row.profileUrl)
      ].join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
};

export const downloadExcel = (data: LinkedInProfile[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = ['Nome', 'Cargo', 'Empresa', 'Tempo no Cargo', 'Formação', 'Estado', 'Localização', 'URL do Perfil'];
  const separator = ';';
  const BOM = '\uFEFF'; 
  
  const csvContent = BOM + [
    headers.map(h => cleanForExcel(h)).join(separator), 
    ...data.map(row => {
      return [
        cleanForExcel(row.name),
        cleanForExcel(row.role),
        cleanForExcel(row.company),
        cleanForExcel(row.tenure),
        cleanForExcel(row.education), 
        cleanForExcel(row.state),     
        cleanForExcel(row.location),
        cleanForExcel(row.profileUrl)
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