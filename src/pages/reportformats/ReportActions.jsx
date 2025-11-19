import { Button } from "antd";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";

const ReportActions = ({
  componentRef,
  filename = "document.pdf",
  documentTitle = "Report",
  onToggleSignature,
  showSignature = true,
  includeSignatureToggle = false,
  handleEmail,
  loadingemail,
}) => {
  const generatePdf = () => {
    const element = componentRef?.current;

    if (!element) {
      console.error("PDF generation failed: element not found");
      return;
    }

    const options = {
      margin: [0, 0, 0, 0],
      filename: filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowHeight: element.scrollHeight,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const text = `Page ${i} of ${totalPages}`;
          const textWidth =
            (pdf.getStringUnitWidth(text) * 10) / pdf.internal.scaleFactor;
          const x = pageWidth - textWidth - 10;
          const y = pageHeight - 10;
          pdf.text(text, x, y);
        }
      })
      .save();
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: documentTitle,
    pageStyle: `
      @page {
        size: A4;
        margin: 1mm !important;
      }
      @media print {
        html,body {
          margin: 1mm !important;
        }
        .print-hide {
          display: none;
        }
      }
    `,
  });

  return (
    <div className="print-hide flex gap-2 mb-4">
      <Button onClick={handlePrint}>Print</Button>
      <Button onClick={generatePdf}>PDF</Button>
      {includeSignatureToggle && (
        <Button
          type={showSignature ? "primary" : "default"}
          onClick={onToggleSignature}
        >
          {showSignature ? "With Signature" : "Without Signature"}
        </Button>
      )}
      <Button onClick={handleEmail} loading={loadingemail}>
        {loadingemail ? "Sending" : "Send Email"}
      </Button>
    </div>
  );
};

export default ReportActions;
