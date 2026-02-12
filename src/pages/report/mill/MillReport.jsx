import { Button, Card, message, Spin } from "antd";
import dayjs from "dayjs";
import * as ExcelJS from "exceljs";
import html2pdf from "html2pdf.js";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { MILL_REPORT } from "../../../api";
import { useGetApiMutation } from "../../../hooks/useGetApiMutation";

const MillReport = () => {
  const containerRef = useRef(null);
  const { data: result, isLoading } = useGetApiMutation({
    url: MILL_REPORT,
    queryKey: ["millReport"],
  });
  const reportData = result?.data || [];

  const groupedReportData = reportData.reduce((acc, item) => {
    const millName = item.mill_name;
    if (!acc[millName]) {
      acc[millName] = [];
    }
    acc[millName].push(item);
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
      .min-h-\\[150px\\] { min-height: 150px !important; }
      .text-\\[13px\\] { font-size: 13px !important; }
      .text-2xl { font-size: 24px !important; }
      .font-bold { font-weight: bold !important; }
      .font-semibold { font-weight: 600 !important; }
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
    `;
    elementForPdf.appendChild(style);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Mill-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
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
    documentTitle: `Mill-Report-${dayjs().format("DD-MM-YYYY")}`,
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
        .min-h-\\[150px\\] { min-height: 150px !important; }
        .text-\\[13px\\] { font-size: 13px !important; }
        .text-2xl { font-size: 24px !important; }
        .font-bold { font-weight: bold !important; }
        .font-semibold { font-weight: 600 !important; }
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
      const worksheet = workbook.addWorksheet("Mill Report");

      worksheet.mergeCells("A1:D1");
      worksheet.getCell("A1").value = "Mill Information";
      worksheet.getCell("A1").font = { bold: true, size: 14 };
      worksheet.getCell("A1").alignment = { horizontal: "center" };

      worksheet.getCell("A2").value = "Mill Name & Billing Address";
      worksheet.getCell("B2").value = "Contact Details";
      worksheet.getCell("C2").value = "Bank Details";
      worksheet.getCell("D2").value = "State & Status";

      ["A2", "B2", "C2", "D2"].forEach((cell) => {
        worksheet.getCell(cell).font = { bold: true };
        worksheet.getCell(cell).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" },
        };
        worksheet.getCell(cell).border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      let currentRow = 3;

      reportData.forEach((mill) => {
        worksheet.getCell(`A${currentRow}`).value = mill.mill_name;
        worksheet.getCell(`A${currentRow}`).font = { bold: true };
        worksheet.getCell(`A${currentRow + 1}`).value = "Billing Address:";
        worksheet.getCell(`A${currentRow + 1}`).font = { bold: true };
        worksheet.getCell(`A${currentRow + 2}`).value =
          mill.mill_billing_address;
        worksheet.getCell(`A${currentRow + 2}`).alignment = { wrapText: true };

        worksheet.getCell(`B${currentRow}`).value = "Contact Details:";
        worksheet.getCell(`B${currentRow}`).font = { bold: true };
        worksheet.getCell(`B${currentRow + 1}`).value = `Name: ${
          mill.mill_cp_name || "-"
        }`;
        worksheet.getCell(`B${currentRow + 2}`).value = `Mobile: ${
          mill.mill_cp_mobile || "-"
        }`;
        worksheet.getCell(`B${currentRow + 3}`).value = `Email: ${
          mill.mill_cp_email || "-"
        }`;
        worksheet.getCell(`B${currentRow + 4}`).value = `GSTIN: ${
          mill.mill_gstin || "-"
        }`;

        worksheet.getCell(`C${currentRow}`).value = "Bank Details:";
        worksheet.getCell(`C${currentRow}`).font = { bold: true };
        worksheet.getCell(`C${currentRow + 1}`).value = `BANK: ${
          mill.mill_bank_name || "-"
        }`;
        worksheet.getCell(`C${currentRow + 2}`).value = `A/c No: ${
          mill.mill_bank_ac_no || "-"
        }`;
        worksheet.getCell(`C${currentRow + 3}`).value = `IFSC: ${
          mill.mill_bank_ifsc || "-"
        }`;
        worksheet.getCell(`C${currentRow + 4}`).value = `Branch: ${
          mill.mill_bank_branch_name || "-"
        }`;

        worksheet.getCell(`D${currentRow}`).value = `State: ${
          mill.mill_state || "-"
        }`;
        worksheet.getCell(`D${currentRow + 1}`).value = `Status: ${
          mill.mill_status || "-"
        }`;

        for (let row = currentRow; row <= currentRow + 4; row++) {
          for (let col = 1; col <= 4; col++) {
            const cell = worksheet.getCell(row, col);
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          }
        }

        worksheet.getRow(currentRow).height = 20;
        worksheet.getRow(currentRow + 1).height = 20;
        worksheet.getRow(currentRow + 2).height = 40;
        worksheet.getRow(currentRow + 3).height = 20;
        worksheet.getRow(currentRow + 4).height = 20;

        currentRow += 6;
      });

      worksheet.columns = [
        { width: 35 },
        { width: 25 },
        { width: 25 },
        { width: 15 },
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Mill-Report-${dayjs().format("DD-MM-YYYY")}.xlsx`;
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
              title="Mill Report"
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
                        Mill Report
                      </h1>
                    </div>

                    <div>
                      {Object.entries(groupedReportData).map(
                        ([millName, millData]) => {
                          const mill = millData[0];
                          const millShort = mill.mill_short;
                          return (
                            <div
                              key={millName}
                              className="mb-6 border border-black text-[13px]"
                            >
                              <div className="p-2 bg-gray-200 font-bold border-b border-black flex justify-between items-center">
                                <div className="flex gap-2">
                                  <span>{millShort}</span>

                                  <span> - {millName}</span>
                                </div>
                                <span className="text-sm font-normal">
                                  {mill.mill_state}
                                </span>
                              </div>

                              <div className="flex flex-col md:flex-row">
                                <div className="flex-1 border-r border-black min-h-[150px]">
                                  <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                    Billing Address
                                  </div>
                                  <div className="p-3 h-full flex items-start">
                                    <div className="whitespace-pre-line break-words">
                                      {mill.mill_billing_address}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 border-r border-black min-h-[150px]">
                                  <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                    Contact Details
                                  </div>
                                  <div className="h-full">
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        Name:
                                      </span>
                                      <span className="text-right">
                                        {mill.mill_cp_name || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        Mobile:
                                      </span>
                                      <span className="text-right">
                                        {mill.mill_cp_mobile || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        Email:
                                      </span>
                                      <span className="text-right break-all">
                                        {mill.mill_cp_email || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 flex justify-between">
                                      <span className="font-semibold">
                                        GSTIN:
                                      </span>
                                      <span className="text-right break-all">
                                        {mill.mill_gstin || "-"}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 min-h-[150px]">
                                  <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                    Bank Details
                                  </div>
                                  <div className="h-full">
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        BANK:
                                      </span>
                                      <span className="text-right">
                                        {mill.mill_bank_name || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        A/c No:
                                      </span>
                                      <span className="text-right break-all">
                                        {mill.mill_bank_ac_no || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 border-b border-gray-300 flex justify-between">
                                      <span className="font-semibold">
                                        IFSC:
                                      </span>
                                      <span className="text-right">
                                        {mill.mill_bank_ifsc || "-"}
                                      </span>
                                    </div>
                                    <div className="p-2 flex justify-between">
                                      <span className="font-semibold">
                                        Branch:
                                      </span>
                                      <span className="text-right break-all">
                                        {mill.mill_bank_branch_name || "-"}
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
                  <p>No mill data available.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MillReport;
