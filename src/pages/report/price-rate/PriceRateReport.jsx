import { Button, Card, Input, message } from "antd";
import dayjs from "dayjs";
import * as ExcelJS from "exceljs";
import html2pdf from "html2pdf.js";
import { Download, FileSpreadsheet, Printer, Search } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { PRICE_RATE_REPORT } from "../../../api";
import Loader from "../../../components/common/Loader";
import { useGetApiMutation } from "../../../hooks/useGetApiMutation";

const PriceRateReport = () => {
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const { data: result, isLoading } = useGetApiMutation({
    url: PRICE_RATE_REPORT,
    queryKey: ["priceRateReport"],
  });

  const reportData = result?.data || [];

  useEffect(() => {
    if (searchTerm) {
      const filtered = reportData.filter(
        (item) =>
          item.mill_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.party_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(reportData);
    }
  }, [searchTerm, reportData]);

  const calculateTotals = () => {
    return filteredData.reduce(
      (acc, item) => {
        acc.purchaseRate += parseFloat(item.purchase_rate) || 0;
        acc.saleRate += parseFloat(item.sale_rate) || 0;
        return acc;
      },
      { purchaseRate: 0, saleRate: 0 }
    );
  };

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
    `;
    elementForPdf.appendChild(style);

    const options = {
      margin: [10, 10, 10, 10],
      filename: `Price-Rate-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
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
    documentTitle: `Price-Rate-Report-${dayjs().format("DD-MM-YYYY")}`,
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
      }
    `,
  });

  const handleExcelExport = async () => {
    if (filteredData.length === 0) {
      message.error("No data to export");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Price Rate Report");

      worksheet.columns = [
        { header: "Mill", key: "mill_name", width: 25 },
        { header: "Party", key: "party_name", width: 25 },
        { header: "BF", key: "billing_bf", width: 15 },
        { header: "Purchase Date", key: "purchase_date", width: 12 },
        { header: "Purchase Rate", key: "purchase_rate", width: 12 },
        { header: "Sale Date", key: "sale_date", width: 12 },
        { header: "Sale Rate", key: "sale_rate", width: 12 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD3D3D3" },
      };

      filteredData.forEach((item) => {
        worksheet.addRow({
          mill_name: item.mill_name,
          party_name: item.party_name,
          billing_bf: item.billing_bf,
          purchase_date: dayjs(item.purchase_date).format("DD-MM-YYYY"),
          purchase_rate: parseFloat(item.purchase_rate).toFixed(2),
          sale_date: dayjs(item.sale_date).format("DD-MM-YYYY"),
          sale_rate: parseFloat(item.sale_rate).toFixed(2),
        });
      });

      const totals = calculateTotals();
      const totalRow = worksheet.addRow({
        mill_name: "TOTAL",
        purchase_rate: totals.purchaseRate.toFixed(2),
        sale_rate: totals.saleRate.toFixed(2),
      });
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F0F0" },
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Price-Rate-Report-${dayjs().format("DD-MM-YYYY")}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success("Excel file downloaded successfully");
    } catch (error) {
      console.error("Excel export error:", error);
      message.error("Failed to export Excel file");
    }
  };

  const totals = calculateTotals();
  if (isLoading) {
    return <Loader msg="Balance Order Report" />;
  }
  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
      

        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full">
            <Card
              title="Price Rate Report"
              className="shadow-lg min-h-[800px]"
              extra={
                <>
                  {reportData.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex flex-row items-center gap-1 font-bold">
                        {filteredData.length > 0
                          ? `${filteredData.length} records found`
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
                  <div className="print-hide flex items-center ">
                    <div className="flex-1">
                      <Input
                        placeholder="Search by Mill or Party..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        prefix={<Search className="h-4 w-4 text-gray-400" />}
                        allowClear
                      />
                    </div>
                  </div>

                  <div ref={containerRef} className="md:overflow-x-auto">
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-center">
                        Price Rate Report
                      </h1>
                    </div>

                    <div className="border-t border-l border-r border-black text-[13px]">
                      <div
                        className="grid bg-white"
                        style={{
                          gridTemplateColumns:
                            "1fr 1fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr",
                        }}
                      >
                        <div
                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                          style={{ gridColumn: "span 1" }}
                        >
                          Mill
                        </div>
                        <div
                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                          style={{ gridColumn: "span 1" }}
                        >
                          Party
                        </div>
                        <div
                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                          style={{ gridColumn: "span 1" }}
                        >
                          BF
                        </div>
                        <div
                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                          style={{ gridColumn: "span 2" }}
                        >
                          Purchase
                        </div>
                        <div
                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                          style={{ gridColumn: "span 2" }}
                        >
                          Sale
                        </div>

                        <div className="p-2 border-b border-r border-black"></div>
                        <div className="p-2 border-b border-r border-black"></div>
                        <div className="p-2 border-b border-r border-black"></div>
                        <div className="p-2 font-bold border-b border-r border-black text-gray-900 text-center">
                          Date
                        </div>
                        <div className="p-2 font-bold border-b border-r border-black text-gray-900 text-center">
                          Rate
                        </div>
                        <div className="p-2 font-bold border-b border-r border-black text-gray-900 text-center">
                          Date
                        </div>
                        <div className="p-2 font-bold border-b border-black text-gray-900 text-center">
                          Rate
                        </div>

                        {filteredData.length > 0 ? (
                          filteredData.map((item, index) => (
                            <React.Fragment key={index}>
                              <div className="p-2 border-b border-r border-black">
                                {item.mill_name}
                              </div>
                              <div className="p-2 border-b border-r border-black">
                                {item.party_name}
                              </div>
                              <div className="p-2 border-b border-r border-black text-center">
                                {item.billing_sub_bf}
                              </div>
                              <div className="p-2 border-b border-r border-black text-center">
                                {dayjs(item.purchase_date).format("DD-MM-YYYY")}
                              </div>
                              <div className="p-2 border-b border-r border-black text-center">
                                ₹{parseFloat(item.purchase_rate).toFixed(2)}
                              </div>
                              <div className="p-2 border-b border-r border-black text-center">
                                {dayjs(item.sale_date).format("DD-MM-YYYY")}
                              </div>
                              <div className="p-2 border-b border-black text-center">
                                ₹{parseFloat(item.sale_rate).toFixed(2)}
                              </div>
                            </React.Fragment>
                          ))
                        ) : (
                          <div className="p-2 border-b border-black text-center col-span-7 font-bold">
                            No Records Found
                          </div>
                        )}

                        <div className="p-2 border-b border-r border-black font-bold"></div>
                        <div className="p-2 border-b border-r border-black font-bold"></div>
                        <div className="p-2 border-b border-r border-black font-bold text-center">
                          TOTAL
                        </div>
                        <div className="p-2 border-b border-r border-black font-bold"></div>
                        <div className="p-2 border-b border-r border-black font-bold text-center">
                          ₹{totals.purchaseRate.toFixed(2)}
                        </div>
                        <div className="p-2 border-b border-r border-black font-bold"></div>
                        <div className="p-2 border-b border-black font-bold text-center">
                          ₹{totals.saleRate.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Report Data</h3>
                  <p>No price rate data available.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceRateReport;
