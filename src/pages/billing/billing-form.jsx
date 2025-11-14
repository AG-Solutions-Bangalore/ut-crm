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
  const { mill, party, item, purchaseorderref } = useMasterData({
    mill: true,
    party: true,
    item: true,
    purchaseorderref: true,
  });

  const [initialData, setInitialData] = useState({
    purchase_date: dayjs(),
    billing_no: "",
    billing_mill_id: null,
    billing_tones: "",
    purchase_rate: "",
    billing_bf: null,
    purchase_amount: "",
    sale_date: null,
    sale_rate: "",
    billing_party_id: null,
    purchase_orders_ref: null,
    billing_type: null,
    billing_payment_type: null,
    billing_due_days: "",
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
      label: item.mill_name,
      value: item.id,
    })) || [];

  const partyOptions =
    party?.data?.data?.map((item) => ({
      label: item.party_name,
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

  const handleValueChange = (_, allValues) => {
    const { purchase_rate, sale_rate, sale_date } = allValues;
    const pRate = parseFloat(purchase_rate) || 0;
    const sRate = parseFloat(sale_rate) || 0;
    const total = sRate - pRate;
    setTotalRate(total ? parseFloat(total.toFixed(2)) : 0);

    if (sale_date) {
      const diff = dayjs()
        .startOf("day")
        .diff(dayjs(sale_date).startOf("day"), "day");

      setDaysDifference(diff);

      form.setFieldsValue({
        billing_due_days: diff,
      });
    } else {
      setDaysDifference(null);
      form.setFieldsValue({
        billing_due_days: "",
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
                      name="purchase_date"
                      label={
                        <span>
                          Purchase Date <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Select Purchase Date" },
                      ]}
                    >
                      <DatePicker
                        autoFocus
                        className="w-full"
                        format="DD-MM-YYYY"
                      />
                    </Form.Item>

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
                      {/* <Input placeholder="Enter PO Reference" /> */}
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
                      name="billing_bf"
                      label={
                        <span>
                          Item <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Select Item" }]}
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
                      />
                    </Form.Item>

                    <Form.Item
                      name="billing_tones"
                      label={
                        <span>
                          Tones <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[{ required: true, message: "Enter Tones" }]}
                    >
                      <Input placeholder="Enter Tones" />
                    </Form.Item>

                    <Form.Item name="purchase_amount" label="Purchase Amount">
                      <Input placeholder="Enter Amount" />
                    </Form.Item>

                    <Form.Item
                      name="purchase_rate"
                      label={
                        <span>
                          Purchase Rate <span className="text-red-500">*</span>
                        </span>
                      }
                      rules={[
                        { required: true, message: "Enter Purchase Rate" },
                      ]}
                    >
                      <InputNumber
                        type="number"
                        placeholder="Enter Rate"
                        className="!w-full"
                        min={1}
                      />
                    </Form.Item>
                    {/* </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4"> */}
                    <Form.Item name="sale_rate" label="Sale Rate">
                      <InputNumber
                        type="number"
                        placeholder="Enter Rate"
                        className="!w-full"
                        min={1}
                      />
                    </Form.Item>

                    <Form.Item name="sale_date" label="Sale Date">
                      <DatePicker className="w-full" format="DD-MM-YYYY" />
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
                  </div>
                </div>
                {/* <div className="w-full max-w-4xl mx-auto p-4 space-y-4 min-h-[340px] max-h-[400px] overflow-y-auto">
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                    <h4 className="text-base font-semibold mb-2 text-gray-800 border-b pb-2">
                      Latest Purchase Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-semibold">Mill: </span>
                        {main?.mill_name}
                      </div>
                      <div>
                        <span className="font-semibold">Party: </span>
                        {main?.party_name}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 ">
                    {subs.map((item, index) => (
                      <Card
                        key={index}
                        size="small"
                        title={item.purchase_orders_sub_ref || "Item Details"}
                        className="shadow-sm border"
                      >
                        <div className="border border-gray-100 rounded-md p-2 shadow-sm">
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
                      </Card>
                    ))}
                  </div>
                </div> */}
                <div className="w-full max-w-4xl mx-auto p-4 space-y-4 min-h-[340px] max-h-[400px] overflow-y-auto">
                  {/* MAIN CARD */}
                  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3">
                    <h4 className="text-base font-semibold mb-2 text-gray-800 border-b pb-2">
                       Purchase Details
                    </h4>
                    {loadingrefdetails ? (
                      <div className="flex justify-center items-center py-4">
                        <Spin size="small" />
                      </div>
                    ) : main && Object.keys(main).length > 0 ? (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm mb-2">
                          <p>
                            <span className="font-semibold">Mill:</span>{" "}
                            {main?.mill_name}
                          </p>
                          <p>
                            <span className="font-semibold">Party:</span>{" "}
                            {main?.party_name}
                          </p>
                        </div>

                        {/* SUB CARDS */}
                        <div className="grid grid-cols-1 gap-4">
                          {subs.map((item, index) => (
                            <Card
                              key={index}
                              size="small"
                              className="shadow-sm border"
                            >
                              <div className="rounded-md p-2 text-xs grid grid-cols-2 gap-1">
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
            </Card>
          </Card>
        </Form>
      )}
    </>
  );
};

export default BillingForm;
