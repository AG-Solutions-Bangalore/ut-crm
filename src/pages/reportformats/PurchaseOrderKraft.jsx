import { useEffect, useRef, useState } from "react";
import reportlogo from "../../assets/report-logo.png";
import ReportActions from "./ReportActions";
import { useParams } from "react-router-dom";

import { message, Spin } from "antd";
import { PURCHASE_ORDER_LIST } from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useSelector } from "react-redux";

const devUrl = '/api/crmapi/public/assets/images/company_images/sign.jpeg'
// const prodUrl = 'https://theunitedtraders.co.in/crmapi/public/assets/images/company_images/sign.jpeg'


const PurchaseOrderKraft = () => {
    const componentRef = useRef(null);
      const [showSignature, setShowSignature] = useState(true);
    
        const { id } = useParams();
    
        
        const company = useSelector(state => state.company.companyDetails);
        // const logo = useSelector(state => state.company.companyImage);
    
        const [selectedMill, setSelectedMill] = useState(null);
        const [selectedParty, setSelectedParty] = useState(null);
        const [data, setData] = useState(null);
        console.log('selectedMill',selectedMill)
        console.log('selectedParty',selectedParty)
        console.log('data',data?.subs)
          const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
    const fetchPurchase = async () => {
        try {
          const res = await fetchTrigger({
            url: `${PURCHASE_ORDER_LIST}/${id}`,
          });
          if (res?.data) {
            
            setSelectedMill(res?.mill || null);
            setSelectedParty(res?.party || null);
            setData(res?.data || null);
         
          }
        } catch (err) {
          console.error("Fetch error:", err);
          message.error("Failed to load purchase details.");
        }
      };
    
    
        useEffect(() => {
          if (id) fetchPurchase();
    
        }, [ id]);
        const loading =
        fetchLoading 
      const toggleSignature = () => {
        setShowSignature(!showSignature);
      };
  return (
      <>
         <ReportActions 
                componentRef={componentRef}
                filename="Purchase_Order.pdf"
                documentTitle="Purchase Order"
                onToggleSignature={toggleSignature}
                showSignature={showSignature}
                includeSignatureToggle={true}
              />
   {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) :(
        <div className="flex justify-center bg-gray-50">
          <div className="w-full max-w-[210mm] bg-white p-4 border-black" ref={componentRef}>
            {/* 1st */}
            <div className="">
              <div className="flex justify-between text-xs mb-2">
                <div className="font-bold">GSTIN : {company?.company_gst}</div>
                <div>Ph : {company?.company_mobile} Mobile : {company?.company_mobile}</div>
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
                  <h1 className="text-3xl font-bold mb-1 instrument-font">{company?.company_name}</h1>
                  <p className="text-xs font-semibold mb-1">Dealers in : KRAFT PAPER & DUPLEX BOARD</p>
                  <p className="text-xs mb-1">{company?.company_address}</p>
                  <p className="text-xs">{company?.company_cor_address}<br/> Email : {company?.company_email}</p>
                  <h2 className="text-xl font-bold mt-2 underline">PURCHASE ORDER</h2>
                </div>
              </div>
            </div>
  
            {/* 2nd */}
            <div className="grid grid-cols-2 border border-black">
              <div className="border-r flex flex-row items-start gap-1 border-black p-3">
                <div className="text-xs mb-2">
                  <span className="font-bold">To : </span>
                </div>
                <div className="text-xs flex flex-col gap-2 leading-relaxed">
                  <div className="font-bold">
                 {selectedMill?.mill_name}
                  </div>
                  <div>
                    <p>{selectedMill?.mill_billing_address}</p>
                
                  </div>
                </div>
              </div>
              
              <div className="p-3">
                <div className="text-xs space-y-2">
                  <div className="flex">
                    <span className="w-32">P.O. Ref.</span>
                    <span>: {data?.purchase_orders_ref}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">P.O. Date</span>
                    <span>: {data?.purchase_orders_date}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">With GSTIN </span>
                    <span>: {selectedMill?.mill_gstin}</span>
                  </div>
                  <div className="flex">
                    <span className="w-32">Service State </span>
                    <span>: {selectedMill?.mill_state}</span>
                  </div>
                </div>
              </div>
            </div>
  
            {/* 3rd */}
            <div className="px-3 py-1 border-r border-l border-black">
              <div className="flex flex-col">
                <div className="text-xs mb-2">
                  <span className="font-bold">Buyer : {selectedParty?.party_name}</span>
                </div>
                
                <div className="mb-2 flex flex-row items-center justify-between w-full">
                  <div className="text-xs w-full">
                    <p className="font-semibold mb-1">Billing Address</p>
                    <p>{selectedParty?.party_billing_address}</p>
              
                  </div>
                  <div className="text-xs w-full">
                    <p className="font-semibold mb-1">Delivery Address</p>
                    <p>{selectedParty?.party_delivery_address}</p>
               
                  </div>
                </div>
              </div>
            </div>
  
            {/* 4th */}
            <div className="grid grid-cols-2 border-b border-r border-l border-black text-xs">
              <div className="p-2">
                <span className="font-bold">GSTIN : {selectedParty?.party_gstin}</span>
              </div>
              <div className="py-2">
                <span className="font-bold">Service State : {selectedParty?.party_state}</span>
              </div>
            </div>
  
            {/* 5th */}
            <table className="w-full border border-black text-xs font-bold border-collapse">
              <thead>
                <tr className="border-b border-black">
                  <th className="border-r border-black p-2 text-center w-1/12">Shade </th>
                  <th className="border-r border-black p-2 text-center w-1/12">Bf </th>
                  <th className="border-r border-black p-2 text-center w-1/12">GSM</th>
                  <th className="border-r border-black p-2 text-center w-1/12">SIZE (CMS.)</th>
                  <th className="border-r border-black p-2 text-center w-2/12" colSpan={2}>
                    Quantity
                  </th>
                  <th className="border-r border-black p-2 text-center w-2/12">
                    Billing Rate
                  </th>
                  <th className="p-2 text-center w-6/12">Remarks / Delivery</th>
                </tr>
              </thead>
  
              <tbody className="font-normal text-xs align-top">
                {data?.subs?.map((item)=>{
  
              return (
                <tr key={item.id}>
                  <td className="border-r border-black p-2 text-center">{item.shade}</td>
                  <td className="border-r border-black p-2 text-center">{item.bf}</td>
                  <td className="border-r border-black p-2 text-center">{item.gsm}</td>
                  <td className="border-r border-black p-2 text-center">{item.size}</td>
                  <td className="border-r border-black p-2 text-center">{item.qnty}</td>
                  <td className="border-r border-black p-2 text-center">{item.unit}</td>
                  <td className="border-r border-black p-2 text-center">{item?.bill_rate}</td>
                  <td className="p-2 text-center">{item.remarks}</td>
                </tr>
                )
               })}
              </tbody>
            </table>
  
            <div className="border border-black">
              <div className="flex flex-row w-full">
                <div className="w-[70%] p-3 text-xs">
                  <div className="mb-2">
                    <span className="font-bold">Delivery :</span> IMMEDIATE
                  </div>
               
                  <div className="mb-1">
                    <span className="font-bold">Special Instructions :</span>
                  </div>
                  <div className="space-y-1 ml-3">
                    <p>1. Invoice should contain the payment endorsement - "Payment to be made to M/s THE UNITED TRADERS (Regd.)".</p>
                    <p>2. Please acknowledge our order within 1 day, confirming the delivery schedule.</p>
                  </div>
                  <div className="mt-3 border-t">
                    <span className="font-bold">Note : {data?.purchase_orders_note}</span>
                  </div>
                </div>
                
               
                <div className={`p-3 flex flex-col w-[30%] justify-between relative signature-section ${!showSignature ? 'no-signature' : ''}`}>
                  <div className="text-right text-md font-bold">
                    For <span className="instrument-font">{company?.company_name} </span>
                  </div>
  
               
                  {showSignature && (
                    <img
                      src={devUrl}
                      alt="Signature"
                      className="absolute right-10 bottom-6 w-28 h-auto object-contain"
                    />
                  )}
  
                  <div className="text-right text-xs mt-20">
                    Authorised Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </>
  )
}

export default PurchaseOrderKraft