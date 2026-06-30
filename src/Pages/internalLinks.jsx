import routeConstants from "../Routes/routeConstants";

const links = [
  // purchase order links
  [
    {
      routeName: "Home",
      routePath: "/",
      key: 0,
    },
    {
      routeName: "Procurement",
      routePath: "/dashboardProcurement",
      key: 0,
    },
  ],
  [
    {
      routeName: "Create PR",
      routePath: "/procurement/create",
      key: 0,
    },
    {
      routeName: "Requested PR",
      routePath: "/procurement/request",
      key: 0,
    },
    {
      routeName: "Manage",
      routePath: "/procurement/manage",
      key: 1,
    },
    {
      routeName: "Completed",
      routePath: "/procurement/completed",
      key: 2,
    },
    // {
    //   routeName: "Vendor Pricing",
    //   routePath: "/vendor-pricing",
    //   key: 3,
    // },
    {
      routeName: "Approval",
      routePath: "/procurement/approval",
      key: 4,
    },
  ],
  // accounts master links
  [
    {
      routeName: "Create Master",
      routePath: "/tally/create-master",
      key: 0,
    },
    {
      routeName: "Create Ledger",
      routePath: "/tally/ledger",
      key: 1,
    },
    {
      routeName: "Chart Of Accounts",
      routePath: "/tally/chart-accounts",
      key: 2,
    },
  ],
  // add new or nature of tds links
  [
    {
      routeName: "Add New TDS",
      routePath: "/tally/nature-tds",
      key: 0,
    },
  ],

  // add new or nature of tcs links
  [
    {
      routeName: "Add New TCS",
      routePath: "/tally/nature-tcs",
      key: 0,
    },
    {
      routeName: "Block TCS",
      routePath: "/tally/block-tcs",
      key: 0,
    },
  ],
  // ledger report links

  // VBT links
  [
    {
      routeName: "Purchase Register",
      routePath: "/tally/vendor-bill-posting/report",
      key: 0,
    },
    {
      routeName: "VBT1",
      routePath: "/tally/vendor-bill-posting/vb-1",
      key: 1,
      placeholder: "Purchase - Goods",
    },
    {
      routeName: "VBT2",
      routePath: "/tally/vendor-bill-posting/vb-2",
      key: 2,
      placeholder: "Services",
    },
    {
      routeName: "VBT3",
      routePath: "/tally/vendor-bill-posting/vb-3",
      key: 3,
      placeholder: "Import",
    },
    {
      routeName: "VBT4",
      routePath: "/tally/vendor-bill-posting/vb-4",
      key: 4,
      placeholder: "Fixed Assets",
    },
    {
      routeName: "VBT5",
      routePath: "/tally/vendor-bill-posting/vb-5",
      key: 5,
      placeholder: "Expenses",
    },
    {
      routeName: "VBT6",
      placeholder: "JobWork",
      routePath: "/tally/vendor-bill-posting/vb-6",
      key: 6,
    },
    {
      routeName: "VBT7",
      placeholder: "RCM",
      routePath: "/tally/vendor-bill-posting/vb-7",
      key: 6,
    },
  ],
  // JV links
  [
    {
      routeName: "JV Register",
      routePath: "/tally/journal-posting/report",
      key: 0,
    },
    {
      routeName: "Journal Voucher",
      routePath: "/tally/journal-posting",
      key: 1,
    },
    {
      routeName: "Journal Voucher (JV01)",
      routePath: "/tally/journal-posting/jv01",
      key: 2,
    },
  ],
  // contra links
  [
    {
      routeName: "Contra Register",
      routePath: "/tally/contra/report",
      key: 0,
    },
    {
      routeName: "Contra 1",
      routePath: "/tally/contra/1",
      key: 1,
      placeholder: "BANK TO CASH",
    },
    {
      routeName: "Contra 2",
      routePath: "/tally/contra/2",
      key: 2,
      placeholder: "CASH TO BANK",
    },
    {
      routeName: "Contra 3",
      routePath: "/tally/contra/3",
      key: 3,
      placeholder: "CASH TO CASH",
    },
    {
      routeName: "Contra 4",
      routePath: "/tally/contra/4",
      key: 4,
      placeholder: "BANK TO BANK",
    },
  ],
  // bank payment voucher links
  [
    {
      routeName: "Bank Payment Register",
      routePath: "/tally/vouchers/bank-payment/report",
      key: 0,
    },
    {
      routeName: "Bank Payment",
      routePath: "/tally/vouchers/bank-payment",
      key: 1,
    },
  ],
  // bank receipts voucer links
  [
    {
      routeName: "Bank Receipts Register",
      routePath: "/tally/vouchers/bank-receipts/report",
      key: 0,
    },

    {
      routeName: "Bank Reciepts",
      routePath: "/tally/vouchers/bank-receipts",
      key: 1,
    },
  ],
  // cash payment voucher links
  [
    {
      routeName: "Cash Payment Register",
      routePath: "/tally/vouchers/cash-payment/report",
      key: 0,
    },
    {
      routeName: "Cash Payment",
      routePath: "/tally/vouchers/cash-payment",
      key: 1,
    },
  ],
  // cash receipts voucer links
  [
    {
      routeName: "Cash Receipts Register",
      routePath: "/tally/vouchers/cash-receipts/report",
      key: 0,
    },

    {
      routeName: "Cash Reciepts",
      routePath: "/tally/vouchers/cash-receipt",
      key: 1,
    },
  ],
  // debit  vbt
  [
    {
      routeName: "Debit Note",
      routePath: "/tally/debit-note/create",
      key: 0,
    },
    {
      routeName: "Debit Register",
      routePath: "/tally/debit-note/report",
      key: 1,
    },
    {
      routeName: "Debit Register Without VBT",
      routePath: "/tally/debit-journal/report",
      key: 2,
    },
    {
      routeName: "Debit Centralized Register",
      routePath: "/tally/debit-journal/general-report",
      key: 3,
    },
  ],
  // legal
  [
    {
      routeName: "Add Agreement",
      routePath: "/legal/create-agreement",
    },
    {
      routeName: "View Agreement",
      routePath: "/legal/view-agreement",
    },
  ],
  [
    {
      routeName: "Add Party",
      routePath: "/legal/create-party",
    },
    {
      routeName: "Add Type of Agreement",
      routePath: "/legal/add-agreement-type",
    },
  ],
  // credit without vbt
  [
    {
      routeName: "Credit Voucher",
      routePath: "/tally/credit-journal-posting",
      key: 0,
    },
    {
      routeName: "Credit Register",
      routePath: "/tally/credit-journal/report",
      key: 1,
    },
  ],
  [
    {
      routeName: "VBT records",
      routePath: "/tally/vendor-bill-posting/vendor-bill-records",
    },
  ],
  // SKU costing
  [
    {
      routeName: "SKU Costing",
      routePath: "/dashboard/sku_costing",
    },
  ],
  // UOM links
  [{ routeName: "UoM", routePath: "/uom" }],
  [{ routeName: "Cost Center", routePath: "/masters/cost-center" }],
  // components links
  [
    { routeName: "Materials", routePath: "/material" },
    { routeName: "Services", routePath: "/services" },
    {
      routeName: "Component Category",
      routePath: "/master/component/category",
    },
    // {
    //   routeName: "StocKControl",
    //   routePath: "/stockControl",
    // },
  ],
  [
    {
      routeName: "Create Physical Stock",
      routePath: "/warehouse/physical/create",
    },
    {
      routeName: "Pending Physical Stock",
      routePath: "/warehouse/physical/pending",
    },
    {
      routeName: "Rejected Physical Stock",
      routePath: "/warehouse/physical/rejected",
    },
    {
      routeName: "View Physical Stock",
      routePath: "/warehouse/physical/view",
    },
  ],
  // product links
  [
    {
      routeName: "Product",
      routePath: "/masters/products/fg",
    },
    {
      routeName: "SFG Product",
      routePath: "/masters/products/sfg",
    },
    {
      routeName: "AddSKUOpeningRate",
      routePath: "/masters/sku-opening-rate",
    },
  ],
  // hsn map links
  [{ routeName: "HSN Map", routePath: "/hsn-map" }],
  // group links
  [
    { routeName: "Groups", routePath: "/group" },
    { routeName: "Sub Groups", routePath: "/sub-group" },
  ],

  [
    {
      routeName: "Billing Address",
      routePath: "/billing-address",
    },
    {
      routeName: "Shipping Address",
      routePath: "/shipping-address",
    },
  ],
  // create and manage BOM links
  [
    {
      routeName: "Create Bill of Material",
      routePath: "/master/bom/create-bom",
    },
    { routeName: "FG BOM", routePath: "/master/bom/manage-fg-bom" },
    {
      routeName: "SFG BOM",
      routePath: "/master/bom/manage-sfg-bom",
    },
    {
      routeName: "Disabled",
      routePath: "/master/bom/bom-disable-list",
    },
  ],
  // vendor master links
  [
    { routeName: "Vendor", routePath: "/vendor" },
    { routeName: "Add Vendor", routePath: "/create-vendor" },
  ],
  // MR approved transactionlinks
  [
    {
      routeName: "Pending MR(Approval)",
      routePath: "/transaction/approved-transaction",
    },
    {
      routeName: "Material Requisition Request",
      routePath: "/material-requisition-request",
    },
  ],
  // Create MIN links
  [
    {
      routeName: "Material In",
      routePath: "/warehouse/material-in",
    },
    {
      routeName: "Material In from PO",
      routePath: "/warehouse/material-in-po",
    },
    {
      routeName: "Material In FG/SFG",
      routePath: "/warehouse/material-in-product",
    },
    {
      routeName: "Import Material In from PO ",
      routePath: "/warehouse/export-material-in-po",
    },
  ],
  //QA link
  [
    { routeName: "Create Process", routePath: "/master/qa-process" },
    { routeName: "MAP", routePath: "/master/qa-process-map" },
  ],
  // edit and reverse MIN links
  // [
  //   { routeName: "Edit MIN", routePath: "/rm/update" },
  //   // { routeName: "Reverse MIN", routePath: "/reverse-min" },
  // ],
  // FG inward links
  [
    {
      routeName: "Completed Finish Goods",
      routePath: "/warehouse/fg/complete",
    },
    {
      routeName: "Pending ",
      routePath: "/warehouse/fg/pending",
    },
  ],
  // FG Out links
  [
    {
      routeName: "Create FG OUT",
      routePath: "/warehouse/fg-out/create",
    },
    { routeName: "View", routePath: "/warehouse/fg-out/view" },
  ],
  [
    {
      routeName: "Create FG Return",
      routePath: "/warehouse/fg-return/create",
    },
    { routeName: "Pending", routePath: "/warehouse/fg-return/pending" },
    { routeName: "Completed", routePath: "/warehouse/fg-return/completed" },
  ],
  // RM to RM transfer links
  [
    { routeName: "RM To RM", routePath: "/material-transfer/rm-to-rm" },
    // { routeName: "SF to Rej", routePath: "/sf-to-rm" },
    {
      routeName: "View Transaction",
      routePath: "/material-transfer/rm-to-rm/view-transaction",
    },
  ],
  [
    {
      routeName: "FG To FG",
      routePath: "/warehouse/material-transfer/fg-to-fg",
    },
    // { routeName: "SF to Rej", routePath: "/sf-to-rm" },
    {
      routeName: "View Transaction",
      routePath: "/warehouse/material-transfer/fg-to-fg/view-transaction",
    },
  ],
  // JW to JW transfer links
  [
    { routeName: "JW To JW", routePath: "/material-transfer/jw-to-jw" },
    {
      routeName: "View Transaction",
      routePath: "/material-transfer/jw-to-jw/view",
    },
  ],
  // RM to REJ links
  [
    { routeName: "RM To REJ", routePath: "/material-transfer/rm-to-rej" },
    {
      routeName: "View Transaction",
      routePath: "/material-transfer/rm-to-rej/view-transation",
    },
  ],
  // pending transfer links
  [
    {
      routeName: "Pending Transfer",
      routePath: "/material-transfer/pending-transfer",
    },
  ],
  // rejection links
  [
    {
      routeName: "Rejection",
      routePath: "/warehouse/rejection",
    },
  ],
  [
    {
      routeName: "Prod Return MIN",
      routePath: "/warehouse/prod-return-MIN",
    },
  ],
  // jobwork links
  [
    { routeName: "Create", routePath: "/warehouse/job-work/create" },
    {
      routeName: "Approval",
      routePath: "/warehouse/job-work/approval"
    },
    { routeName: "Analysis", routePath: "/warehouse/job-work/analysis" },
    { routeName: "RM Issue", routePath: "/warehouse/job-work/issue" },
    {
      routeName: "Issue Challan",
      routePath: "/warehouse/job-work/issue-challan",
    },
    {
      routeName: "RM Challan",
      routePath: "/warehouse/job-work/challan-list",
    },
    {
      routeName: "SF Inward",
      routePath: "/warehouse/job-work/inward",
    },
    {
      routeName: "RM Return",
      routePath: "/warehouse/job-work/return",
    },
    {
      routeName: "RM Consumption",
      routePath: "/warehouse/job-work/rm-consumption",
    },
    {
      routeName: "Completed",
      routePath: "/warehouse/job-work/completed",
    },
    // {
    //   routeName: "JW VENDOR PRICING",
    //   routePath: "/jw-vendor-pricing",
    // },
  ],
  // Jowbwork update
  [
    {
      routeName: "JW Update (Suppl.)",
      routePath: "/jobwork/update/supplementary",
    },
    {
      routeName: "JW Update (Rate)",
      routePath: "/jobwork/update/rate",
    },
  ],
  // jobwork vendor sfg min report
  [
    {
      routeName: "Jobwork SFG MIN",
      routePath: "/job-work/vendor/sfg/min",
    },
  ],
  // workorder links
  [
    { routeName: "CREATE", routePath: "/wo/create" },
    { routeName: "ANALYSIS", routePath: "/wo/analysis" },
    { routeName: "CREATE CHALLAN", routePath: "/wo/create-challan" },
    //
    { routeName: "SCRAPE CHALLAN", routePath: "/wo/create-scrape-challan" },
    { routeName: "SHIPMENT", routePath: "/wo/shipment" },
    { routeName: "VIEW CHALLAN", routePath: "/wo/view-challan" },
    { routeName: "COMPLETED", routePath: "/wocompleted" },
    //
    { routeName: "REPORT", routePath: "/woreport" },
    { routeName: "UPDATE SUPPLEMENTARY", routePath: "/wo/update/supplementary" },
  ],
  //branch transfer link
  [
    {
      routeName: "Branch Transfer",
      routePath: "/warehouse/branch-transfer/challan",
    },
    {
      routeName: "View",
      routePath: "/warehouse/branch-transfer/view",
    },
  ],
  // DC Links
  [
    {
      routeName: "Create DC",
      routePath: "/warehouse/dc/create",
      key: "0",
    },
    {
      routeName: "Manage",
      routePath: "/warehouse/dc/manage",
      key: "1",
    },
  ],
  // gatepass links
  [
    { routeName: "Create GP", routePath: "/warehouse/gp/create" },
    { routeName: "Manage", routePath: "/warehouse/gp/manage" },
  ],
  // physical stock
  // [
  //   {
  //     routeName: "Create Physical Stock",
  //     routePath: "/warehouse/physical/create",
  //   },
  //   {
  //     routeName: "Pending Physical Stock",
  //     routePath: "/warehouse/physical/pending",
  //   },
  //   {
  //     routeName: "Rejected Physical Stock",
  //     routePath: "/warehouse/physical/rejected",
  //   },
  //   {
  //     routeName: "View Physical Stock",
  //     routePath: "/warehouse/physical/view",
  //   },
  // ],
  // [
  //   {
  //     routeName: "Create ",
  //     routePath: "/production/physical-stock/create",
  //   },
  //   {
  //     routeName: "Pending",
  //     routePath: "/production/physical-stock/pending",
  //   },
  //   {
  //     routeName: "Rejected",
  //     routePath: "/production/physical-stock/rejected",
  //   },
  //   {
  //     routeName: "View",
  //     routePath: "/production/physical-stock/view",
  //   },
  // ],
  // part code conversion
  //
  [
    {
      routeName: "SF Part Code Conversion",
      routePath: "/warehouse/part-code-conversion",
    },

    // to be added
    {
      routeName: "RM Part Code Conversion",
      routePath: "/warehouse/rm-part-code-conversion",
    },
    {
      routeName: "Part Code Conversion Report",
      routePath: "/warehouse/part-code-conversion/report",
    },
  ],
  // MIN register

  [
    {
      routeName: "MIN Register",
      routePath: "/reports/transaction-in",
    },
    {
      routeName: "RM Issue Register",
      routePath: "/reports/transaction-out",
    },
    {
      routeName: "View Documents",
      routePath: "/reports/upload-document/view",
    },
    {
      routeName: "JW RM Consumption Report",
      routePath: "/jw-rm-consumption-report",
    },
  ],
  // reports r1-r14 links
  [
    {
      routeName: "R1",
      routePath: "/r1",
      placeholder: "Bom Wise RM Report",
    },
    {
      routeName: "R2",
      routePath: "/r2",
      placeholder: "PO Report",
    },
    {
      routeName: "R3",
      routePath: "/r3",
      placeholder: "Manufacturing Report",
    },
    {
      routeName: "R4",
      routePath: "/r4",
      placeholder: "Finished Goods In",
    },
    {
      routeName: "R5",
      routePath: "/r5",
      placeholder: "Finished Goods Stock ",
    },
    {
      routeName: "R6",
      routePath: "/r6",
      placeholder: "Date Wise RM Stock",
    },
    {
      routeName: "R7",
      routePath: "/r7",
      placeholder: "PPR Replenishment Report",
    },
    {
      routeName: "R8",
      routePath: "/r8",
      placeholder: "Detailed Production Report",
    },
    {
      routeName: "R9",
      routePath: "/r9",
      placeholder: "Location Wise BOM Report",
    },
    {
      routeName: "R10",
      routePath: "/r10",
      placeholder: "Location Wise Report",
    },
    {
      routeName: "R11",
      routePath: "/r11",
      placeholder: "Component CL Stock Report",
    },
    {
      routeName: "R12",
      routePath: "/r12",
      placeholder: "Required RM for FG",
    },
    {
      routeName: "R13",
      routePath: "/r13",
      placeholder: "Custom MIN Report",
    },
    {
      routeName: "R14",
      routePath: "/r14",
      placeholder: "RM Physical Report",
    },
    {
      routeName: "R15",
      routePath: "/r15",
      placeholder: "MIN Register",
    },
    {
      routeName: "R16",
      routePath: "/r16",
      placeholder: "RM Issue Register",
    },
    {
      routeName: "R17",
      routePath: "/r17",
      placeholder: "Vendor Wise JW Stock",
    },
    {
      routeName: "R18",
      routePath: "/r18",
      placeholder: "All Location Wise Stock Report",
    },
    {
      routeName: "R19",
      routePath: "/r19",
      placeholder: "MTD Report",
    },
    {
      routeName: "R20",
      routePath: "/r20",
      placeholder: "Inventory Evaluation",
    },
    {
      routeName: "R21",
      routePath: "/r21",
      placeholder: "Part Storage Location Report",
    },
    {
      routeName: "R22",
      routePath: "/r22",
      placeholder: "Branch Wise BOM Report",
    },
    {
      routeName: "R24",
      routePath: "/r24",
      placeholder: "BOM Component Report",
    },
    {
      routeName: "R25",
      routePath: "/r25",
      placeholder: "FG RM Requirement Report",
    },
    {
      routeName: "R26",
      routePath: "/r26",
      placeholder: "XML Report",
    },
    {
      routeName: "R27",
      routePath: "/r27",
      placeholder: "SFG STOCK",
    },
    //weekly report
    {
      routeName: "R28",
      routePath: "/r28",
      placeholder: "Weekly Audit Report",
    },
    {
      routeName: "R29",
      routePath: "/r29",
      placeholder: "BOM Wise SF Report",
    },
    {
      routeName: "R30",
      routePath: "/r30",

      placeholder: "Vendor Pending MIN Report",
    },
    {
      routeName: "R31",
      routePath: "/r31",

      placeholder: "Vendor RM Consumption Report",
    },

    {
      routeName: "R32",
      routePath: "/r32",

      placeholder: "Cost Center Transaction Report",
    },
    {
      routeName: "R33",
      routePath: "/r33",

      placeholder: "MIS Date Wise Report",
    },
    {
      routeName: "R34",
      routePath: "/r34",

      placeholder: "FG Return Report(NG)",
    },
    {
      routeName: "R35",
      routePath: "/r35",

      placeholder: "SKUs Raw Material transaction Reco",
    },
    {
      routeName: "R37",
      routePath: "/r37",

      placeholder: "Job Work Inventory Report",
    },
    {
      routeName: "R38",
      routePath: "/fg-register-report",

      placeholder: "FG Register Report",
    },
  ],
  // MIN label links

  [
    {
      routeName: "View and Print MIN Label",
      routePath: "/warehouse/print-view-min",
    },
    {
      routeName: "View and Print FG MIN",
      routePath: "/warehouse/print-view-fg-min",
    },
  ],
  // query reports
  [
    {
      routeName: "Q1",
      routePath: "/query/item-all-logs",
      placeholder: "Item Query (All)",
    },
    {
      routeName: "Q2",
      routePath: "/query/item-location-logs",
      placeholder: "Item Query (Loc Wise)",
    },
    {
      routeName: "Q3",
      routePath: "/query/sku-query",
      placeholder: "SKU Query",
    },
    {
      routeName: "Q4",
      routePath: "/query/ledger",
      placeholder: "Ledger's Query",
    },
    {
      routeName: "Q5",
      routePath: "/query/component-wise-stock",
      placeholder: "Component wise stock",
    },
    {
      routeName: "Q6",
      routePath: "/query/closing-stock",
      placeholder: "Closing stock",
    },
  ],
  // CPM Analysis
  [
    {
      routeName: "CPM",
      routePath: "/cpm/analysis",
      placeholder: "Client Project Management",
    },
    {
      routeName: "CPM Finance",
      routePath: "/cpm/reports",
    },
  ],
  // Paytm qc
  [
    // { routeName: "Paytm QC Upload", routePath: "/paytm-qc/upload", key: 0 },
    // { routeName: "Paytm QC Update", routePath: "/paytm-qc/update", key: 1 },
    {
      routeName: "Paytm QC Report",
      routePath: "/analysis/paytm-qc",
    },
  ],
  // Paytm refurbushment
  [
    {
      routeName: "Paytm Refurbishment",
      routePath: "/analysis/paytm-refurbishment",
    },
    {
      routeName: "Paytm MIN Register",
      routePath: "/analysis/paytm-refurbishment/register",
    },
  ],
  // PPR links
  [
    { routeName: "Create PPR", routePath: "/production-and-plan/create" },
    { routeName: "Pending", routePath: "/production-and-plan/pending" },
    {
      routeName: "Completed",
      routePath: "/production-and-plan/completed",
    },
  ],
  // Material Requisition links
  [
    {
      routeName: "Material Requisition with BOM",
      routePath: "/material-requisition/with-bom",
    },
    {
      routeName: "Material Requisition without BOM",
      routePath: "/material-requisition/with-out-bom",
    },
  ],
  // SF To REJ links
  [
    { routeName: "SF to REJ", routePath: "/location-movement/sf-to-rej" },
    {
      routeName: "View Transactions",
      routePath: "/location-movement/sf-to-rej/view",
    },
  ],
  // SF To SF links
  [
    { routeName: "SF to SF", routePath: "/location-movement/sf-to-sf" },
    {
      routeName: "View Transactions",
      routePath: "/location-movement/sf-to-sf/view",
    },
  ],

  // Create QC ALl
  [
    { routeName: "Print QCA Label", routePath: "/print-qc-label" },
    { routeName: "Check", routePath: "/qc/check" },
    { routeName: "Report", routePath: "/qca/report's" },
  ],
  // Create QC ALl
  [
    { routeName: "Create Sample", routePath: "/qca/sample" },
    {
      routeName: "Pending Sample",
      routePath: "/qca/pending",
    },
    {
      routeName: "Completed Sample",
      routePath: "/qca/completed",
    },
    { routeName: "QC Report", routePath: "/qca/report" },
  ],
  [
    {
      routeName: "JW Update Report",
      routePath: "/jw-update",
    },
  ],
  [{ routeName: "Location", routePath: "/location" }],
  // project master
  [
    {
      routeName: "Projects",
      routePath: "/master/reports/projects",
    },
  ],
  // reports Master
  [
    {
      routeName: "R19 MTD",
      routePath: "/master/reports/r19",
    },
  ],
  // clients
  [
    {
      routeName: "Client",
      routePath: "/tally/clients/add",
    },
    // {
    //   routeName: "View Client",
    //   routePath: "/tally/clients/view",
    // },
  ],
  // app reference setup
  [
    {
      routeName: "Ap Bill Setup",
      routePath: "/tally/vouchers/reference/setup",
    },
    {
      routeName: "Payment Setup",
      routePath: "/tally/vouchers/reference/payment",
    },
    {
      routeName: "Report",
      routePath: "/tally/vouchers/reference/report",
    },
    // {
    //   routeName: "Ap Vendor Report",
    //   routePath: "/tally/vouchers/reference/vendor-report",
    // },
    // {
    //   routeName: "Accounts Payable",
    //   routePath: "/tally/vouchers/reference/payable-report",
    // },
  ],
  //  Finance Reports
  [
    {
      routeName: "Trial Balance Report",
      routePath: "/tally/reports/trial-balance-report",
    },
    {
      routeName: "Balance Sheet",
      routePath: "/tally/reports/balance-sheet",
    },
    {
      routeName: "P & L Report",
      routePath: "/tally/reports/profitloss-report",
    },
    {
      routeName: "Day Book",
      routePath: "/tally/reports/day-book",
    },
    {
      routeName: "Ageing Report",
      routePath: "/tally/vouchers/reference/payable-report",
    },
    {
      routeName: "TDS Report",
      routePath: "/tally/vouchers/reference/tds-report",
    },
    {
      routeName: "GSTR Reports",
      routePath: "/tally/vouchers/reference/gst/report",
    },
    {
      routeName: "MIS Report",
      routePath: "/tally/vouchers/reference/mis-report",
    },
    {
      routeName: "Ledger Report",
      routePath: "/tally/ledger-report",
    },
  ],
  // // debit note
  // [
  //   {
  //     routeName: "Debit Note",
  //     routePath: "/tally/debit-note/create",
  //   },
  //   {
  //     routeName: "Debit Note Register",
  //     routePath: "/tally/debit-note/report",
  //   },
  // ],
  // sop module
  [
    {
      routeName: "SOP's",
      routePath: "/sop",
    },
  ],
  [
    {
      routeName: "Sales Register",
      routePath: "/sales-register",
    },
    {
      routeName: "Create Invoice",
      routePath: "/invoice/create",
    },
    {
      routeName: "Draft",
      routePath: "/draft-invoices",
    },
    {
      routeName: "Final",
      routePath: "/final-invoices",
    },
  ],
  // sales create
  [
    {
      routeName: "Create Sales Order",
      routePath: "/sales-order/create",
    },
    {
      routeName: "Register",
      routePath: "/sales-order/register",
    },
    {
      routeName: "Shipment",
      routePath: "/sales-order/shipments",
    },
    {
      routeName: "Challan",
      routePath: "/sales-order/challan",
    },
  ],
  // mes links
  [
    {
      routeName: "Create Process",
      routePath: "/mes/process/create",
    },
    {
      routeName: "Map Process",
      routePath: "/mes/process/map",
    },
  ],
  // gst reco
  [
    {
      routeName: "Add GST Data",
      routePath: "/add-gst-details",
    },
    {
      routeName: "Add Book Data",
      routePath: "/add-book-details",
    },
    {
      routeName: "Reconciled Details",
      routePath: "/view-reconciled",
    },
    {
      routeName: "Summary",
      routePath: "/view-summary",
    },
    {
      routeName: "View Book Data",
      routePath: "/view-book-data",
    },
    {
      routeName: "View GST Data",
      routePath: "/view-gst-data",
    },
  ],
  // vendor reco
  [
    {
      routeName: "Vendor Reconciliation",
      routePath: routeConstants.finance.vendor.reco.create,
    },
    {
      routeName: "View Reconciliations",
      routePath: routeConstants.finance.vendor.reco.report,
    },
  ],
  [
    {
      routeName: "Products",
      routePath: routeConstants.researchAndDevelopment.products.create,
    },
    {
      routeName: "Pending Approval List",
      routePath: routeConstants.researchAndDevelopment.products.approval,
    },
  ],
  // r&d
  [
    {
      routeName: "Create BOM",
      routePath: routeConstants.researchAndDevelopment.bom.create,
    },
    {
      routeName: "List",
      routePath: routeConstants.researchAndDevelopment.bom.list,
    },
    {
      routeName: "Drafts List",
      routePath: routeConstants.researchAndDevelopment.bom.drafts,
    },
  ],
  // task manager links
  [
    {
      routeName: "Tasks(Admin)",
      routePath: "/tasks/admin",
    },
    {
      routeName: "Tasks",
      routePath: "/tasks/user",
    },
  ],
  [
    {
      routeName: "Create Asset",
      routePath: "/assets/create",
    },
    {
      routeName: "View Asset",
      routePath: "/assets/view",
    },
    {
      routeName: "Depreciation",
      routePath: "/assets/depreciation",
    },
  ],
  // Production MIS links
  [
    {
      routeName: "Production MIS",
      routePath: "/production-ims",
    },
  ],
  // Version & Changelog
  [
    // {
    //   routeName: "Version Files",
    //   routePath: "/version/files",
    // },
    {
      routeName: "Changelog History",
      routePath: "/changelog/history",
    },
  ],
];
export default links;
