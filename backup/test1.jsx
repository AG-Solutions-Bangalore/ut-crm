
import reportlogo from "../../assets/report-logo.png";
import { Button } from "antd";
import html2pdf from "html2pdf.js";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
const PurchaseOrder = () => {
  const componentRef = useRef(null);
  const generatePdf = () => {
    const element = componentRef.current; 

    if (!element) {
      console.error("PDF generation failed: element not found");
      return;
    }

    const options = {
      margin: [0, 0, 0, 0],
      filename: "Purchase_Order.pdf",
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

  const whatsappPdf = async () => {
    try {
      const element = componentRef.current;
      if (!element) return alert("PDF element not found!");

      const options = {
        margin: [0, 0, 0, 0], 
        filename: "Purchase_Order.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          windowHeight: element.scrollHeight,
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
        pagebreak: { mode: "avoid-all" },
      };

      const pdfBlob = await html2pdf().from(element).set(options).output("blob");
      const file = new File([pdfBlob], "Purchase_Order.pdf", {
        type: "application/pdf",
      });

      const message = `Purchase Order Details\n\nPlease find the attached Purchase Order document.`;

      try {

        if (
          navigator.share &&
          navigator.canShare &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            text: message,
          });
          return;
        }
      } catch (shareError) {
        console.log("Web Share API failed:", shareError);
      }


      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        const fileUrl = URL.createObjectURL(file);

        if (navigator.share) {
          try {
            await navigator.share({
              text: message,
              url: fileUrl,
            });
            URL.revokeObjectURL(fileUrl);
            return;
          } catch (mobileShareError) {
            console.log("Mobile share failed:", mobileShareError);
          }
        }

        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
          message
        )}`;
        window.location.href = whatsappUrl;

        setTimeout(() => {
          const webWhatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(
            message
          )}`;
          window.open(webWhatsappUrl, "_blank");
        }, 1000);

        URL.revokeObjectURL(fileUrl);
        return;
      }

     
      const webWhatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(
        message
      )}`;
      window.open(webWhatsappUrl, "_blank");
    } catch (error) {
      console.error("Error in whatsappPdf:", error);
      alert("There was an error sharing the PDF. Please try again.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Report",
    pageStyle: `
             @page {
            size: A4;
             margin: 1mm !important;
             }
             @media print {
             html,body {
                 margin: 1mm !important;
                 margin: 1mm !important;
               }
               .print-hide {
                 display: none;
               }
             }
           `,
  });
  return (
    <>
    <Button onClick={handlePrint}>Print</Button>
    <Button onClick={generatePdf}>PDF</Button>
    <Button onClick={whatsappPdf}>Whatsapp</Button>
    <Button onClick={whatsappPdf}>Send Mail</Button>
    <div className="flex justify-center  bg-gray-50">
    <div className="w-full max-w-[210mm] bg-white p-4  border-black" ref={componentRef}>
     {/* 1st  */}
      <div className="">
        <div className="flex justify-between text-xs mb-2">
          <div className="font-bold">GSTIN : 29AAXPA4078K2Z0</div>
          <div>Ph : 08026723020 Mobile : 9845400122</div>
        </div>
        
        <div className="flex gap-4">
     
          <div className="flex-shrink-0">
             <img
                      src={reportlogo}
                      alt="Company Logo"
                      className="w-[120px] h-auto object-contain"
                    />
          </div>
          
    
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold mb-1 instrument-font">THE UNITED TRADERS (Regd.)</h1>
            <p className="text-xs font-semibold mb-1">Dealers in : KRAFT PAPER & DUPLEX BOARD</p>
            <p className="text-xs mb-1">010, A-2 BLOCK, 7TH MAIN, 8TH CROSS, 2ND BLOCK JAYNAGAR, BANGALORE 560011</p>
            <p className="text-xs">Correspondence Address : #1141, 2nd Main, 1st Cross, Hoskerehalli, BSK 3rd Stage,<br/>Bangalore 560085 Email : united1141@gmail.com</p>
            <h2 className="text-xl font-bold mt-2 underline">PURCHASE ORDER</h2>
          </div>
        </div>
      </div>

   {/* 2nd  */}
      <div className="grid grid-cols-2 border border-black">
 
        <div className="border-r flex flex-row items-start gap-1 border-black p-3">
          <div className="text-xs mb-2">
            <span className="font-bold">To : </span>
          </div>
          <div className="text-xs flex flex-col gap-2 leading-relaxed">

            <div className=" font-bold">
            ECO PAPERS INDIA (P) LTD
            </div>
          <div>
          <p>129 A ROAD NO 3 2ND PHASE JIGNI</p>
            <p>INDUSTRIAL AKA</p>
            <p>BANGALORE 562106</p>
          </div>
          </div>


        </div>
        
     
        <div className="p-3">
          <div className="text-xs space-y-2">
            <div className="flex">
              <span className="w-32">P.O. Ref.</span>
              <span>: UT/PO/225/2024-25</span>
            </div>
            <div className="flex">
              <span className="w-32">P.O. Date</span>
              <span>: 04-04-2025</span>
            </div>
            <div className="flex">
              <span className="w-32">With GSTIN</span>
              <span>: 29AAAFB6378R1ZR</span>
            </div>
            <div className="flex">
              <span className="w-32">Service State</span>
              <span>: KARNATAKA</span>
            </div>
          </div>
        </div>
      </div>


{/* 3rd  */}

<div className=" px-3 py-1  border-r border-l border-black">

      <div className="flex flex-col">
          <div className="text-xs mb-2 ">
            <span className="font-bold">Buyer : BETTER PAC INDUSTRIES</span>
          </div>
        
       
        
      
        <div className="mb-2 flex flex-row items-center  justify-between w-full">
        <div className="text-xs  w-full">
            <p className="font-semibold mb-1">Billing Address</p>
            <p>PLOT NO 89E, 2ND PHASE KIADB</p>
            <p>INDUSTRIAL AREA RAYANPUR</p>
            <p>DHARWARD 580004</p>
          </div>
          <div className="text-xs  w-full">
            <p className="font-semibold mb-1">Delivery Address</p>
            <p>PLOT NO 89E, 2ND PHASE KIADB INDUSTRIAL</p>
            <p>AREA RAYANPUR</p>
            <p>DHARWARD 580004</p>
          </div>
        </div>

        </div>
      </div>
  

    {/* 4th  */}
    <div className="grid grid-cols-2 border-b border-r border-l border-black text-xs">
        <div className=" p-2">
          <span className="font-bold">GSTIN : 29AAEFB6349P1ZS</span>
        </div>
        <div className="py-2">
          <span className="font-bold">Service State : KARNATAKA</span>
        </div>
      </div>

{/* 5th  */}
<table className="w-full border border-black text-xs font-bold border-collapse">
  <thead>
    <tr className="border-b border-black">
      <th className="border-r border-black p-2 text-center w-1/12">Quantity</th>
      <th className="border-r border-black p-2 text-center w-1/12">GSM</th>
      <th className="border-r border-black p-2 text-center w-1/12">SIZE (CMS.)</th>

      <th
        className="border-r border-black p-2 text-center w-2/12"
        colSpan={2}
      >
        Quantity
      </th>
      <th className="border-r border-black p-2 text-center w-2/12">
        Billing Rate
      </th>
      <th className="p-2 text-center w-6/12">Remarks / Delivery</th>
    </tr>
  </thead>

  <tbody className="font-normal text-xs align-top">
    <tr>
      <td className="border-r border-black p-2 text-center">GYT</td>
      <td className="border-r border-black p-2 text-center">120</td>
      <td className="border-r border-black p-2 text-center">80x100</td>


      <td className="border-r border-black p-2 text-center">10</td>
      <td className="border-r border-black p-2 text-center">Ton</td>

      <td className="border-r border-black p-2 text-center">₹52,000</td>
      <td className="p-2 text-center">Delivery within 5 days</td>
    </tr>
    <tr>
      <td className="border-r border-black p-2 text-center">GYT</td>
      <td className="border-r border-black p-2 text-center">120</td>
      <td className="border-r border-black p-2 text-center">80x100</td>


      <td className="border-r border-black p-2 text-center">10</td>
      <td className="border-r border-black p-2 text-center">Ton</td>

      <td className="border-r border-black p-2 text-center">₹52,000</td>
      <td className="p-2 text-center">Delivery within 5 days</td>
    </tr>
    <tr>
      <td className="border-r border-black p-2 text-center">GYT</td>
      <td className="border-r border-black p-2 text-center">120</td>
      <td className="border-r border-black p-2 text-center">80x100</td>


      <td className="border-r border-black p-2 text-center">10</td>
      <td className="border-r border-black p-2 text-center">Ton</td>

      <td className="border-r border-black p-2 text-center">₹52,000</td>
      <td className="p-2 text-center">Delivery within 5 days</td>
    </tr>
    <tr>
      <td className="border-r border-black p-2 text-center">GYT</td>
      <td className="border-r border-black p-2 text-center">120</td>
      <td className="border-r border-black p-2 text-center">80x100</td>


      <td className="border-r border-black p-2 text-center">10</td>
      <td className="border-r border-black p-2 text-center">Ton</td>

      <td className="border-r border-black p-2 text-center">₹52,000</td>
      <td className="p-2 text-center">Delivery within 5 days</td>
    </tr>

    <tr>
      <td className="border-r border-black p-2 text-center">GYT</td>
      <td className="border-r border-black p-2 text-center">100</td>
      <td className="border-r border-black p-2 text-center">75x95</td>


      <td className="border-r border-black p-2 text-center">5</td>
      <td className="border-r border-black p-2 text-center">Ton</td>

      <td className="border-r border-black p-2 text-center">₹50,000</td>
      <td className="p-2 text-center">Delivery within 7 days</td>
    </tr>
  </tbody>
</table>




<div className="border border-black">
        <div className="flex flex-row  w-full">
          <div className="  w-[70%] p-3 text-xs">
            <div className="mb-2">
              <span className="font-bold">Delivery :</span> IMMEDIATE
            </div>
         
            <div className="mb-1">
              <span className="font-bold">Special Instructions :</span>
            </div>
            <div className="space-y-1 ml-3  ">
              <p>1. Invoice should contain the payment endorsement - "Payment to be made to M/s THE UNITED TRADERS (Regd.)".</p>
         
              <p>2. Please acknowledge our order within 1 day, confirming the delivery schedule.</p>
   
            </div>
            <div className="mt-3 border-t ">
              <span className="font-bold  ">Note :</span>
            </div>
          </div>
          
          <div className="p-3 flex flex-col w-[30%] justify-between">
            <div className="text-right text-md font-bold ">
              For <span className="instrument-font ">THE UNITED TRADERS (Regd.)</span>
            </div>
            <div className="text-right text-xs mt-20">
              Authorised Signatory
            </div>
          </div>
        </div>
      </div>




    </div>
  </div>
  </>
  );
};

export default PurchaseOrder;
