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
const devUrl = "/api/crmapi/public/assets/images/company_images/sign.jpeg";
// const prodUrl = "https://theunitedtraders.co.in/crmapi/public/assets/images/company_images/sign.jpeg";
const TaxInvoice = () => {
  const componentRef = useRef(null);
  const [showSignature, setShowSignature] = useState(true);
// ------------------------------------------------- 


const { id } = useParams();

    
const company = useSelector(state => state.company.companyDetails);
// const logo = useSelector(state => state.company.companyImage);


console.log(company)
const [selectedMill, setSelectedMill] = useState(null);
const [selectedParty, setSelectedParty] = useState(null);
const [data, setData] = useState(null);
console.log('selectedMill',selectedMill)
console.log('selectedParty',selectedParty)
console.log('data',data?.subs)
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
const fetchPurchase = async () => {
try {
  const res = await fetchTrigger({
    url: `${TAX_INVOICE_LIST}/${id}`,
  });
  if (res?.data) {
    
    setSelectedMill(res?.mill || null);
    setSelectedParty(res?.party || null);
    setData(res?.data || null);
 
  }
} catch (err) {
  console.error("Fetch error:", err);
  message.error("Failed to load tax details.");
}
};


useEffect(() => {
  if (id) fetchPurchase();

}, [ id]);
const loading = fetchLoading 

// -----------------------------------------------------
  const commissionData = [
    { date: '07-Dec-24', billRef: '1237', bf: '22-100', quantity: '12352', rate: '35.45', discRate: '36.95', diff: '1.50', commn: '18228' },

  
    { date: '07-Dec-24', billRef: '1242', bf: '22-90', quantity: '6699', rate: '35.95', discRate: '37.45', diff: '1.50', commn: '10048' },
    { date: '07-Dec-24', billRef: '1242', bf: '22-90', quantity: '6699', rate: '35.95', discRate: '37.45', diff: '1.50', commn: '10048' },
    { date: '05-Nov-25', billRef: '', bf: '', quantity: '', rate: '', discRate: '', diff: '', commn: '' },
  ];

  const generatePdf = () => {
    const element = componentRef?.current;
    
    if (!element) {
      console.error("PDF generation failed: element not found");
      return;
    }

    const options = {
      margin: [1, 1, 1, 1],
      filename: 'Tax_Invoice.pdf',
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowHeight: element.scrollHeight,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
      },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };

    html2pdf()
      .from(element)
      .set(options)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          const text = `Page ${i} of ${totalPages}`;
          const textWidth = (pdf.getStringUnitWidth(text) * 10) / pdf.internal.scaleFactor;
          const x = pageWidth - textWidth - 10;
          const y = pageHeight - 10;
          pdf.text(text, x, y);
        }
      })
      .save();
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Tax Invoice',
    pageStyle: `
      @page {
        size: A4;
             margin: 5mm !important;
             border:2px solid black
      }
      @media print {
        html, body {
          height: 100%;
                  margin: 0;
          padding: 0;
        }
        .print-hide {
          display: none;
        }
        .fixed-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
        }
        .fixed-footer {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 1000;
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
      <style>{`
        @media print {
          .fixed-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            z-index: 1000;
          }
          .fixed-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: white;
            z-index: 1000;
          }
          .page-content {
            margin-top: 200px;
            margin-bottom: 180px;
          }
        }
      `}</style>
      
      <div className="print-hide flex gap-2 mb-4 ">
        <button onClick={handlePrint} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Print
        </button>
        <button onClick={generatePdf} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          PDF
        </button>
        <button 
          onClick={toggleSignature}
          className={`px-4 py-2 rounded ${showSignature ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          {showSignature ? "With Signature" : "Without Signature"}
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) :(

      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white print:border-none border-2 border-blue-900" ref={componentRef}>
          
          {/* Fixed Header */}
          <div className="fixed-header border-b-2 relative border-blue-900 p-2 bg-white">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-blue-900 instrument-font">{company?.company_name}</h1>
                <p className="text-sm text-gray-700 mt-2">Dealers in : KRAFT PAPER & DUPLEX BOARD</p>
                <p className="text-xs text-gray-600">{company?.company_address}</p>
                <div className="mt-4 flex justify-start gap-5 text-xs">
                  <div>GSTIN : {company?.company_gst}</div>
                  <div>Pan No : AAXPA407BK</div>
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

          {/* Page Content */}
          <div className="page-content">
            <div className="flex gap-8 p-4 border-b border-gray-300">
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-700 mb-2">To</p>
                <h3 className="font-bold text-blue-900 mb-1">VAMSHADHARA PAPER MILLS</h3>mill_name
                <p className="text-xs text-gray-700">MADAPAM VILLAGE NARASANNAPETA</p>mill_billing_address
                <p className="text-xs text-gray-700">MANDAL SRIKAKULAM (DT)</p>
                <p className="text-xs text-gray-700">ANDHRA PRADESH 532421</p>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Invoice No. :</span>
                  <span className="text-xs">087</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Invoice Date :</span>
                  <span className="text-xs">18-02-2025</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Service State :</span>
                  <span className="text-xs">ANDHRA PRADESH</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs font-bold text-gray-700">Party GST :</span>
                  <span className="text-xs">37AACVT330B1ZN</span>
                </div>
              </div>
            </div>

            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-blue-900 bg-gray-50">
                  <th className="border-r border-gray-300 p-3 text-left font-bold">Sl. No.</th>
                  <th className="border-r border-gray-300 p-3 text-left font-bold">Description of goods or Services</th> tax_invoice_description
                  <th className="border-r border-gray-300 p-3 text-left font-bold">HSN Code</th> tax_invoice_hsn_code
                  <th className="p-3 text-right font-bold">Total value of Goods / Services ( in INR )</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-300">
                  <td className="border-r border-gray-300 p-3">1.</td>
                  <td className="border-r border-gray-300 p-3">Sales Commission for the Month of FEB 2025</td>
                  <td className="border-r border-gray-300 p-3">996111</td>
                  <td className="p-3 text-right">36168.00 tax_invoice_sub_commn (sum)</td>
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
                  {commissionData.map((row, idx) => (
                    <tr key={idx} className={idx === commissionData.length - 1 ? 'border-b-2 border-gray-800' : 'border-b border-gray-300'}>
                      <td className="border-r border-l-2 border-black p-1">{row.date}</td>
                      <td className="border-r border-gray-300 p-1">{row.billRef}</td>
                      <td className="border-r border-gray-300 p-1">{row.bf}</td>
                      <td className="border-r border-gray-300 p-1 text-right">{row.quantity}</td>
                      <td className="border-r border-gray-300 p-1 text-right">{row.rate}</td>
                      <td className="border-r border-gray-300 p-1 text-right">{row.discRate}</td>
                      <td className="border-r border-gray-300 p-1 text-right">{row.diff}</td>
                      <td className="p-1 border-r-2 border-black text-right">{row.commn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="flex justify-end mt-2">
                <div className="w-48">
                  <div className="flex justify-between text-xs font-bold border-t-2 border-gray-800 pt-1">
                    <span>Total =</span>
                    <span className="text-red-600">Rs. 36,168</span>
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
                <p className="text-sm font-semibold">Forty Two Thousand Six Hundred Seventy Eight Only .....</p>
                <p className="text-xs text-gray-600 mt-2">Note : Any dispute is Subject to Bangalore Jurisdiction.</p>
              </div>
              <div className="flex-1 text-right text-xs">
                <div className="flex justify-between mb-1">
                  <span>Discount (if any)</span>
                  <span className="font-semibold">0.00</span>
                </div>
                <div className="flex justify-between mb-1 font-bold border-b border-gray-300 pb-1">
                  <span>Gross Total :</span>
                  <span>Rs. 36,168.00</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>ADD - CGST 0% :</span> '  "tax_invoice_cgst": "9",
        "tax_invoice_igst": "0",
        "tax_invoice_sgst": "9",'
                  <span>-</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>ADD - SGST 0% :</span>
                  <span>-</span>
                </div>
                <div className="flex justify-between mb-1">
                  <span>ADD - IGST 18% :</span>
                  <span className="font-semibold">Rs. 6,510.00</span>
                </div>
                <div className="flex justify-between font-bold text-blue-900 border-t-2 border-blue-900 pt-1">
                  <span>Total Amount :</span>
                  <span>Rs. 42,678.00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-6 p-4 border-b border-gray-300">
              <div className="flex-1 text-xs">
                <p className="font-bold mb-1">Acc Name : The United Trades (R)</p>
                <p className="mb-1">Bank : Canara Bank</p>
                <p className="mb-1">Branch : Girinagar branch, Bangal</p>
                <p className="mb-1">A/C No : 0419121000031 3</p>
                <p>IFSC Code : CNRB 0010677</p>
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
                  Corr. Address : #1141, 2nd Main, 1st Cross, Hoskerethalli, BSK 3rd Stage, Bangalore 560085
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