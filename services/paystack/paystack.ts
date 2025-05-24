import axios from 'axios';
import { PAYSTACK_SECRET_KEY } from '../../src/secrets';


const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const paystack = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});
