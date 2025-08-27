export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
}

export const sendSuccess = <T>(data: T, message = "Success", statusCode = 200): ApiResponse<T> => {
  return { success: true, message, statusCode, data };
};

export const sendError = (message = "Something went wrong", statusCode = 500): ApiResponse => {
  return { success: false, message, statusCode };
};
