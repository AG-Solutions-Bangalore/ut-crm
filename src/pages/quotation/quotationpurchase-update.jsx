import {
  App,
  Button,
  Card,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { PURCHASE_ORDER_LIST } from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";

const { Text } = Typography;

const PurchaseEditModal = ({ open, onClose, purchaseId, onSuccess }) => {
  const { message } = App.useApp();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const [purchaseData, setPurchaseData] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchPurchaseDetails = async () => {
      if (!purchaseId) return;
      try {
        const res = await fetchTrigger({
          url: `${PURCHASE_ORDER_LIST}/${purchaseId}`,
        });
        if (res?.data) {
          setPurchaseData(res.data);
          form.setFieldsValue(res.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        message.error("Failed to load purchase details.");
      }
    };
    if (open && purchaseId) fetchPurchaseDetails();
  }, [open, purchaseId]);

  const handleSubmit = async (values) => {
    const payload = {
      ...purchaseData,
      purchase_orders_billref: values.purchase_orders_billref || "",
      subs: values.subs?.map((sub) => ({
        ...sub,
        agreed_rate: sub.agreed_rate,
      })),
    };

    try {
      const res = await submitTrigger({
        url: `${PURCHASE_ORDER_LIST}/${purchaseId}`,
        method: "put",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Purchase order updated successfully!");
        onSuccess?.();
        onClose();
      } else {
        message.error(res.message || "Failed to update purchase order.");
      }
    } catch (error) {
      console.error(error);
      message.error("Error while updating purchase order.");
    }
  };

  return (
    <Modal
      title={<span className="text-lg font-bold">View Purchase Order</span>}
      open={open}
      onCancel={onClose}
      footer={null}
      width={1200}
      destroyOnClose
    >
      {fetchLoading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        purchaseData && (
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Descriptions
              bordered
              column={{ xs: 1, sm: 2, md: 3, lg: 4 }}
              size="small"
              labelStyle={{
                width: "150px",
                fontWeight: 500,
                whiteSpace: "normal",
                wordWrap: "break-word",
              }}
              contentStyle={{
                maxWidth: "280px",
                whiteSpace: "normal",
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              <Descriptions.Item label="Mill">
                {purchaseData?.mill_name || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Party">
                {purchaseData?.party_name || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Purchase Date">
                {purchaseData?.purchase_orders_date
                  ? dayjs(purchaseData.purchase_orders_date).format(
                      "DD-MM-YYYY"
                    )
                  : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Text type="success">
                  {purchaseData?.purchase_orders_status || "-"}
                </Text>
              </Descriptions.Item>

              <Descriptions.Item label="Purchase Ref No">
                {purchaseData?.purchase_orders_ref || "-"}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span>
                    Bill Ref <span className="text-red-500">*</span>
                  </span>
                }
              >
                <Form.Item
                  name="purchase_orders_billref"
                  noStyle
                  initialValue={purchaseData?.purchase_orders_billref}
                  rules={[{ required: true, message: "Enter Bill Reference" }]}
                >
                  <Input
                    placeholder="Enter Bill Reference"
                    style={{ width: "220px" }}
                    allowClear
                  />
                </Form.Item>
              </Descriptions.Item>

              <Descriptions.Item label="Total Bill Rate">
                ₹{purchaseData?.total_bill_rate || "0.00"}
              </Descriptions.Item>

              <Descriptions.Item label="Total Agreed Rate">
                ₹{purchaseData?.total_adreed_rate || "0.00"}
              </Descriptions.Item>

              <Descriptions.Item label="Notes" span={3}>
                <Text type="secondary" style={{ whiteSpace: "pre-wrap" }}>
                  {purchaseData?.purchase_orders_note || "No notes provided."}
                </Text>
              </Descriptions.Item>
            </Descriptions>

            <Form.List name="subs" initialValue={purchaseData?.subs || []}>
              {(fields) => (
                <div className="overflow-x-auto max-h-52 overflow-y-auto rounded-lg !my-4 border border-gray-200 bg-white shadow-sm">
                  <table className="min-w-full">
                    <thead className="bg-gray-100 sticky top-0 z-10 text-gray-700 text-sm font-semibold">
                      <tr>
                        <th className="p-2 text-left">Shade</th>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-left">GSM</th>
                        <th className="p-2 text-left">Size</th>
                        <th className="p-2 text-left">Quantity</th>
                        <th className="p-2 text-left">Unit</th>
                        <th className="p-2 text-left">Bill Rate</th>
                        <th className="p-2 text-left">Mill Rate</th>
                        <th className="p-2 text-left">Remarks</th>
                      </tr>
                    </thead>

                    <tbody className="text-sm text-gray-800 ">
                      {fields.map(({ key, name, ...restField }) => {
                        const sub = purchaseData?.subs?.[name];
                        return (
                          <tr key={key} className="hover:bg-gray-50 transition">
                            <td className="p-2">{sub?.shade || "-"}</td>
                            <td className="p-2">{sub?.bf || "-"}</td>
                            <td className="p-2">{sub?.gsm || "-"}</td>
                            <td className="p-2">{sub?.size || "-"}</td>
                            <td className="p-2">{sub?.qnty || "-"}</td>
                            <td className="p-2">{sub?.unit || "-"}</td>
                            <td className="p-2">{sub?.bill_rate || "-"}</td>
                            <td className="p-2">
                              <Form.Item
                                {...restField}
                                name={[name, "agreed_rate"]}
                                noStyle
                                rules={[
                                  {
                                    required: true,
                                    message: "Enter Mill Rate",
                                  },
                                ]}
                              >
                                <InputNumber
                                  min={0}
                                  className="w-full"
                                  placeholder="Mill Rate"
                                />
                              </Form.Item>
                            </td>
                            <td className="p-2">{sub?.remarks || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Form.List>
            <Form.Item className="text-center !mt-4">
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                Update
              </Button>
            </Form.Item>
          </Form>
        )
      )}
    </Modal>
  );
};

export default PurchaseEditModal;
