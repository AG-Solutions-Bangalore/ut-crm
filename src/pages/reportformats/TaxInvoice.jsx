import React, { useRef, useState } from 'react';
import reportlogo from "../../assets/report-logo.png";
import ReportActions from "./ReportActions";
import { Mail, Phone, PhoneCall } from 'lucide-react';
import { Button } from "antd";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";
const devUrl = "/api/crmapi/public/assets/images/company_images/sign.jpeg";
// const prodUrl = "https://theunitedtraders.co.in/crmapi/public/assets/images/company_images/sign.jpeg";

const TaxInvoice = () => {
  const componentRef = useRef(null);
  const [showSignature, setShowSignature] = useState(true);


  const commissionData = [
    { date: '07-Dec-24', billRef: '1237', bf: '22-100', quantity: '12352', rate: '35.45', discRate: '36.95', diff: '1.50', commn: '18228' },
    { date: '07-Dec-24', billRef: '1239', bf: '22-100', quantity: '5261', rate: '35.45', discRate: '36.95', diff: '1.50', commn: '7892' },
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
        margin: [0, 0, 0, 0],
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
            const textWidth =
              (pdf.getStringUnitWidth(text) * 10) / pdf.internal.scaleFactor;
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
          margin: 1mm !important;
        }
        @media print {
          html,body {
            margin: 1mm !important;
          }
          .print-hide {
            display: none;
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
      <Button onClick={handlePrint}>Print</Button>
      <Button onClick={generatePdf}>PDF</Button>
     
        <Button 
          type={showSignature ? "primary" : "default"}
          onClick={toggleSignature}
        >
          {showSignature ? "With Signature" : "Without Signature"}
        </Button>
    
    </div>
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto bg-white border-2 border-blue-900" ref={componentRef}>
          {/* Header */}    <div className="border-b-2 border-blue-900 p-6">
            <div className="text-center text-sm font-bold text-gray-700 mb-2">TAX INVOICE</div>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-blue-900 instrument-font">THE UNITED TRADERS (Regd.)</h1>
                <p className="text-sm text-gray-700 mt-2">Dealers in : KRAFT PAPER & DUPLEX BOARD</p>
                <p className="text-xs text-gray-600">010, A-2 BLOCK, 7TH MAIN, 8TH CROSS, 2ND BLOCK JAYNAGAR, BANGALORE 560011</p>
              </div>
              <div className="text-right">
                <div className="text-white text-center">
                 <img
                                               src={reportlogo}
                                               alt="Company Logo"
                                               className="w-[120px] h-[5rem] object-contain"
                                             />
                              </div>
             
              </div>
            </div>
            <div className="mt-4 flex justify-between text-xs">
              <div>GSTIN : 29AAXPA4078KZ20</div>
              <div>Pan No : AAXPA407BK</div>
            </div>
          </div>

        
          <div className="flex gap-8 p-6 border-b border-gray-300">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 mb-2">To</p>
              <h3 className="font-bold text-blue-900 mb-1">VAMSHADHARA PAPER MILLS</h3>
              <p className="text-xs text-gray-700">MADAPAM VILLAGE NARASANNAPETA</p>
              <p className="text-xs text-gray-700">MANDAL SRIKAKULAM (DT)</p>
              <p className="text-xs text-gray-700">ANDHRA PRADESH 532421</p>
              <p className="text-xs text-gray-700 mt-2">GST | : 37AACVT330B1ZN</p>
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
              <div className="flex justify-between mt-4 p-2 bg-blue-50 border border-blue-200">
                <span className="text-xs font-bold text-gray-700">Total Amount :</span>
                <span className="text-sm font-bold text-red-600">Rs. 42,678.00</span>
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
                <td className="border-r border-gray-300 p-3">Sales Commission for the Month of FEB 2025</td>
                <td className="border-r border-gray-300 p-3">996111</td>
                <td className="p-3 text-right">36168.00</td>
              </tr>
            </tbody>
          </table>

        
          <div className="flex p-6 border-b border-gray-300">
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-700 mb-2">Total Amount (INR IN WORDS) :</p>
              <p className="text-sm font-semibold">Forty Two Thousand Six Hundred Seventy Eight Only .....</p>
              <p className="text-xs text-gray-600 mt-4">Note : Any dispute is Subject to Bangalore Jurisdiction.</p>
            </div>
            <div className="flex-1 text-right text-xs">
              <div className="flex justify-between mb-2">
                <span>Discount (if any)</span>
                <span className="font-semibold">0.00</span>
              </div>
              <div className="flex justify-between mb-2 font-bold border-b border-gray-300 pb-2">
                <span>Gross Total :</span>
                <span>Rs. 36,168.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>ADD - CGST 0% :</span>
                <span>-</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>ADD - SGST 0% :</span>
                <span>-</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>ADD - IGST 18% :</span>
                <span className="font-semibold">Rs. 6,510.00</span>
              </div>
              <div className="flex justify-between font-bold text-blue-900 border-t-2 border-blue-900 pt-2">
                <span>Total Amount :</span>
                <span>Rs. 42,678.00</span>
              </div>
            </div>
          </div>

       
          <div className="flex gap-8 p-6 border-b border-gray-300">
            <div className="flex-1 text-xs">
              <p className="font-bold mb-2">Acc Name : The United Trades (R)</p>
              <p className="mb-2">Bank : Canara Bank</p>
              <p className="mb-2">Branch : Girinagar branch, Bangal</p>
              <p className="mb-2">A/C No : 0419121000031 3</p>
              <p>IFSC Code : CNRB 0010677</p>
            </div>
            <div className="flex-1 text-right">
              <p className="text-md font-bold instrument-font">THE UNITED TRADERS (Regd.)</p>
              <div className="relative mt-12">
                {showSignature && (
                  <img
                    src={devUrl}
                    alt="Signature"
                    className="w-28 h-auto object-contain absolute right-0 -top-17  "
                  />
                )}
                <p className="text-xs mt-16">Authorised Signatory</p>
              </div>
            </div>
          </div>


          
       <div className="mb-8 p-4">
        <div className="text-center mt-4 border-b border-gray-800 pb-2">
            <h2 className="text-lg font-bold text-gray-800">Commission Details for Tax Invoice No. - 87</h2>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="border-r border-gray-800 p-3 text-left text-xs font-bold">Date</th>
                <th className="border-r border-gray-800 p-3 text-left text-xs font-bold">Bill Ref.</th>
                <th className="border-r border-gray-800 p-3 text-left text-xs font-bold">BF</th>
                <th className="border-r border-gray-800 p-3 text-right text-xs font-bold">Quantity</th>
                <th className="border-r border-gray-800 p-3 text-right text-xs font-bold">Rate</th>
                <th className="border-r border-gray-800 p-3 text-right text-xs font-bold">Disc. Rate</th>
                <th className="border-r border-gray-800 p-3 text-right text-xs font-bold">Diff.</th>
                <th className="p-3 text-right text-xs font-bold">Commn</th>
              </tr>
            </thead>
            <tbody>
              {commissionData.map((row, idx) => (
                <tr key={idx} className={idx === commissionData.length - 1 ? 'border-b-2 border-gray-800' : 'border-b border-gray-300'}>
                  <td className="border-r border-gray-300 p-3 text-xs">{row.date}</td>
                  <td className="border-r border-gray-300 p-3 text-xs">{row.billRef}</td>
                  <td className="border-r border-gray-300 p-3 text-xs">{row.bf}</td>
                  <td className="border-r border-gray-300 p-3 text-right text-xs">{row.quantity}</td>
                  <td className="border-r border-gray-300 p-3 text-right text-xs">{row.rate}</td>
                  <td className="border-r border-gray-300 p-3 text-right text-xs">{row.discRate}</td>
                  <td className="border-r border-gray-300 p-3 text-right text-xs">{row.diff}</td>
                  <td className="p-3 text-right text-xs">{row.commn}</td>
                </tr>
              ))}
            </tbody>
          </table>

     
          <div className="flex justify-end mt-4">
            <div className="w-64">
              <div className="flex justify-between text-sm font-bold border-t-2 border-gray-800 pt-2">
                <span>Total =</span>
                <span className="text-red-600">Rs. 36,168</span>
              </div>
            </div>
          </div>
        </div>

        
          <div className="border-t-2 border-blue-900 p-6">
            <p className="text-xs text-center text-gray-700 mb-3">
              Corr. Address : #1141, 2nd Main, 1st Cross, Hoskerethalli, BSK 3rd Stage, Bangalore 560085 Email : united1141@email.com
            </p>
            <div className="flex justify-center gap-6 items-center">
              <div className="text-center">
                <div className="w-6 h-6 rounded-full bg-blue-900 mx-auto mb-1"><Phone className='w-5 h-5 text-white'/></div>
                <p className="text-xs">8626728620</p>
              </div>
              <div className="text-center">
                <div className="w-6 h-6 rounded-full bg-blue-900 mx-auto mb-1"><PhoneCall className='w-5 h-5 text-white'/></div>
                <p className="text-xs">9854420122</p>
              </div>
              <div className="text-center">
                <div className="w-6 h-6 rounded-full bg-blue-900 mx-auto mb-1"><Mail className='w-5 h-5 text-white'/></div>
                <p className="text-xs">united1141@email.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaxInvoice;