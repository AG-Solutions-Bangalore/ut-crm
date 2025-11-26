import { Button, message, Spin } from "antd";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { Mail, Phone, PhoneCall } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { TAX_INVOICE_EMAIL, TAX_INVOICE_LIST } from "../../api";
import useFinalUserImage from "../../components/common/Logo";
import companyFinalSiginImage from "../../components/common/Sigin";
import { useApiMutation } from "../../hooks/useApiMutation";

const TaxInvoice = () => {
  const componentRef = useRef(null);
  const [showSignature, setShowSignature] = useState(true);
  const SiginImagePath = companyFinalSiginImage();
  const finalUserImage = useFinalUserImage();
  const { id } = useParams();
  const company = useSelector((state) => state.company.companyDetails);

  const { trigger: emailTrigger, loading: loadingemail } = useApiMutation();
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

  const tableData = data?.subs || [];

  const totalCommission = tableData.reduce((sum, item) => {
    return sum + (parseFloat(item.tax_invoice_sub_commn) || 0);
  }, 0);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB");
  };

  const numberToWords = (num) => {
    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    if (num === 0) return "Zero Only";

    if (num < 0) {
      return "Minus " + numberToWords(Math.abs(num));
    }

    let words = "";

    const getHundredPart = (n) => {
      let str = "";

      if (n >= 100) {
        str += ones[Math.floor(n / 100)] + " Hundred ";
        n %= 100;
      }

      if (n >= 20) {
        str += tens[Math.floor(n / 10)] + " ";
        n %= 10;
      } else if (n >= 10) {
        str += teens[n - 10] + " ";
        return str;
      }

      if (n > 0) {
        str += ones[n] + " ";
      }

      return str;
    };

    if (num >= 10000000) {
      words += numberToWords(Math.floor(num / 10000000)) + " Crore ";
      num %= 10000000;
    }

    if (num >= 100000) {
      words += numberToWords(Math.floor(num / 100000)) + " Lakh ";
      num %= 100000;
    }

    if (num >= 1000) {
      words += numberToWords(Math.floor(num / 1000)) + " Thousand ";
      num %= 1000;
    }

    words += getHundredPart(num);

    return words.trim();
  };

  const grossTotal = totalCommission;
  const cgstAmount =
    (grossTotal * (parseFloat(data?.tax_invoice_cgst) || 0)) / 100;
  const sgstAmount =
    (grossTotal * (parseFloat(data?.tax_invoice_sgst) || 0)) / 100;
  const igstAmount =
    (grossTotal * (parseFloat(data?.tax_invoice_igst) || 0)) / 100;
  const totalAmount = grossTotal + cgstAmount + sgstAmount + igstAmount;

  const handleDownload = async () => {
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
      filename: `Tax-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
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
      pagebreak: {
        mode: ["avoid-all", "css", "legacy"],
        before: ".fixed-footer",
      },
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
    documentTitle: `Tax_Invoice_${data?.tax_invoice_no || "invoice"}`,
    onBeforeGetContent: () => {
      const signatureElement = componentRef.current?.querySelector(
        'img[alt="Signature"]'
      );
      if (signatureElement) {
        signatureElement.style.display = showSignature ? "block" : "none";
      }
    },
    pageStyle: `
      @page {
        size: A4;
        margin: 5mm !important;
      }
      @media print {
        .print-hide {
          display: none !important;
        }
        
        ${
          tableData.length <= 8
            ? `
        /* Data <= 8: Fixed header and footer */
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
          margin-top: 156px;
        }
        .first-page-summary-table {
          display: table !important;
        }
        .continuation-section {
          display: none !important;
        }
        `
            : `
        /* Data > 8: Header and footer on page 1 (no table), all table data on page 2 */
        .fixed-header {
          position: relative;
          background: white;
        }
        .fixed-footer {
          position: relative;
          background: white;
          page-break-after: always;
        }
        .page-content {
          margin-top: 0;
          margin-bottom: 0;
        }
     .first-page-summary-table {
    visibility: hidden !important;   
    height: 300px !important;        
    min-height: 300px !important;   
  }
        .continuation-section {
          display: block !important;
          page-break-before: always;
          margin-top: 20px;
        }
        /* Show all data in continuation table */
        .show-all-data-in-continuation {
          display: table-row !important;
        }
        `
        }
      }
    `,
  });

  const handleEmail = async () => {
    const payload = showSignature === true ? "with-signature" : "without";
    try {
      const res = await emailTrigger({
        url: `${TAX_INVOICE_EMAIL}/${id}?type=${payload}`,
      });

      if (res.code == 201) {
        message.success(res.message || "Mail Send Successfully");
      } else {
        message.error(res.message || "Failed to send mail.");
      }
    } catch (error) {
      console.error(error);
      message.error(
        error?.response?.data?.message ||
          "Something went wrong while sending mail."
      );
    }
  };

  const toggleSignature = () => {
    setShowSignature(!showSignature);
  };
  const formatINR = (value) => {
    return Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <>
      <div className="print-hide flex gap-2 mb-4">
        <Button onClick={handlePrint}>Print</Button>
        <Button
          type={showSignature ? "primary" : "default"}
          onClick={toggleSignature}
        >
          {showSignature ? "With Signature" : "Without Signature"}
        </Button>
        <Button onClick={handleEmail} loading={loadingemail}>
          {loadingemail ? "Sending" : "Send Email"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto bg-white  " ref={componentRef}>
            <div className="fixed-header border-2  relative border-blue-900 px-2 py-1 bg-white">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-blue-900 instrument-font">
                    {company?.company_name || ""}
                  </h1>
                  <p className="text-sm text-gray-700 mt-2">
                    Dealers in : KRAFT PAPER & DUPLEX BOARD
                  </p>
                  <p className="text-xs text-gray-600">
                    {company?.company_address || ""}
                  </p>
                  <div className="mt-4 flex justify-start gap-5 text-xs">
                    <div>GSTIN : {company?.company_gst || ""}</div>
                    <div>Pan No : {company?.company_pan || ""}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white text-center">
                    
                    <img
                      src={finalUserImage}
                      alt="Company Logo"
                      className="w-[120px] h-[9rem] object-contain"
                    />
                  </div>
                </div>
              </div>
              <div className="absolute w-full text-lg text-center -translate-y-8 -translate-x-2 font-bold text-gray-700">
                TAX INVOICE
              </div>
            </div>

            <div className="page-content border-l-2 border-r-2 border-blue-900 ">
              <div className="flex gap-8 px-4 py-2">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 mb-2">To</p>
                  <h3 className="font-bold text-blue-900 mb-1">
                    {selectedMill?.mill_name || ""}
                  </h3>
                  <p className="text-xs text-gray-700 whitespace-pre-line">
                    {selectedMill?.mill_billing_address || ""}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      Invoice No. :
                    </span>
                    <span className="text-xs">
                      {data?.tax_invoice_no || ""}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      Invoice Date :
                    </span>
                    <span className="text-xs">
                      {formatDate(data?.tax_invoice_date) || ""}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      Service State :
                    </span>
                    <span className="text-xs">
                      {selectedMill?.mill_state || ""}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-bold text-gray-700">
                      Party GST :
                    </span>
                    <span className="text-xs">
                      {selectedMill?.mill_gstin || ""}
                    </span>
                  </div>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr className="border-t-2 border-blue-900">
                    <th className="border-r-2 border-blue-900 p-2 text-left font-semibold w-16">
                      Sl. No.
                    </th>
                    <th className="border-r-2 border-blue-900 p-2 text-left font-semibold">
                      Description of Goods / Services
                    </th>
                    <th className="border-r-2 border-blue-900 p-2 text-left font-semibold w-32">
                      HSN Code
                    </th>
                    <th className="p-2 text-right font-semibold w-48">
                      Total Value (INR)
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-y-2 border-blue-900">
                    <td className="border-r-2 border-blue-900 p-2">1.</td>
                    <td className="border-r-2 border-blue-900 p-2">
                      {data?.tax_invoice_description || ""}
                    </td>
                    <td className="border-r-2 border-blue-900 p-2">
                      {data?.tax_invoice_hsn_code || ""}
                    </td>
                    <td className="p-2 text-right font-medium">
                      Rs:
                      {formatINR(totalCommission)}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="w-[80%] p-2 min-h-[400px] first-page-summary-table ">
                <div className="text-left pb-1">
                  <h2 className="text-md font-bold text-gray-800">Summary</h2>
                </div>
                <table className="w-full border border-gray-800 border-collapse text-xs">
                  <thead>
                    <tr className="border border-gray-800 bg-gray-100">
                      <th className="border border-gray-800 p-1 text-left font-bold">
                        Date
                      </th>
                      <th className="border border-gray-800 p-1 text-left font-bold">
                        Bill Ref.
                      </th>
                      <th className="border border-gray-800 p-1 text-left font-bold">
                        BF
                      </th>
                      <th className="border border-gray-800 p-1 text-right font-bold">
                        Quantity
                      </th>
                      <th className="border border-gray-800 p-1 text-right font-bold">
                        Rate
                      </th>
                      <th className="border border-gray-800 p-1 text-right font-bold">
                        Disc. Rate
                      </th>
                      <th className="border border-gray-800 p-1 text-right font-bold">
                        Diff.
                      </th>
                      <th className="border border-gray-800 p-1 text-right font-bold">
                        Commn
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {tableData.map((row, idx) => (
                      <tr key={idx} className="border border-gray-800">
                        <td className="border border-gray-800 p-1">
                          {formatDate(row.tax_invoice_sub_purchase_date)}
                        </td>
                        <td className="border border-gray-800 p-1">
                          {row.tax_invoice_sub_billing_ref}
                        </td>
                        <td className="border border-gray-800 p-1">
                          {row.tax_invoice_sub_bf}
                        </td>
                        <td className="border border-gray-800 p-1 text-right">
                          {row.tax_invoice_sub_tones}
                        </td>
                        <td className="border border-gray-800 p-1 text-right">
                          {row.tax_invoice_sub_sale_rate}
                        </td>
                        <td className="border border-gray-800 p-1 text-right">
                          {row.tax_invoice_sub_purchase_rate}
                        </td>
                        <td className="border border-gray-800 p-1 text-right">
                          {row.tax_invoice_sub_rate_diff}
                        </td>
                        <td className="border border-gray-800 p-1 text-right">
                          {row.tax_invoice_sub_commn}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end mt-2">
                  <div className="w-48">
                    <div className="flex justify-between text-xs font-bold border-t-2 border-gray-800 pt-1">
                      <span>Total =</span>
                      <span className="text-red-600">
                        Rs. {formatINR(totalCommission)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed-footer bg-white border-l-2 border-r-2 border-b-2 border-blue-900">
              <div className="flex p-4 border-b-2 border-blue-900">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-700 mb-1">
                    Total Amount (INR IN WORDS) :
                  </p>
                  <p className="text-sm font-semibold">
                    {numberToWords(Math.round(totalAmount))}
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    Note : Any dispute is Subject to Bangalore Jurisdiction.
                  </p>
                </div>
                {/* <div className="flex-1 text-right text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Discount (if any)</span>
                    <span className="font-semibold">
                      {data?.tax_invoice_discount || "0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1 font-bold border-b-2 border-blue-900 pb-1">
                    <span>Gross Total :</span>
                    <span>Rs. {grossTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>ADD - CGST {data?.tax_invoice_cgst || 9}% :</span>
                    <span>
                      {cgstAmount > 0 ? `Rs. ${cgstAmount.toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>ADD - SGST {data?.tax_invoice_sgst || 9}% :</span>
                    <span>
                      {sgstAmount > 0 ? `Rs. ${sgstAmount.toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>ADD - IGST {data?.tax_invoice_igst || 0}% :</span>
                    <span className="font-semibold">
                      {igstAmount > 0 ? `Rs. ${igstAmount.toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-blue-900 border-t-2 border-blue-900 pt-1">
                    <span>Total Amount :</span>
                    <span>Rs. {totalAmount.toFixed(2)}</span>
                  </div>
                </div> */}
                <div className="flex-1 text-right text-xs">
                  <div className="flex justify-between mb-1">
                    <span>Discount (if any)</span>
                    <span className="font-semibold">
                      {formatINR(data?.tax_invoice_discount || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between mb-1 font-bold border-b-2 border-blue-900 pb-1">
                    <span>Gross Total :</span>
                    <span>Rs. {formatINR(grossTotal)}</span>
                  </div>

                  <div className="flex justify-between mb-1">
                    <span>ADD - CGST {data?.tax_invoice_cgst || 9}% :</span>
                    <span>
                      {cgstAmount > 0 ? `Rs. ${formatINR(cgstAmount)}` : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between mb-1">
                    <span>ADD - SGST {data?.tax_invoice_sgst || 9}% :</span>
                    <span>
                      {sgstAmount > 0 ? `Rs. ${formatINR(sgstAmount)}` : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between mb-1">
                    <span>ADD - IGST {data?.tax_invoice_igst || 0}% :</span>
                    <span className="font-semibold">
                      {igstAmount > 0 ? `Rs. ${formatINR(igstAmount)}` : "-"}
                    </span>
                  </div>

                  <div className="flex justify-between font-bold text-blue-900 border-t-2 border-blue-900 pt-1">
                    <span>Total Amount :</span>
                    <span>Rs. {formatINR(totalAmount)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-6 p-4 border-b border-blue-900">
                <div className="flex-1 text-xs">
                  <p className="font-bold mb-1">
                    Acc Name : {company?.company_account_name || ""}
                  </p>
                  <p className="mb-1">Bank : {company?.company_bank || ""}</p>
                  <p className="mb-1">
                    Branch : {company?.company_branch || ""}
                  </p>
                  <p className="mb-1">
                    A/C No : {company?.company_account_no || ""}
                  </p>
                  <p>IFSC Code : {company?.company_ifsc_code || ""}</p>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-md font-bold">
                    {company?.company_name || ""}
                  </p>
                  <div className="relative mt-8">
                    {showSignature && (
                      <img
                        src={SiginImagePath}
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
                    Corr. Address : {company?.company_cor_address || ""}
                  </p>
                  <div className="flex gap-4 items-center mx-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-900 flex items-center justify-center">
                        <Phone className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs">
                        {" "}
                        {company?.company_mobile || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-900 flex items-center justify-center">
                        <PhoneCall className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs">
                        {" "}
                        {company?.company_mobile2 || ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-blue-900 flex items-center justify-center">
                        <Mail className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-xs">
                        {" "}
                        {company?.company_email || ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {tableData.length > 8 && (
              <div className="continuation-section hidden print:block">
                <div className="p-2">
                  <div className="text-left pb-1 flex justify-between">
                    <h2 className="text-md font-bold text-gray-800">
                      Summary {tableData.length <= 8 ? "" : ""}
                    </h2>
                    <div className="flex space-x-2">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          Invoice No :
                        </span>
                        <span className="text-xs">
                          {""} {data?.tax_invoice_no || ""}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-bold text-gray-700">
                          Invoice Date :
                        </span>
                        <span className="text-xs">
                          {formatDate(data?.tax_invoice_date) || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <table className="w-full border border-gray-800 border-collapse text-xs">
                    <thead>
                      <tr className="border border-gray-800 bg-gray-100">
                        <th className="border border-gray-800 p-1 text-left font-bold">
                          Date
                        </th>
                        <th className="border border-gray-800 p-1 text-left font-bold">
                          Bill Ref.
                        </th>
                        <th className="border border-gray-800 p-1 text-left font-bold">
                          BF
                        </th>
                        <th className="border border-gray-800 p-1 text-right font-bold">
                          Quantity
                        </th>
                        <th className="border border-gray-800 p-1 text-right font-bold">
                          Rate
                        </th>
                        <th className="border border-gray-800 p-1 text-right font-bold">
                          Disc. Rate
                        </th>
                        <th className="border border-gray-800 p-1 text-right font-bold">
                          Diff.
                        </th>
                        <th className="border border-gray-800 p-1 text-right font-bold">
                          Commn
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {tableData.map((row, idx) => (
                        <tr key={idx} className="border border-gray-800">
                          <td className="border border-gray-800 p-1">
                            {formatDate(row.tax_invoice_sub_purchase_date)}
                          </td>
                          <td className="border border-gray-800 p-1">
                            {row.tax_invoice_sub_billing_ref}
                          </td>
                          <td className="border border-gray-800 p-1">
                            {row.tax_invoice_sub_bf}
                          </td>
                          <td className="border border-gray-800 p-1 text-right">
                            {row.tax_invoice_sub_tones}
                          </td>
                          <td className="border border-gray-800 p-1 text-right">
                            {row.tax_invoice_sub_sale_rate}
                          </td>
                          <td className="border border-gray-800 p-1 text-right">
                            {row.tax_invoice_sub_purchase_rate}
                          </td>
                          <td className="border border-gray-800 p-1 text-right">
                            {row.tax_invoice_sub_rate_diff}
                          </td>
                          <td className="border border-gray-800 p-1 text-right">
                            {row.tax_invoice_sub_commn}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="flex justify-end mt-2">
                    <div className="w-48">
                      <div className="flex justify-between text-xs font-bold border-t-2 border-gray-800 pt-1">
                        <span>Total =</span>
                        <span className="text-red-600">
                          Rs.{" "}
                          {totalCommission.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TaxInvoice;
