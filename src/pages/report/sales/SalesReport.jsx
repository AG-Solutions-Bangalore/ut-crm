import { Button, Card, Form, message, Select, Spin } from "antd";
import dayjs from "dayjs";
import * as ExcelJS from "exceljs";
import html2pdf from "html2pdf.js";
import { Download, FileSpreadsheet, Printer } from "lucide-react";
import React, { useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { SALES_REPORT } from "../../../api";
import { useMasterData } from "../../../hooks";
import { useApiMutation } from "../../../hooks/useApiMutation";

const SalesReport = () => {
  const [form] = Form.useForm();
  const containerRef = useRef(null);
  const [reportData, setReportData] = useState([]);
  const { mill, months } = useMasterData({ mill: true, months: true });
  const { trigger: salesTrigger, loading: salesloading } = useApiMutation();
  const monthOptions =
    months?.data?.data?.map((item) => ({
      label: item.formatted_date,
      value: item.formatted_date,
    })) || [];

  const millOptions =
    mill?.data?.data?.map((item) => ({
      label: item.mill_short,
      value: item.id,
    })) || [];

  const fetchReportData = async (values) => {
    if (!values.month) {
      message.error("Please select a month");
      return [];
    }

    try {
      const payload = {
        month: values.month,
        mill_id: values.mill || "",
      };

      const response = await salesTrigger({
        url: SALES_REPORT,
        method: "post",
        data: payload,
      });

      const data = response?.data || [];

      if (data.length > 0) {
        message.success("Report generated successfully");
      } else {
        message.info("No data found for the selected criteria");
      }

      return data;
    } catch (error) {
      console.error("Error fetching report data:", error);
      message.error("Failed to generate report");
      return [];
    }
  };

  const calculateTotals = (reportData) =>
    reportData.reduce(
      (acc, item) => {
        acc.gross += parseFloat(item.gross_amount) || 0;
        acc.sgst += parseFloat(item.total_sgst) || 0;
        acc.cgst += parseFloat(item.total_cgst) || 0;
        acc.igst += parseFloat(item.total_igst) || 0;
        acc.net += parseFloat(item.grand_total) || 0;
        return acc;
      },
      { gross: 0, sgst: 0, cgst: 0, igst: 0, net: 0 }
    );

  const handlePrint = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: `Sales-Report-${dayjs().format("DD-MM-YYYY")}`,
    removeAfterPrint: true,
    pageStyle: `
      @page { size: A4; margin: 10mm; }
      @media print {
        body { margin: 0; padding: 0; }
        .print-hide { display: none !important; }
        .ant-card { box-shadow: none !important; border: none !important; }
        .ant-card-body { padding: 0 !important; }
      }
    `,
  });

  const handleDownloadPDF = (reportData) => {
    const element = containerRef.current;
    if (!element) return message.error("Failed to generate PDF");

    const cloned = element.cloneNode(true);
    cloned.querySelectorAll(".print-hide").forEach((el) => el.remove());

    const style = document.createElement("style");
    style.textContent = `
      * { color: #000 !important; background-color: transparent !important; }
      .bg-gray-200, .bg-gray-100, .bg-white { background-color: #fff !important; }
    `;
    cloned.appendChild(style);

    html2pdf()
      .from(cloned)
      .set({
        margin: 10,
        filename: `Sales-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          windowHeight: cloned.scrollHeight,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .save()
      .then(() => message.success("PDF downloaded successfully"))
      .catch(() => message.error("Failed to download PDF"));
  };

  const handleExcelExport = async (reportData) => {
    if (!reportData.length) return message.error("No data to export");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
      { header: "Inv", key: "tax_invoice_ref", width: 20 },
      { header: "Date", key: "tax_invoice_date", width: 12 },
      { header: "Mill Name", key: "mill_name", width: 25 },
      { header: "GSTIN", key: "mill_gstin", width: 20 },
      { header: "Service State", key: "mill_state", width: 15 },
      { header: "Gross", key: "gross_amount", width: 12 },
      { header: "SGST", key: "total_sgst", width: 12 },
      { header: "CGST", key: "total_cgst", width: 12 },
      { header: "IGST", key: "total_igst", width: 12 },
      { header: "Net Value", key: "grand_total", width: 12 },
    ];

    worksheet.addRows(
      reportData.map((item) => ({
        tax_invoice_ref: item.tax_invoice_ref,
        tax_invoice_date: dayjs(item.tax_invoice_date).format("DD-MM-YYYY"),
        mill_name: item.mill_name,
        mill_gstin: item.mill_gstin,
        mill_state: item.mill_state,
        gross_amount: parseFloat(item.gross_amount).toFixed(2),
        total_sgst: parseFloat(item.total_sgst).toFixed(2),
        total_cgst: parseFloat(item.total_cgst).toFixed(2),
        total_igst: parseFloat(item.total_igst).toFixed(2),
        grand_total: parseFloat(item.grand_total).toFixed(2),
      }))
    );

    const totals = calculateTotals(reportData);
    const totalRow = worksheet.addRow({
      tax_invoice_ref: "TOTAL",
      gross_amount: totals.gross.toFixed(2),
      total_sgst: totals.sgst.toFixed(2),
      total_cgst: totals.cgst.toFixed(2),
      total_igst: totals.igst.toFixed(2),
      grand_total: totals.net.toFixed(2),
    });
    totalRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Sales-Report-${dayjs().format("DD-MM-YYYY")}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);

    message.success("Excel file downloaded successfully");
  };
  const totals = calculateTotals(reportData);
  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto flex flex-col lg:flex-row gap-2">
        <div className="w-full lg:w-[30%]">
          <Card title="Sales Report Criteria" className="shadow-lg sticky">
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              className="p-2"
              onFinish={async (values) => {
                const data = await fetchReportData(values);
                setReportData(data);
              }}
            >
              <Form.Item
                name="month"
                label={
                  <span>
                    Month <span className="text-red-500">*</span>
                  </span>
                }
                rules={[{ required: true }]}
              >
                <Select
                  placeholder="Select Month"
                  options={monthOptions}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item name="mill" label="Mill (Optional)">
                <Select
                  placeholder="Select Mill"
                  options={millOptions}
                  showSearch
                  allowClear
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Generate Report
                </Button>
                <Button
                  type="default"
                  className="ml-2"
                  onClick={() => form.resetFields()}
                >
                  Reset
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>

        <div className="w-full lg:w-[70%]">
          <Card
            title="Sales Report"
            className="shadow-lg min-h-[800px]"
            extra={
              form.getFieldValue("reportData")?.length > 0 && (
                <div className="print-hide flex space-x-2">
                  <Button
                    onClick={() =>
                      handleDownloadPDF(form.getFieldValue("reportData"))
                    }
                  >
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                  <Button
                    onClick={() =>
                      handleExcelExport(form.getFieldValue("reportData"))
                    }
                  >
                    <FileSpreadsheet className="h-4 w-4" /> Excel
                  </Button>
                  <Button onClick={handlePrint}>
                    <Printer className="h-4 w-4" /> Print
                  </Button>
                </div>
              )
            }
          >
            {reportData.length > 0 ? (
              <div ref={containerRef} className="md:overflow-x-auto p-4">
                <h1 className="text-2xl font-bold text-center">
                  SALES COMMISSION REPORT - {form.getFieldValue("month")}
                </h1>
                {salesloading ? (
                  <div className="flex justify-center items-center py-4">
                    <Spin size="small" />
                  </div>
                ) : (
                  <div className="border-t border-l border-r border-black text-[13px]">
                    <div
                      className="grid bg-white"
                      style={{
                        gridTemplateColumns:
                          "1fr 0.8fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                      }}
                    >
                      {[
                        "Inv",
                        "Date",
                        "Mill Name",
                        "GSTIN",
                        "Service State",
                        "Gross",
                        "SGST",
                        "CGST",
                        "IGST",
                        "Net Value",
                      ].map((header, idx) => (
                        <div
                          key={idx}
                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                        >
                          {header}
                        </div>
                      ))}

                      {reportData?.map((item, index) => (
                        <React.Fragment key={index}>
                          <div className="p-2 border-b border-r border-black text-center">
                            {item.tax_invoice_ref}
                          </div>
                          <div className="p-2 border-b border-r border-black text-center">
                            {dayjs(item.tax_invoice_date).format("DD-MM-YYYY")}
                          </div>
                          <div className="p-2 border-b border-r border-black">
                            {item.mill_name}
                          </div>
                          <div className="p-2 border-b border-r border-black text-center">
                            {item.mill_gstin}
                          </div>
                          <div className="p-2 border-b border-r border-black text-center">
                            {item.mill_state}
                          </div>
                          <div className="p-2 border-b border-r border-black text-right">
                            {parseFloat(item.gross_amount).toFixed(2)}
                          </div>
                          <div className="p-2 border-b border-r border-black text-right">
                            {parseFloat(item.total_sgst).toFixed(2)}
                          </div>
                          <div className="p-2 border-b border-r border-black text-right">
                            {parseFloat(item.total_cgst).toFixed(2)}
                          </div>
                          <div className="p-2 border-b border-r border-black text-right">
                            {parseFloat(item.total_igst).toFixed(2)}
                          </div>
                          <div className="p-2 border-b border-black text-right">
                            {parseFloat(item.grand_total).toFixed(2)}
                          </div>
                        </React.Fragment>
                      ))}

                      <div className="p-2 border-b border-r border-black font-bold"></div>
                      <div className="p-2 border-b border-r border-black font-bold"></div>
                      <div className="p-2 border-b border-r border-black font-bold"></div>
                      <div className="p-2 border-b border-r border-black font-bold"></div>
                      <div className="p-2 border-b border-r border-black font-bold text-center">
                        TOTAL
                      </div>
                      <div className="p-2 border-b border-r border-black font-bold text-right">
                        {totals.gross.toFixed(2)}
                      </div>
                      <div className="p-2 border-b border-r border-black font-bold text-right">
                        {totals.sgst.toFixed(2)}
                      </div>
                      <div className="p-2 border-b border-r border-black font-bold text-right">
                        {totals.cgst.toFixed(2)}
                      </div>
                      <div className="p-2 border-b border-r border-black font-bold text-right">
                        {totals.igst.toFixed(2)}
                      </div>
                      <div className="p-2 border-b border-black font-bold text-right">
                        {totals.net.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">No Report Data</h3>
                <p>
                  Please select month and optionally a mill to generate the
                  report.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;
