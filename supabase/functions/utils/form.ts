export interface FormField {
    name: string;
    type: string;
    label?: string;
    value?: string;
  }
  
  export interface FormData {
    action: string;
    method: string;
    fields: FormField[];
    url: string;
  }
  
  export interface FormSendRequest {
    formData: FormData;
    companyName: string;
    companyUrl: string;
    product: string;
    userId: string;
  }
  
  export interface FormSendResponse {
    message: string;
    response: string;
  }