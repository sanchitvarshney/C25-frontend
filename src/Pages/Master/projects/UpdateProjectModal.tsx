import { useState, useEffect } from "react";
import { Drawer, Input, Button, Form } from "antd";
//@ts-ignore
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
//@ts-ignore
import Field from "../../../Components/Field";
//@ts-ignore
import { getBomOptions, getCostCentresOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "@/utils/general";
import useApi from "@/hooks/useApi";
//@ts-ignore
import { useToast } from "../../../hooks/useToast.js";

const UpdateProjectModal = ({
  data,
  setIsModalVisible,
  isModalVisible,
  onUpdate,
}: any) => {
  const [form] = Form.useForm();
  const { showToast } = useToast();
  const [isValid, setIsValid] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const descriptionValue = Form.useWatch("description", form);
  const qtyValue = Form.useWatch("qty", form);

  const [fgBomOptions, setFgBomOptions] = useState<any[]>([]);
  const [sfgBomOptions, setSfgBomOptions] = useState<any[]>([]);
  const [costCenterOptions, setCostCenterOptions] = useState<any[]>([]);

  const { executeFun } = useApi();

  const getRecipeType = (row: any) => {
    const label = String(row?.bom_type_label ?? "")
      .trim()
      .toLowerCase();
    if (label === "sfg") return "semi";
    if (label === "fg") return "default";
    return String(
      row?.bom_recipe_type ??
        row?.recipe_type ??
        row?.type ??
        row?.bom_recipe ??
        "",
    )
      .trim()
      .toLowerCase();
  };
  const isFgType = (type: string) =>
    ["default", "fg", "finished"].includes(type);
  const isSfgType = (type: string) =>
    ["semi", "sfg", "semi-fg", "semifg"].includes(type);
  const toSelectOptions = (rows: any[]) =>
    (rows ?? []).map((row: any) => ({
      text: row?.text ?? row?.subject_name ?? row?.name ?? "",
      value: row?.id ?? row?.subject_id ?? row?.value,
    }));

  const loadFgBomOptions = async (search: any) => {
    const response = await executeFun(
      () => getBomOptions(search, "default"),
      "select",
    );
    setFgBomOptions(response.success ? toSelectOptions(response.data) : []);
  };

  const loadSfgBomOptions = async (search: any) => {
    const response = await executeFun(
      () => getBomOptions(search, "semi"),
      "select",
    );
    setSfgBomOptions(response.success ? toSelectOptions(response.data) : []);
  };

  // Load Cost Center options
  const loadCostCenterOptions = async (search: any) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select",
    );
    if (response.success) {
      const options: any = convertSelectOptions(response.data);
      setCostCenterOptions(options);
    } else {
      setCostCenterOptions([]);
    }
  };

  const normalizeBomsForPrefill = (projectData: any) => {
    const raw = projectData?.bomSubject ?? projectData?.bom ?? null;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const parsed = list
      .map((item: any) => {
        // older rows may carry a plain BOM id/name instead of an object
        if (typeof item !== "object" || item === null) {
          return { type: "", value: item, label: String(item) };
        }
        return {
          type: getRecipeType(item),
          value: item?.subject_id ?? item?.id ?? item?.value ?? null,
          label:
            item?.display_text ??
            item?.subject_name ??
            item?.name ??
            item?.label ??
            item?.text ??
            "",
        };
      })
      .filter((row: any) => row.value !== null && row.value !== undefined);

    let fg = parsed.find((row: any) => isFgType(row.type));
    let sfg = parsed.find((row: any) => isSfgType(row.type));

    if (!fg && !sfg && parsed.length >= 2) {
      // Backend often sends [SFG, FG] when type is missing.
      fg = parsed[1];
      sfg = parsed[0];
    } else if (!fg && !sfg && parsed.length === 1) {
      fg = parsed[0];
    } else {
      if (!fg && sfg && parsed.length > 1) {
        fg = parsed.find(
          (row: any) => String(row.value) !== String(sfg?.value),
        );
      }
      if (!sfg && fg && parsed.length > 1) {
        sfg = parsed.find(
          (row: any) => String(row.value) !== String(fg?.value),
        );
      }
    }

    return { fg, sfg };
  };

  const normalizeCostCenterForPrefill = (costcenter: any) => {
    if (!costcenter) return null;
    if (typeof costcenter === "object") {
      return {
        value: costcenter.cost_center_key,
        label: costcenter.cost_center_name,
      };
    }
    return { value: costcenter, label: costcenter };
  };

  // Populate form when modal opens with selected project data
  useEffect(() => {
    if (data && isModalVisible) {
      const { fg, sfg } = normalizeBomsForPrefill(data);
      const costCenter = normalizeCostCenterForPrefill(data.costcenter);
      form.setFieldsValue({
        project: data.project,
        description: data.description || "",
        qty: data.qty || 1,
        fgBom: fg ? { value: fg.value, label: fg.label } : null,
        sfgBom: sfg ? { value: sfg.value, label: sfg.label } : null,
        costcenter: costCenter,
      });

      if (fg) setFgBomOptions([{ value: fg.value, text: fg.label }]);
      if (sfg) setSfgBomOptions([{ value: sfg.value, text: sfg.label }]);
      if (costCenter) {
        setCostCenterOptions([
          { value: costCenter.value, text: costCenter.label },
        ]);
      }
    }
  }, [data, isModalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    setFgBomOptions([]);
    setSfgBomOptions([]);
    setCostCenterOptions([]);
    setIsModalVisible(false);
    setIsValid(false);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then(async (values) => {
        setIsValid(false);
        const fgBomId = values?.fgBom?.value ?? values?.fgBom ?? null;
        const sfgBomId = values?.sfgBom?.value ?? values?.sfgBom ?? null;

        if (fgBomId && sfgBomId && String(fgBomId) === String(sfgBomId)) {
          showToast("FG and SFG BOM must be different", "error");
          return;
        }

        const updatedData = {
          project: values.project,
          description: values.description?.trim(),
          qty: values.qty ? Number(values.qty) : 0,
          bomSubject: [fgBomId ?? null, sfgBomId ?? null],
          costcenter: values.costcenter?.value ?? values.costcenter ?? null,
        };

        try {
          setSubmitLoading(true);
          await onUpdate(updatedData); // Send to parent
        } finally {
          setSubmitLoading(false);
        }
      })
      .catch((info) => {
        setIsValid(true);
      });
  };

  return (
    <Drawer
      title="Update Project"
      open={isModalVisible}
      onClose={handleCancel}
      width={600}
      placement="right"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button key="cancel" onClick={handleCancel} disabled={submitLoading}>
            Cancel
          </Button>
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmit}
            loading={submitLoading}
          >
            Update Project
          </Button>
        </div>
      }
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="project"
          label="Project ID"
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>

        <Field
          attr="required | Please enter project description"
          value={descriptionValue}
          showValidation={isValid}
        >
          <Form.Item
            name="description"
            label="Project Description"
            rules={[{ required: true, message: "" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter project name/description"
            />
          </Form.Item>
        </Field>

        <Field
          attr="required | Please enter Quantity"
          value={qtyValue}
          showValidation={isValid}
        >
          <Form.Item
            name="qty"
            label="Quantity"
            rules={[{ required: true, message: "" }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
        </Field>

        <Form.Item name="fgBom" label="FG BOM">
          <MyAsyncSelect
            placeholder="Search and select FG BOM..."
            loadOptions={loadFgBomOptions}
            optionsState={fgBomOptions}
            onBlur={() => setFgBomOptions([])}
            labelInValue={true}
            allowClear
          />
        </Form.Item>

        <Form.Item name="sfgBom" label="SFG BOM">
          <MyAsyncSelect
            placeholder="Search and select SFG BOM..."
            loadOptions={loadSfgBomOptions}
            optionsState={sfgBomOptions}
            onBlur={() => setSfgBomOptions([])}
            labelInValue={true}
            allowClear
          />
        </Form.Item>

        {/* Cost Center Field - Uses its own options */}
        <Form.Item name="costcenter" label="Cost Center">
          <MyAsyncSelect
            placeholder="Search and select Cost Center..."
            loadOptions={loadCostCenterOptions}
            optionsState={costCenterOptions}
            onBlur={() => setCostCenterOptions([])}
            labelInValue={true}
            allowClear
          />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default UpdateProjectModal;
