import React, { useState, useRef } from 'react';
import { Select, Button, Card, message, Form } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import useToken from '../../../api/usetoken';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import * as ExcelJS from 'exceljs';

const { Option } = Select;

const SalesReport = () => {
  const [form] = Form.useForm();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedMill, setSelectedMill] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const token = useToken();

  const { data: monthsData, isLoading: monthsLoading } = useQuery({
    queryKey: ['months'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}getMonth`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    enabled: !!token,
  });

  const { data: millsData, isLoading: millsLoading } = useQuery({
    queryKey: ['activeMills'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}activeMills`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    },
    enabled: !!token,
  });

  const calculateTotals = () => {
    return reportData.reduce((acc, item) => {
      acc.gross += parseFloat(item.gross_amount) || 0;
      acc.sgst += parseFloat(item.total_sgst) || 0;
      acc.cgst += parseFloat(item.total_cgst) || 0;
      acc.igst += parseFloat(item.total_igst) || 0;
      acc.net += parseFloat(item.grand_total) || 0;
      return acc;
    }, { gross: 0, sgst: 0, cgst: 0, igst: 0, net: 0 });
  };

  const handleGenerateReport = async () => {
    if (!selectedMonth) {
      message.error('Please select month');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        month: selectedMonth,
        mill_id: selectedMill || ''
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}salesReport`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setReportData(response.data.data || []);
      
      if (response.data.data && response.data.data.length > 0) {
        message.success('Report generated successfully');
      } else {
        message.info('No data found for the selected criteria');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedMonth(null);
    setSelectedMill(null);
    setReportData([]);
  };

  const handleDownload = () => {
    const element = containerRef?.current; 

    if (!element) {
      message.error('Failed to generate PDF');
      return;
    }

    const elementForPdf = element.cloneNode(true);
    const printHideElements = elementForPdf.querySelectorAll('.print-hide');
    printHideElements.forEach(el => el.remove());

    const style = document.createElement('style');
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
      filename: `Sales-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowHeight: elementForPdf.scrollHeight,
        backgroundColor: '#FFFFFF'
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
        message.success('PDF downloaded successfully');
      })
      .catch((error) => {
        console.error('PDF download error:', error);
        message.error('Failed to download PDF');
      });
  };

  const handlePrint = useReactToPrint({
    content: () => containerRef.current,
    documentTitle: `Sales-Report-${dayjs().format('DD-MM-YYYY')}`,
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
    if (reportData.length === 0) {
      message.error('No data to export');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sales Report');

      worksheet.columns = [
        { header: 'Inv', key: 'tax_invoice_ref', width: 20 },
        { header: 'Date', key: 'tax_invoice_date', width: 12 },
        { header: 'Mill Name', key: 'mill_name', width: 25 },
        { header: 'GSTIN', key: 'mill_gstin', width: 20 },
        { header: 'Service State', key: 'mill_state', width: 15 },
        { header: 'Gross', key: 'gross_amount', width: 12 },
        { header: 'SGST', key: 'total_sgst', width: 12 },
        { header: 'CGST', key: 'total_cgst', width: 12 },
        { header: 'IGST', key: 'total_igst', width: 12 },
        { header: 'Net Value', key: 'grand_total', width: 12 }
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      reportData.forEach((item) => {
        worksheet.addRow({
          tax_invoice_ref: item.tax_invoice_ref,
          tax_invoice_date: dayjs(item.tax_invoice_date).format('DD-MM-YYYY'),
          mill_name: item.mill_name,
          mill_gstin: item.mill_gstin,
          mill_state: item.mill_state,
          gross_amount: parseFloat(item.gross_amount).toFixed(2),
          total_sgst: parseFloat(item.total_sgst).toFixed(2),
          total_cgst: parseFloat(item.total_cgst).toFixed(2),
          total_igst: parseFloat(item.total_igst).toFixed(2),
          grand_total: parseFloat(item.grand_total).toFixed(2)
        });
      });

      const totals = calculateTotals();
      const totalRow = worksheet.addRow({
        tax_invoice_ref: 'TOTAL',
        gross_amount: totals.gross.toFixed(2),
        total_sgst: totals.sgst.toFixed(2),
        total_cgst: totals.cgst.toFixed(2),
        total_igst: totals.igst.toFixed(2),
        grand_total: totals.net.toFixed(2)
      });
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F0' }
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Sales-Report-${dayjs().format('DD-MM-YYYY')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Failed to export Excel file');
    }
  };

  const totals = calculateTotals();
  const selectedMonthText = monthsData?.data?.find(month => month.formatted_date === selectedMonth)?.formatted_date;

  return (
    <div className="min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="text-center">
          {!token && (
            <div className="text-red-500 text-sm mt-2">
              Please log in to access this feature
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-2">
          <div className="w-full lg:w-[30%]">
            <Card 
              title="Sales Report Criteria" 
              className="shadow-lg sticky"
              extra={
                <Button 
                  type="link" 
                  onClick={handleReset}
                  size="small"
                >
                  Reset
                </Button>
              }
            >
              <Form form={form} requiredMark={false} layout="vertical" className="p-2">
                <div className="mb-6">
                  <Form.Item
                    label={
                      <span>
                        Month <span className="text-red-500">*</span>
                      </span>
                    }
                    required
                  >
                    <Select
                      placeholder="Select Month"
                      loading={monthsLoading}
                      onChange={setSelectedMonth}
                      allowClear
                      value={selectedMonth}
                    >
                      {monthsData?.data?.map((month) => (
                        <Option key={month.formatted_date} value={month.formatted_date}>
                          {month.formatted_date}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="mb-6">
                  <Form.Item label="Mill (Optional)">
                    <Select
                      placeholder="Select Mill"
                      loading={millsLoading}
                      onChange={setSelectedMill}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={selectedMill}
                    >
                      {millsData?.data?.map((mill) => (
                        <Option key={mill.id} value={mill.id}>
                          {mill.mill_name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button 
                    onClick={handleReset}
                    size="large"
                  >
                    Reset
                  </Button>
                  <Button 
                    type="primary" 
                    onClick={handleGenerateReport}
                    size="large"
                    className="bg-blue-600 hover:bg-blue-700"
                    loading={loading}
                    disabled={!selectedMonth}
                  >
                    Generate Report
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

          <div className="w-full lg:w-[70%]">
            <Card 
              title="Sales Report" 
              className="shadow-lg min-h-[800px]"
              extra={
                <>
                 {reportData.length > 0 && (
                 <div className="print-hide flex justify-between items-center  rounded-lg ">
                
                    <div className="flex flex-row items-center  font-bold">
                    {reportData.length > 0 ? `${reportData.length} records found` : 'No data to display'}
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
                 

                  <div ref={containerRef} className="md:overflow-x-auto">
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-center">
                        SALES COMMISSION REPORT FOR THE MONTH OF - {selectedMonthText}
                      </h1>
                    </div>

                    <div className="border-t border-l border-r border-black text-[13px]">
                      <div
                        className="grid bg-white"
                        style={{
                          gridTemplateColumns: "1fr 0.8fr 1.2fr 1.2fr 1fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
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
                          "Net Value"
                        ].map((header, idx) => (
                          <div
                            key={idx}
                            className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                          >
                            {header}
                          </div>
                        ))}

                        {reportData.map((item, index) => (
                          <React.Fragment key={index}>
                            <div className="p-2 border-b border-r border-black text-center">
                              {item.tax_invoice_ref}
                            </div>
                            <div className="p-2 border-b border-r border-black text-center">
                              {dayjs(item.tax_invoice_date).format('DD-MM-YYYY')}
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
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Report Data</h3>
                  <p>Please select month and optionally a mill to generate the report.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;