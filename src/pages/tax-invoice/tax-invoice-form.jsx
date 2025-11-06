import {
  DeleteOutlined,
  FileSearchOutlined,
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
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DELETE_ORDER_SUB, PURCHASE_ORDER_LIST } from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";
import { useSelector } from "react-redux";
import PendingBillsModal from "./pending-bill";

const TaxInvoiceForm = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const companystate = useSelector(
    (state) => state?.auth?.userDetails?.company_state?.toLowerCase() || ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMill, setSelectedMill] = useState(null);
  const { mill, taxinvoice } = useMasterData({
    mill: true,
    party: true,
    item: true,
    taxinvoice: true,
    shade: true,
    unit: true,
  });
  const millOptions =
    mill?.data?.data?.map((item) => ({
      label: item.mill_name,
      value: item.id,
      mill_state: item.mill_state,
    })) || [];

  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const { trigger: deleteTrigger } = useApiMutation();
  const [initialData, setInitialData] = useState({
    tax_invoice_date: null,
    tax_invoice_ref: "",
    tax_invoice_mill_id: null,
    tax_invoice_description: "",
    tax_invoice_discount: "",
    tax_invoice_sgst: "",
    tax_invoice_cgst: "",
    tax_invoice_igst: "",
    tax_invoice_hsn_code: "",
    tax_invoice_payment_terms: "",
  });
  const handleMillChange = (millId) => {
    taxinvoice.refetch();
    const selectedMill = millOptions.find((m) => m.value == millId);
    if (!selectedMill) {
      form.setFieldsValue({
        tax_invoice_sgst: 0,
        tax_invoice_cgst: 0,
        tax_invoice_igst: 0,
      });
      return;
    }
    const millState = selectedMill.mill_state?.toLowerCase() || "";

    if (millState == companystate) {
      form.setFieldsValue({
        tax_invoice_sgst: 9,
        tax_invoice_cgst: 9,
        tax_invoice_igst: 0,
      });
    } else {
      form.setFieldsValue({
        tax_invoice_sgst: 0,
        tax_invoice_cgst: 0,
        tax_invoice_igst: 18,
      });
    }
    if (taxinvoice?.data?.data) {
      form.setFieldValue("tax_invoice_ref", taxinvoice?.data?.data);
    }
  };

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

  const loading = fetchLoading || mill?.loading;

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
            <Card size="small" className="!mb-2 !bg-gray-50 ">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Form.Item
                  label={
                    <span>
                      Invoice Date <span className="text-red-500">*</span>
                    </span>
                  }
                  name="tax_invoice_date"
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
                  name="tax_invoice_mill_id"
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
                      Tax Invoice Ref <span className="text-red-500">*</span>
                    </span>
                  }
                  name="tax_invoice_ref"
                  rules={[
                    { required: true, message: "Enter reference number" },
                  ]}
                >
                  <Input readOnly value={taxinvoice?.data?.data} />
                </Form.Item>
                <Form.Item label="Discount" name="tax_invoice_discount">
                  <InputNumber min={1} className="!w-full" type="number" />
                </Form.Item>
                <div className="grid grid-cols-3 gap-4">
                  <Form.Item label="SGST" name="tax_invoice_sgst">
                    <InputNumber className="!w-full" readOnly />
                  </Form.Item>
                  <Form.Item label="CGST" name="tax_invoice_cgst">
                    <InputNumber className="!w-full" readOnly />
                  </Form.Item>
                  <Form.Item label="IGST" name="tax_invoice_igst">
                    <InputNumber className="!w-full" readOnly />
                  </Form.Item>
                </div>
                <Form.Item label="HSN Code" name="tax_invoice_hsn_code">
                  <Input />
                </Form.Item>
                <Form.Item
                  label="Payment Terms"
                  name="tax_invoice_payment_terms"
                >
                  <Input.TextArea rows={2} />
                </Form.Item>

                <Form.Item label="Description" name="tax_invoice_description">
                  <Input.TextArea rows={2} className="bg-gray-50" />
                </Form.Item>
              </div>
            </Card>
          </Card>
          <Button
            type="default"
            icon={<FileSearchOutlined />}
            onClick={() => {
              if (form.getFieldValue("tax_invoice_mill_id")) {
                setSelectedMill(form.getFieldValue("tax_invoice_mill_id"));
                setIsModalOpen(true);
              } else {
                message.warning("Please select a mill first");
              }
            }}
          >
            View Pending Bills
          </Button>
        </Form>
      )}
      <PendingBillsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        millId={selectedMill}
      />
    </>
  );
};

export default TaxInvoiceForm;
