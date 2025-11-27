import { useRef, useState, forwardRef } from "react";
import reportlogo from "../../assets/report-logo.png";

import { useReactToPrint } from "react-to-print";
import dayjs from "dayjs";
import { Button, message } from "antd";
import html2pdf from "html2pdf.js";
import companyFinalSiginImage from "../../components/common/Sigin";

const AuthInvoice = forwardRef(
  ({ partyData, thirdPartyData, invoiceData }, ref) => {
    const componentRef = useRef(null);
    const [showSignature, setShowSignature] = useState(true);
    const SiginImagePath = companyFinalSiginImage();

    const toggleSignature = () => {
      setShowSignature(!showSignature);
    };

    const formatDate = (dateString) => {
      if (!dateString)
        return new Date()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
          })
          .replace(/ /g, "-");

      const date = new Date(dateString);
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
        .replace(/ /g, "-");
    };

    const getTodayDate = () => {
      return new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
        })
        .replace(/ /g, "-");
    };

    const formatAmount = (amount) => {
      if (!amount) return "₹0";
      return "₹" + new Intl.NumberFormat("en-IN").format(amount);
    };

    const formatAddress = (address) => {
      if (!address) return null;
      return address
        .split("\n")
        .map((line, index) => <div key={index}>{line}</div>);
    };

    const handleDownload = () => {
      const element = componentRef?.current;

      if (!element) {
        message.error("Failed to generate PDF");
        return;
      }

      const elementForPdf = element.cloneNode(true);
      const printHideElements = elementForPdf.querySelectorAll(".print-hide");
      printHideElements.forEach((el) => el.remove());

      const style = document.createElement("style");
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
        filename: `Auth-Invoice-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          scrollY: 0,
          windowHeight: elementForPdf.scrollHeight,
          backgroundColor: "#FFFFFF",
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
          message.success("PDF downloaded successfully");
        })
        .catch((error) => {
          console.error("PDF download error:", error);
          message.error("Failed to download PDF");
        });
    };

    const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      documentTitle: `Auth-Invoice-Report-${dayjs().format("DD-MM-YYYY")}`,
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

        <div className="flex justify-center bg-gray-50 p-4">
          <div
            className="w-full max-w-[210mm] bg-white p-8 relative"
            ref={componentRef}
          >
            <div className="mb-6">
              <div className="flex justify-end text-xs mb-4">
                <div className="text-right">
                  <div>Ph : 080-26723020</div>
                  <div>Mobile : 9845400122</div>
                </div>
              </div>

              <div className="flex gap-4 items-start mb-4">
                <div className="flex-shrink-0 w-16 h-20 flex items-center justify-center">
                  <img
                    src={reportlogo}
                    alt="Company Logo"
                    className="w-[120px] h-auto object-contain"
                  />
                </div>

                <div className="flex-1 text-center">
                  <h1 className="text-4xl font-bold mb-2">
                    THE UNITED TRADERS (Regd.)
                  </h1>
                  <p className="text-xs font-semibold mb-2">
                    Dealers in : KRAFT PAPER & DUPLEX BOARD
                  </p>
                  <p className="text-[10px] leading-tight mb-1">
                    High profile business center, No 15 3rd floor 1/A Church
                    Street, Bangalore - 560001
                  </p>
                  <p className="text-[10px] leading-tight">
                    Correspondence Address : #1141, Krishna Kuteer, 2nd Main,
                    1st Cross, Hoskerehalli,
                    <br />
                    Bannarihatti 3rd Stage, Bangalore - 560085, Email :
                    united1141@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="text-xs font-bold">
                  <div>{partyData?.party_name || "BAG FACTORY"}</div>
                  {formatAddress(partyData?.party_billing_address) || (
                    <>
                      <div>NO 9 SY NO 69/70, BEHIND</div>
                      <div>BYRAVESHWAR SAW MILL, SEGEHALLI</div>
                      <div>MAGDI ROAD, BANGALORE 560091</div>
                    </>
                  )}
                </div>
                <div className="text-xs">
                  <span className="font-bold">Date :</span> {getTodayDate()}
                </div>
              </div>

              <div className="text-xs mb-4">Dear Sir,</div>
            </div>

            <div className="text-xs mb-4">
              <span className="font-bold">
                Sub : Regarding the payment of Bill
              </span>
            </div>

            <div className="text-xs mb-6 leading-relaxed">
              We hereby authorize M/s{" "}
              {thirdPartyData?.party_name || "BAG FACTORY"} to collect the
              payment for the following Bill:
            </div>

            <div className="mb-6">
              <table className="w-full text-xs border-collapse border border-black">
                <thead>
                  <tr className="border-b border-black bg-gray-100">
                    <th className="text-left py-2 px-2 border-r border-black">
                      Sl.No
                    </th>
                    <th className="text-left py-2 px-2 border-r border-black">
                      Invoice No.
                    </th>
                    <th className="text-left py-2 px-2 border-r border-black">
                      Date
                    </th>
                    <th className="text-left py-2 px-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-black">
                    <td className="py-2 px-2 border-r border-black">1</td>
                    <td className="py-2 px-2 border-r border-black">
                      {invoiceData?.invoiceNo || "1212"}
                    </td>
                    <td className="py-2 px-2 border-r border-black">
                      {formatDate(invoiceData?.date)}
                    </td>
                    <td className="py-2 px-2">
                      {formatAmount(invoiceData?.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-xs mb-4 leading-relaxed">
              Kindly make the payment in favour of M/s{" "}
              {thirdPartyData?.party_name || "BAG FACTORY"} under intimation to
              us.
            </div>

            <div className="text-xs mb-4">Thanks & Regards,</div>
            <div className="text-xs mb-2">Yours faithfully,</div>
            <div className="text-xs mb-2 font-bold">
              For THE UNITED TRADERS (Regd.)
            </div>

            <div className="relative mt-10 mb-16">
              {showSignature && (
                <img
                  src={SiginImagePath}
                  alt="Signature"
                  className="w-28 h-auto object-contain absolute left-10 -top-20"
                />
              )}
              <div className="text-xs text-left mt-20">
                Authorised Signatory
              </div>
            </div>

            <div className="text-xs mt-12">
              <div className="font-bold mb-2">CC To :</div>
              <div>{thirdPartyData?.party_name || "BAG FACTORY"}</div>
              {formatAddress(thirdPartyData?.party_delivery_address) || (
                <>
                  <div>NO 9 SY NO 69/70, BEHIND</div>
                  <div>BYRAVESHWAR SAW MILL, SEGEHALLI</div>
                  <div>MAGDI ROAD, BANGALORE 560091</div>
                </>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }
);

AuthInvoice.displayName = "AuthInvoice";

export default AuthInvoice;
