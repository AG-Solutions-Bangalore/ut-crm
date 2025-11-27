import {
  DeleteOutlined,
  MinusOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, message, Modal, Popconfirm, Spin } from "antd";
import dayjs from "dayjs";
import { useApiMutation } from "../../hooks/useApiMutation";

const PendingBillsModal = ({
  open,
  onClose,
  setBills,
  bills,
  setSelectedBills,
  handleDelete,
  fetchedBills,
  tempSelectedBills,
  setTempSelectedBills,
  loading,
}) => {
  const handleAdd = (bill) => {
    setTempSelectedBills((prev) => {
      const exists = prev.some((b) => b.billing_ref == bill.billing_ref);
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
            <div className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
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
                          {bill.billing_ref}
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
                          {bill.billing_sub_tones || ""}
                        </td>

                        <td className="p-1 border border-gray-200">
                          {bill.billing_sub_bf || ""}
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
