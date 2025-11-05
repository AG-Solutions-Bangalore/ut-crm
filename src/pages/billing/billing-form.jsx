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
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BILLING_LIST } from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";

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
  const { mill, party, item, purchaseRef } = useMasterData({
    mill: true,
    party: true,
    item: true,
    purchaseRef: true,
  });
  const [initialData, setInitialData] = useState({
    purchase_date: null,
    billing_no: "",
    billing_mill_id: null,
    billing_tones: "",
    purchase_rate: "",
    billing_bf: null,
    purchase_amount: "",
    sale_date: null,
    sale_rate: "",
    billing_party_id: null,
    purchase_orders_ref: "",
    billing_type: null,
    billing_due_days: "",
    billing_status: false,
  });

  const [totalRate, setTotalRate] = useState(null);
  const [daysDifference, setDaysDifference] = useState(null);

  const resetForm = () => {
    form.resetFields();
    setTotalRate(null);
    setDaysDifference(null);
  };

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

  const handleChange = () => {
    purchaseRef.refetch();
    if (purchaseRef?.data?.data) {
      form.setFieldValue("purchase_orders_ref", purchaseRef?.data?.data);
    }
  };
  const handleValueChange = (_, allValues) => {
    const { purchase_rate, sale_rate, sale_date } = allValues;
    const pRate = parseFloat(purchase_rate) || 0;
    const sRate = parseFloat(sale_rate) || 0;
    const total = sRate - pRate;
    setTotalRate(total ? parseFloat(total.toFixed(2)) : null);

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
        billing_status: values?.billing_status == "Open" ? "Open" : "Close",
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
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Form.Item
                  name="purchase_date"
                  label={
                    <span>
                      Purchase Date <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Select Purchase Date" }]}
                >
                  <DatePicker
                    className="w-full"
                    format="DD-MM-YYYY"
                    onChange={handleChange}
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

                <Form.Item name="purchase_orders_ref" label="PO Reference">
                  <Input placeholder="Enter PO Reference" readOnly />
                </Form.Item>

                <Form.Item
                  name="billing_no"
                  label={
                    <span>
                      Billing No <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Enter Billing Number" }]}
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
                  rules={[{ required: true, message: "Enter Purchase Rate" }]}
                >
                  <InputNumber
                    type="number"
                    placeholder="Enter Rate"
                    className="!w-full"
                  />
                </Form.Item>

                <Form.Item name="sale_rate" label="Sale Rate">
                  <InputNumber
                    type="number"
                    placeholder="Enter Rate"
                    className="!w-full"
                  />
                </Form.Item>

                <div>
                  <label>PR-SR</label>
                  <div
                    className={`border border-gray-400 rounded-md px-3 py-1  mt-[8px]  bg-gray-100 outline-none cursor-default ${
                      totalRate < 0
                        ? "text-red-500 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {totalRate !== null ? `${totalRate}` : "-"}
                  </div>
                </div>

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
                  rules={[{ required: true, message: "Select Billing Type" }]}
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

                <Form.Item name="billing_due_days" label="Due Days">
                  <Input
                    readOnly
                    value={
                      daysDifference !== null ? `${daysDifference} Days` : "-"
                    }
                    className={`!w-32 !bg-gray-100 !border !border-gray-400 !rounded-md !px-3 !outline-none !cursor-default ${
                      daysDifference < 0
                        ? "!text-red-500 !font-semibold"
                        : "!text-gray-800"
                    }`}
                  />
                </Form.Item>
              </div>
            </Card>
          </Card>
        </Form>
      )}
    </>
  );
};

export default BillingForm;
