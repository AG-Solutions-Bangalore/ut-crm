import { App, Button, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { DELIVERY_LIST } from "../../../api";
import { useApiMutation } from "../../../hooks/useApiMutation";

const DeliveryForm = ({ id, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const isEditMode = Boolean(id);
  const [initialData, setInitialData] = useState({});

  const resetForm = () => form.resetFields();

  const fetchDelivery = async () => {
    try {
      const res = await fetchTrigger({ url: `${DELIVERY_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          delivery_status: res.data.delivery_status == "Active",
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      message.error("Failed to load Delivery details.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchDelivery();
    } else {
      resetForm();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      delivery_status: values?.delivery_status ? "Active" : "Inactive",
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${DELIVERY_LIST}/${id}` : DELIVERY_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Delivery saved successfully!");
        onSuccess?.();
        form.resetFields();
      } else {
        message.error(res.message || "Failed to save Delivery.");
      }
    } catch {
      message.error("Something went wrong while saving Delivery.");
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialData}
      requiredMark={false}
    >
      <Form.Item
        name="delivery"
        label={
          <span>
            Delivery <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Delivery name is required" }]}
      >
        <Input.TextArea
          maxLength={200}
          placeholder="Enter Delivery Details"
          autoSize={{ minRows: 2, maxRows: 4 }}
          autoFocus
        />
      </Form.Item>

      {isEditMode && (
        <Form.Item
          name="delivery_status"
          label="Status"
          rules={[{ required: true, message: "Please select status" }]}
        >
          <Select
            options={[
              { label: "Active", value: true },
              { label: "Inactive", value: false },
            ]}
            placeholder="Select Status"
          />
        </Form.Item>
      )}

      <div className="text-center mt-3">
        <Button
          type="primary"
          htmlType="submit"
          loading={submitLoading}
          className="w-full"
        >
          {isEditMode ? "Update" : "Create"}
        </Button>
      </div>
    </Form>
  );
};

export default DeliveryForm;
