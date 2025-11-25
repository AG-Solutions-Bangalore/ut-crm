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
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { PAYMENT_BILLING_REF, PAYMENT_LIST } from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";

const PaymentForm = () => {
  const { message } = App.useApp();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [form] = Form.useForm();
  const { trigger: fetchPendingTrigger, loading: loadpendingBill } =
    useApiMutation();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [billingData, setBillingData] = useState(null);

  const [initialData, setInitialData] = useState({
    payment_from_id: null,
    payment_billing_ref: "",
    payment_billing_no: null,
    payment_date: null,
    payment_type: null,
    payment_transaction: "",
    payment_amount: "",
    payment_party_type: "",
  });
  const { mill, party, payment } = useMasterData({
    mill: isEditMode
      ? initialData.payment_party_type == "Paybles"
      : type === "Paybles",
    party: isEditMode
      ? initialData.payment_party_type != "Paybles"
      : type !== "Paybles",
    payment: true,
  });
  const resetForm = () => {
    form.resetFields();
  };

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
  const billingOptions =
    billingData?.map((item) => ({
      label: `B No : ${item.billing_no} Amt : ${item.balance}`,
      value: item.billing_no,
    })) || [];

  const handleChange = (bill_no) => {
    if (bill_no) {
      const Ref = billingData.find((m) => m.billing_no == bill_no);
      form.setFieldValue("payment_billing_ref", Ref?.billing_ref || "");
      form.setFieldValue("payment_amount", Ref?.balance || "");
    }
  };
  const handleMillChange = (id) => {
    if (id) {
      if (id) fetchPaymentBillingRef(id);
    }
  };
  const fetchPaymentBillingRef = async (millOrPartyId) => {
    try {
      const res = await fetchPendingTrigger({
        url: `${PAYMENT_BILLING_REF}/${millOrPartyId}/${
          isEditMode ? initialData?.payment_party_type : type
        }`,
      });
      if (res?.data) {
        setBillingData(res?.data);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load billing details.");
    }
  };
  useEffect(() => {
    if (isEditMode && initialData?.payment_from_id) {
      fetchPaymentBillingRef(initialData.payment_from_id);
    }
  }, [isEditMode, initialData?.payment_from_id]);
  const fetchBilling = async () => {
    try {
      const res = await fetchTrigger({ url: `${PAYMENT_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          payment_billing_no: Number(res.data.payment_billing_no),
          payment_date: res.data.payment_date
            ? dayjs(res.data.payment_date)
            : null,
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      message.error("Failed to load payment details.");
    }
  };

  useEffect(() => {
    if (id) fetchBilling();
    else resetForm();
  }, [id]);

  const handleSubmit = async (values) => {
    if (!(isEditMode ? initialData?.payment_party_type : type)) {
      message.error("Type is missing!");
      return;
    }

    if (!values?.payment_billing_ref) {
      message.error("Billing reference is missing!");
      return;
    }
    const payload = {
      ...values,
      payment_party_type: isEditMode
        ? initialData?.payment_party_type
        : type || "",
      payment_billing_ref: values?.payment_billing_ref || "",
      payment_date: values?.payment_date
        ? dayjs(values?.payment_date).format("YYYY-MM-DD")
        : null,
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${PAYMENT_LIST}/${id}` : PAYMENT_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Payment saved successfully!");
        await queryClient.invalidateQueries({ queryKey: ["payementdata"] });
        navigate("/payment");
      } else {
        message.error(res.message || "Failed to save Payment.");
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Error while saving Payment.");
    }
  };
  const dataloading =
    mill.loading || party.loading || payment.loading || fetchLoading;
  return (
    <>
      {dataloading ? (
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
                  ? `Update ${type ? type : "Payment"}`
                  : `Create ${type ? type : "Payment"}`}
              </h2>
            }
            extra={
              <div className="flex items-center gap-2">
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
            <Card size="small" className="!mt-2 !bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <Form.Item
                  label={
                    <span>
                      Payment From <span className="text-red-500">*</span>
                    </span>
                  }
                  name="payment_from_id"
                  rules={[{ required: true, message: "Select Payment From" }]}
                >
                  <Select
                    placeholder="Select Payment From"
                    options={
                      isEditMode
                        ? initialData?.payment_party_type === "Paybles"
                          ? millOptions
                          : partyOptions
                        : type === "Paybles"
                        ? millOptions
                        : partyOptions
                    }
                    onChange={handleMillChange}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    showSearch
                    allowClear
                    autoFocus
                  />
                </Form.Item>
                <Form.Item name="payment_billing_ref" hidden>
                  <Input type="hidden" />
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      Billing No <span className="text-red-500">*</span>
                    </span>
                  }
                  name="payment_billing_no"
                  rules={[{ required: true, message: "Select Billing No" }]}
                >
                  <Select
                    placeholder="Select Billing No"
                    options={billingOptions}
                    loading={loadpendingBill}
                    onChange={(value) => {
                      form.setFieldValue("payment_billing_no", value);
                      handleChange(value);
                    }}
                    filterOption={(input, option) =>
                      (option?.label ?? "")
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                    showSearch
                    allowClear
                  />{" "}
                  {isEditMode && (
                    <span>
                      Previous Bill No : {initialData?.payment_billing_no || ""}
                    </span>
                  )}
                </Form.Item>

                <Form.Item
                  name="payment_date"
                  label={
                    <span>
                      Payment Date<span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Select Payment Date" }]}
                >
                  <DatePicker className="w-full" format="DD-MM-YYYY" />
                </Form.Item>

                <Form.Item
                  name="payment_type"
                  label={
                    <span>
                      Payment Type<span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Select  Payment Type" }]}
                >
                  <Select
                    placeholder="Select  Payment Type"
                    options={
                      payment?.data?.data?.map((item) => ({
                        value: item.payment_mode,
                        label: item.payment_mode,
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
                  name="payment_amount"
                  label={
                    <span>
                      Payment Amount <span className="text-red-500">*</span>
                    </span>
                  }
                  rules={[{ required: true, message: "Enter  Payment Amount" }]}
                >
                  <InputNumber
                    type="number"
                    placeholder="Enter Amount"
                    className="!w-full"
                    min={1}
                  />
                </Form.Item>
              </div>
              <Form.Item name="payment_transaction" label="Payment Transaction">
                <Input.TextArea
                  placeholder="Enter Payment Transaction"
                  className="!w-full"
                />
              </Form.Item>
            </Card>
          </Card>
        </Form>
      )}
    </>
  );
};

export default PaymentForm;
