import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

/* ------------------------------------------
   Registration Count API
------------------------------------------ */
export const countRegistrations = async (file, startDate, endDate) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    const response = await axios.post(
      `${API_BASE}/registrations/count`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Registration count error:", error);
    throw error;
  }
};

/* ------------------------------------------
   Lottery Last Purchase Time API
------------------------------------------ */
export const getLastPurchaseTime = async (zipFile, filterDate) => {
  try {
    const formData = new FormData();
    formData.append("zip_file", zipFile);
    formData.append("filter_date", filterDate);

    const response = await axios.post(
      `${API_BASE}/lottery/last-purchase-time`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Last purchase time error:", error);
    throw error;
  }
};

/* ------------------------------------------
   Monthly Activation Count API
------------------------------------------ */
export const getMonthlyActivations = async (
  file,
  startDate = null,
  endDate = null,
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (startDate) formData.append("start_date", startDate);
    if (endDate) formData.append("end_date", endDate);

    const response = await axios.post(
      `${API_BASE}/registrations/monthly-activations`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Monthly activation error:", error);
    throw error;
  }
};

export const getReconciliationSummary = async (zipFile) => {
  try {
    const formData = new FormData();
    formData.append("zip_file", zipFile);

    const response = await axios.post(
      `${API_BASE}/reconciliation/summary`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Reconciliation summary error:", error);
    throw error;
  }
};

export const getSummery = async (zipFile) => {
  try {
    const formData = new FormData();
    formData.append("zip_file", zipFile);

    const response = await axios.post(`${API_BASE}/summary`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Reconciliation summary error:", error);
    throw error;
  }
};

/* ------------------------------------------
   Customers by Date Range (Grouped by Date)
------------------------------------------ */
export const getCustomersByDateRange = async (file, startDate, endDate) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("start_date", startDate);
    formData.append("end_date", endDate);

    const response = await axios.post(
      `${API_BASE}/registrations/customers-by-range-grouped`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
console.log(response);

    return response.data;
  } catch (error) {
    console.error("Customers by date range error:", error);
    throw error;
  }
};