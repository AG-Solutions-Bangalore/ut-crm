import { useRef, useState } from "react";
import useFinalUserImage from "../../components/common/Logo";
import companyFinalSiginImage from "../../components/common/Sigin";
import ReportActions from "./ReportActions";
const TradeInvoice = () => {
  const componentRef = useRef(null);
  const [showSignature, setShowSignature] = useState(true);
  const SiginImagePath = companyFinalSiginImage();
  const finalUserImage = useFinalUserImage();
  const toggleSignature = () => {
    setShowSignature(!showSignature);
  };

  return (
    <>
      <ReportActions
        componentRef={componentRef}
        filename="Trade_Invoice.pdf"
        documentTitle="Trade Invoice"
        onToggleSignature={toggleSignature}
        showSignature={showSignature}
        includeSignatureToggle={true}
      />
      <div className="flex justify-center bg-gray-50 p-4">
        <div
          className="w-full max-w-[210mm] bg-white border border-black"
          ref={componentRef}
        >
          <div className="border-b border-black p-3">
            <div className="flex justify-between text-xs mb-3">
              <div>
                <div className="font-bold">GSTIN : 29AAXPA4078K2Z0</div>
                <div>Pan No : AAXPA4078K</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">TAX INVOICE</div>
                <div className="text-[10px]">ORIGINAL COPY</div>
              </div>
              <div className="text-right">
                <div>Ph : 08026723020</div>
                <div>Mobile : 9845400122</div>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center">
                <div className="text-white text-center">
                  <img
                    src={finalUserImage}
                    alt="Company Logo"
                    className="w-[120px] h-auto object-contain"
                  />
                </div>
              </div>

              <div className="flex-1 text-center">
                <h1 className="text-xl font-bold mb-1 instrument-font">
                  THE UNITED TRADERS (Regd.)
                </h1>
                <p className="text-xs font-semibold mb-1">
                  Dealers in : KRAFT PAPER & DUPLEX BOARD
                </p>
                <p className="text-[10px] leading-tight">
                  010, A-2 BLOCK, 7TH MAIN, 8TH CROSS, 2ND BLOCK JAYNAGAR,
                  BANGALORE 560011
                  <br />
                  Correspondence Address : #1141, 2nd Main, 1st Cross,
                  Hoskerehalli, BSK 3rd Stage,
                  <br />
                  Bangalore 560085 Email : united1141@gmail.com
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 border-b border-black">
            <div className="border-r border-black p-3">
              <div className="text-xs space-y-1">
                <div>
                  <span className="font-bold">
                    To : TRISHA PACKAGING INDUSTRIES
                  </span>
                </div>
                <div>112/1 10TH MAIN ROAD DODDANNA INDL</div>
                <div>ESTATE PEENYA 2ND STAGE</div>
                <div>BANGALORE 560091</div>
                <div className="mt-2">
                  <span className="font-bold">Delivery Address</span>
                </div>
                <div>112/1 10TH MAIN ROAD DODDANNA INDL</div>
                <div>ESTATE PEENYA 2ND STAGE</div>
              </div>
            </div>

            <div className="p-3">
              <div className="text-xs space-y-1">
                <div className="flex">
                  <span className="w-32">Invoice No.</span>
                  <span>: UT/2020-21/12</span>
                </div>
                <div className="flex">
                  <span className="w-32">Invoice Date</span>
                  <span>: 22-12-2020</span>
                </div>
                <div className="flex">
                  <span className="w-32">Party's GSTIN</span>
                  <span>: 29BBDPR1429R1ZY</span>
                </div>
                <div className="flex">
                  <span className="w-32">Service State</span>
                  <span>: KARNATAKA</span>
                </div>
                <div className="flex">
                  <span className="w-32">E Way Bill No.</span>
                  <span>: 1912 8158 1266</span>
                </div>
                <div className="flex">
                  <span className="w-32">PaymentTerm</span>
                  <span>: 30 DAYS</span>
                </div>
              </div>
            </div>
          </div>

          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-2 text-center w-12">
                  Sl.
                  <br />
                  No.
                </th>
                <th className="border-r border-black p-2 text-left">
                  Description of goods or Services
                </th>
                <th className="border-r border-black p-2 text-center w-16">
                  Reel
                </th>
                <th className="border-r border-black p-2 text-center w-20">
                  Qnty.
                  <br />
                  (in Kgs)
                </th>
                <th className="border-r border-black p-2 text-center w-20">
                  Rate
                  <br />
                  (in Rs./KGS)
                </th>
                <th className="p-2 text-center w-24">
                  Taxable value of
                  <br />
                  Goods / Services
                  <br />
                  (in Rs.)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-r border-black p-2 text-center align-top">
                  1
                </td>
                <td className="border-r border-black p-2 align-top">
                  <div>CRAFT PAPER</div>
                  <div>BF - 18, GSM - 180, SIZE - 92,</div>
                  <div>Shade - NATURAL</div>
                </td>
                <td className="border-r border-black p-2 text-center align-top">
                  6
                </td>
                <td className="border-r border-black p-2 text-right align-top">
                  2,719.000
                </td>
                <td className="border-r border-black p-2 text-right align-top">
                  31.00
                </td>
                <td className="p-2 text-right align-top">84,289.00</td>
              </tr>

              <tr style={{ height: "300px" }}>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td className="border-r border-black"></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div className="border-t border-black">
            <div className="flex">
              <div className="flex-1 border-r border-black p-3">
                <div className="text-xs mb-2">
                  <span className="font-bold">HSN CODE : </span>48043900
                </div>
                <div className="text-xs">
                  <span className="font-bold">Total Amount</span>
                </div>
                <div className="text-xs">
                  <span className="font-bold">(Net in Words) : </span>
                  <span className="font-bold">
                    Ninety Four Thousand Four Hundred Three
                  </span>
                </div>
                <div className="text-xs font-bold">Only .....</div>
              </div>

              <div className="w-64">
                <div className="flex justify-between border-b border-black p-2 text-xs">
                  <span className="font-bold">Gross Total :</span>
                  <span className="font-bold">Rs. 84,289.00</span>
                </div>
                <div className="flex justify-between border-b border-black p-2 text-xs">
                  <span>ADD : CGST 6%</span>
                  <span>Rs. 5,057.00</span>
                </div>
                <div className="flex justify-between border-b border-black p-2 text-xs">
                  <span>ADD : IGST 0%</span>
                  <span></span>
                </div>
                <div className="flex justify-between p-2 text-xs">
                  <span className="font-bold">Total Amount :</span>
                  <span className="font-bold">Rs. 94,403.00</span>
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
                <div className="ml-3">
                  (If bill remains unpaid after Due Date)
                </div>
              </div>
            </div>

            <div className="w-64 p-3 flex flex-col justify-between relative">
              <div className="text-right text-xs">
                <div className="font-bold">For THE UNITED TRADERS (Regd.)</div>
              </div>

              <div className="mt-4 h-20 relative">
                {showSignature && (
                  <img
                    src={SiginImagePath}
                    alt="Signature"
                    className="w-24 h-auto object-contain absolute right-0 top-0"
                  />
                )}
                <div className="absolute bottom-0 right-0 text-xs">
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

export default TradeInvoice;
