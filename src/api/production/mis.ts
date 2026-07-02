import { imsAxios } from "@/axiosInterceptor";
import { ResponseType } from "@/types/general";
import { convertSelectOptions } from "@/utils/general";
import { Row } from "antd";
import dayjs from "dayjs";

export const getDepartmentOptions = async (search: string) => {
  const response: ResponseType = await imsAxios.post("/backend/misDepartment", {
    search,
  });
  let arr: any = [];
  if (response.success) {
    arr = convertSelectOptions(response.data);
  }
  response.data = [];
  return response;
};

export const createEntry = async (values: any) => {
  const payload: any = {
    date: values.shifts.map((row:any) => row.date),
    code: values.shifts.map((row:any) => row.product),
    type: values.shifts.map((row:any) => row.productType),
    manPower: values.shifts.map((row:any) => row.manPower),
    lineNo: values.shifts.map((row:any) => row.lineCount),
    output: values.shifts.map((row:any) => row.output),
    remarks: values.shifts.map((row:any) => row.remarks ?? ""),
    shiftIn: values.shifts.map((row:any) => row.shiftHours[0].format("HH:mm")),
    shiftEnd: values.shifts.map((row:any) => row.shiftHours[1].format("HH:mm")),
    overTime: values.shifts.map((row:any) => row.overTime.format("HH:mm")),
    workHoursIn: values.shifts.map((row:any) =>
      row.workingTimings[0].format("HH:mm")
    ),
    workHoursEnd: values.shifts.map((row:any) =>
      row.workingTimings[1].format("HH:mm")
    ),
    department: values.department,
    shiftCode: values.shifts.map((row:any) => row.shiftLabel),
  };

  const response = await imsAxios.post("/production/mis/add", payload);
  return response;
};

export const createDepartment = async (name: string) => {
  const response: ResponseType = await imsAxios.post(
    "/production/mis/createDprt",
    {
      department: name,
    }
  );

  return response;
};

export const fetchShiftLabels = async () => {
  const response: ResponseType = await imsAxios.get(
    "/production/mis/shiftList"
  );

  let arr:any = [];
  if (response.success) {
    arr = convertSelectOptions(response.data, "name", "id");

    const final = {
      data: arr,
      raw: response.data,
    };
    response.data = final;
  }

  return response;
};

export const updateShiftLabels = async (id: string, range: any) => {
  const payload = {
    shift: id,
    start: dayjs(range[0]).format("HH:mm"),
    end: dayjs(range[1]).format("HH:mm"),
  };

  const response = await imsAxios.post(
    "/production/mis/updateShiftTime",
    payload
  );
  return response;
};
