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
import {
  DELETE_ORDER_SUB,
  DELETE_QUOTATION_SUB,
  PURCHASE_ORDER_LIST,
  QUOTATION_LIST,
} from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";

const QuotationForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [initialData, setInitialData] = useState({
    quotation_date: null,
    quotation_ref: "",
    quotation_mill_id: null,
    quotation_party_id: null,
    quotation_subject: "",
    quotation_deckle: "",
    quotation_gsm_range: "",
    quotation_extra_charge: "FOR GYT - Rs 1.00 KG",
    quotation_freight: null,
    quotation_payment: "WITH IN 15 DAYS",
    quotation_delivery: "",
    quotation_furnish: "INDIAN + IMPORTED waste",
    quotation_samples: "",
    quotation_footer:
      "We assure of our prompt and efficient services and look forward",
  });

  const { mill, party, quotationRef, item } = useMasterData();
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

  const handleChange = () => {
    if (quotationRef?.data?.data) {
      form.setFieldValue("quotation_ref", quotationRef.data?.data);
    }
  };

  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { trigger: deleteTrigger } = useApiMutation();
  const fetchQuotation = async () => {
    try {
      const res = await fetchTrigger({
        url: `${PURCHASE_ORDER_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          quotation_status: res.data.quotation_status == "Open" ? true : false,
          quotation_date: res.data.quotation_date
            ? dayjs(res.data.quotation_date)
            : null,
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load quotation details.");
    }
  };

  useEffect(() => {
    if (id) fetchQuotation();
    else form.resetFields();
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      quotation_ref: initialData.quotation_ref || "",
      quotation_date: values.quotation_date
        ? dayjs(values.quotation_date).format("YYYY-MM-DD")
        : null,
      subs: (values.subs || []).map((sub) => ({
        id: sub?.id || "",
        quotation_quality: sub?.quotation_quality || "",
        quotation_basic_price: sub?.quotation_basic_price || "",
        quotation_gst: sub?.quotation_gst || "",
        quotation_insurance: sub?.quotation_insurance || "",
        quotation_tmill: sub?.quotation_tmill || "",
        quotation_net_gst: sub?.quotation_net_gst || "",
      })),
    };

    if (isEditMode) {
      payload.quotation_status = values?.quotation_status ? "Open" : "Close";
    }

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${QUOTATION_LIST}/${id}` : QUOTATION_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Quotation order saved successfully!");
        await queryClient.invalidateQueries({ queryKey: ["quotationdata"] });
        navigate("/quotation");
      } else {
        message.error(res.message || "Failed to save quotation order.");
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Error while saving quotation order.");
    }
  };
  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid sub-item ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${DELETE_QUOTATION_SUB}/${subId}`,
        method: "delete",
      });

      if (res?.code === 201) {
        message.success(res?.message || "Sub-item deleted successfully!");
        fetchQuotation();
      } else {
        message.error(res?.message || "Failed to delete sub-item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting sub-item.");
    }
  };

  const loading = fetchLoading || mill?.loading || party?.loading;
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
                {isEditMode
                  ? "Update Quotation Order"
                  : "Create Quotation Order"}
              </h2>
            }
            extra={
              <>
                {isEditMode && (
                  <Form.Item
                    name="quotation_status"
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
              </>
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                    Quotation Date <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker className="w-full" format="DD-MM-YYYY" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    Quotation Ref No <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_ref"
                rules={[{ required: true, message: "Enter reference number" }]}
              >
                <Input disabled value={quotationRef?.data?.data} />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Deckle <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_deckle"
                rules={[{ required: true, message: "Select Deckle" }]}
              >
                <Select
                  placeholder="Select Deckle"
                  options={partyOptions}
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
                    GSM <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_gsm_range"
                rules={[{ required: true, message: "Select GSM" }]}
              >
                <Select
                  placeholder="Select GSM"
                  options={partyOptions}
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
                    Freight <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_freight"
                rules={[{ required: true, message: "Select Freight" }]}
              >
                <Select
                  placeholder="Select Freight"
                  options={partyOptions}
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
                    Samples <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_samples"
                rules={[{ required: true, message: "Select Samples" }]}
              >
                <Select
                  placeholder="Select Samples"
                  options={partyOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  showSearch
                  allowClear
                />
              </Form.Item>
              <Form.Item name="quotation_payment" label="Payment">
                <Input placeholder="Enter Payment" />
              </Form.Item>
              <Form.Item name="quotation_furnish" label="Furnish">
                <Input placeholder="Enter Furnish" />
              </Form.Item>
              <Form.Item name="quotation_extra_charge" label="Extra Charge">
                <Input placeholder="Enter Extra Charge" />
              </Form.Item>
              <Form.Item
                label={
                  <span>
                    Delivery <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_delivery"
                rules={[{ required: true, message: "Select Delivery" }]}
              >
                <Select
                  placeholder="Select Delivery"
                  options={partyOptions}
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
                    Subject <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_subject"
                rules={[{ required: true, message: "Select Subject" }]}
              >
                <Select
                  placeholder="Select Subject"
                  options={partyOptions}
                  showSearch
                  allowClear
                />
              </Form.Item>
              <Form.Item
                name="quotation_footer"
                label="Footer"
                className="md:col-span-2"
              >
                <Input placeholder="Enter Footer" value="" />
              </Form.Item>
            </div>
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
                          className="!mb-3 bg-white border relative"
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

                          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-6">
                            <Form.Item
                              {...restField}
                              name={[name, "quotation_quality"]}
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
                              name={[name, "quotation_basic_price"]}
                              label="Basic Price"
                            >
                              <Input placeholder="Basic Price" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "quotation_gst"]}
                              label="Gst"
                            >
                              <Input placeholder="Gst" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "quotation_insurance"]}
                              label="Insurance"
                            >
                              <Input type="number" placeholder="Insurance" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "quotation_tmill"]}
                              label="T Mill"
                            >
                              <Input type="number" placeholder="T Mill" />
                            </Form.Item>

                            <Form.Item
                              {...restField}
                              name={[name, "quotation_net_gst"]}
                              label="Net Gst"
                            >
                              <Input type="number" placeholder="Net Gst" />
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
          </Card>
        </Form>
      )}
    </>
  );
};

export default QuotationForm;
