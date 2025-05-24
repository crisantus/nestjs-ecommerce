

// Paystack initialize transaction response
export interface PaystackInitResponse {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
    };
  }
  
  // Paystack verify transaction response
  export interface PaystackVerifyResponse {
    status: boolean;
    message: string;
    data: {
      status: 'success' | 'failed' | 'abandoned';
      reference: string;
      amount: number;
      customer: {
        email: string;
        user:String
      };
      [key: string]: any;
    };
  }
  