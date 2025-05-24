import axios from "axios";
import { FLW_SECRET_KEY, FLW_BASE_URL } from "../../src/secrets";
import { AxiosResponse } from "axios";
import { FlutterwaveVerificationResponse } from "./flutterwave-type";

// ✅ Always check the env values exist
if (!FLW_SECRET_KEY || !FLW_BASE_URL) {
  throw new Error("Flutterwave config missing: FLW_SECRET_KEY or FLW_BASE_URL not set");
}

// ✅ Reusable headers with proper content type
const headers = {
  Authorization: `Bearer ${FLW_SECRET_KEY}`,
  "Content-Type": "application/json",
};

// ✅ Initiate a payment
export const initiatePaymentService = async (data: any) => {
  try {
    const response = await axios.post(`${FLW_BASE_URL}/payments`, data, { headers });
    return response.data;
  } catch (error: any) {
    console.error("Flutterwave Initiate Payment Error:", error.response?.data || error.message);
    throw new Error("Failed to initiate payment with Flutterwave");
  }
};

// ✅ Verify a payment using transaction ID (not tx_ref)
export const verifyPaymentService = async (transactionId: string): Promise<FlutterwaveVerificationResponse['data']> => {
  try {
    const response: AxiosResponse<FlutterwaveVerificationResponse> = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      { headers }
    );

    const result = response.data;

    if (result.status === "success" && result.data.status === "successful") {
      return result.data;
    } else {
      throw new Error("Payment not verified or failed");
    }
  } catch (error: any) {
    console.error("Flutterwave Verify Payment Error:", error.response?.data || error.message);
    throw new Error("Failed to verify payment with Flutterwave");
  }
};

// ✅ Generate a unique transaction reference
export const generateTxRef = () => {
  return `TX-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
};
