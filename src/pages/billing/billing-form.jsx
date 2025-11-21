import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Select,
  Spin,
  Switch,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ACTIVE_PURCHASE_ORDER_REF,
  BILLING_LIST,
  GET_PURCHASE_ORDER_REF_DETAILS,
} from "../../api";
import {
  DeleteOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useGetApiMutation } from "../../hooks/useGetApiMutation";

const billingTypes = [
  { label: "Comm", value: "Comm" },
  { label: "Pur", value: "Pur" },
];

const BillingForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mill, party, item } = useMasterData({
    mill: true,
    party: true,
    item: true,
  });

  const [initialData, setInitialData] = useState({
    billing_no: "",
    billing_mill_id: null,
    billing_total_tones: "",
    billing_party_id: "",
    purchase_orders_ref: null,
    billing_total_commn: "",
    billing_total_sale_amount: null,
    billing_type: null,
    billing_payment_type: null,
    billing_note: "",
    billing_status: false,
  });
  const [selectedMillId, setSelectedMillId] = useState(null);
  const [selectedRefId, setSelectetReflId] = useState(null);
  const [totalRate, setTotalRate] = useState(null);
  const [daysDifference, setDaysDifference] = useState(null);
  const { data: purchaserefdata, isLoading } = useGetApiMutation({
    url: `${ACTIVE_PURCHASE_ORDER_REF}/${selectedMillId}`,
    queryKey: ["purchasereforderdata", selectedMillId],
    options: {
      enabled: !!selectedMillId,
    },
  });
  const { data: getpurchaserefdetails, isLoading: loadingrefdetails } =
    useGetApiMutation({
      url: `${GET_PURCHASE_ORDER_REF_DETAILS}?purchase_orders_ref=${selectedRefId}`,
      queryKey: ["getpurchaserefdetails", selectedRefId],
      options: {
        enabled: !!selectedRefId,
      },
    });
  console.log(getpurchaserefdetails);
  const resetForm = () => {
    form.resetFields();
    setTotalRate(null);
    setDaysDifference(null);
  };

  const poRefOptions =
    purchaserefdata?.data?.map((item) => ({
      label: item.purchase_orders_ref,
      value: item.purchase_orders_ref,
    })) || [];
  const millOptions =
    mill?.data?.data?.map((item) => ({
      label: item.mill_short,
      value: item.id,
    })) || [];

  const partyOptions =
    party?.data?.data?.map((item) => ({
      label: item.party_short,
      value: item.id,
    })) || [];

  const fetchBilling = async () => {
    try {
      const res = await fetchTrigger({ url: `${BILLING_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          purchase_date: res.data.purchase_date
            ? dayjs(res.data.purchase_date)
            : null,
          sale_date: res.data.sale_date ? dayjs(res.data.sale_date) : null,
          billing_status: res.data.billing_status == "Open" ? true : false,
        };
        const diff = dayjs()
          .startOf("day")
          .diff(dayjs(formattedData?.sale_date).startOf("day"), "day");
        const total =
          Number(formattedData?.sale_rate) -
          Number(formattedData?.purchase_rate);
        setTotalRate(total ? parseFloat(total.toFixed(2)) : 0);
        setDaysDifference(diff);
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load billing details.");
    }
  };

  useEffect(() => {
    if (id) fetchBilling();
    else resetForm();
  }, [id]);

  const handleChange = (value) => {
    setSelectedMillId(value);
  };
  const handleChangeRef = (value) => {
    setSelectetReflId(value);
  };

  // const handleValueChange = (_, allValues) => {
  //   const { purchase_rate, sale_rate, sale_date } = allValues;
  //   const pRate = parseFloat(purchase_rate) || 0;
  //   const sRate = parseFloat(sale_rate) || 0;
  //   const total = sRate - pRate;
  //   setTotalRate(total ? parseFloat(total.toFixed(2)) : 0);

  //   if (sale_date) {
  //     const diff = dayjs()
  //       .startOf("day")
  //       .diff(dayjs(sale_date).startOf("day"), "day");

  //     setDaysDifference(diff);

  //     form.setFieldsValue({
  //       billing_due_days: diff,
  //     });
  //   } else {
  //     setDaysDifference(null);
  //     form.setFieldsValue({
  //       billing_due_days: "",
  //     });
  //   }
  // };
  
  const handleValueChange = (_, allValues) => {
  const { purchase_rate, sale_rate, sale_date, subs } = allValues;

  // Existing logic
  const pRate = parseFloat(purchase_rate) || 0;
  const sRate = parseFloat(sale_rate) || 0;
  const total = sRate - pRate;
  setTotalRate(total ? parseFloat(total.toFixed(2)) : 0);

  if (sale_date) {
    const diff = dayjs().startOf("day").diff(dayjs(sale_date).startOf("day"), "day");
    setDaysDifference(diff);
    form.setFieldsValue({ billing_due_days: diff });
  }

  if (Array.isArray(subs)) {
    const totalTones = subs.reduce((sum, row) => {
      return sum + (parseFloat(row?.billing_sub_tones) || 0);
    }, 0);

    const totalComm = subs.reduce((sum, row) => {
      return sum + (parseFloat(row?.billing_commn) || 0);
    }, 0);

    form.setFieldsValue({
      billing_total_tones: totalTones,
      billing_total_commn: totalComm,
    });
  }
};

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      billing_due_days: daysDifference ? daysDifference : 0,
      billing_tones: values.billing_tones ? Number(values.billing_tones) : 0,
      purchase_rate: values.purchase_rate ? Number(values.purchase_rate) : 0,
      purchase_amount: values.purchase_amount
        ? Number(values.purchase_amount)
        : 0,
      sale_rate: values.sale_rate ? Number(values.sale_rate) : 0,
      purchase_date: values.purchase_date
        ? dayjs(values.purchase_date).format("YYYY-MM-DD")
        : null,
      sale_date: values.sale_date
        ? dayjs(values.sale_date).format("YYYY-MM-DD")
        : null,
      ...(isEditMode && {
        billing_status: values?.billing_status === true ? "Open" : "Close",
      }),
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${BILLING_LIST}/${id}` : BILLING_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Billing saved successfully!");
        await queryClient.invalidateQueries({ queryKey: ["billingdata"] });
        navigate("/billing");
      } else {
        message.error(res.message || "Failed to save billing.");
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Error while saving billing.");
    }
  };
  const main = getpurchaserefdetails?.data || {};
  const subs = main?.subs || [];
  const loadingdata =
    item?.loading || fetchLoading || mill.loading || party.loading;
  return (
    <>
      {loadingdata ? (
        <div className="flex justify-center py-20">
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleValueChange}
          initialValues={initialData}
          className="mt-4"
          requiredMark={false}
        >
          <Card
            title={
              <h2 className="text-2xl font-bold">
                {isEditMode ? "Update Billing" : "Create Billing"}
              </h2>
            }
            extra={
              <div className="flex items-center gap-2">
                {isEditMode && (
                  <Form.Item
                    name="billing_status"
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
            <Card
              size="small"
              title={<span className="font-semibold">Purchase Info</span>}
              className="!mt-2 !bg-gray-50"
              extra={
                <div className="flex">
                  {daysDifference !== null && (
                    <div className="flex">
                      <span
                        className={`mt-1 w-40 text-center px-1 py-1.5 ${
                          daysDifference < 0
                            ? "text-red-600 font-semibold"
                            : "text-gray-800"
                        }`}
                      >
                        Due Days: {daysDifference || 0}
                      </span>
                    </div>
                  )}

                  {/* PR - SR */}
                  {totalRate !== null && (
                    <div className="flex items-center justify-center">
                      <span
                        className={`px-1 py-1.5 rounded-md text-sm font-medium ${
                          totalRate < 0 ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        PR - SR: {totalRate || 0}
                      </span>
                    </div>
                  )}
                </div>
              }
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Form.Item
                      label={
                        <span>
                          Mill Name <span className="text-red-500">*</span>
                        </span>
                      }
                      name="billing_mill_id"
                      rules={[{ required: true, message: "Select Mill Name" }]}
                    >
                      <Select
                        placeholder="Select Mill Name"
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
                      name="purchase_orders_ref"
                      label="PO Reference"
                      rules={[
                        { required: true, message: "Select PO Reference" },
                      ]}
                    >
                      <Select
                        placeholder="Select PO Reference"
                        options={poRefOptions}
                        loading={isLoading}
                        onChange={handleChangeRef}
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
                      name="billing_no"
                      label={
                        <span>
                          Billing No <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Enter Billing Number" },
                      ]}
                    >
                      <Input placeholder="Enter Billing No" />
                    </Form.Item>

                    <Form.Item
                      name="billing_party_id"
                      label={
                        <span>
                          Party<span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Select Party" }]}
                    >
                      <Select
                        placeholder="Select Party"
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
                      name="billing_type"
                      label={
                        <span>
                          Billing Type <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Select Billing Type" },
                      ]}
                    >
                      <Select
                        placeholder="Select Billing Type"
                        options={billingTypes}
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
                      name="billing_payment_type"
                      label={
                        <span>
                          Payment Type <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Select Payment Type" },
                      ]}
                    >
                      <Select
                        placeholder="Select Payment Type"
                        options={[
                          { label: "Payables", value: "Payables" },
                          { label: "Receivables", value: "Receivables" },
                        ]}
                        allowClear
                      />
                    </Form.Item>
                    <Form.Item
                      name="billing_total_tones"
                      label={
                        <span>
                          Tones <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Enter Tones" }]}
                      styles={{ width: "100%" }}
                    >
                      <InputNumber
                        placeholder="Enter Tones"
                        className="!w-full"
                      />
                    </Form.Item>
                    <Form.Item
                      name="billing_total_commn"
                      label={
                        <span>
                          Comm <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Enter Comm" }]}
                      styles={{ width: "100%" }}
                    >
                      <InputNumber
                        placeholder="Enter Comm"
                        className="!w-full"
                      />
                    </Form.Item>
                    <Form.Item
                      name="billing_total_sale_amount"
                      label={
                        <span>
                          Sale Amount <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Enter Sale Amount" }]}
                      styles={{ width: "100%" }}
                    >
                      <InputNumber
                        placeholder="Enter Sale Amount"
                        className="!w-full"
                      />
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="billing_note"
                    label={
                      <span>
                        Note <span className="text-red-500">*</span>
                      </span>
                    }
                    rules={[{ required: true, message: "Enter Note" }]}
                  >
                    <Input.TextArea
                      placeholder="Enter Note"
                    />
                  </Form.Item>
                </div>

                <div className="w-full max-w-4xl mx-auto p-4 space-y-4 min-h-[340px] max-h-[350px] overflow-y-auto">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                    <h4 className="text-base font-semibold mb-2 text-gray-800 border-b ">
                      Purchase Details
                    </h4>
                    {loadingrefdetails ? (
                      <div className="flex justify-center items-center py-4">
                        <Spin size="small" />
                      </div>
                    ) : main && Object.keys(main).length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-2">
                          <p>
                            <span className="font-semibold">Mill:</span>{" "}
                            {main?.mill_name}
                          </p>
                          <p>
                            <span className="font-semibold">Party:</span>{" "}
                            {main?.party_name}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {subs.map((item, index) => (
                            <Card
                              key={index}
                              size="small"
                              className="shadow-sm border "
                            >
                              <div className="rounded-md  text-xs grid grid-cols-3 gap-1">
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
                                    Bill:
                                  </span>{" "}
                                  ₹{item.bill_rate}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-500">
                                    Agreed:
                                  </span>{" "}
                                  ₹{item.agreed_rate}
                                </p>
                                <p className="col-span-2">
                                  <span className="font-medium text-gray-500">
                                    Shade:
                                  </span>{" "}
                                  {item.shade ?? "-"}
                                </p>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-md p-3 text-center text-gray-500">
                        No recent data available
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                      <div className="grid grid-cols-1 md:grid-cols-5 lg:grid-cols-10 gap-3 bg-gray-100 text-gray-700 font-semibold text-sm p-2">
                        <div>Pur Date</div>
                        <div>Pur Rate</div>
                        <div>Sale Date</div>
                        <div>Sale Rate</div>
                        <div className="col-span-2">Item</div>
                        <div>Tones</div>
                        <div>Comm</div>
                        {/* <div>Sales Amo</div>

                        <div>Rate Diff</div>
                        <div>Due Days</div> */}
                      </div>

                      <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
                        {fields.map(({ key, name, ...restField }) => {
                          const subItem = form.getFieldValue(["subs", name]);
                          const hasId = subItem?.id;
                          return (
                            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-10 gap-2 mt-2 p-2 transition relative">
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
                                name={[name, "purchase_date"]}
                                noStyle
                                className="mb-0"
                              >
                                <DatePicker size="medium" format="DD-MM-YYYY" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "purchase_rate"]}
                                noStyle
                                className="mb-0"
                              >
                                <InputNumber
                                  placeholder="Rate"
                                  size="medium"
                                  type="number"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "sale_date"]}
                                noStyle
                                className="mb-0"
                              >
                                <DatePicker size="medium" format="DD-MM-YYYY" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "sale_rate"]}
                                noStyle
                                className="mb-0"
                              >
                                <InputNumber
                                  placeholder="Sale Rate"
                                  size="medium"
                                  type="number"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "billing_sub_bf"]}
                                noStyle
                              >
                                <Select
                                  placeholder="Select Item"
                                  options={
                                    item?.data?.data?.map((i) => ({
                                      label: i.bf,
                                      value: i.bf,
                                    })) || []
                                  }
                                  filterOption={(input, option) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  showSearch
                                  allowClear
                                  className="col-span-2 w-full"
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "billing_sub_tones"]}
                                noStyle
                                className="mb-0"
                              >
                                <InputNumber
                                  placeholder="Tones"
                                  size="medium"
                                  type="number"
                                  min={1}
                                />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "billing_commn"]}
                                noStyle
                                className="mb-0"
                              >
                                <InputNumber
                                  placeholder="Enter Comm"
                                  size="medium"
                                  type="number"
                                  min={1}
                                />
                              </Form.Item>

                              <div className="flex gap-1 col-span-2">
                                <Form.Item
                                  {...restField}
                                  name={[name, "sales_amount"]}
                                  noStyle
                                  className="mb-0"
                                >
                                  <InputNumber
                                    size="medium"
                                    type="number"
                                    min={1}
                                    disabled
                                    className="!w-24"
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "rate_diff"]}
                                  noStyle
                                  className="mb-0"
                                >
                                  <InputNumber
                                    size="medium"
                                    type="number"
                                    min={1}
                                    disabled
                                    className="!w-24"
                                  />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, "billing_due_days"]}
                                  noStyle
                                  className="mb-0"
                                >
                                  <InputNumber
                                    size="medium"
                                    disabled
                                    className="!w-24"
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

export default BillingForm;
