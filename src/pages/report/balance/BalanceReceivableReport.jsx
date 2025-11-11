/* eslint-disable no-unused-vars */

import React, { useState, useRef } from 'react';
import { Select, DatePicker, Button, Form, message, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import useToken from '../../../api/usetoken';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import * as ExcelJS from 'exceljs';

const { Option } = Select;

const BalanceReceivableReport = () => {
  const [form] = Form.useForm();
  const [fromDate, setFromDate] = useState(dayjs().month(3).date(1)); 
  const [toDate, setToDate] = useState(dayjs()); 
  const [selectedMill, setSelectedMill] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  const token = useToken();

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

  const { data: partiesData, isLoading: partiesLoading } = useQuery({
    queryKey: ['activeParties'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}activePartys`,
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

  const groupDataByMillAndMonth = (data) => {
    const grouped = {};
    
    data.forEach(item => {
      const millName = item.mill_name;
      const monthYear = dayjs(item.sale_date).format('MMM-YY');
      
      if (!grouped[millName]) {
        grouped[millName] = {};
      }
      
      if (!grouped[millName][monthYear]) {
        grouped[millName][monthYear] = [];
      }
      
      grouped[millName][monthYear].push(item);
    });
    
    return grouped;
  };
console.log(reportData.length)
  const calculateMonthTotals = (monthData) => {
    return monthData.reduce((acc, item) => {
      acc.amount += parseFloat(item.purchase_amount) || 0;
      acc.balance += parseFloat(item.balance) || 0;
      return acc;
    }, { amount: 0, balance: 0 });
  };

  const calculateMillTotals = (millData) => {
    let totalAmount = 0;
    let totalBalance = 0;
    
    Object.values(millData).forEach(monthData => {
      const monthTotals = calculateMonthTotals(monthData);
      totalAmount += monthTotals.amount;
      totalBalance += monthTotals.balance;
    });
    
    return { amount: totalAmount, balance: totalBalance };
  };

  const calculateOverallTotals = () => {
    let totalAmount = 0;
    let totalBalance = 0;
    
    Object.values(groupedReportData).forEach(millData => {
      const millTotals = calculateMillTotals(millData);
      totalAmount += millTotals.amount;
      totalBalance += millTotals.balance;
    });
    
    return { amount: totalAmount, balance: totalBalance };
  };

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      message.error('Please select both From Date and To Date');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        from_date: fromDate.format('YYYY-MM-DD'),
        to_date: toDate.format('YYYY-MM-DD'),
        mill_id: selectedMill,
        party_id: selectedParty || ''
      };

      const response = await axios.post(
        `https://theunitedtraders.co.in/crmapi/public/api/balanceReceivablesReport`,
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
    setFromDate(dayjs().month(3).date(1)); 
    setToDate(dayjs()); 
    setSelectedMill(null);
    setSelectedParty(null);
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
      filename: `Balance-Receivable-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
    documentTitle: `Balance-Receivable-Report-${dayjs().format('DD-MM-YYYY')}`,
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
      const worksheet = workbook.addWorksheet('Balance Receivable Report');

      worksheet.columns = [
        { header: 'Mill Name', key: 'mill_name', width: 25 },
        { header: 'Month', key: 'month', width: 12 },
        { header: 'SL No', key: 'sl_no', width: 8 },
        { header: 'Bill No', key: 'billing_no', width: 15 },
        { header: 'Particulars', key: 'party_name', width: 25 },
        { header: 'Date', key: 'sale_date', width: 12 },
        { header: 'Credit', key: 'days_since_sale', width: 10 },
        { header: 'Days Over', key: 'billing_due_days', width: 10 },
        { header: 'Amount', key: 'purchase_amount', width: 12 },
        { header: 'Balance', key: 'balance', width: 12 }
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      let currentRow = 2;
      const groupedData = groupDataByMillAndMonth(reportData);
      const overallTotals = calculateOverallTotals();

      Object.entries(groupedData).forEach(([millName, months]) => {
        const millTotals = calculateMillTotals(months);

        Object.entries(months).forEach(([month, monthData]) => {
          const monthTotals = calculateMonthTotals(monthData);

          monthData.forEach((item, index) => {
            worksheet.addRow({
              mill_name: millName,
              month: month,
              sl_no: index + 1,
              billing_no: item.billing_no,
              party_name: item.party_name,
              sale_date: dayjs(item.sale_date).format('DD-MM-YYYY'),
              days_since_sale: item.days_since_sale,
              billing_due_days: item.billing_due_days,
              purchase_amount: parseFloat(item.purchase_amount).toFixed(2),
              balance: parseFloat(item.balance).toFixed(2)
            });
            currentRow++;
          });

          const monthTotalRow = worksheet.addRow({
            mill_name: `${millName} - ${month} Total`,
            purchase_amount: monthTotals.amount.toFixed(2),
            balance: monthTotals.balance.toFixed(2)
          });
          monthTotalRow.font = { bold: true };
          monthTotalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF0F0F0' }
          };
          currentRow++;
        });

        const millTotalRow = worksheet.addRow({
          mill_name: `${millName} - Grand Total`,
          purchase_amount: millTotals.amount.toFixed(2),
          balance: millTotals.balance.toFixed(2)
        });
        millTotalRow.font = { bold: true, size: 12 };
        millTotalRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
        currentRow++;
      });

      const grandTotalRow = worksheet.addRow({
        mill_name: 'OVERALL GRAND TOTAL',
        purchase_amount: overallTotals.amount.toFixed(2),
        balance: overallTotals.balance.toFixed(2)
      });
      grandTotalRow.font = { bold: true, size: 14 };
      grandTotalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFC0C0C0' }
      };

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Balance-Receivable-Report-${dayjs().format('DD-MM-YYYY')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Failed to export Excel file');
    }
  };

  const groupedReportData = groupDataByMillAndMonth(reportData);
  const overallTotals = calculateOverallTotals();

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
          <div className="w-full lg:w-2/6">
            <Card 
              title="Balance Receivable Report Criteria" 
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
                        From Date <span className="text-red-500">*</span>
                      </span>
                    }
                    required
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      value={fromDate}
                      onChange={setFromDate}
                      format="YYYY-MM-DD"
                      placeholder="Select From Date"
                    />
                  </Form.Item>
                  
                  <Form.Item
                    label={
                      <span>
                        To Date <span className="text-red-500">*</span>
                      </span>
                    }
                    required
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      value={toDate}
                      onChange={setToDate}
                      format="YYYY-MM-DD"
                      placeholder="Select To Date"
                    />
                  </Form.Item>
                </div>

                <div className="mb-6">
                  <Form.Item label="Mill">
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

                <div className="mb-6">
                  <Form.Item label="Party">
                    <Select
                      placeholder="Select Party"
                      loading={partiesLoading}
                      onChange={setSelectedParty}
                      allowClear
                      showSearch
                      filterOption={(input, option) =>
                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                      value={selectedParty}
                    >
                      {partiesData?.data?.map((party) => (
                        <Option key={party.id} value={party.id}>
                          {party.party_name}
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
                    disabled={!fromDate || !toDate}
                  >
                    Generate Report
                  </Button>
                </div>
              </Form>
            </Card>
          </div>

          <div className="w-full lg:w-4/6">
            <Card 
              title="Balance Receivable Report" 
              className="shadow-lg min-h-[800px]"
              extra={
                <>
                  {reportData.length > 0 && (
                    <div className="flex justify-between items-center">
                      <div className="flex flex-row items-center gap-1 font-bold">
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
                    <div className="">
                      <h1 className="text-2xl font-bold text-center">Balance Receivable Report</h1>
                      <div className="text-center text-lg mt-2">
                        Period: {dayjs(fromDate).format("DD-MMM-YYYY")} to {dayjs(toDate).format("DD-MMM-YYYY")}
                      </div>
                    </div>

                    <div>
                      {Object.entries(groupedReportData).map(([millName, months]) => {
                        const millTotals = calculateMillTotals(months);
                        
                        return (
                          <div key={millName} className="mb-6">
                            <div className="border-t border-l border-r border-black">
                              <h2 className="p-2 bg-gray-200 font-bold border-b border-black">{millName}</h2>
                              
                              {Object.entries(months).map(([month, monthData]) => {
                                const monthTotals = calculateMonthTotals(monthData);
                                
                                return (
                                  <div key={month} className="mb-4">
                                    <h3 className="p-2 bg-gray-100 font-semibold border-b border-black">{month}</h3>
                                    
                                    <div
                                      className="grid bg-white text-[13px]"
                                      style={{
                                        gridTemplateColumns: "0.5fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                                      }}
                                    >
                                      {[
                                        "SL No",
                                        "Bill No",
                                        "Particulars",
                                        "Date",
                                        "Credit",
                                        "Days Over",
                                        "Amount",
                                        "Balance"
                                      ].map((header, idx) => (
                                        <div
                                          key={idx}
                                          className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                                        >
                                          {header}
                                        </div>
                                      ))}

                                      {monthData.map((item, index) => (
                                        <React.Fragment key={index}>
                                          <div className="p-2 border-b border-r border-black text-center">
                                            {index + 1}
                                          </div>
                                          <div className="p-2 border-b border-r border-black text-center">
                                            {item.billing_no}
                                          </div>
                                          <div className="p-2 border-b border-r border-black">
                                            {item.party_name}
                                          </div>
                                          <div className="p-2 border-b border-r border-black text-center">
                                            {dayjs(item.sale_date).format('DD-MM-YYYY')}
                                          </div>
                                          <div className="p-2 border-b border-r border-black text-center">
                                            {item.days_since_sale}
                                          </div>
                                          <div className="p-2 border-b border-r border-black text-center">
                                            {item.billing_due_days}
                                          </div>
                                          <div className="p-2 border-b border-r border-black text-right">
                                            {parseFloat(item.purchase_amount).toFixed(2)}
                                          </div>
                                          <div className="p-2 border-b border-black text-right">
                                            {parseFloat(item.balance).toFixed(2)}
                                          </div>
                                        </React.Fragment>
                                      ))}

                                      <div className="p-2 border-b border-r border-black font-bold"></div>
                                      <div className="p-2 border-b border-r border-black font-bold"></div>
                                      <div className="p-2 border-b border-r border-black font-bold text-center">
                                        Total
                                      </div>
                                      <div className="p-2 border-b border-r border-black font-bold"></div>
                                      <div className="p-2 border-b border-r border-black font-bold"></div>
                                      <div className="p-2 border-b border-r border-black font-bold"></div>
                                      <div className="p-2 border-b border-r border-black font-bold text-right">
                                        {monthTotals.amount.toFixed(2)}
                                      </div>
                                      <div className="p-2 border-b border-black font-bold text-right">
                                        {monthTotals.balance.toFixed(2)}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              <div
                                className="grid bg-gray-100 border-t border-l border-r border-black font-bold text-[13px]"
                                style={{
                                  gridTemplateColumns: "0.5fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                                }}
                              >
                                <div className="p-2 border-b border-black"></div>
                                <div className="p-2 border-b border-black"></div>
                                <div className="p-2 border-b border-r border-black font-bold text-center">
                                  Sub Total
                                </div>
                                <div className="p-2 border-b border-black"></div>
                                <div className="p-2 border-b border-black"></div>
                                <div className="p-2 border-b border-black"></div>
                                <div className="p-2 border-b border-r border-black text-right">
                                  {millTotals.amount.toFixed(2)}
                                </div>
                                <div className="p-2 border-b border-black text-right">
                                  {millTotals.balance.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div
                        className="grid bg-gray-200 border-t border-l border-r border-black font-bold text-[13px]"
                        style={{
                          gridTemplateColumns: "0.5fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                        }}
                      >
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-r border-black font-bold text-center">
                          GRAND TOTAL
                        </div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {overallTotals.amount.toFixed(2)}
                        </div>
                        <div className="p-2 border-b border-black text-right">
                          {overallTotals.balance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold mb-2">No Report Data</h3>
                  <p>Please select date range, mill, and optionally a party to generate the report.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceReceivableReport;
