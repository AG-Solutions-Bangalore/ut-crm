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
  InputNumber,
  Popconfirm,
  Select,
  Spin,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DELETE_ORDER_SUB,
  PURCHASE_LATEST_DATA,
  PURCHASE_ORDER_LIST,
} from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useWatch } from "antd/es/form/Form";

const PurchaseForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mill, party, purchaseRef, shade, unit, item } = useMasterData({
    mill: true,
    party: true,
    item: true,
    purchaseRef: true,
    shade: true,
    unit: true,
  });
  const milllatestId = useWatch("purchase_orders_mill_id", form);
  console.log(milllatestId, "millId");
  const partylatestId = useWatch("purchase_orders_party_id", form);
  console.log(partylatestId, "partyId");

  const [latestPurchaseData, setLatestPurchaseData] = useState([]);
  console.log(latestPurchaseData, "latestPurchaseData");
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
  const fetchLatestPurchaseData = async () => {
    try {
      if (!selectedMill?.value || !selectedParty?.value) return;

      const res = await fetchLatestTrigger({
        url: `${PURCHASE_LATEST_DATA}/${selectedMill?.value}/${selectedParty?.value}`,
      });

      if (res?.data) {
        setLatestPurchaseData(res.data);
      } else {
        setLatestPurchaseData(null);
        message.warning("No latest purchase data found.");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load latest details.");
    }
  };
  useEffect(() => {
    if (selectedMill?.value && selectedParty?.value) {
      fetchLatestPurchaseData();
    }
  }, [selectedMill?.value, selectedParty?.value]);

  const handlePartyChange = (partyId) => {
    const party = partyOptions.find((p) => p.value === partyId);
    setSelectedParty(party || null);
    if (purchaseRef?.data?.data) {
      form.setFieldValue("purchase_orders_ref", purchaseRef.data?.data);
    }
  };

  const { trigger: fetchLatestTrigger, loading: fetchlatestLoading } =
    useApiMutation();
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
        console.log(res, "sdfdf");
        setSelectedMill(res?.mill || null);
        setLatestPurchaseData(res?.billing || []);
        setSelectedParty(res?.party || null);
        setInitialData(formattedData);
        setLatestPurchaseData(res?.billing);
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
                    {/* <Tooltip title="Status" placement="top"> */}
                    <Switch checkedChildren="Open" unCheckedChildren="Close" />
                    {/* </Tooltip> */}
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
            <Card size="small" className="!mb-2 !bg-gray-50 ">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="col-span-3">
                  <div className="grid grid-cols-1 md:grid-cols-2  gap-4">
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
                        autoFocus
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

                    <Form.Item>
                      <Input.TextArea
                        value={selectedMill?.mill_billing_address}
                        readOnly
                        className="bg-gray-50"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Input.TextArea
                        value={selectedParty?.party_delivery_address}
                        readOnly
                        className="bg-gray-50"
                      />
                    </Form.Item>
                    <Form.Item
                      label={
                        <span>
                          Purchase Date <span className="text-red-500">*</span>
                        </span>
                      }
                      name="purchase_orders_date"
                      rules={[
                        { required: true, message: "Please select date" },
                      ]}
                    >
                      <DatePicker className="w-full" format="DD-MM-YYYY" />
                    </Form.Item>
                    <Form.Item
                      label={
                        <span>
                          Purchase Ref No{" "}
                          <span className="text-red-500">*</span>
                        </span>
                      }
                      name="purchase_orders_ref"
                      rules={[
                        { required: true, message: "Enter reference number" },
                      ]}
                    >
                      <Input disabled value={purchaseRef?.data?.data} />
                    </Form.Item>
                  </div>
                  <Form.Item label="Notes" name="purchase_orders_note">
                    <Input.TextArea rows={2} placeholder="Enter Notes" />
                  </Form.Item>
                </div>
                <div className="h-full min-h-[340px] max-h-[340px] overflow-y-auto col-span-2">
                  {isEditMode ? (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                      <h4 className="text-base font-semibold mb-2 text-gray-800 border-b pb-2">
                        Latest Details
                      </h4>
                      {fetchlatestLoading ? (
                        <div className="flex justify-center items-center py-4">
                          <Spin size="small" />
                        </div>
                      ) : latestPurchaseData &&
                        Object.keys(latestPurchaseData).length > 0 ? (
                        <div className="border border-gray-100 rounded-md p-2 mb-2 shadow-sm">
                          <div className="grid grid-cols-2 text-xs gap-3">
                            <p>
                              <span className="font-medium text-gray-500">
                                Bill No:
                              </span>{" "}
                              {latestPurchaseData.billing_no ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Tones:
                              </span>{" "}
                              {latestPurchaseData.billing_tones ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Purchase Date:
                              </span>{" "}
                              {latestPurchaseData.purchase_date ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Purchase Rate:
                              </span>{" "}
                              {latestPurchaseData.purchase_rate ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Item:
                              </span>{" "}
                              {latestPurchaseData.billing_bf ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Sale Date:
                              </span>{" "}
                              {latestPurchaseData.sale_date ?? "-"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Sale Rate:
                              </span>{" "}
                              ₹{latestPurchaseData.sale_rate}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Amount:
                              </span>{" "}
                              ₹{latestPurchaseData.purchase_amount}
                            </p>
                            <p>
                              <span className="font-medium text-gray-500">
                                Comm:
                              </span>{" "}
                              ₹{latestPurchaseData.billing_commn}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-3 text-center text-gray-500">
                          No recent data available
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                      <h4 className="text-base font-semibold mb-2 text-gray-800 border-b pb-2">
                        Latest Purchase Details
                      </h4>
                      {fetchlatestLoading ? (
                        <div className="flex justify-center items-center py-4">
                          <Spin size="small" />
                        </div>
                      ) : latestPurchaseData &&
                        latestPurchaseData.length > 0 ? (
                        latestPurchaseData.map((item, index) => (
                          <div
                            key={index}
                            className="border border-gray-100 rounded-md p-2 mb-2 shadow-sm"
                          >
                            <div className="grid grid-cols-2 text-xs gap-1">
                              <p>
                                <span className="font-medium text-gray-500">
                                  GSM:
                                </span>{" "}
                                {item.gsm ?? "-"}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  BF:
                                </span>{" "}
                                {item.bf ?? "-"}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  Size:
                                </span>{" "}
                                {item.size ?? "-"}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  Shade:
                                </span>{" "}
                                {item.shade ?? "-"}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  Qty:
                                </span>{" "}
                                {item.qnty ?? "-"}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  Unit:
                                </span>{" "}
                                {item.unit ?? "-"}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  Bill Rate:
                                </span>{" "}
                                ₹{item.bill_rate}
                              </p>
                              <p>
                                <span className="font-medium text-gray-500">
                                  Agreed Rate:
                                </span>{" "}
                                ₹{item.agreed_rate}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-3 text-center text-gray-500">
                          No recent data available
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
            <Card size="small" className="bg-gray-50 my-4">
              <Form.List
                name="subs"
                initialValue={[{}]}
                rules={[
                  {
                    validator: async (_, subs) => {
                      if (!Array.isArray(subs) || subs.length === 0) {
                        return Promise.reject(
                          new Error("Please add at least one sub item.")
                        );
                      }

                      const nonEmptyRows = subs.filter((row) =>
                        Object.values(row || {}).some(
                          (val) => val !== undefined && val !== ""
                        )
                      );

                      if (nonEmptyRows.length === 0) {
                        return Promise.reject(
                          new Error(
                            "Please fill at least one sub item before submitting."
                          )
                        );
                      }

                      const emptyRows = subs.filter((row) =>
                        Object.values(row || {}).every(
                          (val) => val === undefined || val === ""
                        )
                      );

                      if (emptyRows.length > 0) {
                        return Promise.reject(
                          new Error(
                            "Empty sub items are not allowed — please fill or remove them."
                          )
                        );
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
                validateTrigger={["onSubmit"]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <div className="flex justify-between items-center mb-2">
                      <div className="font-semibold text-lg">Sub Details</div>
                      <Button
                        type="dashed"
                        htmlType="button"
                        onClick={() => add()}
                        icon={<PlusOutlined />}
                      >
                        Add Item
                      </Button>
                    </div>

                    <div className="overflow-x-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 bg-gray-100 text-gray-700 font-semibold text-sm p-2">
                        <div className="md:col-span-2">Shade</div>
                        <div className="md:col-span-2">Item</div>
                        <div>GSM</div>
                        <div>Size</div>
                        <div>Quantity</div>
                        <div>Unit</div>
                        <div>Bill Rate</div>
                        <div>Mill Rate</div>
                        <div className="md:col-span-2">Remarks</div>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {fields.map(({ key, name, ...restField }) => {
                          const subItem = form.getFieldValue(["subs", name]);
                          const hasId = subItem?.id;

                          return (
                            <div
                              key={key}
                              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-3 p-2 items-center hover:bg-gray-50 transition relative"
                            >
                              {/* Delete button (absolute right) */}
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
                                      className="!absolute top-0 right-0 z-10 text-red-500"
                                    />
                                  </Popconfirm>
                                ) : (
                                  <Button
                                    type="text"
                                    danger
                                    icon={<MinusCircleOutlined />}
                                    className="!absolute top-0 right-0 z-10"
                                    onClick={() => remove(name)}
                                  />
                                ))}

                              {/* Inputs */}
                              <Form.Item
                                {...restField}
                                name={[name, "shade"]}
                                noStyle
                                className="!relative"
                              >
                                <Select
                                  className="md:col-span-2"
                                  placeholder="Shade"
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
                                noStyle
                              >
                                <Select
                                  className="md:col-span-2"
                                  placeholder="Item"
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
                                noStyle
                              >
                                <Input placeholder="GSM" />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "size"]}
                                noStyle
                              >
                                <Input placeholder="Size" />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "qnty"]}
                                noStyle
                              >
                                <InputNumber
                                  min={1}
                                  className="!w-full"
                                  placeholder="Qty"
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "unit"]}
                                noStyle
                              >
                                <Select
                                  placeholder="Unit"
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
                                noStyle
                              >
                                <InputNumber
                                  min={1}
                                  className="!w-full"
                                  type="number"
                                  placeholder="Rate"
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "agreed_rate"]}
                                noStyle
                              >
                                <InputNumber
                                  min={1}
                                  className="!w-full"
                                  type="number"
                                  placeholder="Mill Rate"
                                />
                              </Form.Item>

                              <div className="md:col-span-2">
                                <Form.Item
                                  {...restField}
                                  name={[name, "remarks"]}
                                  noStyle
                                >
                                  <Input.TextArea
                                    rows={1}
                                    placeholder="Remarks"
                                  />
                                </Form.Item>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {errors.length > 0 && (
                      <div className="text-red-500 text-sm mt-2">
                        {errors[0]}
                      </div>
                    )}
                  </>
                )}
              </Form.List>
            </Card>
          </Card>
        </Form>
      )}
    </>
  );
};

export default PurchaseForm;
