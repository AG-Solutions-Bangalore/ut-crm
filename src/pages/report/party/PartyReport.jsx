import React, { useState, useRef } from 'react';
import { Button, Card, message } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useToken from '../../../api/usetoken';
import Loader from '../../../components/common/Loader';
import { Download, FileSpreadsheet, Printer } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import html2pdf from 'html2pdf.js';
import * as ExcelJS from 'exceljs';


const PartyReport = () => {
  const [reportData, setReportData] = useState([]);
  const containerRef = useRef(null);
  const token = useToken();



 
  const { isFetching } = useQuery({
    queryKey: ['partyReport'],
    queryFn: async () => {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}partyReport`,
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
        filename: `Party-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
    documentTitle: `Party-Report-${dayjs().format('DD-MM-YYYY')}`,
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
        const worksheet = workbook.addWorksheet('Party Report');
  
        worksheet.columns = [
          { header: 'Party Name', key: 'party_name', width: 30 },
          { header: 'Party Short', key: 'party_short', width: 15 },
          { header: 'Billing Address', key: 'party_billing_address', width: 40 },
          { header: 'Delivery Address', key: 'party_delivery_address', width: 40 },
          { header: 'Contact Name', key: 'party_cp_name', width: 20 },
          { header: 'Mobile', key: 'party_cp_mobile', width: 15 },
          { header: 'Due Days', key: 'party_due_days', width: 10 },
          { header: 'GSTIN', key: 'party_gstin', width: 20 },
          { header: 'State', key: 'party_state', width: 15 },
          { header: 'Status', key: 'party_status', width: 10 }
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
            party_name: item.party_name,
            party_short: item.party_short,
            party_billing_address: item.party_billing_address,
            party_delivery_address: item.party_delivery_address,
            party_cp_name: item.party_cp_name,
            party_cp_mobile: item.party_cp_mobile,
            party_due_days: item.party_due_days,
            party_gstin: item.party_gstin,
            party_state: item.party_state,
            party_status: item.party_status
          });
        });
  
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Party-Report-${dayjs().format('DD-MM-YYYY')}.xlsx`;
        link.click();
        URL.revokeObjectURL(url);
  
        message.success('Excel file downloaded successfully');
      } catch (error) {
        console.error('Excel export error:', error);
        message.error('Failed to export Excel file');
      }
    };
  if(isFetching){
    return <Loader msg="Party Report"/>
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
              title="Party Report" 
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
                  <div ref={containerRef} className="">
                    <div className="p-4">
                      <h1 className="text-2xl font-bold text-center">Party Report</h1>
                    </div>

                    <div>
                      {Object.entries(groupedReportData).map(([partyName, partyData]) => {
                        const party = partyData[0];
                        
                        return (
                          <div
                            key={partyName}
                            className="mb-6 border border-black text-[13px]"
                          >
                            <div className="p-2 bg-gray-200 font-bold border-b border-black flex justify-between items-center">
                              <span>{partyName}</span>
                              <span className="text-sm font-normal">{party.party_state}</span>
                            </div>
                            
                            <div className="flex flex-col md:flex-row">
                              {/* Billing Address Column */}
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

                              {/* Delivery Address Column */}
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

                              {/* Contact Details Column */}
                              <div className="flex-1 min-h-[120px]">
                                <div className="p-2 font-bold border-b border-black text-center bg-gray-100">
                                  Contact Details
                                </div>
                                <div className="h-full">
                                  <div className="p-2 border-b border-gray-300 flex justify-between">
                                    <span className="font-semibold">Name:</span>
                                    <span className="text-right">{party.party_cp_name || 'N/A'}</span>
                                  </div>
                                  <div className="p-2 border-b border-gray-300 flex justify-between">
                                    <span className="font-semibold">Mobile:</span>
                                    <span className="text-right">{party.party_cp_mobile || 'N/A'}</span>
                                  </div>
                                  <div className="p-2 border-b border-gray-300 flex justify-between">
                                    <span className="font-semibold">Due:</span>
                                    <span className="text-right">{party.party_due_days} days</span>
                                  </div>
                                  <div className="p-2 flex justify-between">
                                    <span className="font-semibold">GSTIN:</span>
                                    <span className="text-right break-all">{party.party_gstin}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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