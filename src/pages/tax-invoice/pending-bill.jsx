import { useEffect, useState } from "react";
import { Modal, Card, Button, Spin, Empty } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useApiMutation } from "../../hooks/useApiMutation";
import { TAX_INVOICE_PENDING_BILLING } from "../../api";

const PendingBillsModal = ({ open, onClose, millId }) => {
  const [bills, setBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const { trigger: fetchTrigger, loading } = useApiMutation();

  useEffect(() => {
    if (open && millId) {
      fetchBills();
    }
  }, [open, millId]);

  const fetchBills = async () => {
    try {
      const res = await fetchTrigger({
        url: `${TAX_INVOICE_PENDING_BILLING}/${millId}`,
      });
      setBills(res?.data || []);
    } catch (err) {
      console.error("Failed to fetch bills", err);
    }
  };

  const handleAdd = (bill) => {
    setSelectedBills([...selectedBills, bill]);
    setBills(bills.filter((b) => b.billing_ref !== bill.billing_ref));
  };

  const handleRemove = (bill) => {
    setBills([...bills, bill]);
    setSelectedBills(
      selectedBills.filter((b) => b.billing_ref !== bill.billing_ref)
    );
  };

  return (
    <Modal
      title="Pending Bills"
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
    >
      <Spin spinning={loading}>
        <div className="grid grid-cols-12 gap-4">
          {/* Left Section */}
          <div className="col-span-3">
            <h3 className="font-semibold mb-2">Available Bills</h3>
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
              {bills.length ? (
                bills.map((bill) => (
                  <Card
                    key={bill.billing_ref}
                    size="small"
                    className="shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {bill.billing_ref}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bill.purchase_date}
                        </p>
                      </div>
                      <Button
                        icon={<PlusOutlined />}
                        type="link"
                        onClick={() => handleAdd(bill)}
                      />
                    </div>
                  </Card>
                ))
              ) : (
                <Empty
                  description="No pending bills"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>
          </div>

          <div className="col-span-9">
            <h3 className="font-semibold mb-2">Selected Bills</h3>

            {selectedBills.length ? (
              <div className="overflow-x-auto border">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-700 font-medium border-b">
                    <tr>
                      <th className="p-1 border">Bill Ref</th>
                      <th className="p-1 border">Purch Date</th>
                      <th className="p-1 border">Billing Tons</th>
                      <th className="p-1 border">BF</th>
                      <th className="p-1 border">Purchase Rate</th>
                      <th className="p-1 border">Sale Rate</th>
                      <th className="p-1 border">Rate Diff</th>
                      <th className="p-1 border">Commission</th>
                      <th className="p-1 border text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBills.map((bill, index) => (
                      <tr key={bill.billing_ref} className="hover:bg-gray-50">
                        <td className="p-1 border font-semibold text-gray-800">
                          {bill.billing_ref}
                        </td>
                        <td className="p-1 border">
                          {bill.purchase_date}
                        </td>
                        <td className="p-1 border text-right">
                          {bill.billing_tones}
                        </td>
                        <td className="p-1 border">{bill.billing_bf}</td>
                        <td className="p-1 border text-right">
                          {bill.purchase_rate}
                        </td>
                        <td className="p-1 border text-right">
                          {bill.sale_rate}
                        </td>
                        <td className="p-1 border text-right">
                          {bill.rate_diff}
                        </td>
                        <td className="p-1 border text-right">
                          {bill.billing_commn}
                        </td>
                        <td className="border text-center">
                          <Button
                            icon={<DeleteOutlined />}
                            type="text"
                            danger
                            onClick={() => handleRemove(bill)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty
                description="No bills added"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default PendingBillsModal;
