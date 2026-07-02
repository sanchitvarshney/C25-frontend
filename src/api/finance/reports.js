import { imsAxios } from "../../axiosInterceptor";

export const getLedgerReport = async (vendorCode, dateRange) => {
  const response = await imsAxios.post("/tally/ledger/ledger_report", {
    date: dateRange,
    data: vendorCode,
  });

  let arr = [];
  let summary = {};

  if (response.success) {
    arr = response.data.rows.map((row, index) => ({
      id: index + 1,
      creditAmount: row.credit,
      debitAmount: row.debit,
      insertDate: row.insert_date,
      invoiceDate: row.invoice_date,
      invoiceNumber: row.invoice_no,
      moduleUsed: row.module_used,
      recoStatus: row.recoStatus,
      reference: row.ref,
      referenceDate: row.ref_date,
      whichModule: row.which_module,
    }));

    summary = {
      closing: response.data.summary.closing,
      opening: response.data.summary.opening,
      creditTotal: response.data.summary.total_credit,
      debitTotal: response.data.summary.total_debit,
    };
  }

  response.data = { rows: arr, summary: summary };

  return response;
};
