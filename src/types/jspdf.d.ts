// src/types/jspdf.d.ts

// Este arquivo estende os tipos da biblioteca jsPDF para incluir o plugin autoTable.
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
