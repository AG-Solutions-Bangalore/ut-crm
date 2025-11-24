import React, { useState, useRef } from 'react';
import { Select, DatePicker, Button, Form, message, Card } from 'antd';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import useToken from '../../../api/usetoken';
import { Download, Printer, FileSpreadsheet, Search, Loader2 } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import html2pdf from 'html2pdf.js';
import * as ExcelJS from 'exceljs';
import axiosInstance from '../../../api/axios';

const { Option } = Select;

const PartyLedger = () => {
  const [form] = Form.useForm();
  const [fromDate, setFromDate] = useState(dayjs().month(3).date(1)); 
  const [toDate, setToDate] = useState(dayjs()); 
  const [selectedParty, setSelectedParty] = useState(null);
  const [searchParams, setSearchParams] = useState(null);
  const tableRef = useRef(null);

  const token = useToken();

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

  // Fetch ledger data
  const { data: ledgerData, isLoading } = useQuery({
    queryKey: ["ledgerReport", searchParams],
    queryFn: async () => {
      if (!searchParams) return {
        payment: [],
        received: [],
        opening_balance: 0,
        closing_balance: 0
      };

      const payload = {
        from_id: searchParams.party_id,
        from_date: searchParams.from_date,
        to_date: searchParams.to_date,
        type: 'Receivables'
      };

      const response = await axiosInstance.post(
        'ledgerReport',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.data;
    },
    enabled: !!searchParams && !!token,
  });

  const calculateTotalPayment = () => {
    if (!ledgerData?.payment) return 0;
    return ledgerData.payment.reduce(
      (total, item) => total + (Number(item.payment_amount) || 0),
      0
    );
  };

  const calculateTotalReceived = () => {
    if (!ledgerData?.received) return 0;
    return ledgerData.received.reduce(
      (total, item) => total + (Number(item.sales_amount) || 0),
      0
    );
  };

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate || !selectedParty) {
      message.error('Please select From Date, To Date and Party');
      return;
    }

    const data = {
      party_id: selectedParty,
      from_date: fromDate.format('YYYY-MM-DD'),
      to_date: toDate.format('YYYY-MM-DD'),
      type: 'Receivables'
    };

    if (searchParams && JSON.stringify(searchParams) === JSON.stringify(data)) {
      message.info("You're already viewing results for these search criteria");
      return;
    }

    setSearchParams(data);
  };

 
  const handleDownloadPDF = () => {
      const element = tableRef?.current; 
  
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
        filename: `Receivables-Ledger-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
    content: () => tableRef.current,
    documentTitle: `Party-Ledger-Report-${searchParams?.party_id}`,
    pageStyle: `
      @page {
        size: auto;
        margin: 5mm;
      }
      @media print {
        body { 
          margin: 0 !important;
          padding: 0 !important;
          width: 100% !important;
        }
        .hidden.sm\\:block {
          display: block !important;
        }
        .flex-col.md\\:flex-row {
          display: flex !important;
          flex-direction: row !important;
          width: 100% !important;
          gap: 16px !important;
        }
        .flex-1 {
          flex: 1 1 0% !important;
          width: 50% !important;
        }
        table {
          width: 100% !important;
          border-collapse: collapse !important;
          font-size: 10pt !important;
        }
        th, td {
          border: 1px solid #ddd !important;
          padding: 4px !important;
          text-align: center !important;
        }
        .bg-red-100 {
          background-color: rgba(254, 226, 226, 1) !important;
        }
        .bg-red-50 {
          background-color: rgba(254, 242, 242, 1) !important;
        }
        .bg-green-100 {
          background-color: rgba(220, 252, 231, 1) !important;
        }
        .bg-green-50 {
          background-color: rgba(240, 253, 244, 1) !important;
        }
        .bg-gray-100 {
          background-color: rgba(243, 244, 246, 1) !important;
        }
      }
    `,
  });

  const handleExcelExport = async () => {
    if (!ledgerData) {
      message.error('No data to export');
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Party Ledger Report');

      // Add header
      worksheet.mergeCells('A1:D1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = `Party Ledger Report - ${getPartyName()}`;
      titleCell.font = { bold: true, size: 14 };
      titleCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:D2');
      const dateCell = worksheet.getCell('A2');
      dateCell.value = `From ${searchParams.from_date} to ${searchParams.to_date}`;
      dateCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A3:D3');
      const openingCell = worksheet.getCell('A3');
      openingCell.value = `Opening Balance = ₹ ${ledgerData?.opening_balance || 0}`;
      openingCell.alignment = { horizontal: 'center' };

      // Add debit section
      worksheet.mergeCells('A5:B5');
      const debitTitle = worksheet.getCell('A5');
      debitTitle.value = 'Debit Transactions';
      debitTitle.font = { bold: true };
      debitTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFDEDED' }
      };

      worksheet.getCell('A6').value = 'Date';
      worksheet.getCell('B6').value = 'Amount';
      worksheet.getRow(6).font = { bold: true };

      let rowIndex = 7;
      ledgerData?.payment?.forEach((item) => {
        worksheet.getCell(`A${rowIndex}`).value = dayjs(item.payment_date).format('DD-MM-YYYY');
        worksheet.getCell(`B${rowIndex}`).value = Number(item.payment_amount);
        rowIndex++;
      });

      if (!ledgerData?.payment?.length) {
        worksheet.mergeCells(`A${rowIndex}:B${rowIndex}`);
        worksheet.getCell(`A${rowIndex}`).value = 'No debit transactions found';
        rowIndex++;
      }

      worksheet.getCell(`A${rowIndex}`).value = 'Total';
      worksheet.getCell(`B${rowIndex}`).value = calculateTotalPayment();
      worksheet.getRow(rowIndex).font = { bold: true };
      rowIndex += 2;

      // Add credit section
      worksheet.mergeCells(`D${rowIndex-2}:E${rowIndex-2}`);
      const creditTitle = worksheet.getCell(`D${rowIndex-2}`);
      creditTitle.value = 'Credit Transactions';
      creditTitle.font = { bold: true };
      creditTitle.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE8F5E8' }
      };

      worksheet.getCell(`D${rowIndex-1}`).value = 'Date';
      worksheet.getCell(`E${rowIndex-1}`).value = 'Amount';
      worksheet.getRow(rowIndex-1).font = { bold: true };

      let creditRowIndex = rowIndex;
      ledgerData?.received?.forEach((item) => {
        worksheet.getCell(`D${creditRowIndex}`).value = dayjs(item.sale_date).format('DD-MM-YYYY');
        worksheet.getCell(`E${creditRowIndex}`).value = Number(item.sales_amount);
        creditRowIndex++;
      });

      if (!ledgerData?.received?.length) {
        worksheet.mergeCells(`D${creditRowIndex}:E${creditRowIndex}`);
        worksheet.getCell(`D${creditRowIndex}`).value = 'No credit transactions found';
        creditRowIndex++;
      }

      worksheet.getCell(`D${creditRowIndex}`).value = 'Total';
      worksheet.getCell(`E${creditRowIndex}`).value = calculateTotalReceived();
      worksheet.getRow(creditRowIndex).font = { bold: true };

      // Add closing balance
      const closingRow = Math.max(creditRowIndex, rowIndex) + 2;
      worksheet.mergeCells(`A${closingRow}:E${closingRow}`);
      const closingCell = worksheet.getCell(`A${closingRow}`);
      closingCell.value = `Closing Balance = ₹ ${ledgerData?.closing_balance || 0}`;
      closingCell.font = { bold: true };
      closingCell.alignment = { horizontal: 'center' };

      // Adjust column widths
      worksheet.columns = [
        { width: 15 },
        { width: 15 },
        { width: 5 },
        { width: 15 },
        { width: 15 }
      ];

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `party-ledger-report-${dayjs().format('DD-MM-YYYY')}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      message.success('Excel file downloaded successfully');
    } catch (error) {
      console.error('Excel export error:', error);
      message.error('Failed to export Excel file');
    }
  };

  const getPartyName = () => {
    if (!searchParams?.party_id || !partiesData?.data) return 'Unknown Party';
    const party = partiesData.data.find(party => party.id === searchParams.party_id);
    return party?.party_name || 'Unknown Party';
  };

  return (
    <div className="min-h-screen bg-gray-50/30">
      <div className="max-w-full mx-auto ">
        <div className="shadow-sm border-0">
          {/* Header Section */}
          <div className="sticky top-0 z-10 border border-gray-200 rounded-lg bg-blue-50 shadow-sm p-3 mb-2">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="w-[30%] shrink-0">
                <h1 className="text-xl font-bold text-gray-800 truncate">Receivables Ledger </h1>
                {searchParams && (
                  <p className="text-md text-gray-500 truncate">
                    {getPartyName()}
                  </p>
                )}
              </div>

              <div className="bg-white w-full lg:w-[70%] p-3 rounded-md shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-end gap-3">
                  <Form 
                    form={form}
                    onFinish={handleGenerateReport}
                    className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full"
                  >
                    <div className="space-y-1">
                      <label htmlFor="party_id" className="text-xs text-gray-700 block mb-1">
                        Party Name
                      </label>
                      <Select
                        id="party_id"
                        placeholder="Select party"
                        loading={partiesLoading}
                        value={selectedParty}
                        onChange={setSelectedParty}
                        showSearch
                        filterOption={(input, option) =>
                          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                        }
                        style={{ width: '100%', height: '32px' }}
                        className="text-xs"
                      >
                        {partiesData?.data?.map((party) => (
                          <Option key={party.id} value={party.id}>
                            {party.party_name}
                          </Option>
                        ))}
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="from_date" className="text-xs text-gray-700 block mb-1">
                        From Date
                      </label>
                      <DatePicker
                        id="from_date"
                        style={{ width: '100%', height: '32px' }}
                        value={fromDate}
                        onChange={setFromDate}
                        format="YYYY-MM-DD"
                        className="text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="to_date" className="text-xs text-gray-700 block mb-1">
                        To Date
                      </label>
                      <DatePicker
                        id="to_date"
                        style={{ width: '100%', height: '32px' }}
                        value={toDate}
                        onChange={setToDate}
                        format="YYYY-MM-DD"
                        className="text-xs"
                      />
                    </div>

                    <div className="md:col-span-3 flex justify-end">
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        className="h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                        disabled={!selectedParty || !fromDate || !toDate}
                      >
                        {isLoading ? (
                          <>
             <div className='flex flex-row items-center gap-1'>               <Loader2 className="h-3 w-3 animate-spin mr-1" />
             <span>Generating...</span></div>
                          </>
                        ) : (
                          <>
                            <div className='flex flex-row items-center gap-1'><Search className="h-3 w-3 mr-1" />
                            <span>Generate</span></div>
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </div>
          </div>

          {/* Report Results */}
          {searchParams && ledgerData && (
            <>
              <div className="border-t pt-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between sm:gap-2 mb-4">
                  <h3 className="text-lg font-semibold flex flex-row items-center gap-2">
                    Report Results
                    {ledgerData && (
                      <span className="text-blue-800 text-xs">
                        {dayjs(searchParams.from_date).format("DD-MMM-YYYY")} to {dayjs(searchParams.to_date).format("DD-MMM-YYYY")}
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleExcelExport}
                      icon={<FileSpreadsheet className="h-4 w-4" />}
                    >
                      Excel
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handleDownloadPDF}
                      icon={<Download className="h-4 w-4" />}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      onClick={handlePrint}
                      icon={<Printer className="h-4 w-4" />}
                    >
                      Print
                    </Button>
                  </div>
                </div>

                <div ref={tableRef} className="overflow-x-auto print:p-4">
                  <div className="text-center mb-4 font-semibold text-lg">
    {getPartyName()}
                  </div>
                  <div className="text-center text-sm mb-2">
                    From {dayjs(searchParams.from_date).format("DD-MMM-YYYY")} to {dayjs(searchParams.to_date).format("DD-MMM-YYYY")}
                  </div>
                  <div className="text-center text-sm mb-6">
                    Opening Balance = ₹ {ledgerData?.opening_balance || 0}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Debit Table */}
                    <div className="flex-1">
                      <table className="border w-full">
                        <thead>
                          <tr className="bg-red-100 hover:bg-red-100">
                            <th colSpan={2} className="text-center text-black bg-red-50 border p-2">
                              Debit Transactions
                            </th>
                          </tr>
                          <tr className="bg-gray-100 hover:bg-gray-100">
                            <th className="text-center border p-2">Date</th>
                            <th className="text-center border p-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledgerData?.payment?.length ? (
                            ledgerData.payment.map((item, index) => (
                              <tr
                                key={`debit-${index}`}
                                className={index % 2 === 0 ? "bg-white" : "bg-red-50/30"}
                              >
                                <td className="text-center border p-2">
                                  {dayjs(item.payment_date).format("DD-MM-YYYY")}
                                </td>
                                <td className="text-center border p-2">
                                  {item.payment_amount}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="text-center py-4 text-gray-500 border">
                                No debit transactions found
                              </td>
                            </tr>
                          )}
                          <tr className="bg-red-50/30 font-medium">
                            <td className="text-center border p-2">Total</td>
                            <td className="text-center border p-2">
                              {calculateTotalPayment()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Credit Table */}
                    <div className="flex-1">
                      <table className="border w-full">
                        <thead>
                          <tr className="bg-green-100 hover:bg-green-100">
                            <th colSpan={2} className="text-center text-black bg-green-50 border p-2">
                              Credit Transactions
                            </th>
                          </tr>
                          <tr className="bg-gray-100 hover:bg-gray-100">
                            <th className="text-center border p-2">Date</th>
                            <th className="text-center border p-2">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ledgerData?.received?.length ? (
                            ledgerData.received.map((item, index) => (
                              <tr
                                key={`credit-${index}`}
                                className={index % 2 === 0 ? "bg-white" : "bg-green-50/30"}
                              >
                                <td className="text-center border p-2">
                                  {dayjs(item.sale_date).format("DD-MM-YYYY")}
                                </td>
                                <td className="text-center border p-2">
                                  {item.sales_amount}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={2} className="text-center py-4 text-gray-500 border">
                                No credit transactions found
                              </td>
                            </tr>
                          )}
                          <tr className="bg-green-50/30 font-medium">
                            <td className="text-center border p-2">Total</td>
                            <td className="text-center border p-2">
                              {calculateTotalReceived()}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="mt-6 text-center font-medium text-lg">
                    Closing Balance = ₹ {ledgerData?.closing_balance || 0}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PartyLedger;




