import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const exportProductPDF = async (product) => {
  const element = document.getElementById("print-area");
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  const addWatermark = () => {
    pdf.setTextColor(220, 220, 220);
    pdf.setFontSize(40);
    pdf.text("EL-MOTAHIDA", pdfWidth / 2, pdfHeight / 2, {
      angle: 45,
      align: "center",
    });
  };

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  addWatermark();

  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position -= pdfHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    addWatermark();
    heightLeft -= pdfHeight;
  }

  pdf.save(`${product.name}-ELMOTAHIDA.pdf`);
};