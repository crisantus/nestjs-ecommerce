

export interface FlutterwaveVerificationResponse {
    status: "success" | "error";
    message: string;
    data: {
      id: number;
      tx_ref: string;
      flw_ref: string;
      amount: number;
      currency: string;
      status: "successful" | "failed" | "pending";
      customer: {
        name: string;
        email: string;
        phone_number: string;
      };
      payment_type: string;
      created_at: string;
    };
  }
  