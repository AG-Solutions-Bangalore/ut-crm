import { App, Button, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import { UNIT_LIST } from "../../../api";
import { useApiMutation } from "../../../hooks/useApiMutation";

const UnitForm = ({ id, onSuccess }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const { trigger: fetchTrigger, loading: fetchLoading } = useApiMutation();
  const { trigger: submitTrigger, loading: submitLoading } = useApiMutation();
  const isEditMode = Boolean(id);
  const [initialData, setInitialData] = useState({});

  const resetForm = () => form.resetFields();

  const fetchUnit = async () => {
    try {
      const res = await fetchTrigger({ url: `${UNIT_LIST}/${id}` });
      if (res?.data) {
        const formattedData = {
          ...res.data,
          unit_status: res.data.unit_status == "Active",
        };
        setInitialData(formattedData);
        form.setFieldsValue(formattedData);
      }
    } catch (err) {
      message.error("Failed to load Unit details.");
    }
  };

  useEffect(() => {
    if (id) {
      fetchUnit();
    } else {
      resetForm();
    }
  }, [id]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      unit_status: values?.unit_status ? "Active" : "Inactive",
    };

    try {
      const res = await submitTrigger({
        url: isEditMode ? `${UNIT_LIST}/${id}` : UNIT_LIST,
        method: isEditMode ? "put" : "post",
        data: payload,
      });

      if (res.code === 201) {
        message.success(res.message || "Unit saved successfully!");
        onSuccess?.();
        form.resetFields();
      } else {
        message.error(res.message || "Failed to save Unit.");
      }
    } catch {
      message.error("Something went wrong while saving Unit.");
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
        name="unit"
        label={
          <span>
            Unit <span className="text-red-500">*</span>
          </span>
        }
        rules={[{ required: true, message: "Unit name is required" }]}
      >
        <Input
          maxLength={10}
          placeholder="Enter Unit Details"
          autoSize={{ minRows: 2, maxRows: 4 }}
          autoFocus
        />
      </Form.Item>

      {isEditMode && (
        <Form.Item
          name="unit_status"
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

export default UnitForm;
