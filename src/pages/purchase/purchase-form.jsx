import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Popconfirm,
  Select,
  Spin,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DELETE_ORDER_SUB, PURCHASE_ORDER_LIST } from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";

const PurchaseForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mill, party, purchaseRef, shade, unit, item } = useMasterData();
  const [selectedMill, setSelectedMill] = useState(null);
  const [selectedParty, setSelectedParty] = useState(null);
  const millOptions =
    mill?.data?.data?.map((item) => ({
      label: item.mill_name,
      value: item.id,
      mill_billing_address: item.mill_billing_address,
    })) || [];

  const partyOptions =
    party?.data?.data?.map((item) => ({
      label: item.party_name,
      value: item.id,
      party_delivery_address: item.party_delivery_address,
    })) || [];
  const handleMillChange = (millId) => {
    const mill = millOptions.find((m) => m.value === millId);
    setSelectedMill(mill || null);
    if (purchaseRef?.data?.data) {
      form.setFieldValue("purchase_orders_ref", purchaseRef?.data?.data);
    }
  };

  const handlePartyChange = (partyId) => {
    const party = partyOptions.find((p) => p.value === partyId);
    setSelectedParty(party || null);
    if (purchaseRef?.data?.data) {
      form.setFieldValue("purchase_orders_ref", purchaseRef.data?.data);
    }
  };

  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { trigger: deleteTrigger } = useApiMutation();
  const [initialData, setInitialData] = useState({});

  const fetchPurchase = async () => {
    try {
      const res = await fetchTrigger({
        url: `${PURCHASE_ORDER_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          purchase_orders_status:
            res.data.purchase_orders_status == "Open" ? true : false,
          purchase_orders_date: res.data.purchase_orders_date
            ? dayjs(res.data.purchase_orders_date)
            : null,
        };
        setSelectedMill(res?.mill || null);
        setSelectedParty(res?.party || null);
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
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
      purchase_orders_billref: initialData.purchase_orders_billref || "",
      purchase_orders_date: values.purchase_orders_date
        ? dayjs(values.purchase_orders_date).format("YYYY-MM-DD")
        : null,
      subs: (values.subs || []).map((sub) => ({
        id: sub?.id || "",
        shade: sub?.shade || "",
        bf: sub?.bf || "",
        gsm: sub?.gsm || "",
        size: sub?.size || "",
        qnty: sub?.qnty || "",
        unit: sub?.unit || "",
        bill_rate: sub?.bill_rate || "",
        agreed_rate: sub?.agreed_rate || "",
        remarks: sub?.remarks || "",
      })),
    };

    if (isEditMode) {
      payload.purchase_orders_status = values?.purchase_orders_status
        ? "Open"
        : "Close";
    }

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
  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid sub-item ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${DELETE_ORDER_SUB}/${subId}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Sub-item deleted successfully!");
        fetchPurchase();
      } else {
        message.error(res?.message || "Failed to delete sub-item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting sub-item.");
    }
  };

  const loading =
    fetchLoading ||
    mill?.loading ||
    party?.loading ||
    shade?.loading ||
    unit?.loading ||
    item?.loading;
  return (
    <>
      {loading ? (
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
            extra={
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <Form.Item
                    name="purchase_orders_status"
                    valuePropName="checked"
                    className="!mb-0"
                  >
                    <Switch />
                  </Form.Item>
                )}
                <Form.Item className="text-center !mt-4">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitLoading}
                  >
                    {isEditMode ? "Update" : "Create"}
                  </Button>
                </Form.Item>
              </div>
            }
            variant="borderless"
          >
            <Card
              size="small"
              title={<span className="font-semibold">Purchase Info</span>}
              className="!mb-2 !bg-gray-50 "
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
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    showSearch
                    allowClear
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
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    showSearch
                    allowClear
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
                  rules={[
                    { required: true, message: "Enter reference number" },
                  ]}
                >
                  <Input disabled value={purchaseRef?.data?.data} />
                </Form.Item>

                <Form.Item>
                  <Input.TextArea
                    value={selectedMill?.mill_billing_address}
                    rows={3}
                    readOnly
                    className="bg-gray-50"
                  />
                </Form.Item>
                <Form.Item>
                  <Input.TextArea
                    value={selectedParty?.party_delivery_address}
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
            </Card>
            <Card size="small" className="bg-gray-50 my-4">
              <Form.List
                name="subs"
                initialValue={[{}]}
                rules={[
                  {
                    validator: async (_, subs) => {
                      if (!subs || subs.length < 1)
                        return Promise.reject(
                          new Error("Please add at least one sub item.")
                        );

                      const hasAnyFilledRow = subs.some((row) =>
                        Object.values(row || {}).some(
                          (val) => val !== undefined && val !== ""
                        )
                      );

                      if (!hasAnyFilledRow)
                        return Promise.reject(
                          new Error(
                            "Please fill at least one sub item before submitting."
                          )
                        );

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <div className="flex justify-between mb-2">
                      <div className="font-semibold text-lg mb-2">
                        Sub Details
                      </div>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      >
                        Add Item
                      </Button>
                    </div>
                    {fields.map(({ key, name, ...restField }) => {
                      const subItem = form.getFieldValue(["subs", name]);
                      const hasId = subItem?.id;
                      return (
                        <Card
                          key={key}
                          size="small"
                          className="!mb-3 !bg-gray-50 border relative"
                        >
                          {fields.length > 1 &&
                            (hasId ? (
                              <Popconfirm
                                title="Are you sure you want to delete this sub-item?"
                                onConfirm={() => handleDelete(subItem?.id)}
                                okText="Yes"
                                cancelText="No"
                              >
                                <Button
                                  type="text"
                                  danger
                                  icon={<DeleteOutlined />}
                                  className="!absolute top-2 right-2 text-red-500"
                                />
                              </Popconfirm>
                            ) : (
                              <Button
                                type="text"
                                danger
                                icon={<MinusCircleOutlined />}
                                className="!absolute top-2 right-2"
                                onClick={() => remove(name)}
                              />
                            ))}

                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-10 gap-3 mt-6">
                            <Form.Item
                              {...restField}
                              name={[name, "shade"]}
                              label="Shade"
                            >
                              <Select
                                placeholder="Select Shade"
                                options={shade?.data?.data?.map((item) => ({
                                  label: item.shade,
                                  value: item.shade,
                                }))}
                                loading={shade?.loading}
                                showSearch
                                allowClear
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "bf"]}
                              label="Item"
                            >
                              <Select
                                placeholder="Select Item"
                                options={item?.data?.data?.map((item) => ({
                                  label: item.bf,
                                  value: item.bf,
                                }))}
                                loading={item?.loading}
                                showSearch
                                allowClear
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              />
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
                                placeholder="Select Unit"
                                options={unit?.data?.data?.map((item) => ({
                                  label: item.unit,
                                  value: item.unit,
                                }))}
                                loading={unit?.loading}
                                showSearch
                                allowClear
                                filterOption={(input, option) =>
                                  (option?.label ?? "")
                                    .toLowerCase()
                                    .includes(input.toLowerCase())
                                }
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
                      );
                    })}
                    {errors.length > 0 && (
                      <div className="text-red-500 text-sm mt-2">
                        {errors[0]}
                      </div>
                    )}{" "}
                  </>
                )}
              </Form.List>
            </Card>

            {/* <Form.Item className="text-center !mt-4">
              <Button type="primary" htmlType="submit" loading={submitLoading}>
                {isEditMode ? "Update" : "Create"}
              </Button>
            </Form.Item> */}
          </Card>
        </Form>
      )}
    </>
  );
};

export default PurchaseForm;
