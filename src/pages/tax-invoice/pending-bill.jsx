import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, message, Modal, Popconfirm, Spin } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { TAX_INVOICE_PENDING_BILLING } from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";

const PendingBillsModal = ({
  open,
  onClose,
  millId,
  setBills,
  bills,
  selectedBills,
  setSelectedBills,
  isEditMode,
  handleDelete,
}) => {
  const { trigger: fetchTrigger, loading } = useApiMutation();
  const [fetchedBills, setFetchedBills] = useState([]);
  const [tempSelectedBills, setTempSelectedBills] = useState([]);
  console.log(tempSelectedBills, "tempSelectedBills");
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
          !selectedBills.some((sel) => {
            const selectedRef =
              sel.billing_ref || sel.tax_invoice_sub_billing_ref;
            return selectedRef === bill.billing_ref;
          })
      );

      setFetchedBills(data);
      setBills(filtered);

      if (selectedBills?.length) {
        const normalized = selectedBills.map((b) => ({
          id: b.id || b.id,
          billing_ref: b.tax_invoice_sub_billing_ref || b.billing_ref,
          purchase_date:
            b.tax_invoice_sub_purchase_date || b.purchase_date || null,
          billing_tones: b.tax_invoice_sub_tones || b.billing_tones || "",
          billing_bf: b.tax_invoice_sub_bf || b.billing_bf || "",
          purchase_rate:
            b.tax_invoice_sub_purchase_rate || b.purchase_rate || "",
          sale_rate: b.tax_invoice_sub_sale_rate || b.sale_rate || "",
          rate_diff: b.tax_invoice_sub_rate_diff || b.rate_diff || "",
          billing_commn: b.tax_invoice_sub_commn || b.billing_commn || "",
          billing_mill_id: b.tax_invoice_sub_mill_id || b.billing_mill_id || "",
          billing_party_id:
            b.tax_invoice_sub_party_id || b.billing_party_id || null,
        }));

        setTempSelectedBills(normalized);
      } else {
        setTempSelectedBills([]);
      }
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

    // Update parent state only on save
    setSelectedBills(tempSelectedBills);

    // Remove saved bills from available list
    setBills((prev) =>
      prev.filter(
        (b) =>
          !tempSelectedBills.some((sel) => sel.billing_ref === b.billing_ref)
      )
    );

    onClose();
  };

  const handleCancel = () => {
    // Move temporary bills back to available list if they exist in fetched bills
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
                      <th className="p-1 border border-gray-200">Purch Date</th>
                      <th className="p-1 border border-gray-200">
                        Billing Tons
                      </th>
                      <th className="p-1 border border-gray-200">Item</th>
                      <th className="p-1 border border-gray-200">
                        Purchase Rate
                      </th>
                      <th className="p-1 border border-gray-200">Sale Rate</th>
                      <th className="p-1 border border-gray-200">Rate Diff</th>
                      <th className="p-1 border border-gray-200">Commission</th>
                      <th className="p-1 border border-gray-200 text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tempSelectedBills.map((bill) => (
                      <tr key={bill.billing_ref} className="hover:bg-gray-50">
                        <td className="p-1 border border-gray-200">
                          {dayjs(bill.purchase_date).format("DD-MM-YYYY")}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {bill.billing_tones || ""}
                        </td>

                        <td className="p-1 border border-gray-200">
                          {bill.billing_bf || ""}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {bill.purchase_rate || ""}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {bill.sale_rate || ""}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {bill.rate_diff || ""}
                        </td>

                        <td className="p-1 border border-gray-200 text-right">
                          {bill.billing_commn || ""}
                        </td>

                        <td className="border border-gray-200 text-center">
                          {bill.id ? (
                            <Popconfirm
                              title="Are you sure to delete this bill?"
                              onConfirm={() => handleDelete(bill.id)}
                              okText="Yes"
                              cancelText="No"
                              disabled={tempSelectedBills.length <= 1}
                            >
                              <Button
                                icon={<DeleteOutlined />}
                                type="text"
                                danger
                                                              disabled={tempSelectedBills.length <= 1}

                              />
                            </Popconfirm>
                          ) : (
                            <Button
                              icon={<MinusOutlined />}
                              type="text"
                              onClick={() => handleRemove(bill)}
                            />
                          )}
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
