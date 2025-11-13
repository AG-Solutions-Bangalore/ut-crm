import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, PhoneCall } from 'lucide-react';
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
import reportlogo from "../../assets/report-logo.png";
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useApiMutation } from '../../hooks/useApiMutation';
import { TAX_INVOICE_LIST } from '../../api';
import { message, Spin } from 'antd';
import dayjs from 'dayjs';

const devUrl = "/api/crmapi/public/assets/images/company_images/sign.jpeg";

const TaxInvoice = () => {
  const componentRef = useRef(null);
  const [showSignature, setShowSignature] = useState(true);

  const { id } = useParams();
  const company = useSelector(state => state.company.companyDetails);
  
  const [selectedMill, setSelectedMill] = useState(null);
  
  const [data, setData] = useState(null);

  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();

  const fetchPurchase = async () => {
    try {
      const res = await fetchTrigger({
        url: `${TAX_INVOICE_LIST}/${id}`,
      });
      if (res?.data) {
        setSelectedMill(res?.mill || null);
      
        setData(res?.data || null);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load tax details.");
    }
  };

  useEffect(() => {
    if (id) fetchPurchase();
  }, [id]);

  const loading = fetchLoading;


  const totalCommission = data?.subs?.reduce((sum, item) => {
    return sum + (parseFloat(item.tax_invoice_sub_commn) || 0);
  }, 0) || 0;

 
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB');
  };

  
  const numberToWords = (num) => {
    
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    
    if (num === 0) return 'Zero';
    
    let words = '';
    

    if (num >= 1000) {
      words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
      num %= 1000;
    }
    
   
    if (num >= 100) {
      words += ones[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    
  
    if (num >= 20) {
      words += tens[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      words += teens[num - 10] + ' ';
      num = 0;
    }
    
    if (num > 0) {
      words += ones[num] + ' ';
    }
    
    return words.trim() + ' Only';
  };

  const grossTotal = totalCommission;
  const cgstAmount = (grossTotal * (parseFloat(data?.tax_invoice_cgst) || 0) / 100);
  const sgstAmount = (grossTotal * (parseFloat(data?.tax_invoice_sgst) || 0) / 100);
  const igstAmount = (grossTotal * (parseFloat(data?.tax_invoice_igst) || 0) / 100);
  const totalAmount = grossTotal + cgstAmount + sgstAmount + igstAmount;


  const handleDownload = async () => {
    const element = componentRef?.current;
  
    if (!element) {
      message.error('Failed to generate PDF');
      return;
    }
  
    const elementForPdf = element.cloneNode(true);
    const printHideElements = elementForPdf.querySelectorAll('.print-hide');
    printHideElements.forEach(el => el.remove());
  
    // Remove fixed positioning styles for PDF
    const style = document.createElement('style');
    style.textContent = `
      * {
        color: #000000 !important;
        background-color: transparent !important;
      }
      .bg-gray-200, .bg-gray-100, .bg-white {
        background-color: #ffffff !important;
      }
      .bg-gray-50 {
        background-color: #f9fafb !important;
      }
      .text-blue-900 {
        color: #1e3a8a !important;
      }
      .text-gray-700 {
        color: #374151 !important;
      }
      .text-gray-600 {
        color: #4b5563 !important;
      }
      .text-gray-800 {
        color: #1f2937 !important;
      }
      .text-red-600 {
        color: #dc2626 !important;
      }
      .border-blue-900 {
        border-color: #1e3a8a !important;
      }
      .border-gray-300 {
        border-color: #d1d5db !important;
      }
      .border-gray-800 {
        border-color: #1f2937 !important;
      }
      .border-black {
        border-color: #000000 !important;
      }
      /* Remove fixed positioning for PDF */
      .fixed-header, .fixed-footer {
        position: relative !important;
      }
      .page-content {
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }
    `;
    elementForPdf.appendChild(style);
  
    const options = {
      margin: [10, 10, 10, 10],
      filename: `Tax-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.fixed-footer'
      },
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
    content: () => componentRef.current,
    documentTitle: `Tax_Invoice_${data?.tax_invoice_no || 'invoice'}`,
    onBeforeGetContent: () => {
    
      const signatureElement = componentRef.current?.querySelector('img[alt="Signature"]');
      if (signatureElement) {
        signatureElement.style.display = showSignature ? 'block' : 'none';
      }
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 5mm !important;
        border:2px solid black
      }
      @media print {
       
        .print-hide {
          display: none !important;
        }
        .fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
        }
        .fixed-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: white;
        }
        .page-content {
          margin-top: 200px;
          margin-bottom: 180px;
        }
      }
    `,
  });

  const toggleSignature = () => {
    setShowSignature(!showSignature);
  };

  return (
    <>
     
      
      <div className="print-hide flex gap-2 mb-4">
        <button 
          onClick={handlePrint} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          Print
        </button>
        <button 
          onClick={handleDownload} 
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors cursor-pointer"
          style={{ cursor: 'pointer' }}
        >
          PDF
        </button>
        <button 
          onClick={toggleSignature}
          className={`px-4 py-2 rounded transition-colors cursor-pointer ${
            showSignature ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
          }`}
          style={{ cursor: 'pointer' }}
        >
          {showSignature ? "With Signature" : "Without Signature"}
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white print:border-none border-2 border-blue-900" ref={componentRef}>
            
           
            <div className="fixed-header border-b-2 relative border-blue-900 p-2 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-blue-900 instrument-font">{company?.company_name}</h1>
                  <p className="text-sm text-gray-700 mt-2">Dealers in : KRAFT PAPER & DUPLEX BOARD</p>
                  <p className="text-xs text-gray-600">{company?.company_address}</p>
                  <div className="mt-4 flex justify-start gap-5 text-xs">
                    <div>GSTIN : {company?.company_gst}</div>
                    <div>Pan No : {company?.company_pan}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-center">
                    <img
                      src={reportlogo}
                      alt="Company Logo"
                      className="w-[120px] h-[10rem] object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute w-full text-lg text-center -translate-y-8 -translate-x-2 font-bold text-gray-700">
                TAX INVOICE
              </div>
            </div>

        
            <div className="page-content">
              <div className="flex gap-8 p-4 border-b border-gray-300">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 mb-2">To</p>
                  <h3 className="font-bold text-blue-900 mb-1">{selectedMill?.mill_name}</h3>
                  <p className="text-xs text-gray-700 whitespace-pre-line">{selectedMill?.mill_billing_address}</p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">Invoice No. :</span>
                    <span className="text-xs">{data?.tax_invoice_no}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">Invoice Date :</span>
                    <span className="text-xs">{formatDate(data?.tax_invoice_date)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">Service State :</span>
                    <span className="text-xs">{selectedMill?.mill_state}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">Party GST :</span>
                    <span className="text-xs">{selectedMill?.mill_gstin}</span>
                  </div>
                </div>
              </div>

              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-blue-900 bg-gray-50">
                    <th className="border-r border-gray-300 p-3 text-left font-bold">Sl. No.</th>
                    <th className="border-r border-gray-300 p-3 text-left font-bold">Description of goods or Services</th>
                    <th className="border-r border-gray-300 p-3 text-left font-bold">HSN Code</th>
                    <th className="p-3 text-right font-bold">Total value of Goods / Services ( in INR )</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-300">
                    <td className="border-r border-gray-300 p-3">1.</td>
                    <td className="border-r border-gray-300 p-3">{data?.tax_invoice_description}</td>
                    <td className="border-r border-gray-300 p-3">{data?.tax_invoice_hsn_code}</td>
                    <td className="p-3 text-right">{totalCommission.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="w-[80%] p-2">
                <div className="text-left pb-1">
                  <h2 className="text-md font-bold text-gray-800">Summary</h2>
                </div>
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr className="border-2 border-gray-800">
                      <th className="border-r border-gray-800 p-1 text-left font-bold">Date</th>
                      <th className="border-r border-gray-800 p-1 text-left font-bold">Bill Ref.</th>
                      <th className="border-r border-gray-800 p-1 text-left font-bold">BF</th>
                      <th className="border-r border-gray-800 p-1 text-right font-bold">Quantity</th>
                      <th className="border-r border-gray-800 p-1 text-right font-bold">Rate</th>
                      <th className="border-r border-gray-800 p-1 text-right font-bold">Disc. Rate</th>
                      <th className="border-r border-gray-800 p-1 text-right font-bold">Diff.</th>
                      <th className="p-1 text-right font-bold">Commn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.subs?.map((row, idx) => (
                      <tr key={idx} className={idx === data.subs.length - 1 ? 'border-b-2 border-gray-800' : 'border-b border-gray-300'}>
                        <td className="border-r border-l-2 border-black p-1">{formatDate(row.tax_invoice_sub_purchase_date)}</td>
                        <td className="border-r border-gray-300 p-1">{row.tax_invoice_sub_billing_ref}</td>
                        <td className="border-r border-gray-300 p-1">{row.tax_invoice_sub_bf}</td>
                        <td className="border-r border-gray-300 p-1 text-right">{row.tax_invoice_sub_tones}</td>
                        <td className="border-r border-gray-300 p-1 text-right">{row.tax_invoice_sub_sale_rate}</td>
                        <td className="border-r border-gray-300 p-1 text-right">{row.tax_invoice_sub_purchase_rate}</td>
                        <td className="border-r border-gray-300 p-1 text-right">{row.tax_invoice_sub_rate_diff}</td>
                        <td className="p-1 border-r-2 border-black text-right">{row.tax_invoice_sub_commn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-end mt-2">
                  <div className="w-48">
                    <div className="flex justify-between text-xs font-bold border-t-2 border-gray-800 pt-1">
                      <span>Total =</span>
                      <span className="text-red-600">Rs. {totalCommission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="fixed-footer bg-white">
              <div className="flex p-4 border-b border-gray-300">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 mb-1">Total Amount (INR IN WORDS) :</p>
                  <p className="text-sm font-semibold">{numberToWords(Math.round(totalAmount))} .....</p>
                  <p className="text-xs text-gray-600 mt-2">Note : Any dispute is Subject to Bangalore Jurisdiction.</p>
                </div>
                <div className="flex-1 text-right text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Discount (if any)</span>
                    <span className="font-semibold">{data?.tax_invoice_discount || '0.00'}</span>
                  </div>
                  <div className="flex justify-between mb-1 font-bold border-b border-gray-300 pb-1">
                    <span>Gross Total :</span>
                    <span>Rs. {grossTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>ADD - CGST {data?.tax_invoice_cgst}% :</span>
                    <span>{cgstAmount > 0 ? `Rs. ${cgstAmount.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>ADD - SGST {data?.tax_invoice_sgst}% :</span>
                    <span>{sgstAmount > 0 ? `Rs. ${sgstAmount.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>ADD - IGST {data?.tax_invoice_igst}% :</span>
                    <span className="font-semibold">{igstAmount > 0 ? `Rs. ${igstAmount.toFixed(2)}` : '-'}</span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-900 border-t-2 border-blue-900 pt-1">
                    <span>Total Amount :</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 p-4 border-b border-gray-300">
                <div className="flex-1 text-xs">
                  <p className="font-bold mb-1">Acc Name : The United Trades (R)</p>
                  <p className="mb-1">Bank : {selectedMill?.mill_bank_name}</p>
                  <p className="mb-1">Branch : {selectedMill?.mill_bank_branch_name}</p>
                  <p className="mb-1">A/C No : {selectedMill?.mill_bank_ac_no}</p>
                  <p>IFSC Code : {selectedMill?.mill_bank_ifsc}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-md font-bold">THE UNITED TRADERS (Regd.)</p>
                  <div className="relative mt-8">
                    {showSignature && (
                      <img
                        src={devUrl}
                        alt="Signature"
                        className="w-28 h-auto object-contain absolute right-0 -top-12"
                      />
                    )}
                    <p className="text-xs mt-12">Authorised Signatory</p>
                  </div>
                </div>
              </div>

              <div className="border-t-2 border-blue-900 p-4">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-700 flex-1">
                    Corr. Address : {company?.company_cor_address}
                  </p>
                  <div className="flex gap-4 items-center mx-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-900 flex items-center justify-center">
                        <Phone className='w-3 h-3 text-white'/>
                      </div>
                      <span className="text-xs">8626728620</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-900 flex items-center justify-center">
                        <PhoneCall className='w-3 h-3 text-white'/>
                      </div>
                      <span className="text-xs">9854420122</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-900 flex items-center justify-center">
                        <Mail className='w-3 h-3 text-white'/>
                      </div>
                      <span className="text-xs">united1141@email.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaxInvoice;