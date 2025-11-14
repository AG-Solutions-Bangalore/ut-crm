import { useEffect, useRef, useState } from "react";
import ReportActions from "../reportformats/ReportActions";
// import reportlogo from "../../assets/report-logo.png";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { TRADE_INVOICE_LIST } from "../../api";
import { Button, message, Spin } from "antd";
import { useApiMutation } from "../../hooks/useApiMutation";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { useReactToPrint } from "react-to-print";

const devUrl = "/api/crmapi/public/assets/images/company_images/sign.jpeg";
// const prodUrl = "https://theunitedtraders.co.in/crmapi/public/assets/images/company_images/sign.jpeg";


const TradeInvoiceView = () => {
    const componentRef = useRef(null);
        const [showSignature, setShowSignature] = useState(true);
        const { id } = useParams();
        const company = useSelector(state => state.company.companyDetails);
                const logo = useSelector(state => state.company.companyImage);

                const companyLogoObj = logo?.find(img => img.image_for === "Company");


        const toggleSignature = () => {
          setShowSignature(!showSignature);
        };
        const [selectedParty, setSelectedParty] = useState(null);
        const [data, setData] = useState(null);

 
      
        const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
      
        const fetchTradeInvoice = async () => {
          try {
            const res = await fetchTrigger({
              url: `${TRADE_INVOICE_LIST}/${id}`,
            });
            if (res?.data) {
                setSelectedParty(res?.party || null);
            
              setData(res?.data || null);
            }
          } catch (err) {
            console.error("Fetch error:", err);
            message.error("Failed to load trade invoice details.");
          }
        };
      
        useEffect(() => {
          if (id) fetchTradeInvoice();
        }, [id]);
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
            
            return words.trim();
          };
          const subtotal = data?.subs?.reduce((total, item) => {
            const quantity = parseFloat(item.trade_invoice_sub_qnty) || 0;
            const rate = parseFloat(item.trade_invoice_sub_rate) || 0;
            return total + (quantity * rate);
          }, 0) || 0;
    
          const sgst = parseFloat(data?.trade_invoice_sgst) || 0;
          const cgst = parseFloat(data?.trade_invoice_cgst) || 0;
          const igst = parseFloat(data?.trade_invoice_igst) || 0;
          
          const sgstAmount = (subtotal * sgst) / 100;
          const cgstAmount = (subtotal * cgst) / 100;
          const igstAmount = (subtotal * igst) / 100;
          
          const totalAmount = subtotal + sgstAmount + cgstAmount + igstAmount;
           const handleDownload = () => {
              const element = componentRef?.current; 
          
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
                filename: `Balance-Close-Order-Report-${dayjs().format('DD-MM-YYYY')}.pdf`,
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
              content: () => componentRef.current,
              documentTitle: `Balance-Close-Order-Report-${dayjs().format('DD-MM-YYYY')}`,
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
        const loading = fetchLoading;
  return (
 <>
   
<div className="flex flex-row items-center gap-2">
<Button onClick={handlePrint}>Print</Button>


<Button onClick={handleDownload}>PDF</Button>


<Button
  type={showSignature ? "primary" : "default"}
  onClick={toggleSignature}
>
  {showSignature ? "With Signature" : "Without Signature"}
</Button>
</div>

      
         {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
       <div className="flex justify-center bg-gray-50 p-4">
         <div className="w-full max-w-[210mm] bg-white border border-black" ref={componentRef}>
           
         
           <div className="border-b border-black p-3">
             <div className="flex justify-between text-xs mb-3">
               <div>
                 <div className="font-bold">GSTIN : {company?.company_gst}</div>
                 <div>Pan No : {company?.company_pan}</div>
               </div>
               <div className="text-center">
                 <div className="text-xl font-bold">TRADE INVOICE</div>
                 <div className="text-[10px]">ORIGINAL COPY</div>
               </div>
               <div className="text-right">
        
                 <div>Mobile : {company?.company_mobile}</div>
       
               </div>
             </div>
 
   
             <div className="flex gap-4 items-start">
               <div className="flex-shrink-0 w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                 <div className="text-white text-center">
               <img
                                src={`${companyLogoObj?.image_url}${company?.company_image}`}
                                alt="Company Logo"
                                className="w-[120px] h-auto object-contain"
                              />
                 </div>
               </div>
               
               <div className="flex-1 text-center">
                 <h1 className="text-xl font-bold mb-1 instrument-font">{company?.company_name}</h1>
                 <p className="text-xs font-semibold mb-1">Dealers in : KRAFT PAPER & DUPLEX BOARD</p>
                 <p className="text-[10px] leading-tight">
                  {company?.company_address}<br/>
                   Correspondence Address : {company?.company_cor_address} <br/> Email : {company?.company_email}
                 </p>
               </div>
             </div>
           </div>
     
           <div className="grid grid-cols-2 border-b border-black">
         
             <div className="border-r border-black p-3">
               <div className="text-xs space-y-1">
                 <div>
                   <span className="font-bold">To : {selectedParty?.party_name} </span>
                 </div>
                 <div>
                    {selectedParty?.party_billing_address}
                 </div>
      
         
                 <div className="mt-2">
                   <span className="font-bold">Delivery Address</span>
                 </div>
                 <div>{selectedParty?.party_delivery_address}</div>
   
               </div>
             </div>
 
          
             <div className="p-3">
               <div className="text-xs space-y-1">
                 <div className="flex">
                   <span className="w-32">Invoice No.</span>
                   <span>: {data?.trade_invoice_no}</span>
                 </div>
                 <div className="flex">
                   <span className="w-32">Invoice Date</span>
                   <span>: {formatDate(data?.trade_invoice_date)} </span>
                 </div>
                 <div className="flex">
                   <span className="w-32">Party's GSTIN</span>
                   <span>: {selectedParty?.party_gstin} </span>
                 </div>
                 <div className="flex">
                   <span className="w-32">Service State</span>
                   <span>: {selectedParty?.party_state} </span>
                 </div>
                 <div className="flex">
                   <span className="w-32">E Way Bill No.</span>
                   <span>: {data?.trade_invoice_ewaybill} </span>
                 </div>
                 <div className="flex">
                   <span className="w-32">PaymentTerm</span>
                   <span>: {data?.trade_invoice_payment_terms} </span>
                 </div>
               </div>
             </div>
           </div>
 
           <table className="w-full border-collapse text-xs">
             <thead>
               <tr className="border-b border-black">
                 <th className="border-r border-black p-2 text-center w-12">Sl.<br/>No.</th>
                 <th className="border-r border-black p-2 text-left">Description of goods or Services</th>
                 <th className="border-r border-black p-2 text-center w-16">Reel</th>
                 <th className="border-r border-black p-2 text-center w-20">Qnty.<br/>(in Kgs)</th>
                 <th className="border-r border-black p-2 text-center w-20">Rate<br/>(in Rs./KGS)</th>
                 <th className="p-2 text-center w-24">Taxable value of<br/>Goods / Services<br/>(in Rs.)</th>
               </tr>
             </thead>
             <tbody>
             {data?.subs?.map((item, index) => {
      const quantity = parseFloat(item.trade_invoice_sub_qnty) || 0;
      const rate = parseFloat(item.trade_invoice_sub_rate) || 0;
      const taxableValue = quantity * rate;
      
      return (
        <tr key={item.id}>
                    <td className="border-r border-black p-2 text-center align-top">{index + 1}</td>
                    <td className="border-r border-black p-2 align-top">
            <div>KRAFT PAPER</div>
            <div>BF - {item.trade_invoice_sub_bf}, GSM - {item.trade_invoice_sub_gsm}, SIZE - {item.trade_invoice_sub_size},</div>
            <div>Shade - {item.trade_invoice_sub_shade}</div>
          </td>
          <td className="border-r border-black p-2 text-center align-top">{parseFloat(item.trade_invoice_sub_reel).toFixed(2)}</td>
          <td className="border-r border-black p-2 text-right align-top">{quantity.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}</td>
          <td className="border-r border-black p-2 text-right align-top">{rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          <td className="p-2 text-right align-top">{taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
               </tr>
             
            
                );
            })}
             </tbody>
           </table>
 
           <div className="border-t border-black">
             <div className="flex">
           
               <div className="flex-1 border-r border-black p-3">
                 <div className="text-xs mb-2">
                   <span className="font-bold">HSN CODE : </span> {data?.trade_invoice_hsn_code}
                 </div>
                 <div className="text-xs">
                   <span className="font-bold">Total Amount</span>
                 </div>
                 <div className="text-xs">
                   <span className="font-bold">(Net in Words) : </span>
                   <span className="font-bold">{numberToWords(Math.round(totalAmount))}</span>
                 </div>
                 <div className="text-xs font-bold">Only .....</div>
               </div>
 
            
               <div className="w-64">
                <div className="flex justify-between border-b border-black p-2 text-xs">
                  <span className="font-bold">Gross Total :</span>
                  <span className="font-bold">Rs. {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {/* {sgst > 0 && ( */}
                  <div className="flex justify-between border-b border-black p-2 text-xs">
                    <span>ADD : SGST {sgst}%</span>
                    <span>Rs. {sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                {/* )} */}
                {/* {cgst > 0 && ( */}
                  <div className="flex justify-between border-b border-black p-2 text-xs">
                    <span>ADD : CGST {cgst}%</span>
                    <span>Rs. {cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                {/* )} */}
                {/* {igst > 0 && ( */}
                  <div className="flex justify-between border-b border-black p-2 text-xs">
                    <span>ADD : IGST {igst}%</span>
                    <span>Rs. {igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                {/* )} */}
                <div className="flex justify-between p-2 text-xs">
                  <span className="font-bold">Total Amount :</span>
                  <span className="font-bold">Rs. {totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
             </div>
           </div>
 
           <div className="border-t border-black flex">
  
   <div className="flex-1 p-3 text-[10px]">
     <div className="font-bold mb-1">Terms & Conditions :</div>
     <div className="space-y-0.5">
       <div>1. Any dispute is subject to Bangalore jurisdiction.</div>
       <div>2. Payment to be made by A/c Payee cheque or DD only.</div>
       <div>3. Late payment charges will be @ 24 % p.a.,</div>
       <div className="ml-3">(If bill remains unpaid after Due Date)</div>
     </div>
   </div>
 
 
   <div className="w-64 p-3 flex flex-col justify-between relative">
     <div className="text-right text-xs">
       <div className="font-bold">For {company?.company_name}</div>
     </div>
 
    
     <div className="mt-4 h-20 relative">
       {showSignature && (
         <img
           src={devUrl}
           alt="Signature"
           className="w-24 h-auto object-contain absolute right-0 top-0"
         />
       )}
       <div className="absolute bottom-0 right-0 text-xs">Authorised Signatory</div>
     </div>
   </div>
 </div>
 
         </div>
       </div>
        )}
 </>
  )
}

export default TradeInvoiceView