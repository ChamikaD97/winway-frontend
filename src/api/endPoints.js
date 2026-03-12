import axios from "axios";

const API_BASE_LOCAL = "http://localhost:8001";

export const getCombinedCustomers = () => {
  return axios.get(`${API_BASE_LOCAL}/loyalCustomer/combined`);
};

/**
 * Get monthly loyalty upgrades
 */
export const getMonthlyUpgrades = () => {
  return axios.get(`${API_BASE_LOCAL}/loyalCustomer/monthly-upgrades`);
};

/**
 * Get system settings
 */
export const getSettings = () => {
  
  return axios.get(`${API_BASE_LOCAL}/settings`);
};

//saveSettingsGroup
export const saveSettingsGroup = async (group) => {
  const updates = Object.entries(group);
  for (const [key, value] of updates) {
    await axios.post(`${API_BASE_LOCAL}/settings`, {
      key,
      value,
      type: "number",
    });
  }
};
