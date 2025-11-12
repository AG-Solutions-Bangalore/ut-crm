import { App, Button, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { SHADE_LIST } from "../../../api";
import { useApiMutation } from "../../../hooks/useApiMutation";

const ShadeForm = ({ id, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const isEditMode = Boolean(id);
  const [initialData, setInitialData] = useState({});

  const resetForm = () => form.resetFields();

  const fetchShade = async () => {
    try {
      const res = await fetchTrigger({ url: `${SHADE_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          shade_status: res.data.shade_status == "Active",
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      message.error("Failed to load Shade details.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchShade();
    } else {
      resetForm();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      shade_status: values?.shade_status ? "Active" : "Inactive",
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${SHADE_LIST}/${id}` : SHADE_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Shade saved successfully!");
        onSuccess?.();
        form.resetFields();
      } else {
        message.error(res.message || "Failed to save Shade.");
      }
    } catch {
      message.error("Something went wrong while saving Shade.");
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
        name="shade"
        label={
          <span>
            Shade <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Shade name is required" }]}
      >
        <Input.TextArea
          maxLength={10}
          placeholder="Enter Shade Details"
          autoFocus
        />
      </Form.Item>

      {isEditMode && (
        <Form.Item
          name="shade_status"
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

export default ShadeForm;
