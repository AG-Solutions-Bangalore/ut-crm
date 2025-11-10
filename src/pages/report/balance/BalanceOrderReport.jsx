/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { Button, Card, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import useToken from '../../../api/usetoken';
import { Download, Printer, FileSpreadsheet } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import * as ExcelJS from 'exceljs';
import Loader from '../../../components/common/Loader';

const BalanceOrderReport = () => {
  const [reportData, setReportData] = useState([]);
  const containerRef = useRef(null);
  const token = useToken();

  const { isFetching } = useQuery({
    queryKey: ['balanceOrderReport'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}balanceOrderReport`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setReportData(response.data.data || []);
      return response.data;
    },
    enabled: !!token,
  });

  const groupedReportData = reportData.reduce((acc, item) => {
    const millName = item.mill_name;
    if (!acc[millName]) {
      acc[millName] = [];
    }
    acc[millName].push(item);
    return acc;
  }, {});

  const calculateMillTotals = (millData) => {
    return millData.reduce((acc, item) => {
      acc.tones += parseFloat(item.total_billing_tones) || 0;
      acc.quantity += parseFloat(item.total_quantity) || 0;
      acc.balance += parseFloat(item.balance) || 0;
      return acc;
    }, { tones: 0, quantity: 0, balance: 0 });
  };

  const calculateOverallTotals = () => {
    return reportData.reduce((acc, item) => {
      acc.tones += parseFloat(item.total_billing_tones) || 0;
      acc.quantity += parseFloat(item.total_quantity) || 0;
      acc.balance += parseFloat(item.balance) || 0;
      return acc;
    }, { tones: 0, quantity: 0, balance: 0 });
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
      filename: `Balance-Order-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
    documentTitle: `Balance-Order-Report-${dayjs().format('DD-MM-YYYY')}`,
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
      const worksheet = workbook.addWorksheet('Balance Order Report');

      worksheet.columns = [
        { header: 'Mill Name', key: 'mill_name', width: 30 },
        { header: 'SL No', key: 'sl_no', width: 8 },
        { header: 'PO Ref', key: 'purchase_orders_ref', width: 20 },
        { header: 'Tones', key: 'total_billing_tones', width: 12 },
        { header: 'Qnty', key: 'total_quantity', width: 12 },
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
      const overallTotals = calculateOverallTotals();

      Object.entries(groupedReportData).forEach(([millName, millData]) => {
        const millTotals = calculateMillTotals(millData);

        millData.forEach((item, index) => {
          worksheet.addRow({
            mill_name: millName,
            sl_no: index + 1,
            purchase_orders_ref: item.purchase_orders_ref,
            total_billing_tones: parseFloat(item.total_billing_tones).toFixed(2),
            total_quantity: parseFloat(item.total_quantity).toFixed(2),
            balance: parseFloat(item.balance).toFixed(2)
          });
          currentRow++;
        });

        const totalRow = worksheet.addRow({
          mill_name: `${millName} - Total`,
          total_billing_tones: millTotals.tones.toFixed(2),
          total_quantity: millTotals.quantity.toFixed(2),
          balance: millTotals.balance.toFixed(2)
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
        mill_name: 'GRAND TOTAL',
        total_billing_tones: overallTotals.tones.toFixed(2),
        total_quantity: overallTotals.quantity.toFixed(2),
        balance: overallTotals.balance.toFixed(2)
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
      link.download = `Balance-Order-Report-${dayjs().format('DD-MM-YYYY')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Failed to export Excel file');
    }
  };

  const overallTotals = calculateOverallTotals();


  if(isFetching){
  return <Loader msg ="Balance Order Report"/>
  }
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
          <div className="w-full">
            <Card 
              title="Balance Order Report" 
              className="shadow-lg min-h-[800px]"
              extra={
                <>
                  {reportData.length > 0 && (
                 <div className=" flex justify-between items-center ">
                    
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
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-center">Balance Order Report</h1>
                    
                    </div>

                    <div>
                      {Object.entries(groupedReportData).map(([millName, millData]) => {
                        const totals = calculateMillTotals(millData);
                        
                        return (
                          <div
                            key={millName}
                            className="mb-6 border-t border-l border-r border-black text-[13px]"
                          >
                            <h2 className="p-2 bg-gray-200 font-bold border-b border-black">{millName}</h2>
                            
                            <div
                              className="grid bg-white"
                              style={{
                                gridTemplateColumns: "0.5fr 1.2fr 0.8fr 0.8fr 0.8fr",
                              }}
                            >
                              {[
                                "SL NO",
                                "PO Ref",
                                "Tones",
                                "Qnty",
                                "Balance"
                              ].map((header, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 font-bold border-b border-r border-t border-black text-gray-900 text-center"
                                >
                                  {header}
                                </div>
                              ))}

                              {millData.map((item, index) => (
                                <React.Fragment key={index}>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {index + 1}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-center">
                                    {item.purchase_orders_ref}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-right">
                                    {parseFloat(item.total_billing_tones).toFixed(2)}
                                  </div>
                                  <div className="p-2 border-b border-r border-black text-right">
                                    {parseFloat(item.total_quantity).toFixed(2)}
                                  </div>
                                  <div className="p-2 border-b border-black text-right">
                                    {parseFloat(item.balance).toFixed(2)}
                                  </div>
                                </React.Fragment>
                              ))}

                              <div className="p-2 border-b border-r border-black font-bold"></div>
                              <div className="p-2 border-b border-r border-black font-bold text-center">
                                Total
                              </div>
                              <div className="p-2 border-b border-r border-black font-bold text-right">
                                {totals.tones.toFixed(2)}
                              </div>
                              <div className="p-2 border-b border-r border-black font-bold text-right">
                                {totals.quantity.toFixed(2)}
                              </div>
                              <div className="p-2 border-b border-black font-bold text-right">
                                {totals.balance.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div
                        className="grid bg-gray-100 border-t border-l border-r border-black font-bold text-[13px]"
                        style={{
                          gridTemplateColumns: "0.5fr 1.2fr 0.8fr 0.8fr 0.8fr",
                        }}
                      >
                        <div className="p-2 border-b border-black"></div>
                        <div className="p-2 border-b border-r border-black font-bold text-center">
                          Grand Total
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {overallTotals.tones.toFixed(2)}
                        </div>
                        <div className="p-2 border-b border-r border-black text-right">
                          {overallTotals.quantity.toFixed(2)}
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
                  <p>No balance order data available.</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceOrderReport;