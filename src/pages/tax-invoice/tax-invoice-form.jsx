import { DeleteOutlined, FileSearchOutlined } from "@ant-design/icons";
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
} from "antd";
import { useWatch } from "antd/es/form/Form";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { TAX_INVOICE_LIST, TAX_INVOICE_SUB_DELETE } from "../../api";
import { useMasterData } from "../../hooks";
import { useApiMutation } from "../../hooks/useApiMutation";
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
  const [bills, setBills] = useState([]);
  const [selectedBills, setSelectedBills] = useState([]);
  const selectedMillId = useWatch("tax_invoice_mill_id", form);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMill, setSelectedMill] = useState(null);
  console.log(selectedBills, "selectedBillsform");
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
    tax_invoice_hsn_code: "996111",
    tax_invoice_payment_terms: "",
    tax_invoice_type: null,
  });
  const handleMillChange = (millId) => {
    taxinvoice.refetch();
    setSelectedBills([]);
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
        url: `${TAX_INVOICE_LIST}/${id}`,
      });
      if (res?.data) {
        const formattedData = {
          ...res.data,

          tax_invoice_date: res.data.tax_invoice_date
            ? dayjs(res.data.tax_invoice_date)
            : null,
        };
        setSelectedMill(res?.mill || null);
        setInitialData(formattedData);
        // setSelectedBills(formattedData.subs || []);
        form.setFieldsValue(formattedData);

        if (formattedData.subs?.length) {
          const normalized = formattedData.subs.map((b) => ({
            id: b.id || b.id,
            billing_ref: b.tax_invoice_sub_billing_ref,
            purchase_date: b.tax_invoice_sub_purchase_date || null,
            billing_tones: b.tax_invoice_sub_tones || "",
            billing_bf: b.tax_invoice_sub_bf || "",
            purchase_rate: b.tax_invoice_sub_purchase_rate || "",
            sale_rate: b.tax_invoice_sub_sale_rate || "",
            rate_diff: b.tax_invoice_sub_rate_diff || "",
            billing_commn: b.tax_invoice_sub_commn || "",
            billing_mill_id: b.tax_invoice_sub_mill_id || "",
            billing_party_id: b.tax_invoice_sub_party_id || null,
          }));

          setSelectedBills(normalized);
        } else {
          setSelectedBills([]);
        }
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
    const subsdata = selectedBills.map((bill) => ({
      id: isEditMode ? bill.id : null,
      tax_invoice_sub_billing_ref: bill.billing_ref,

      tax_invoice_sub_purchase_date: bill.purchase_date,

      tax_invoice_sub_tones: bill.billing_tones,

      tax_invoice_sub_bf: bill.billing_bf,

      tax_invoice_sub_sale_rate: bill.sale_rate,

      tax_invoice_sub_purchase_rate: bill.purchase_rate,

      tax_invoice_sub_rate_diff: bill.rate_diff,

      tax_invoice_sub_commn: bill.billing_commn,

      tax_invoice_sub_mill_id: bill.billing_mill_id,

      tax_invoice_sub_party_id: bill.billing_party_id,
    }));
    const data = {
      tax_invoice_date: values?.tax_invoice_date || null,
      tax_invoice_ref: values?.tax_invoice_ref || "",
      tax_invoice_mill_id: values?.tax_invoice_mill_id || null,
      tax_invoice_description: values?.tax_invoice_description || "",
      tax_invoice_discount: values?.tax_invoice_discount || 0,
      tax_invoice_sgst: values?.tax_invoice_sgst || 0,
      tax_invoice_cgst: values?.tax_invoice_cgst || 0,
      tax_invoice_igst: values?.tax_invoice_igst || 0,
      tax_invoice_hsn_code: values?.tax_invoice_hsn_code || "",
      tax_invoice_payment_terms: values?.tax_invoice_payment_terms || "",
      tax_invoice_type: values?.tax_invoice_type || "",
    };

    const payload = {
      ...data,
      tax_invoice_date: values.tax_invoice_date
        ? dayjs(values.tax_invoice_date).format("YYYY-MM-DD")
        : null,
      subs: subsdata,
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${TAX_INVOICE_LIST}/${id}` : TAX_INVOICE_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code == 201) {
        message.success(res.message || "Tax data saved successfully!");
        await queryClient.invalidateQueries({ queryKey: ["taxinvoicedata"] });
        navigate("/tax-invoice");
      } else {
        message.error(res.message || "Failed to save Tax data.");
      }
    } catch (error) {
      console.error(error);
      message.error(error?.message || "Error while saving Tax data.");
    }
  };
  const handleDelete = async (subId) => {
    if (!subId) {
      message.error("Invalid sub-item ID.");
      return;
    }

    try {
      const res = await deleteTrigger({
        url: `${TAX_INVOICE_SUB_DELETE}/${subId}`,
        method: "delete",
      });

      if (res?.code == 201) {
        message.success(res?.message || "Sub-item deleted successfully!");
        // fetchPurchase();
      } else {
        message.error(res?.message || "Failed to delete sub-item.");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error?.message || "Error while deleting sub-item.");
    }
  };

  const loading = fetchLoading || mill?.loading;
  console.log(selectedBills, "selectedBills");
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
                {isEditMode ? "Update Tax Invoice" : "Create Tax Invoice"}
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
                      Type <span className="text-red-500">*</span>
                    </span>
                  }
                  name="tax_invoice_type"
                  rules={[{ required: true, message: "Select Type" }]}
                >
                  <Select
                    placeholder="Select Type"
                    options={["COM", "COD"].map((item) => ({
                      label: item,
                      value: item,
                    }))}
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
                <Form.Item label="Discount " name="tax_invoice_discount">
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
            {selectedMillId && (
              <div className="flex justify-end !my-2">
                <Button
                  type="default"
                  icon={<FileSearchOutlined />}
                  onClick={() => {
                    const millId = form.getFieldValue("tax_invoice_mill_id");
                    if (millId) {
                      setSelectedMill(millId);
                      setIsModalOpen(true);
                    } else {
                      message.warning("Please select a mill first");
                    }
                  }}
                >
                  View Pending Bills
                </Button>
              </div>
            )}

            {selectedBills.length > 0 && (
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-100 text-gray-700 font-medium border-b">
                  <tr>
                    <th className="p-1 border border-gray-200">Purch Date</th>
                    <th className="p-1 border border-gray-200">Billing Tons</th>
                    <th className="p-1 border border-gray-200">Item</th>
                    <th className="p-1 border border-gray-200">
                      Purchase Rate
                    </th>
                    <th className="p-1 border border-gray-200">Sale Rate</th>
                    <th className="p-1 border border-gray-200">Rate Diff</th>
                    <th className="p-1 border border-gray-200">Commission</th>

                    {isEditMode && (
                      <th className="p-1 border border-gray-200 text-center">
                        Action
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {selectedBills?.map((bill) => (
                    <tr key={bill.billing_ref} className="hover:bg-gray-50">
                      <td className="p-1 border border-gray-200">
                        {dayjs(bill.purchase_date).format("DD-MM-YYYY")}
                      </td>

                      <td className="p-1 border border-gray-200 text-right">
                        {bill.billing_tones || ""}
                      </td>

                      <td className="p-1 border border-gray-200">
                        {bill.billing_bf || ""}
                      </td>

                      <td className="p-1 border border-gray-200 text-right">
                        {bill.purchase_rate || ""}
                      </td>

                      <td className="p-1 border border-gray-200 text-right">
                        {bill.sale_rate || ""}
                      </td>

                      <td className="p-1 border border-gray-200 text-right">
                        {bill.rate_diff || ""}
                      </td>

                      <td className="p-1 border border-gray-200 text-right">
                        {bill.billing_commn || ""}
                      </td>

                      <td className="border border-gray-200 text-center">
                        {bill.id && (
                          <Popconfirm
                            title="Are you sure to delete this bill?"
                            onConfirm={() => handleDelete(bill.id)}
                            okText="Yes"
                            cancelText="No"
                            disabled={selectedBills.length <= 1}
                          >
                            <Button
                              icon={<DeleteOutlined />}
                              type="text"
                              danger
                              disabled={selectedBills.length <= 1}
                            />
                          </Popconfirm>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </Form>
      )}
      {isModalOpen && (
        <PendingBillsModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          millId={selectedMill}
          selectedBills={selectedBills}
          setSelectedBills={setSelectedBills}
          setBills={setBills}
          bills={bills}
          isEditMode={isEditMode}
          handleDelete={handleDelete}
        />
      )}
    </>
  );
};

export default TaxInvoiceForm;
