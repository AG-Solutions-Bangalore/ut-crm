import { App, Button, Spin } from "antd";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { PURCHASE_ORDER_EMAIL, PURCHASE_ORDER_LIST } from "../../api";
import useFinalUserImage from "../../components/common/Logo";
import companyFinalSiginImage from "../../components/common/Sigin";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import PurchaseOrderDuplex from "./PurchaseOrderDuplex";
import PurchaseOrderKraft from "./PurchaseOrderKraft";
import ReportActions from "./ReportActions";

const PurchaseOrderTab = () => {
  const componentRef = useRef(null);
  const [showSignature, setShowSignature] = useState(true);
  const { id } = useParams();
  const company = useSelector((state) => state.company.companyDetails);

  const finalUserImage = useFinalUserImage();
  const SiginImagePath = companyFinalSiginImage();
  const { trigger: emailTrigger, loading: loadingemail } = useApiMutation();
  const { message } = App.useApp();

  const {
    data: purchaseView,
    isLoading,
    isError,
    refetch,
  } = useGetApiMutation({
    url: `${PURCHASE_ORDER_LIST}/${id}`,
    queryKey: ["purchaseorderviewtab", id],
  });

  const milldata = purchaseView?.mill || null;
  const partydata = purchaseView?.party || null;
  const data = purchaseView?.data || null;

  const toggleSignature = () => setShowSignature(!showSignature);
  const handleEmail = async () => {
    const payload = showSignature === true ? "with-signature" : "without";
    try {
      const res = await emailTrigger({
        url: `${PURCHASE_ORDER_EMAIL}/${id}?type=${payload}`,
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
  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spin size="large" />
      </div>
    );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="mb-3 text-lg font-semibold text-gray-600">
          No Purchase Order Found
        </h2>

        <Button type="primary" onClick={() => refetch()} loading={isLoading}>
          Retry
        </Button>
      </div>
    );
  }
  return (
    <>
      <ReportActions
        componentRef={componentRef}
        filename="Purchase_Order.pdf"
        documentTitle="Purchase Order"
        onToggleSignature={toggleSignature}
        showSignature={showSignature}
        includeSignatureToggle={true}
        loadingemail={loadingemail}
        handleEmail={handleEmail}
      />
      {data?.purchase_orders_type === "Kraft" ? (
        <>
          <PurchaseOrderKraft
            componentRef={componentRef}
            showSignature={showSignature}
            toggleSignature={toggleSignature}
            milldata={milldata}
            partydata={partydata}
            data={data}
            loading={isLoading}
            id={id}
            company={company}
            finalUserImage={finalUserImage}
            SiginImagePath={SiginImagePath}
          />
        </>
      ) : (
        <>
      
          <PurchaseOrderDuplex
            componentRef={componentRef}
            showSignature={showSignature}
            toggleSignature={toggleSignature}
            milldata={milldata}
            partydata={partydata}
            data={data}
            loading={isLoading}
            id={id}
            company={company}
            finalUserImage={finalUserImage}
            SiginImagePath={SiginImagePath}
          />
        </>
      )}
    </>
  );
};

export default PurchaseOrderTab;
