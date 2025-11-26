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
import { DELETE_QUOTATION_SUB, QUOTATION_LIST } from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";
import quotationOptions from "../../constants/quotationOptions.json";
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
    quotation_subject: null,
    quotation_deckle: null,
    quotation_gsm_range: null,
    quotation_extra_charge: "FOR GYT - Rs 1.00 KG",
    quotation_freight: null,
    quotation_payment: "WITH IN 15 DAYS",
    quotation_delivery: null,
    quotation_furnish: "INDIAN + IMPORTED waste",
    quotation_samples: null,
    quotation_footer:
      "We assure of our prompt and efficient services and look forward",
    quotation_status: false,
  });

  const { mill, party, item, quotationRef, deckle, subject, gsm, delivery } =
    useMasterData({
      mill: true,
      party: true,
      item: true,
      quotationRef: true,
      deckle: true,
      subject: true,
      gsm: true,
      delivery: true,
    });
  const deliveryOptions =
    delivery?.data?.data?.map((item) => ({
      label: item.delivery,
      value: item.delivery,
    })) || [];
  const deckleOptions =
    deckle?.data?.data?.map((item) => ({
      label: item.deckle,
      value: item.deckle,
    })) || [];
  const subjectOptions =
    subject?.data?.data?.map((item) => ({
      label: item.subject,
      value: item.subject,
    })) || [];
  const gsmOptions =
    gsm?.data?.data?.map((item) => ({
      label: item.gsm,
      value: item.gsm,
    })) || [];
  const millOptions =
    mill?.data?.data?.map((item) => ({
      label: item.mill_short,
      value: item.id,
      mill_billing_address: item.mill_billing_address,
    })) || [];

  const partyOptions =
    party?.data?.data?.map((item) => ({
      label: item.party_short,
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
        url: `${QUOTATION_LIST}/${id}`,
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
    quotationRef.refetch();
    const payload = {
      ...values,
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
      ...(isEditMode && {
        quotation_status: values?.quotation_status === true ? "Open" : "Close",
      }),
    };

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
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <Form.Item
                    name="quotation_status"
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                    Mill <span className="text-red-500">*</span>
                  </span>
                }
                name="quotation_mill_id"
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
                name="quotation_party_id"
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
                  options={deckleOptions}
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
                  options={subjectOptions}
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
                  options={gsmOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  showSearch
                  allowClear
                />
              </Form.Item>

              <Form.Item name="quotation_extra_charge" label="Extra Charge">
                <Input placeholder="Enter Extra Charge" />
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
                  options={quotationOptions.freightOptions}
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
                  options={deliveryOptions}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  showSearch
                  allowClear
                />
              </Form.Item>
              <Form.Item name="quotation_furnish" label="Furnish">
                <Input placeholder="Enter Furnish" />
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
                  options={quotationOptions.samplesOptions}
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
                name="quotation_footer"
                label="Footer"
                className="md:col-span-3"
              >
                <Input.TextArea placeholder="Enter Footer" />
              </Form.Item>
            </div>
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
                    <div className="flex justify-between mb-2">
                      <div className="font-semibold text-lg mb-2">
                        Sub Details
                      </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 bg-gray-100 text-gray-700 font-semibold text-sm p-2">
                        <div className="col-span-2">Quality</div>
                        <div>Price</div>
                        <div>Gst</div>
                        <div>Insurance</div>
                        <div>TMill</div>
                        <div>Net Gst</div>
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {fields.map(({ key, name, ...restField }) => {
                          const subItem = form.getFieldValue(["subs", name]);
                          const hasId = subItem?.id;
                          return (
                            <div
                              key={key}
                              className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3 p-2 items-center hover:bg-gray-50 transition relative"
                            >
                              {" "}
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
                                    className="!absolute top-0 right-0 z-10 text-red-500"
                                    onClick={() => remove(name)}
                                  />
                                ))}
                              <Form.Item
                                {...restField}
                                name={[name, "quotation_quality"]}
                                noStyle
                                className="!relative"
                              >
                                <Select
                                  className="md:col-span-2"
                                  placeholder="Select Quality"
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
                                noStyle
                              >
                                <InputNumber
                                  type="number"
                                  className="!w-full"
                                  placeholder="Basic Price"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "quotation_gst"]}
                                noStyle
                              >
                                <InputNumber
                                  type="number"
                                  className="!w-full"
                                  placeholder="Gst"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "quotation_insurance"]}
                                noStyle
                              >
                                <InputNumber
                                  type="number"
                                  className="!w-full"
                                  placeholder="Insurance"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "quotation_tmill"]}
                                noStyle
                              >
                                <InputNumber
                                  type="number"
                                  className="!w-full"
                                  placeholder="T Mill"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "quotation_net_gst"]}
                                noStyle
                              >
                                <InputNumber
                                  type="number"
                                  className="!w-full"
                                  placeholder="Net Gst"
                                  min={1}
                                />
                              </Form.Item>
                            </div>
                          );
                        })}
                      </div>
                    </div>
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
