
interface TokenUser {
    email: string;
    userId: number;
    role: string;
  }
  
  export function createTokenUser(email: string, userId: number, role: string): TokenUser {
    return {
      email,
      userId,
      role,
    };
  }
  
  