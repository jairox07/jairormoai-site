import { MEMBRETE, SECCIONES_SOAP, fechaLarga, lineaPaciente, type Medico, type NotaSoap, type Paciente } from "@/lib/types";

// Genera el PDF de la nota (cliente). Lo usan "Exportar PDF" y "Enviar por correo".
export async function construirPdf(
  nota: NotaSoap,
  fechaConsulta: Date,
  paciente?: Paciente,
  numero?: number | null,
  expediente?: string | null,
  medico?: Medico | null
) {
  const { jsPDF } = await import("jspdf");
  const generado = new Date();
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const ancho = doc.internal.pageSize.getWidth();
  const alto = doc.internal.pageSize.getHeight();
  const margen = 56;
  const anchoTexto = ancho - margen * 2;
  let y = 0;

  const pie = () => {
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(148, 163, 184);
    doc.text("Borrador generado con IA. Debe ser revisado y validado por el médico tratante.", margen, alto - 28);
    doc.text(`Página ${doc.getNumberOfPages()}`, ancho - margen, alto - 28, { align: "right" });
  };
  const salto = (h: number) => {
    if (y + h > alto - 52) {
      pie();
      doc.addPage();
      y = margen;
    }
  };

  // Membrete
  doc.setFillColor(45, 163, 211); // brand-500
  doc.rect(0, 0, ancho, 84, "F");
  doc.setFillColor(32, 135, 181); // brand-600
  doc.rect(0, 84, ancho, 4, "F");
  doc.setTextColor(255, 255, 255).setFont("helvetica", "bold").setFontSize(20);
  doc.text(MEMBRETE, margen, 44);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(`Fecha de generación: ${fechaLarga(generado)}`, margen, 64);
  if (medico?.clinica) {
    doc.setFont("helvetica", "bold").setFontSize(11);
    doc.text(medico.clinica.slice(0, 34), ancho - margen, 44, { align: "right" });
    doc.setFont("helvetica", "normal").setFontSize(10);
  }
  y = 118;
  if (paciente) {
    doc.setFont("helvetica", "bold").setFontSize(14).setTextColor(15, 23, 42);
    doc.text(lineaPaciente(paciente, numero), margen, y);
    y += 20;
  }
  if (expediente) {
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(3, 105, 161);
    doc.text(`Expediente: ${expediente}`, margen, y);
    y += 18;
  }

  doc.setTextColor(100, 116, 139).setFontSize(10);
  doc.text(`Fecha de la consulta: ${fechaLarga(fechaConsulta)}`, margen, y);
  y += 14;
  if (medico) {
    const datos = [`Médico: ${medico.nombre}`, medico.cedula ? `Cédula profesional: ${medico.cedula}` : null, medico.especialidad]
      .filter(Boolean)
      .join("  ·  ");
    const lineasMedico = doc.splitTextToSize(datos, anchoTexto) as string[];
    doc.text(lineasMedico, margen, y);
    y += lineasMedico.length * 13;
  }
  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(15, 23, 42);
  doc.text("Nota clínica (SOAP)", margen, y + 14);
  y += 36;

  for (const { key, letra, titulo } of SECCIONES_SOAP) {
    salto(44);
    doc.setFillColor(217, 238, 250); // brand-100
    doc.roundedRect(margen, y - 13, anchoTexto, 22, 4, 4, "F");
    doc.setFont("helvetica", "bold").setFontSize(11).setTextColor(27, 109, 147); // brand-700
    doc.text(`${letra}  ${titulo.toUpperCase()}`, margen + 8, y + 2);
    y += 26;

    doc.setFont("helvetica", "normal").setFontSize(11).setTextColor(30, 41, 59);
    for (const item of nota[key]) {
      const lineas = doc.splitTextToSize(item, anchoTexto - 16) as string[];
      salto(lineas.length * 14 + 4);
      doc.setTextColor(45, 163, 211).text("•", margen + 4, y);
      doc.setTextColor(30, 41, 59).text(lineas, margen + 16, y);
      y += lineas.length * 14 + 4;
    }
    y += 12;
  }

  // Firma del médico (NOM-004: nombre completo, cédula profesional y firma).
  if (medico) {
    salto(96);
    y += 28;
    doc.setDrawColor(148, 163, 184).setLineWidth(0.7);
    doc.line(margen, y, margen + 220, y);
    y += 14;
    doc.setFont("helvetica", "bold").setFontSize(10).setTextColor(15, 23, 42);
    doc.text(medico.nombre, margen, y);
    y += 13;
    doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(100, 116, 139);
    doc.text(medico.cedula ? `Cédula profesional: ${medico.cedula}` : "Firma del médico", margen, y);
  }

  pie();
  return doc;
}
