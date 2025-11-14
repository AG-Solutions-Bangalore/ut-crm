import { useRef, useState } from "react";
import reportlogo from "../../assets/report-logo.png";
import ReportActions from "../reportformats/ReportActions";

const devUrl = "/api/crmapi/public/assets/images/company_images/sign.jpeg";
// const prodUrl = "https://theunitedtraders.co.in/crmapi/public/assets/images/company_images/sign.jpeg";

const Quotation = () => {
  const componentRef = useRef(null);

  const [showSignature, setShowSignature] = useState(true);

  const toggleSignature = () => {
    setShowSignature(!showSignature);
  };

  return (
    <>
      <ReportActions
        componentRef={componentRef}
        filename="Quotation_Invoice.pdf"
        documentTitle="Quotation Invoice"
        onToggleSignature={toggleSignature}
        showSignature={showSignature}
        includeSignatureToggle={true}
      />

      <div className="flex justify-center bg-gray-50 p-4">
        <div
          className="w-full max-w-[210mm] bg-white border border-black"
          ref={componentRef}
        >
          <div className="border-b-2 border-black p-4">
            <div className="flex justify-end text-xs mb-3">
              <div className="text-right">
                <div>Ph : 08026723020</div>
                <div>Mobile : 9845400122</div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                <div className="text-white text-center">
                  <img
                    src={reportlogo}
                    alt="Company Logo"
                    className="w-[120px] h-auto object-contain"
                  />
                </div>
              </div>

              <div className="flex-1 text-center">
                <div className="text-xl font-bold mb-1">QUOTATIONS</div>
                <h1 className="text-3xl font-bold mb-1 instrument-font">
                  THE UNITED TRADERS (Regd.)
                </h1>
                <p className="text-xs font-semibold mb-2">
                  Dealers in : KRAFT PAPER & DUPLEX BOARD
                </p>

                <p className="text-[10px] leading-tight">
                  Correspondence Address : #1141, 2nd Main, 1st Cross,
                  Hoskerehalli, BSK 3rd Stage,
                  <br />
                  Bangalore 560085 Email : united1141@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-black">
            <div className="flex justify-between items-start mb-3">
              <div className="text-xs">
                <div className="font-bold mb-1">To, ADITYA PACKAGING</div>
                <div>NO 93/6 WEST PIPE LINE</div>
                <div>KASTURIABA NAGAR, MYSORE ROAD</div>
                <div>BANGALORE - 560026</div>
                <div className="mt-2">Dear Sir,</div>
              </div>
              <div className="text-xs text-right">
                <div className="mb-1">
                  <span className="font-bold">Date:</span> 13-03-2020
                </div>
                <div>
                  <span className="font-bold">Quotation Ref :</span> QT/2/201920
                </div>
              </div>
            </div>

            <div className="text-xs mb-3">
              We take pleasure to offer Kraft Paper as per details
            </div>

            <div className="text-xs space-y-1">
              <div>
                <span className="font-bold">Mill :</span> BALAJI MALT (P) LTD
              </div>
              <div>
                <span className="font-bold">Deckle :</span> 410 - 420 cms
              </div>
              <div>
                <span className="font-bold">GSM Range :</span> 120 - 250 GSM
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="text-xs text-right mb-2 font-bold">
              Rate Per Kg (Rs.)
            </div>
            <table className="w-full border border-black text-xs">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black p-2 text-center font-bold">
                    QUALITY
                  </th>
                  <th className="border-r border-black p-2 text-center font-bold">
                    BASIC
                    <br />
                    (Freight Included)
                  </th>
                  <th className="border-r border-black p-2 text-center font-bold">
                    GST
                  </th>
                  <th className="border-r border-black p-2 text-center font-bold">
                    INSURANCE
                  </th>
                  <th className="border-r border-black p-2 text-center font-bold">
                    TOTAL
                    <br />
                    EX.MILL
                  </th>
                  <th className="p-2 text-center font-bold">
                    NET OF
                    <br />
                    GST
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-black">
                  <td className="border-r border-black p-2 text-center">
                    20 BF
                  </td>
                  <td className="border-r border-black p-2 text-center">22</td>
                  <td className="border-r border-black p-2 text-center">
                    2.64
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    0.02
                  </td>
                  <td className="border-r border-black p-2 text-center">
                    24.66
                  </td>
                  <td className="p-2 text-center">22.02</td>
                </tr>

                <tr style={{ height: "80px" }}>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td className="border-r border-black"></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs">
            <div className="mb-3">
              <div className="flex mb-1">
                <span className="font-bold w-40">EXTRA CHARGES :</span>
                <span>For GYT - Rs 1.00 PER KG</span>
              </div>
              <div className="flex mb-1">
                <span className="font-bold w-40">( Add to Basic )</span>
                <span>For 120 GSM - Rs 0.50 PER KG</span>
              </div>
              <div className="flex mb-1">
                <span className="w-40"></span>
                <span>For 201 GSM - 250 GSM - Rs 0.50 PER KG</span>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex">
                <span className="font-bold w-40">FREIGHT :</span>
                <span>Included</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">PAYMENT :</span>
                <span>WITHIN 15 Days</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">DELIVERY :</span>
                <span>8 - 10 Days from the receipt of your order</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">FURNISH :</span>
                <span>INDIANe IMPORTED waste paper</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">SAMPLES :</span>
                <span>Enclosed</span>
              </div>
            </div>

            <div className="mb-3 leading-relaxed">
              We assure you of our prompt and efficient services and look
              forward for your esteemed orders
            </div>

            <div className="mb-3">Thanking You,</div>
            <div className="mb-3">Your's faithfully,</div>
            <div className="mb-8">For THE UNITED TRADERS (Regd.)</div>
            <div className="relative mt-12 mb-8">
              {showSignature && (
                <img
                  src={devUrl}
                  alt="Signature"
                  className="w-28 h-auto object-contain absolute left-12 -top-16"
                />
              )}
              <div className="text-xs text-left mt-16">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Quotation;
