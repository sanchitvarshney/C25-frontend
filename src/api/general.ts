import { ResponseType, SelectOptionType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";
//@ts-ignore
import { imsAxios } from "../axiosInterceptor";
//@ts-ignore
import { getGlobalToast } from "../context/ToastContext";

export const uplaodFGFileInMINInward = async (formdata:any) => {
  try {
    const response = await imsAxios.post("fgMIN/upload/item", formdata);
    return response;
  } catch (error) {
    console.log("something happened wrong", error);
  }
};


export const getVendorOptions = async (search:any) => {
  
  try {
    const response = await imsAxios.post("/backend/vendorList", {
      search,
    });
    return response;
  } catch (error) {}
};
export const createJobWorkReq = async (finalObj: any) => {
  const showToast = getGlobalToast();
  try {
    const response = await imsAxios.post("/jobwork/createJobWorkReq", finalObj);
    if (response.code == 500) {
      showToast(response?.message?.msg, "error");
    }
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const saveJwMAterialIssue = async (finalObj: any) => {
  try {
    const response = await imsAxios.post(
      "/jobwork/save_jw_material_issue",
      finalObj,
    );
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const checkInvoiceforMIN = async (payload: any) => {
  try {
    const response = await imsAxios.post("/backend/checkInvoice", payload);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const poMINforMIN = async (final: any) => {
  try {
    const response = await imsAxios.post("/purchaseOrder/poMIN", final);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};

export const poMINforImport = async (final: any) => {
  try {
    const response = await imsAxios.post("/purchaseOthers/poMINImport", final);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const savefginward = async (final: any) => {
  try {
    const response = await imsAxios.post("/fgMIN/savefginward", final);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const getBomItem = async (finalObj: any) => {
  try {
    const response = await imsAxios.post("/jobwork/bom-items", finalObj);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const savejwsfinward = async (finalObj: any) => {
  try {
    const response = await imsAxios.post("/jobwork/savejwsfinward", finalObj);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const saveCreateChallan = async (final: any) => {
  try {
    const response = await imsAxios.post("/jobwork/saveCreateChallan", final);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const uplaodFileInJWReturn = async (formdata: any) => {
  try {
    const response = await imsAxios.post("/jobwork/upload/item ", formdata);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const uplaodFileInMINInward = async (formdata: any) => {
  try {
    const response = await imsAxios.post("transaction/upload/item", formdata);
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};

export const uploadPOExportFile = async (formdata: any) => {
  try {
    const response = await imsAxios.post(
      "purchaseOthers/uploadPoFile",
      formdata,
    );
    return response;
  } catch (error) {
    console.error("something happened wrong", error);
  }
};
export const getVendorBranchOptions = async (vendorCode: any) => {
  const response = await imsAxios.post("/backend/vendorBranchList", {
    vendorcode: vendorCode,
  });

  return response;
};
export const getVendorBranchDetails = async (
  vendorCode: any,
  branchCode: any,
) => {
  const response = await imsAxios.post("/backend/vendorAddress", {
    branchcode: branchCode,
    vendorcode: vendorCode,
  });
  return response;
};
export const getCostCentresOptions = async (search: any) => {
  const response = await imsAxios.get(`/backend/costcenter?search=${search}`);
  return response;
};

export const getBomOptions = async (search: any) => {
  const response = await imsAxios.post("/backend/bomRecipe", {
    search,
  });
  return response;
};

export const getUsersOptions = async (search: any) => {
  const response = await imsAxios.post("/backend/fetchAllUser", {
    search,
  });

  return response;
};

export const getBillingAddressDetails = async (addressCode: any) => {
  const response = await imsAxios.post("/backend/billingAddress", {
    billing_code: addressCode,
  });

  return response;
};
export const getBillingAddressOptions = async () => {
  const response = await imsAxios.post("/backend/billingAddressList", {
    search: "",
  });

  return response;
};

export const getShippingAddressOptions = async () => {
  const response = await imsAxios.post("/backend/shipingAddressList", {
    search: "",
  });

  return response;
};

export const getClientShippingOptions = async (search: any) => {
  const response = await imsAxios.post("/backend/shipingAddressList", {
    search,
  });

  return response;
};

export const getProjectOptions = async (search: any) => {
  const response = await imsAxios.post("/backend/poProjectName", {
    search,
  });

  let arr: any = [];
  arr = convertSelectOptions(response.data ?? []);
  response.data = arr;
  return response;
};

export const getProjectDetails = async (projectId: any) => {
  const response = await imsAxios.post("/backend/projectDescription", {
    project_name: projectId,
  });
  return response;
};

export const getComponentOptions = async (search: any) => {
  const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    search,
  });
  // console.error("response", response);
  return response;
};
export const updateAlternatePartCode = async (
  alternativeArr: any,
  basePartCode: any,
) => {
  const response = await imsAxios.post("/component/update_alt_part_no", {
    componentKey: basePartCode,
    alt_part_key: alternativeArr,
  });
  return response;
};
export const fetchLocations = async (search: any, type?: "sf") => {
  let url = "/backend/fetchLocation";
  switch (type) {
    case "sf":
      url = "/godown/fetchLocationForSF2SF_from";
      break;
  }
  const response = await imsAxios.post(url, {
    searchTerm: search,
  });

  return response;
};
export const getProductsOptions = async (search: string, sku?: boolean) => {
  let url;
  if (sku) {
    url = "/backend/fetchProduct";
  } else {
    url = "/backend/getProductByNameAndNo";
  }

  const response = await imsAxios.post(url, {
    search,
    searchTerm: search,
  });
  let arr: any = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }

  response.data = arr;

  return response;
};

///Query  6
export const getClosingStockForQuery6 = async (search: any) => {
  const response = await imsAxios.post(
    "/closing_stock/save_closing_stock_cif",
    {
      date: search,
    },
  );

  let arr = [];
  // if (response.success) arr = convertSelectOptions(response.data);
  // response.data = arr;
  return response;
};
export const getComponentDetail = async (componentKey: string, vendorCode: string) => {
  const response = await imsAxios.post("/component/getComponentDetailsByCode", {
    component_code: componentKey,
    vendorCode,
  });

  return response;
};

export const getMINOptions = async (search: any) => {
  const response = await imsAxios.post("/qrLabel/getMinsTransaction", {
    searchTerm: search,
  });

  let arr: any = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }
  response.data = arr;
  return response;
};

export const getFGMINOptions = async (search:any) => {
  const response = await imsAxios.post("/fgMinPrint/getFGMinsTransaction", {
    searchTerm: search,
  });

  let arr:any = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }
  response.data = arr;
  return response;
};

export const getHsnOptions = async (search: string) => {
  const response: ResponseType = await imsAxios.post("/backend/searchHsn", {
    searchTerm: search,
  });

  let arr: any = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }
  response.data = arr;
  return response;
};

export const getComponentStock = async (componentKey: string, type: "rm") => {
  if (type === "rm") {
  }
  const response = await imsAxios.post("/minBoxLablePrint/getComponetQty", {
    component: componentKey,
  });

  if (response.success) {
    response.data = response.data.stock;
  }

  return response;
};



export const getUserOptions = async (search: string) => {
  const response = await imsAxios.post("/backend/fetchAllUser", {
    search,
  });

  if (Array.isArray(response.data)) {
    response.data = convertSelectOptions(response.data);
  }

  return response;
};
export const getUomOptions = async () => {
  const response: ResponseType = await imsAxios.post("/uom/uomSelect2");

  response.data = convertSelectOptions(response.data ?? []);

  return response;
};
export const getPprOptions = async (search: string) => {
  const response = await imsAxios.post("/createqca/getPprNo", {
    searchTerm: search,
  });

  response.data = convertSelectOptions(response.data ?? []);

  return response;
};
export const deleteQcaRows = async (payload: any) => {
  const response = await imsAxios.post(
    "/createqca/delete_testing_data",
    payload,
  );

  response.data = convertSelectOptions(response.data ?? []);

  return response;
};
export const getComponentMfgCodeAndType = async (components: string[]) => {
  const response: ResponseType = await imsAxios.post("/backend/checkMPN", {
    search: components,
  });

  let arr: any = [];

  if (response.success) {
    arr = response.data.map((row: any) => ({
      mfgCode: row.manufacturingCode,
      category: row.category,
      key: row.componentKey,
    }));
  }

  response.data = arr;
  return response;
};

export const getComponenentAndProduct = async (search: string) => {
  const response: ResponseType = await imsAxios.post(
    "/backend/getFGRMByNameAndNo",
    {
      search,
      searchTerm: search,
    },
  );

  let arr: SelectOptionType[] = [];
  if (response.success) {
    arr = response.data.map((row: any) => ({
      text: row.text,
      value: row.id,
      type: row.type,
    }));
  }
  response.data = arr;

  return response;
};
