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
  ACTIVE_PURCHASE_ORDER_REF,
  BILLING_LIST,
  BILLING_SUB,
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
    billing_party_id: null,
    purchase_orders_ref: null,
    billing_total_commn: "",
    billing_total_sale_amount: "",
    billing_type: null,
    billing_note: "",
    billing_payment_type: null,
  });
  const [selectedMillId, setSelectedMillId] = useState(null);
  const [selectedRefId, setSelectetReflId] = useState(null);
  const { trigger: deleteTrigger } = useApiMutation();
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
  const main = getpurchaserefdetails?.data || {};
  const subs = main?.subs || [];
  const resetForm = () => {
    form.resetFields();
  };
  useEffect(() => {
    if (main) {
      console.log(main, "main");
      form.setFieldsValue({
        billing_party_id: main?.party_short,
      });
    }
  }, [main]);

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
  const itemOptions =
    item?.data?.data?.map((item) => ({
      label: item.bf,
      value: item.bf,
    })) || [];

  const fetchBilling = async () => {
    try {
      const res = await fetchTrigger({ url: `${BILLING_LIST}/${id}` });

      if (res?.data) {
        const formattedSubs =
          Array.isArray(res.subs) &&
          res.subs.map((row) => ({
            ...row,
            purchase_date: row.purchase_date ? dayjs(row.purchase_date) : null,
            sale_date: row.sale_date ? dayjs(row.sale_date) : null,
            purchase_rate: row.purchase_rate ? Number(row.purchase_rate) : "",
            sale_rate: row.sale_rate ? Number(row.sale_rate) : "",
            billing_sub_tones: row.billing_sub_tones
              ? Number(row.billing_sub_tones)
              : "",
            billing_commn: row.billing_commn ? Number(row.billing_commn) : "",
            sales_amount: row.sales_amount ? Number(row.sales_amount) : "",
            rate_diff: row.rate_diff ? Number(row.rate_diff) : "",
            billing_due_days: row.billing_due_days
              ? Number(row.billing_due_days)
              : "",
          }));
        const formattedData = {
          ...res.data,
          purchase_date: res.data.purchase_date
            ? dayjs(res.data.purchase_date)
            : null,
          sale_date: res.data.sale_date ? dayjs(res.data.sale_date) : null,
          billing_status: res.data.billing_status === "Open",
          subs: formattedSubs || [],
        };

        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
        setSubRows(formattedData.subs || []);
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
    form.resetFields(["subs"]);
  };

  const handleValueChange = (_, allValues) => {
    const { subs } = allValues;

    if (Array.isArray(subs)) {
      const updatedSubs = subs.map((row) => {
        const pRate = parseFloat(row?.purchase_rate) || 0;
        const sRate = parseFloat(row?.sale_rate) || 0;
        const tones = parseFloat(row?.billing_sub_tones) || 0;

        const Comm = (sRate - pRate) * tones;
        const rateDiff = sRate - pRate;

        const salesAmount = tones * sRate;

        let dueDays = 0;
        if (row?.sale_date) {
          dueDays = dayjs()
            .startOf("day")
            .diff(dayjs(row.sale_date).startOf("day"), "day");
        }

        return {
          ...row,

          billing_commn: parseFloat(Comm.toFixed(2)),
          rate_diff: parseFloat(rateDiff.toFixed(2)),
          sales_amount: parseFloat(salesAmount.toFixed(2)),
          billing_due_days: dueDays,
        };
      });

      form.setFieldsValue({ subs: updatedSubs });

      const totalTones = updatedSubs.reduce(
        (sum, row) => sum + (parseFloat(row.billing_sub_tones) || 0),
        0
      );
      const totalComm = updatedSubs.reduce(
        (sum, row) => sum + (parseFloat(row.billing_commn) || 0),
        0
      );

      form.setFieldsValue({
        billing_total_tones: totalTones,
        billing_total_commn: totalComm,
      });
    }
  };

  const handleSubmit = async (values) => {
    const formattedSubs = (values.subs || []).map((item) => ({
      id: item.id || null,
      purchase_date: item.purchase_date
        ? dayjs(item.purchase_date).format("YYYY-MM-DD")
        : null,
      sale_date: item.sale_date
        ? dayjs(item.sale_date).format("YYYY-MM-DD")
        : null,

      purchase_rate: item.purchase_rate ? Number(item.purchase_rate) : 0,
      sale_rate: item.sale_rate ? Number(item.sale_rate) : 0,
      billing_sub_bf: item.billing_sub_bf || "",
      billing_sub_tones: item.billing_sub_tones
        ? Number(item.billing_sub_tones)
        : 0,

      billing_commn: item.billing_commn ? Number(item.billing_commn) : 0,
      rate_diff: item.rate_diff ? Number(item.rate_diff) : 0,
      sales_amount: item.sales_amount ? Number(item.sales_amount) : 0,
      billing_due_days: item.billing_due_days
        ? Number(item.billing_due_days)
        : 0,
    }));
    const payload = {
      billing_no: values.billing_no ? values.billing_no : "",
      billing_mill_id: values.billing_mill_id ? values.billing_mill_id : "",
      billing_party_id: values.billing_party_id ? values.billing_party_id : "",
      purchase_orders_ref: values.purchase_orders_ref
        ? values.purchase_orders_ref
        : "",
      billing_total_commn: values.billing_total_commn
        ? values.billing_total_commn
        : "",
      billing_total_sale_amount: values.billing_total_sale_amount
        ? values.billing_total_sale_amount
        : "",
      billing_type: values.billing_type ? values.billing_type : "",
      billing_note: values.billing_note ? values.billing_note : "",
      billing_payment_type: values.billing_payment_type
        ? values.billing_payment_type
        : "",

      billing_total_tones: values.billing_total_tones
        ? Number(values.billing_total_tones)
        : 0,
      subs: formattedSubs,
      ...(isEditMode && {
        billing_status: values?.billing_status === true ? "Open" : "Close",
      }),
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${BILLING_LIST}/${id}` : `${BILLING_LIST}`,
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
  const [subRows, setSubRows] = useState([]);

  const handleInsertSub = (mainItem, subItem) => {
    const currentSubs = form.getFieldValue("subs") || [];

    const newRow = {
      purchase_date: mainItem?.purchase_orders_date
        ? dayjs(mainItem.purchase_orders_date)
        : dayjs(),
      purchase_rate: subItem.agreed_rate || "",
      sale_date: null,
      sale_rate: subItem.bill_rate || "",
      billing_sub_bf: subItem.bf || "",
      billing_sub_tones: subItem.qnty || "",
      billing_commn: "",
    };

    const updatedSubs = [newRow, ...currentSubs];

    form.setFieldsValue({ subs: updatedSubs });
    setSubRows(updatedSubs);

    handleValueChange(null, { subs: updatedSubs });
  };

  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid sub-item ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${BILLING_SUB}/${subId}`,
        method: "delete",
      });

      if (res?.code == 201) {
        message.success(res?.message || "Sub-item deleted successfully!");
        if (id) fetchBilling();
      } else {
        message.error(res?.message || "Failed to delete sub-item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting sub-item.");
    }
  };

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
          onValuesChange={(_, allValues) => {
            setSubRows(allValues.subs || []);
            handleValueChange(_, allValues);
          }}
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
                    <Switch checkedChildren="Open" unCheckedChildren="Close" />
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
                        disabled
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
                        disabled
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
                        disabled
                      />
                    </Form.Item>
                  </div>
                  <Form.Item name="billing_note" label="  Note">
                    <Input.TextArea placeholder="Enter Note" />
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
                            {main?.mill_short}
                          </p>
                          <p>
                            <span className="font-semibold">Party:</span>{" "}
                            {main?.party_short}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          {subs.map((item, index) => (
                            <Card
                              key={index}
                              size="small"
                              className="shadow-sm border relative"
                            >
                              <Button
                                type="primary"
                                size="small"
                                className="!absolute top-1 right-1 z-20 !p-1"
                                disabled={subRows.some(
                                  (s) =>
                                    s.billing_sub_bf == item.bf &&
                                    s.billing_sub_tones == item.qnty &&
                                    s.purchase_rate == item.agreed_rate &&
                                    s.sale_rate == item.bill_rate
                                )}
                                onClick={() => handleInsertSub(main, item)}
                              >
                                {form
                                  .getFieldValue("subs")
                                  ?.some(
                                    (s) =>
                                      s.billing_sub_bf == item.bf &&
                                      s.billing_sub_tones == item.qnty &&
                                      s.purchase_rate == item.agreed_rate &&
                                      s.sale_rate == item.bill_rate
                                  )
                                  ? "✓"
                                  : "+"}
                              </Button>

                              <div className="rounded-md  text-xs grid grid-cols-2 gap-1">
                                <p>
                                  {" "}
                                  {item.gsm ?? ""} / {item.bf ?? ""} /{" "}
                                  {item.size ?? ""}
                                </p>
                                <p>
                                  {" "}
                                  {item.bill_rate} / {item.agreed_rate}
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

                        <div className="flex gap-3 col-span-2">
                          <span>Sales Amo</span>
                          <span>Rate Diff</span>
                          <span>Due Days</span>
                        </div>
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
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <DatePicker size="medium" format="DD-MM-YYYY" />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "purchase_rate"]}
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <InputNumber
                                  placeholder="Rate"
                                  size="medium"
                                  min={1}
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "sale_date"]}
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <DatePicker size="medium" format="DD-MM-YYYY" />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "sale_rate"]}
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <InputNumber
                                  placeholder="Sale Rate"
                                  size="medium"
                                  min={1}
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "billing_sub_bf"]}
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <Select
                                  placeholder="Select Item"
                                  className="col-span-2"
                                  filterOption={(input, option) =>
                                    (option?.label ?? "")
                                      .toLowerCase()
                                      .includes(input.toLowerCase())
                                  }
                                  options={itemOptions}
                                  showSearch
                                  allowClear
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "billing_sub_tones"]}
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <InputNumber
                                  placeholder="Tones"
                                  size="medium"
                                  min={1}
                                />
                              </Form.Item>

                              <Form.Item
                                {...restField}
                                name={[name, "billing_commn"]}
                                rules={[{ required: true, message: "" }]}
                                noStyle
                              >
                                <InputNumber
                                  placeholder="Enter Comm"
                                  size="medium"
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
