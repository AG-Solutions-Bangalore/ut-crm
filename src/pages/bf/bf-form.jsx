import { App, Button, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { BF_LIST } from "../../api";
import { useApiMutation } from "../../hooks/useApiMutation";

const BFForm = ({ id, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const isEditMode = Boolean(id);
  const [initialData, setInitialData] = useState({});

  const resetForm = () => form.resetFields();

  const fetchBf = async () => {
    try {
      const res = await fetchTrigger({ url: `${BF_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          bf_status: res.data.bf_status == "Active",
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      message.error("Failed to load BF details.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchBf();
    } else {
      resetForm();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      bf_status: values?.bf_status ? "Active" : "Inactive",
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${BF_LIST}/${id}` : BF_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "BF saved successfully!");
        onSuccess?.();
        form.resetFields();
      } else {
        message.error(res.message || "Failed to save BF.");
      }
    } catch {
      message.error("Something went wrong while saving BF.");
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
        name="bf"
        label={
          <span>
            BF <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "BF name is required" }]}
      >
        <Input maxLength={50} placeholder="Enter BF" autoFocus />
      </Form.Item>

      {isEditMode && (
        <Form.Item
          name="bf_status"
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

export default BFForm;
