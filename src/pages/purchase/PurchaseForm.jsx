import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, DatePicker, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ACTIVE_MILL,
  ACTIVE_PARTY,
  PURCHASE_ORDER_LIST,
  PURCHASE_ORDER_REF,
} from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";
import { useMasterData } from "../../hooks";

const PurchaseForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { MillActiveData, PartyActiveData, PurchaseOrderRef, refetchRefNo } =
    useMasterData();
//   const {
//     data: MillActiveData,
//     isLoading,
//     refetch,
//   } = useGetApiMutation({
//     url: ACTIVE_MILL,
//     queryKey: ["activemilldata"],
//   });
//   const {
//     data: PartyActiveData,
//     isLoading: partyloading,
//     refetch: partyrefetch,
//   } = useGetApiMutation({
//     url: ACTIVE_PARTY,
//     queryKey: ["activepartydata"],
//   });
//   const {
//     data: PurchaseOrderRef,
//     isLoading: purchaserefloading,
//     refetch: purchaserefetch,
//   } = useGetApiMutation({
//     url: PURCHASE_ORDER_REF,
//     queryKey: ["purchaseorderrefdata"],
//   });
  const [selectedMill, setSelectedMill] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);

  const millOptions =
    MillActiveData?.data?.map((item) => ({
      label: item.mill_name,
      value: item.id,
      billing: item.mill_billing_address,
    })) || [];

  const partyOptions =
    PartyActiveData?.data?.map((item) => ({
      label: item.party_name,
      value: item.id,
      delivery: item.party_delivery_address,
    })) || [];
  const handleMillChange = (millId) => {
    const mill = millOptions.find((m) => m.value === millId);
    setSelectedMill(mill || null);
    if (PurchaseOrderRef?.data) {
      form.setFieldValue("purchase_orders_ref", PurchaseOrderRef.data);
    }
  };

  const handlePartyChange = (partyId) => {
    const party = partyOptions.find((p) => p.value === partyId);
    setSelectedParty(party || null);
    if (PurchaseOrderRef?.data) {
      form.setFieldValue("purchase_orders_ref", PurchaseOrderRef.data);
    }
  };

  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const [initialData, setInitialData] = useState({});

  const fetchPurchase = async () => {
    try {
      const res = await fetchTrigger({
        url: `${PURCHASE_ORDER_LIST}/${id}`,
      });
      if (res?.data) {
        setInitialData(res.data);
        form.setFieldsValue(res.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load purchase details.");
    }
  };

  useEffect(() => {
    if (id) fetchPurchase();
    else form.resetFields();
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      subs: values.subs || [],
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${PURCHASE_ORDER_LIST}/${id}` : PURCHASE_ORDER_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Purchase order saved successfully!");
        await queryClient.invalidateQueries({ queryKey: ["purchasedata"] });
        navigate("/purchase");
      } else {
        message.error(res.message || "Failed to save purchase order.");
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Error while saving purchase order.");
    }
  };

  return (
    <>
      {fetchLoading ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={initialData}
          className="mt-4"
          requiredMark={false}
        >
          <Card
            title={
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Update Purchase Order" : "Create Purchase Order"}
              </h2>
            }
            variant="borderless"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Form.Item
                label={
                  <span>
                    Mill <span className="text-red-500">*</span>
                  </span>
                }
                name="purchase_orders_mill_id"
                rules={[{ required: true, message: "Select mill" }]}
              >
                <Select
                  placeholder="Select Mill"
                  options={millOptions}
                  onChange={handleMillChange}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Party <span className="text-red-500">*</span>
                  </span>
                }
                name="purchase_orders_party_id"
                rules={[{ required: true, message: "Select party" }]}
              >
                <Select
                  placeholder="Select Party"
                  options={partyOptions}
                  onChange={handlePartyChange}
                />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Purchase Date <span className="text-red-500">*</span>
                  </span>
                }
                name="purchase_orders_date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker className="w-full" format="DD-MM-YYYY" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Purchase Ref No <span className="text-red-500">*</span>
                  </span>
                }
                name="purchase_orders_ref"
                rules={[{ required: true, message: "Enter reference number" }]}
              >
                <Input disabled value={PurchaseOrderRef?.data} />
              </Form.Item>

              <Form.Item>
                <Input.TextArea
                  value={selectedMill?.billing}
                  rows={3}
                  readOnly
                  className="bg-gray-50"
                />
              </Form.Item>
              <Form.Item>
                <Input.TextArea
                  value={selectedParty?.delivery}
                  rows={3}
                  readOnly
                  className="bg-gray-50"
                />
              </Form.Item>

              <Form.Item
                label="Notes"
                name="purchase_orders_note"
                className="md:col-span-2"
              >
                <Input.TextArea rows={2} placeholder="Enter Notes" />
              </Form.Item>
            </div>
            <Card
              size="small"
              //   title={<span className="font-semibold">Sub Details</span>}
              className="bg-gray-50 my-4"
            >
              <Form.List name="subs" initialValue={[{}]}>
                {(fields, { add, remove }) => (
                  <>
                    <div className="flex justify-between mb-2">
                      <div>
                        <div className="font-semibold text-lg mb-2">
                          Sub Details
                        </div>
                      </div>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      >
                        Add Item
                      </Button>
                    </div>

                    {fields.map(({ key, name, ...restField }) => (
                      <Card
                        key={key}
                        size="small"
                        className="!mb-3 bg-white border relative"
                      >
                        {fields.length > 1 && (
                          <Button
                            type="text"
                            danger
                            icon={<MinusCircleOutlined />}
                            className="!absolute top-2 right-2"
                            onClick={() => remove(name)}
                          />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-10 gap-3 mt-6">
                          <Form.Item
                            {...restField}
                            name={[name, "shade"]}
                            label="Shade"
                          >
                            <Input placeholder="Shade" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "bf"]}
                            label="Item"
                          >
                            <Input placeholder="Item" />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "gsm"]}
                            label="GSM"
                          >
                            <Input placeholder="GSM" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "size"]}
                            label="Size"
                          >
                            <Input placeholder="Size" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "qnty"]}
                            label="Quantity"
                          >
                            <Input type="number" placeholder="Qty" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "unit"]}
                            label="Unit"
                          >
                            <Select
                              placeholder="Unit"
                              options={[
                                { label: "Kg", value: "Kg" },
                                { label: "Ream", value: "Ream" },
                                { label: "Ton", value: "Ton" },
                              ]}
                            />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "bill_rate"]}
                            label="Bill Rate"
                          >
                            <Input type="number" placeholder="Rate" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "agreed_rate"]}
                            label="Mill Rate"
                          >
                            <Input type="number" placeholder="Mill Rate" />
                          </Form.Item>

                          <Form.Item
                            {...restField}
                            name={[name, "remarks"]}
                            label="Remarks"
                            className="md:col-span-2"
                          >
                            <Input.TextArea rows={1} placeholder="Remarks" />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                  </>
                )}
              </Form.List>
            </Card>

            <Form.Item className="text-center !mt-4">
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {isEditMode ? "Update" : "Create"}
              </Button>
            </Form.Item>
          </Card>
        </Form>
      )}
    </>
  );
};

export default PurchaseForm;
