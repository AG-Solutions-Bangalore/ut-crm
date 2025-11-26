import { Button, Card, message, Spin } from "antd";
import dayjs from "dayjs";
import * as ExcelJS from "exceljs";
import html2pdf from "html2pdf.js";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { PARTY_REPORT } from "../../../api";
import { useGetApiMutation } from "../../../hooks/useGetApiMutation";

const PartyReport = () => {
  const containerRef = useRef(null);
  const { data: result, isLoading } = useGetApiMutation({
    url: PARTY_REPORT,
    queryKey: ["partyReport"],
  });
  const reportData = result?.data || [];

  const groupedReportData = reportData.reduce((acc, item) => {
    const partyName = item.party_name;
    if (!acc[partyName]) {
      acc[partyName] = [];
    }
    acc[partyName].push(item);
    return acc;
  }, {});

  const handleDownload = () => {
    const element = containerRef?.current;

    if (!element) {
      message.error("Failed to generate PDF");
      return;
    }

    const elementForPdf = element.cloneNode(true);
    const printHideElements = elementForPdf.querySelectorAll(".print-hide");
    printHideElements.forEach((el) => el.remove());

    const style = document.createElement("style");
    style.textContent = `
      * {
        color: #000000 !important;
        background-color: transparent !important;
      }
      .bg-gray-200, .bg-gray-100, .bg-white {
        background-color: #ffffff !important;
      }
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      .md\\:flex-row { flex-direction: row !important; }
      .flex-1 { flex: 1 !important; }
      .border { border: 1px solid black !important; }
      .border-r { border-right: 1px solid black !important; }
      .border-b { border-bottom: 1px solid black !important; }
      .border-black { border-color: black !important; }
      .border-gray-300 { border-color: #d1d5db !important; }
      .p-2 { padding: 8px !important; }
      .p-3 { padding: 12px !important; }
      .p-4 { padding: 16px !important; }
      .mb-6 { margin-bottom: 24px !important; }
      .min-h-\\[120px\\] { min-height: 120px !important; }
      .text-\\[13px\\] { font-size: 13px !important; }
      .text-2xl { font-size: 24px !important; }
      .text-sm { font-size: 14px !important; }
      .font-bold { font-weight: bold !important; }
      .font-semibold { font-weight: 600 !important; }
      .font-normal { font-weight: normal !important; }
      .text-center { text-align: center !important; }
      .text-right { text-align: right !important; }
      .whitespace-pre-line { white-space: pre-line !important; }
      .break-words { word-wrap: break-word !important; }
      .break-all { word-break: break-all !important; }
      .bg-gray-200 { background-color: #e5e7eb !important; }
      .bg-gray-100 { background-color: #f3f4f6 !important; }
      .justify-between { justify-content: space-between !important; }
      .items-center { align-items: center !important; }
      .items-start { align-items: flex-start !important; }
      .h-full { height: 100% !important; }
      .ml-2 { margin-left: 8px !important; }
      .gap-1 { gap: 4px !important; }
    `;
    elementForPdf.appendChild(style);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Party-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowHeight: elementForPdf.scrollHeight,
        backgroundColor: "#FFFFFF",
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .from(elementForPdf)
      .set(options)
      .save()
      .then(() => {
        message.success("PDF downloaded successfully");
      })
      .catch((error) => {
        console.error("PDF download error:", error);
        message.error("Failed to download PDF");
      });
  };

  const handlePrint = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: `Party-Report-${dayjs().format("DD-MM-YYYY")}`,
    removeAfterPrint: true,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
          font-size: 13px;
        }
        .print-hide {
          display: none !important;
        }
        .ant-card {
          box-shadow: none !important;
          border: none !important;
        }
        .ant-card-body {
          padding: 0 !important;
        }
        .flex { display: flex !important; }
        .flex-col { flex-direction: column !important; }
        .md\\:flex-row { flex-direction: row !important; }
        .flex-1 { flex: 1 !important; }
        .border { border: 1px solid black !important; }
        .border-r { border-right: 1px solid black !important; }
        .border-b { border-bottom: 1px solid black !important; }
        .border-black { border-color: black !important; }
        .border-gray-300 { border-color: #d1d5db !important; }
        .p-2 { padding: 8px !important; }
        .p-3 { padding: 12px !important; }
        .p-4 { padding: 16px !important; }
        .mb-6 { margin-bottom: 24px !important; }
        .min-h-\\[120px\\] { min-height: 120px !important; }
        .text-\\[13px\\] { font-size: 13px !important; }
        .text-2xl { font-size: 24px !important; }
        .text-sm { font-size: 14px !important; }
        .font-bold { font-weight: bold !important; }
        .font-semibold { font-weight: 600 !important; }
        .font-normal { font-weight: normal !important; }
        .text-center { text-align: center !important; }
        .text-right { text-align: right !important; }
        .whitespace-pre-line { white-space: pre-line !important; }
        .break-words { word-wrap: break-word !important; }
        .break-all { word-break: break-all !important; }
        .bg-gray-200 { background-color: #e5e7eb !important; }
        .bg-gray-100 { background-color: #f3f4f6 !important; }
        .justify-between { justify-content: space-between !important; }
        .items-center { align-items: center !important; }
        .items-start { align-items: flex-start !important; }
        .h-full { height: 100% !important; }
        .ml-2 { margin-left: 8px !important; }
        .gap-1 { gap: 4px !important; }
      }
    `,
  });

  const handleExcelExport = async () => {
    if (reportData.length === 0) {
      message.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Party Report");

      worksheet.mergeCells("A1:C1");
      worksheet.getCell("A1").value = "Party Information";
      worksheet.getCell("A1").font = { bold: true, size: 14 };
      worksheet.getCell("A1").alignment = { horizontal: "center" };

      worksheet.getCell("A2").value = "Billing Address";
      worksheet.getCell("B2").value = "Delivery Address";
      worksheet.getCell("C2").value = "Contact Details";

      ["A2", "B2", "C2"].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        worksheet.getCell(cell).alignment = { horizontal: "center" };
        worksheet.getCell(cell).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let currentRow = 3;

      reportData.forEach((party) => {
        worksheet.mergeCells(`A${currentRow}:C${currentRow}`);
        worksheet.getCell(
          `A${currentRow}`
        ).value = `${party.party_name} - ${party.party_state}`;
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(`A${currentRow}`).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE5E7EB" },
        };
        worksheet.getCell(`A${currentRow}`).alignment = {
          horizontal: "center",
        };
        worksheet.getCell(`A${currentRow}`).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        currentRow++;

        worksheet.getCell(`A${currentRow}`).value = party.party_billing_address;
        worksheet.getCell(`A${currentRow}`).alignment = {
          wrapText: true,
          vertical: "top",
        };

        worksheet.getCell(`B${currentRow}`).value =
          party.party_delivery_address;
        worksheet.getCell(`B${currentRow}`).alignment = {
          wrapText: true,
          vertical: "top",
        };

        const contactDetails = [
          `Name: ${party.party_cp_name || "-"}`,
          `Mobile: ${party.party_cp_mobile || "-"}`,
          `Due: ${party.party_due_days} days`,
          `GSTIN: ${party.party_gstin}`,
        ].join("\n");

        worksheet.getCell(`C${currentRow}`).value = contactDetails;
        worksheet.getCell(`C${currentRow}`).alignment = {
          wrapText: true,
          vertical: "top",
        };

        for (let col = 1; col <= 3; col++) {
          const cell = worksheet.getCell(currentRow, col);
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
        }

        worksheet.getRow(currentRow).height = 80;

        currentRow += 2;
      });

      worksheet.columns = [{ width: 40 }, { width: 40 }, { width: 30 }];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Party-Report-${dayjs().format("DD-MM-YYYY")}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      message.error("Failed to export Excel file");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full">
            <Card
              title="Party Report"
              className="shadow-lg min-h-[800px]"
              extra={
                <>
                  {reportData.length > 0 && (
                    <div className="print-hide flex justify-between items-center">
                      <div className="flex flex-row items-center gap-1 font-bold">
                        {reportData.length > 0
                          ? `${reportData.length} records found`
                          : "No data to display"}
                        <Button
                          className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={handleDownload}
                        >
                          <Download className="h-4 w-4" /> PDF
                        </Button>
                        <Button
                          className="ml-2 bg-green-600 hover:bg-green-700 text-white"
                          onClick={handleExcelExport}
                        >
                          <FileSpreadsheet className="h-4 w-4" /> Excel
                        </Button>
                        <Button
                          className="ml-2 bg-orange-600 hover:bg-orange-700 text-white"
                          onClick={handlePrint}
                        >
                          <Printer className="h-4 w-4" /> Print
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              }
            >
              {reportData.length > 0 ? (
                <div>
                  <div ref={containerRef} className="">
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-center">
                        Party Report
                      </h1>
                    </div>

                    <div>
                      {Object.entries(groupedReportData).map(
                        ([partyName, partyData]) => {
                          const party = partyData[0];
                          const partyShort = party.party_short;

                          return (
                            <div
                              key={partyName}
                              className="mb-6 border border-black text-[13px]"
                            >
                              <div className="p-2 bg-gray-200 font-bold border-b border-black flex justify-between items-center">
                                <span>
                                  {partyShort} - {partyName}
                                </span>

                                <span className="text-sm font-normal">
                                  {party.party_state}
                                </span>
                              </div>

                              <div className="flex flex-col md:flex-row">
                                <div className="flex-1 border-r border-black min-h-[120px]">
                                  <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                    Billing Address
                                  </div>
                                  <div className="p-3 h-full flex items-start">
                                    <div className="whitespace-pre-line break-words">
                                      {party.party_billing_address}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 border-r border-black min-h-[120px]">
                                  <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                    Delivery Address
                                  </div>
                                  <div className="p-3 h-full flex items-start">
                                    <div className="whitespace-pre-line break-words">
                                      {party.party_delivery_address}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 min-h-[120px]">
                                  <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                    Contact Details
                                  </div>
                                  <div className="h-full">
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        Name:
                                      </span>
                                      <span className="text-right">
                                        {party.party_cp_name || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        Mobile:
                                      </span>
                                      <span className="text-right">
                                        {party.party_cp_mobile || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        Due:
                                      </span>
                                      <span className="text-right">
                                        {party.party_due_days} days
                                      </span>
                                    </div>
                                    <div className="p-2 flex justify-between">
                                      <span className="font-semibold">
                                        GSTIN:
                                      </span>
                                      <span className="text-right break-all">
                                        {party.party_gstin}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Report Data</h3>
                  <p>No party data available.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyReport;
