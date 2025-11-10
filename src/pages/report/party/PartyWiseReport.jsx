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

const PartyWiseReport = () => {
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

  const groupedReportData = reportData.reduce((acc, item) => {
    const partyName = item.party_name;
    if (!acc[partyName]) {
      acc[partyName] = [];
    }
    acc[partyName].push(item);
    return acc;
  }, {});

  const calculatePartyTotals = (partyData) => {
    return partyData.reduce((acc, item) => {
      acc.tones += parseFloat(item.billing_tones) || 0;
      acc.amount += parseFloat(item.amount) || 0;
      return acc;
    }, { tones: 0, amount: 0 });
  };

  const calculateOverallTotals = () => {
    return reportData.reduce((acc, item) => {
      acc.tones += parseFloat(item.billing_tones) || 0;
      acc.amount += parseFloat(item.amount) || 0;
      return acc;
    }, { tones: 0, amount: 0 });
  };

  const calculateOverdueDays = (purchaseDate) => {
    const purchase = dayjs(purchaseDate);
    const today = dayjs();
    return today.diff(purchase, 'day');
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
        `${import.meta.env.VITE_API_BASE_URL}partywiseReport`,
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
      filename: `Party-Wise-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
    documentTitle: `Party-Wise-Report-${dayjs().format('DD-MM-YYYY')}`,
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
      const worksheet = workbook.addWorksheet('Party Wise Report');

      worksheet.columns = [
        { header: 'Party Name', key: 'party_name', width: 30 },
        { header: 'P Date', key: 'purchase_date', width: 12 },
        { header: 'Bill No', key: 'billing_no', width: 15 },
        { header: 'Mill', key: 'mill_name', width: 25 },
        { header: 'S Date', key: 'sale_date', width: 12 },
        { header: 'Credit', key: 'billing_party_id', width: 10 },
        { header: 'Overdue', key: 'overdue_days', width: 10 },
        { header: 'BF', key: 'billing_bf', width: 15 },
        { header: 'Tones', key: 'billing_tones', width: 12 },
        { header: 'S Rate', key: 'sale_rate', width: 12 },
        { header: 'Amount', key: 'amount', width: 15 }
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };

      let currentRow = 2;
      const overallTotals = calculateOverallTotals();

      Object.entries(groupedReportData).forEach(([partyName, partyData]) => {
        const partyTotals = calculatePartyTotals(partyData);

        partyData.forEach((item) => {
          worksheet.addRow({
            party_name: partyName,
            purchase_date: dayjs(item.purchase_date).format('DD-MM-YYYY'),
            billing_no: item.billing_no,
            mill_name: item.mill_name,
            sale_date: dayjs(item.purchase_date).format('DD-MM-YYYY'),
            billing_party_id: item.billing_party_id,
            overdue_days: calculateOverdueDays(item.purchase_date),
            billing_bf: item.billing_bf,
            billing_tones: parseFloat(item.billing_tones).toFixed(2),
            sale_rate: `₹${parseFloat(item.sale_rate).toFixed(2)}`,
            amount: `₹${parseFloat(item.amount).toFixed(2)}`
          });
          currentRow++;
        });

        const totalRow = worksheet.addRow({
          party_name: `${partyName} - Total`,
          billing_tones: partyTotals.tones.toFixed(2),
          amount: `₹${partyTotals.amount.toFixed(2)}`
        });
        totalRow.font = { bold: true };
        totalRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF0F0F0' }
        };
        currentRow++;
      });

      const grandTotalRow = worksheet.addRow({
        party_name: 'GRAND TOTAL',
        billing_tones: overallTotals.tones.toFixed(2),
        amount: `₹${overallTotals.amount.toFixed(2)}`
      });
      grandTotalRow.font = { bold: true, size: 12 };
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
      link.download = `Party-Wise-Report-${dayjs().format('DD-MM-YYYY')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Failed to export Excel file');
    }
  };

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
              title="Party Report Criteria" 
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
              title="Party Wise Report" 
              className="shadow-lg min-h-[800px]"
              extra={
                <div className="text-sm text-gray-500">
                  {reportData.length > 0 ? `${reportData.length} records found` : 'No data to display'}
                </div>
              }
            >
              {reportData.length > 0 ? (
                <div>
                  <div className="print-hide flex justify-between items-center p-2 rounded-lg mb-5 bg-gray-200">
                    <h1 className="text-xl font-bold">Party Wise Report</h1>
                    <div className="flex flex-row items-center gap-4 font-bold">
                      <span className="mr-2">
                        From - {dayjs(fromDate).format("DD-MMM-YYYY")}
                      </span>
                      To - {dayjs(toDate).format("DD-MMM-YYYY")}
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

                  <div ref={containerRef} className="md:overflow-x-auto">
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-center">Party Wise Report</h1>
                      <div className="text-center text-lg mt-2">
                        Period: {dayjs(fromDate).format("DD-MMM-YYYY")} to {dayjs(toDate).format("DD-MMM-YYYY")}
                      </div>
                    </div>

                    <div>
                      {Object.entries(groupedReportData).map(([partyName, partyData]) => {
                        const totals = calculatePartyTotals(partyData);
                        
                        return (
                          <div
                            key={partyName}
                            className="mb-6 border-t border-l border-r border-black text-[13px]"
                          >
                            <h2 className="p-2 bg-gray-200 font-bold border-b border-black">{partyName}</h2>
                            
                            <div
                              className="grid bg-white"
                              style={{
                                gridTemplateColumns: "0.8fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                              }}
                            >
                              {[
                                "P Date",
                                "Bill No",
                                "Mill",
                                "S Date",
                                "Credit",
                                "Overdue",
                                "BF",
                                "Tones",
                                "S Rate"
                              ].map((header, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                                >
                                  {header}
                                </div>
                              ))}

                              {partyData.map((item, index) => (
                                <React.Fragment key={index}>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {dayjs(item.purchase_date).format('DD-MM-YYYY')}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {item.billing_no}
                                  </div>
                                  <div className="p-2 border-b border-r border-black">
                                    {item.mill_name}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {dayjs(item.purchase_date).format('DD-MM-YYYY')}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {item.billing_party_id}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {calculateOverdueDays(item.purchase_date)} days
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {item.billing_bf}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-right">
                                    {parseFloat(item.billing_tones).toFixed(2)}
                                  </div>
                                  <div className="p-2 border-b border-black text-right">
                                    ₹{parseFloat(item.sale_rate).toFixed(2)}
                                  </div>
                                </React.Fragment>
                              ))}

                              <div className="p-2 border-b border-r border-black font-bold"></div>
                              <div className="p-2 border-b border-r border-black"></div>
                              <div className="p-2 border-b border-r border-black"></div>
                              <div className="p-2 border-b border-r border-black"></div>
                              <div className="p-2 border-b border-r border-black"></div>
                              <div className="p-2 border-b border-r border-black"></div>
                              <div className="p-2 border-b border-r border-black font-bold text-center">
                                Total
                              </div>
                              <div className="p-2 border-b border-r border-black font-bold text-right">
                                {totals.tones.toFixed(2)}
                              </div>
                              <div className="p-2 border-b border-black"></div>
                            </div>
                          </div>
                        );
                      })}

                      <div
                        className="grid bg-gray-100 border-t border-l border-r border-black font-bold text-[13px]"
                        style={{
                          gridTemplateColumns: "0.8fr 0.8fr 1.2fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr",
                        }}
                      >
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-r border-black font-bold text-center">
                          Grand Total
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {overallTotals.tones.toFixed(2)}
                        </div>
                        <div className="p-2 border-b border-black"></div>
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

export default PartyWiseReport;