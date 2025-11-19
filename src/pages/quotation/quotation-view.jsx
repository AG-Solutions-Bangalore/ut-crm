import { App, Button } from "antd";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { QUOTATION_EMAIL, QUOTATION_LIST } from "../../api";
import useFinalUserImage from "../../components/common/Logo";
import companyFinalSiginImage from "../../components/common/Sigin";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { useApiMutation } from "../../hooks/useApiMutation";

const QuotationView = () => {
  const { message } = App.useApp();
  const componentRef = useRef(null);
  const { id } = useParams();
  const [showSignature, setShowSignature] = useState(true);
  const { trigger: emailTrigger, loading: loadingemail } = useApiMutation();
  const companydata = useSelector((state) => state?.auth?.userDetails);
  const SiginImagePath = companyFinalSiginImage();
  const finalUserImage = useFinalUserImage();
  const toggleSignature = () => {
    setShowSignature(!showSignature);
  };

  const {
    data: quotationdata,
    isLoading,
    refetch,
  } = useGetApiMutation({
    url: `${QUOTATION_LIST}/${id}`,
    queryKey: ["quotationdataview", id],
  });
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Quotation--Report-${dayjs().format("DD-MM-YYYY")}`,
    removeAfterPrint: true,
    pageStyle: `
                @page {
                  size: A4;
                  margin: 5mm;
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
      margin: [5, 5, 5, 5],
      filename: `Quotation-Report-${dayjs().format("DD-MM-YYYY")}.pdf`,
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
  const handleEmail = async () => {
    const payload = showSignature === true ? "with-signature" : "without";
    try {
      const res = await emailTrigger({
        url: `${QUOTATION_EMAIL}/${id}?type=${payload}`,
      });

      if (res.code == 201) {
        message.success(res.message || "Mail Send Sucessfully");
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
        <Button onClick={handleEmail} loading={loadingemail}>
          {loadingemail ? "Sending" : "Send Email"}
        </Button>
      </div>
      <div className="flex justify-center p-4 ">
        <div
          className="w-full max-w-[210mm] bg-white border border-black "
          ref={componentRef}
        >
          <div className="border-b-2 border-black p-4 relative">
            <div className="flex justify-end text-xs mb-3 absolute top-2 right-2">
              <div className="text-right">
                <div>Email : {companydata?.company_email ?? ""}</div>
                <div>Mobile : {companydata?.company_mobile ?? ""}</div>
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
                <div className="text-xl font-bold mb-1">QUOTATIONS</div>
                <h1 className="text-3xl font-bold mb-1 instrument-font">
                  {companydata?.company_name ?? ""}
                </h1>
                <p className="text-xs font-semibold mb-2">
                  Dealers in : KRAFT PAPER & DUPLEX BOARD
                </p>

                <p className="text-[10px] leading-tight">
                  {companydata?.company_cor_address ?? ""}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-3 border-b border-black">
            <div className="flex justify-between items-start mb-3">
              <div className="text-xs">
                <div className="font-bold mb-1">
                  To, {quotationdata?.data?.party_name ?? ""}
                </div>
                <div
                  dangerouslySetInnerHTML={{
                    __html: (
                      quotationdata?.party?.party_billing_address || ""
                    ).replace(/\n/g, "<br/>"),
                  }}
                ></div>

                <div className="mt-2">Dear Sir,</div>
              </div>
              <div className="text-xs text-right">
                <div className="mb-1">
                  <span className="font-bold">Date:</span>{" "}
                  {quotationdata?.data?.quotation_date
                    ? dayjs(quotationdata?.data?.quotation_date).format(
                        "DD-MM-YYYY"
                      )
                    : ""}
                </div>
                <div>
                  <span className="font-bold">Quotation Ref :</span>
                  {quotationdata?.data?.quotation_ref ?? ""}
                </div>
              </div>
            </div>

            <div className="text-xs mb-3">
              {quotationdata?.data?.quotation_subject ?? ""}
            </div>

            <div className="text-xs space-y-1">
              <div>
                <span className="font-bold">Mill :</span>{" "}
                {quotationdata?.data?.mill_name ?? ""}
              </div>
              <div>
                <span className="font-bold">Deckle :</span>{" "}
                {quotationdata?.data?.quotation_deckle ?? ""}
              </div>
              <div>
                <span className="font-bold">GSM Range :</span>{" "}
                {quotationdata?.data?.quotation_gsm_range ?? ""}
              </div>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="text-xs text-center mb-2 font-bold">
              Rate Per Kg (Rs.)
            </div>
            <table className="w-full border border-black text-xs table-fixed">
              <thead>
                <tr className="border-b border-black">
                  <th className="w-40 border-r border-black px-1 py-2 text-center font-bold">
                    QUALITY
                  </th>

                  <th className="w-32 border-r border-black px-1 py-2 text-center font-bold">
                    BASIC <br /> (Freight Included)
                  </th>

                  <th className="w-20 border-r border-black px-1 py-2 text-center font-bold">
                    GST
                  </th>

                  <th className="w-24 border-r border-black px-1 py-2 text-center font-bold">
                    INSURANCE
                  </th>

                  <th className="w-28 border-r border-black px-1 py-2 text-center font-bold">
                    TOTAL EX.MILL
                  </th>

                  <th className="w-28 px-1 py-2 text-center font-bold">
                    NET OF GST
                  </th>
                </tr>
              </thead>

              <tbody>
                {quotationdata?.data?.subs?.length > 0 ? (
                  quotationdata.data.subs.map((data, key) => (
                    <tr className="border-b border-black" key={key}>
                      <td className="w-40 px-1 py-2 whitespace-pre-line break-words border-r border-black">
                        {data.quotation_quality ?? ""}
                      </td>

                      <td className="w-32 px-1 py-2 text-center border-r border-black">
                        {data.quotation_basic_price ?? ""}
                      </td>

                      <td className="w-20 px-1 py-2 text-center border-r border-black">
                        {data.quotation_gst ?? ""}
                      </td>

                      <td className="w-24 px-1 py-2 text-center border-r border-black">
                        {data.quotation_insurance ?? ""}
                      </td>

                      <td className="w-28 px-1 py-2 text-center border-r border-black">
                        {data.quotation_tmill ?? ""}
                      </td>

                      <td className="w-28 px-1 py-2 text-center">
                        {data.quotation_net_gst ?? ""}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-600">
                      No Data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 text-xs">
            <div className="mb-3">
              <div className="flex mb-1">
                <div>
                  <span className="font-bold w-40">EXTRA CHARGES :</span>
                  <p className="font-bold w-40">( Add to Basic )</p>
                </div>
                <span>
                  {" "}
                  {quotationdata?.data?.quotation_extra_charge ?? ""}
                </span>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              <div className="flex">
                <span className="font-bold w-40">FREIGHT :</span>
                <span> {quotationdata?.data?.quotation_freight ?? ""}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">PAYMENT :</span>
                <span> {quotationdata?.data?.quotation_payment ?? ""}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">DELIVERY :</span>
                <span> {quotationdata?.data?.quotation_delivery ?? ""}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">FURNISH :</span>
                <span> {quotationdata?.data?.quotation_furnish ?? ""}</span>
              </div>
              <div className="flex">
                <span className="font-bold w-40">SAMPLES :</span>
                <span> {quotationdata?.data?.quotation_samples ?? ""}</span>
              </div>
            </div>

            <div className="mb-3 leading-relaxed">
              {quotationdata?.data?.quotation_footer ?? ""}
            </div>

            <div className="mb-3">Thanking You,</div>
            <div className="mb-3">Your's faithfully,</div>
            <div className="mb-8">For THE UNITED TRADERS (Regd.)</div>
            <div className="relative mt-12 mb-8">
              {showSignature && (
                <img
                  src={SiginImagePath}
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

export default QuotationView;
