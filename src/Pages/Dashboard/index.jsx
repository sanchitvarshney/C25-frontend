import { useState } from "react";
import { Col, Row } from "antd";
import SummarySection from "./SummarySection";
import Section3 from "./Section3";
import { imsAxios } from "../../axiosInterceptor";
import { useEffect } from "react";
import { useToast } from "../../hooks/useToast.js";
import MINSummary from "./MINSummary";
import MyDatePicker from "../../Components/MyDatePicker";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { showToast } = useToast();
  const [summaryDate, setSummaryDate] = useState("");
 const { user } = useSelector(
    (state) => state.login
  );
  

  const [transactionSummary, setTransactionSummary] = useState([
    {
      title: "Rejection",
      date: "",
      value: "",
    },
    {
      title: "MFG",
      date: "",
      value: "",
    },
    {
      title: "Consumption",
      date: "",
      value: "",
      // link: "/transaction-In",
    },
    {
      title: "Purchase Orders",
      value: "",
      link: "/procurement/manage",
    },
  ]);
  const [pendingTransactionSummary, setPendingTransactionSummary] = useState([
    {
      title: "Pending PO",
      value: "",
    },
    {
      title: "Pending JW PO",
      value: "",
    },
    {
      title: "Pending PPR",
      value: "",
      // link: "/transaction-In",
    },
    {
      title: "Pending FG",
      value: "",
      link: "/procurement/manage",
    },
    {
      title: "Pending MR Approval",
      value: "",
      link: "/procurement/manage",
    },
  ]);
  const [masterSummary, setMasterSummary] = useState([
    {
      title: "Components",
      value: "",
      date: "",
      link: "/material",
    },
    {
      title: "Products",
      value: "",
      date: "",
      link: "/masters/products/fg",
    },
    {
      title: "Projects",
      value: "",
      date: "",
      link: "/master/reports/projects",
    },
    {
      title: "Vendors",
      value: "",
      date: "",
      link: "/vendor",
    },
  ]);
  const [gatePassSummary, setGatePassSummary] = useState([
    {
      title: "Gatepass",
      value: "",
      date: "",
    },
    {
      title: "RGP",
      value: "",
      date: "",
    },
    {
      title: "NRGP",
      value: "",
      date: "",
    },
    {
      title: "Challan",
      value: "",
    },
  ]);
  const [minSummary, setMINSummary] = useState([
    {
      title: "PO MIN",
      value: "",
      date: "",
      key: "poMin",
    },
    {
      title: "Without PO MIN",
      value: "",
      date: "",
      key: "withoutPoMin",
    },
    {
      title: "JW MIN",
      value: "",
      date: "",
      key: "jwMin",
    },
  ]);
  const [mfgProducts, setMfgProductSummary] = useState([]);
  const [loading, setLoading] = useState({
    master: true,
    transactions: true,
    gatePass: true,
    min: true,
    pendingSummary: true,
  });

  const gettingDateSummary = async (transactionType, date) => {
    try {
      let params =
        transactionType === "transactions"
          ? "transaction"
          : transactionType === "gatePass"
          ? "GP"
          : transactionType === "min" && "MIN";
      setLoading((curr) => ({
        ...curr,
        [transactionType]: true,
      }));
      const response = await imsAxios.post(
        `/tranCount/transaction_counts/${params}`,
        {
          data: date,
        }
      );
      const  data  = response?.data;
     
        if (response.success) {
          if (transactionType === "transactions") {
            setTransactionSummary([
              {
                title: "Rejection",
                value: data.totalRejection,
                date: data.data.lastRejection,
              },
              {
                title: "MFG",
                value: data.totalMFG,
                date: data.lastMFG,
              },
              {
                title: "Consumption",
                value: data.totalConsumption,
                date: data.lastConsumption,
                // link: "/transaction-In",
              },
              {
                title: "Purchase Orders",
                value: data.totalPO,
                date: data.lastPO,
                link: "/procurement/manage",
              },
            ]);
          } else if (transactionType === "gatePass") {
            setGatePassSummary([
              {
                title: "Gatepass",

                value: data.totalGatePass,
              },
              {
                title: "RGP",
                date: data.lastRGP,
                value: data.totalRGP,
              },
              {
                title: "NRGP",
                date: data.lastNRGP,
                value: data.totalNRGP,
              },
              {
                title: "Challan",
                date: data.lastDCchallan,
                value: data.totalRGP_DCchallan,
              },
            ]);
          } else if (transactionType === "min") {
            setMINSummary([
              {
                title: "PO MIN",
                date: data.lastMin,
                value: data.totalPOMin,
              },
              {
                title: "Without PO MIN",
                date: data.lastNormalMin,
                value: data.totalNormalMIN,
              },

              {
                title: "JW MIN",
                date: data.lastJWMin,
                value: data.totalJWMin,
                key: "jwMin",
              },
            ]);
          }
        }
   
    } catch (error) {
      showToast(error.message || error, "error");
    } finally {
      setLoading((curr) => ({
        ...curr,
        [transactionType]: false,
      }));
    }
  };
  const getMasterSummary = async () => {
    try {
      setLoading((curr) => ({
        ...curr,
        master: true,
      }));
      const response = await imsAxios.post("/tranCount/master_counts");
      const  data  = response?.data;
      if (data) {
        if (response.success) {
          setMasterSummary([
            {
              title: "Components",
              value: data.totalComponents,
              date: data.lastComponent,
              link: "/material",
            },
            {
              title: "Products",
              value: data.totalProducts,
              date: data.lastProduct,
              link: "/masters/products/fg",
            },
            {
              title: "Projects",
              date: data.lastProject,
              value: data.totalProjects,
              link: "/master/reports/projects",
            },
            {
              title: "Vendors",
              date: data.lastVendor,
              value: data.totalVendors,
              link: "/vendor",
            },
          ]);
        } else {
          showToast(response.message || response.message, "error");
        }
      }
    } catch (error) {
      showToast(error.message || error, "error");
    } finally {
      setLoading((curr) => ({
        ...curr,
        master: false,
      }));
    }
  };

  const getMfgProducts = async (date) => {
    try {
      setLoading((curr) => ({
        ...curr,
        master: true,
      }));
      const response = await imsAxios.post("/tranCount/top_mfg_products", {
        data: date,
      });
      const  data  = response?.data;
      if (data) {
        if (response.success) {
          const arr = data.topProducts.map((item) => ({
            sku: item.productSku,
            qty: item.totalmfgQuantity,
            product: item.productName,
          }));

          setMfgProductSummary(arr);
        } else {
          showToast(response.message || response.message, "error");
        }
      }
    } catch (error) {
      showToast(error.message || error, "error");
    } finally {
      setLoading((curr) => ({
        ...curr,
        master: false,
      }));
    }
  };
  const gettingPendingTransaction = async (date) => {
    try {
      setLoading((curr) => ({
        ...curr,
        pendingSummary: true,
      }));
      const response = await imsAxios.post("/tranCount/pending_counts", {
        data: date,
      });
      const  data  = response?.data;
      if (data) {
        if (response.success) {
          setPendingTransactionSummary([
            {
              title: "Pending PO",
              value: data.pendingPO,
            },
            {
              title: "Pending JW PO",
              value: data.pendingJW_PO,
            },
            {
              title: "Pending PPR",
              value: data.pendingPPR,
              // link: "/transaction-In",
            },
            {
              title: "Pending FG",
              value: data.pendingFG,
              // link: "/procurement/manage",
            },
            {
              title: "Pending MR Approval",
              value: data.pendingMRapproval,
              // link: "/procurement/manage",
            },
          ]);
        } else {
          showToast(response.message || response.message, "error");
        }
      }
    } catch (error) {
      showToast(error.message || error, "error");
    } finally {
      setLoading((curr) => ({
        ...curr,
        pendingSummary: false,
      }));
    }
  };
  useEffect(() => {
    if (summaryDate && summaryDate.split("-").length > 2) {
      gettingDateSummary("transactions", summaryDate);
      gettingDateSummary("gatePass", summaryDate);
      gettingDateSummary("min", summaryDate);
      gettingPendingTransaction(summaryDate);
      getMfgProducts(summaryDate);
    }
  }, [summaryDate]);

  useEffect(() => {
    if (!user) {
      return;
    }
    getMasterSummary();
  }, [user]);
  return (
    <Row  style={{ padding: 20 }}>
      <Col span={22}>
        <Row gutter={[6, 12]}>
          <Col>
            <MyDatePicker setDateRange={setSummaryDate} startingDate={true} />
          </Col>
          <SummarySection
            title="Master Summary"
            summary={masterSummary}
            loading={loading["master"]}
          />
          <SummarySection
            title="Transactions Summary"
            summary={transactionSummary}
            loading={loading["transactions"]}
          />
          <Section3
            columns={mfgProductColumns}
            rows={mfgProducts}
            title="Most MFG Products"
          />
          <MINSummary minSummary={minSummary} loading={loading["min"]} />
          <SummarySection
            title="Pending Transactions Summary"
            subTitle="(Stats not dependant on selected date range)"
            summary={pendingTransactionSummary}
            loading={loading["pendingSummary"]}
          />
          <SummarySection
            title="Gate Pass Summary"
            summary={gatePassSummary}
            loading={loading["gatePass"]}
          />
        </Row>
      </Col>
    </Row>
  );
};

export default Dashboard;

const mfgProductColumns = [
  { headerName: "Product", field: "product" },
  { headerName: "SKU", field: "sku" },
  { headerName: "MFG Qty", field: "qty" },
];
