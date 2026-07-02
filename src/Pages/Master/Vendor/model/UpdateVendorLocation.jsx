import  { useEffect, useState } from "react";
import { Button, Form, Modal } from "antd";
import MySelect from "../../../../Components/MySelect";
import { imsAxios } from "../../../../axiosInterceptor";
import { useToast } from "../../../../hooks/useToast";

const UpdateVendorLocation = ({ onClose, vendor, onSuccess }) => {
  const { showToast } = useToast();
  const [locationOptions, setLocationOptions] = useState([]);
  const [vendorLoc, setVendorLoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);

  const fetchLocationOptions = async () => {
    try {
      const res = await imsAxios.get("/vendor/getAllLocation");
      if (res?.success) {
        const arr = res?.data.map((row) => ({
          text: row.loc_name,
          value: row.location_key,
        }));
        setLocationOptions(arr);
      } else {
        setLocationOptions([]);
      }
    } catch (e) {
      setLocationOptions([]);
    }
  };

  const fetchCurrentVendorLoc = async () => {
    if (!vendor?.vendor_code) return;
    setFetchLoading(true);
    try {
      const { data: vendorData } = await imsAxios.post("/vendor/getVendor", {
        vendor_id: vendor.vendor_code,
      });

      const vendorRes = Array.isArray(vendorData)
        ? vendorData?.[0]
        : vendorData?.[0];
      if (vendorRes?.vendor_loc) {
        setVendorLoc(vendorRes.vendor_loc);
      } else {
        setVendorLoc("");
      }
    } catch (e) {
      setVendorLoc("");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    if (vendor) {
      fetchLocationOptions();
      fetchCurrentVendorLoc();
    } else if (!vendor) {
      setVendorLoc("");
    }
  }, [vendor]);

  const handleUpdate = async () => {
    if (!vendor?.vendor_code) {
      showToast("Vendor not selected", "error");
      return;
    }
    if (!vendorLoc) {
      showToast("Please select a vendor location", "error");
      return;
    }
    setLoading(true);
    try {
      const data = await imsAxios.put("/vendor/updateVendorLocation", {
        vendorcode: vendor.vendor_code,
        vendor_loc: vendorLoc,
      });
      if (data?.success) {
        showToast(data?.message ?? "Vendor location updated");
        onSuccess?.();
        onClose();
      } else {
        showToast(data?.message ?? "Failed to update vendor location", "error");
      }
    } catch (e) {
      showToast(
        e?.response?.data?.message ??
          e?.message ??
          "Failed to update vendor location",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Vendor Location"
      open={!!vendor}
      onCancel={onClose}
      width={480}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleUpdate}
          disabled={fetchLoading}
        >
          Update location
        </Button>,
      ]}
    >
      {vendor && (
        <Form layout="vertical" size="small">
          <Form.Item label="Vendor">
            <span>
              {vendor.vendor_name} ({vendor.vendor_code})
            </span>
          </Form.Item>
          <Form.Item label="Vendor Location" required>
            <MySelect
              placeholder="Select location"
              value={vendorLoc || undefined}
              options={locationOptions}
              onChange={(val) => setVendorLoc(val || "")}
              style={{ width: "100%" }}
              disabled={fetchLoading}
            />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default UpdateVendorLocation;
