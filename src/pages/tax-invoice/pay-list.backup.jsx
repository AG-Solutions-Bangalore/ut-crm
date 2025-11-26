import { useEffect, useState } from "react";
import { Modal, Card, Button, Spin, Empty, message } from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined } from "@ant-design/icons";
import { useApiMutation } from "../../hooks/useApiMutation";
import { TAX_INVOICE_PENDING_BILLING } from "../../api";
import dayjs from "dayjs";

const PendingBillsModal = ({
  open,
  onClose,
  millId,
  setBills,
  bills,
  selectedBills,
  setSelectedBills,
  isEditMode,
}) => {
  const { trigger: fetchTrigger, loading } = useApiMutation();
  const [fetchedBills, setFetchedBills] = useState([]);
  const [tempSelectedBills, setTempSelectedBills] = useState([]);

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
      const data = res?.data || [];

      const filtered = data.filter(
        (bill) =>
          !selectedBills.some((sel) => sel.billing_ref === bill.billing_ref)
      );

      setFetchedBills(data);
      setBills(filtered);
      setTempSelectedBills(selectedBills); 
    } catch (err) {
      console.error("Failed to fetch bills", err);
    }
  };

  const handleAdd = (bill) => {
    setTempSelectedBills((prev) => {
      const exists = prev.some((b) => b.billing_ref === bill.billing_ref);
      return exists ? prev : [...prev, bill];
    });
    setBills((prev) => prev.filter((b) => b.billing_ref !== bill.billing_ref));
  };

  const handleRemove = (bill) => {
    const existedInFetched = fetchedBills.some(
      (b) => b.billing_ref === bill.billing_ref
    );
    if (existedInFetched) {
      setBills((prev) => {
        const alreadyExists = prev.some(
          (b) => b.billing_ref === bill.billing_ref
        );
        return alreadyExists ? prev : [...prev, bill];
      });
    }
    setTempSelectedBills((prev) =>
      prev.filter((b) => b.billing_ref !== bill.billing_ref)
    );
  };

  const handleSave = () => {
    if (!tempSelectedBills.length) {
      message.warning("Please add at least one bill before saving.");
      return;
    }

    message.success("Bills saved successfully!");

    setSelectedBills(tempSelectedBills);

    setBills((prev) =>
      prev.filter(
        (b) =>
          !tempSelectedBills.some((sel) => sel.billing_ref === b.billing_ref)
      )
    );

    onClose();
  };

  const handleCancel = () => {
    const toRestore = tempSelectedBills.filter((b) =>
      fetchedBills.some((fb) => fb.billing_ref === b.billing_ref)
    );
    setBills((prev) => [...prev, ...toRestore]);
    setTempSelectedBills([]);
    onClose();
  };

  return (
    <Modal
      title="Pending Bills"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={1200}
      destroyOnClose
    >
      <Spin spinning={loading}>
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT SECTION */}
          <div className="col-span-3">
            <h3 className="font-semibold mb-2">Available Bills</h3>
            <div className="space-y-3 overflow-y-auto max-h-[70vh] pr-2">
              {bills.length ? (
                bills.map((bill) => (
                  <Card
                    key={bill.billing_ref}
                    size="small"
                    className="shadow-sm hover:shadow-md transition !mb-2"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-800">
                          {bill.billing_bf}
                        </p>
                        <p className="text-xs text-gray-500">
                          {bill.purchase_date
                            ? dayjs(bill.purchase_date).format("DD-MM-YYYY")
                            : "-"}
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

          {/* RIGHT SECTION */}
          <div className="col-span-9 flex flex-col h-full">
            <h3 className="font-semibold mb-2">Selected Bills</h3>

            <div className="flex-grow overflow-y-auto">
              {tempSelectedBills.length ? (
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-100 text-gray-700 font-medium border-b">
                    <tr>
                      <th className="p-1 border">Bill Ref</th>
                      <th className="p-1 border">Purch Date</th>
                      <th className="p-1 border">Billing Tons</th>
                      <th className="p-1 border">Item</th>
                      <th className="p-1 border">Purchase Rate</th>
                      <th className="p-1 border">Sale Rate</th>
                      <th className="p-1 border">Rate Diff</th>
                      <th className="p-1 border">Commission</th>
                      <th className="p-1 border text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempSelectedBills.map((bill) => (
                      <tr key={bill.billing_ref} className="hover:bg-gray-50">
                        <td className="p-1 border border-gray-200">
                          {dayjs(
                            isEditMode
                              ? bill.tax_invoice_sub_purchase_date
                              : bill.purchase_date
                          ).format("DD-MM-YYYY")}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {isEditMode
                            ? bill.tax_invoice_sub_tones
                            : bill.billing_tones}
                        </td>

                        <td className="p-1 border border-gray-200">
                          {isEditMode
                            ? bill.tax_invoice_sub_bf
                            : bill.billing_bf}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {isEditMode
                            ? bill.tax_invoice_sub_purchase_rate
                            : bill.purchase_rate}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {isEditMode
                            ? bill.tax_invoice_sub_sale_rate
                            : bill.sale_rate}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {isEditMode
                            ? bill.tax_invoice_sub_rate_diff
                            : bill.rate_diff}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {isEditMode
                            ? bill.tax_invoice_sub_commn
                            : bill.billing_commn}
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
              ) : (
                <Empty
                  description="No bills added yet"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </div>

            {tempSelectedBills.length > 0 && (
              <div className="flex justify-end mt-4">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                >
                  Save Selected Bills
                </Button>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};

export default PendingBillsModal;
