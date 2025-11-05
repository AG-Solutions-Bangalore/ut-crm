import { Button } from "antd";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import reportlogo from "../../assets/report-logo.png";
const PurchaseOrder = () => {
  const componentRef = useRef(null);

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
    <div >
      <Button onClick={handlePrint}>Print</Button>
      <div className="flex justify-center" ref={componentRef}>
        <div className="px-2 w-full max-w-[210mm]">
          <div className="flex justify-between">
            <div className="font-bold">GSTIN : 29AAXPA4078K2Z0</div>
            <div>Ph : 08026723020 Mobile : 9845400122</div>
          </div>
          <div className="grid grid-cols-12 gap-4 border-b border-black pb-2 items-start">
            {/* Left: Logo */}
            <div className="col-span-2">
              <img
                src={reportlogo}
                alt="Company Logo"
                className="w-[120px] h-auto object-contain"
              />
            </div>

            {/* Right: Company Info */}
            <div className="col-span-10 text-[13px] leading-tight text-center">
              <div
                className="text-lg font-semibold tracking-wide"
            
              >
                THE UNITED TRADERS (Regd.)
              </div>
              <div className="font-bold">
                Dealers in : KRAFT PAPER & DUPLEX BOARD
              </div>
              <div>
                010, A-2 BLOCK, 7TH MAIN, 8TH CROSS, 2ND BLOCK JAYNAGAR,
                BANGALORE 560011
              </div>
              <p>
                Correspondence Address : #1141, 2nd Main, 1st Cross,
                Hoskerehalli, BSK 3rd Stage, Bangalore 560085,Email : united1141@gmail.com
              </p>

              {/* Title */}
              <div className="mt-2 text-xl font-bold underline">
                PURCHASE ORDER
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrder;
