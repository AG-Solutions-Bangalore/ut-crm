import { useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Form,
  Input,
  Select,
  Spin,
  Switch,
  DatePicker,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { BILLING_LIST } from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useMasterData } from "../../hooks";

const billingTypes = [
  { label: "Credit", value: "Credit" },
  { label: "Cash", value: "Cash" },
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
  const { mill, party } = useMasterData();

  const [initialData, setInitialData] = useState({
    purchase_date: null,
    billing_no: "",
    billing_mill_id: null,
    billing_tones: "",
    purchase_rate: "",
    billing_bf: "",
    purchase_amount: "",
    sale_date: null,
    sale_rate: "",
    billing_party_id: null,
    purchase_orders_ref: "",
    billing_type: "",
    billing_due_days: "",
    billing_status: false,
  });

  const resetForm = () => {
    form.resetFields();
  };
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
  const fetchBilling = async () => {
    try {
      const res = await fetchTrigger({
        url: `${BILLING_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          purchase_date: res.data.purchase_date
            ? dayjs(res.data.purchase_date)
            : null,
          sale_date: res.data.sale_date ? dayjs(res.data.sale_date) : null,
          billing_status: res.data.billing_status === "Active",
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

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      purchase_date: values.purchase_date
        ? dayjs(values.purchase_date).format("YYYY-MM-DD")
        : null,
      sale_date: values.sale_date
        ? dayjs(values.sale_date).format("YYYY-MM-DD")
        : null,
      billing_status: values?.billing_status ? "Active" : "Inactive",
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
            // variant="borderless"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card
                size="small"
                title={<span className="font-semibold">Purchase Info</span>}
                className="!mt-2 !bg-gray-50 "
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    name="purchase_date"
                    label="Purchase Date"
                    className="!mb-0"
                    rules={[
                      { required: true, message: "Select purchase date" },
                    ]}
                  >
                    <DatePicker className="w-full" />
                  </Form.Item>

                  <Form.Item
                    name="billing_no"
                    label="Billing No"
                    className="!mb-0"
                    rules={[
                      { required: true, message: "Enter billing number" },
                    ]}
                  >
                    <Input placeholder="Enter Billing No" />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        Mill <span className="text-red-500">*</span>
                      </span>
                    }
                    name="billing_mill_id"
                    className="!mb-0"
                    rules={[{ required: true, message: "Select mill" }]}
                  >
                    <Select
                      placeholder="Select Mill"
                      options={millOptions}
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
                    label="Tones"
                    className="!mb-0"
                  >
                    <Input placeholder="Enter tones" />
                  </Form.Item>

                  <Form.Item
                    name="purchase_rate"
                    label="Purchase Rate"
                    className="!mb-0"
                  >
                    <Input placeholder="Enter rate" />
                  </Form.Item>

                  <Form.Item name="billing_bf" label="BF" className="!mb-0">
                    <Input placeholder="Enter BF" />
                  </Form.Item>

                  <Form.Item
                    name="purchase_amount"
                    label="Purchase Amount"
                    className="!mb-0"
                  >
                    <Input placeholder="Enter amount" />
                  </Form.Item>
                </div>
              </Card>

              <Card
                size="small"
                title={<span className="font-semibold">Sale Info</span>}
                className="!mt-2 !bg-gray-50"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item name="sale_date" label="Sale Date">
                    <DatePicker className="w-full" />
                  </Form.Item>

                  <Form.Item
                    name="sale_rate"
                    label="Sale Rate"
                    className="!mb-0"
                  >
                    <Input placeholder="Enter rate" />
                  </Form.Item>

                  <Form.Item
                    label={
                      <span>
                        Party <span className="text-red-500">*</span>
                      </span>
                    }
                    name="billing_party_id"
                    className="!mb-0"
                    rules={[{ required: true, message: "Select party" }]}
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
                    name="purchase_orders_ref"
                    label="PO Reference"
                    className="!mb-0"
                  >
                    <Input placeholder="Enter PO Reference" />
                  </Form.Item>

                  <Form.Item
                    name="billing_type"
                    label="Billing Type"
                    className="!mb-0"
                  >
                    <Select
                      placeholder="Select Billing Type"
                      options={billingTypes}
                    />
                  </Form.Item>

                  <Form.Item
                    name="billing_due_days"
                    label="Due Days"
                    className="!mb-0"
                  >
                    <Input placeholder="Enter Due Days" />
                  </Form.Item>
                </div>
              </Card>
            </div>
          </Card>
        </Form>
      )}
    </>
  );
};

export default BillingForm;
