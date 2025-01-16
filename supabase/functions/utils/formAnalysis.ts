import { FormData, FormField } from '../utils/form';

export function validateFormData(formData: FormData): boolean {
  if (!formData.action || !formData.method || !Array.isArray(formData.fields)) {
    return false;
  }
  return formData.fields.every(field => validateFormField(field));
}

function validateFormField(field: FormField): boolean {
  return !!field.name && !!field.type;
}

export function inferFieldType(fieldName: string): string {
  const lowercaseName = fieldName.toLowerCase();
  if (lowercaseName.includes('email')) return 'email';
  if (lowercaseName.includes('name')) return 'text';
  if (lowercaseName.includes('message') || lowercaseName.includes('comment')) return 'textarea';
  if (lowercaseName.includes('phone')) return 'tel';
  return 'text';
}

export function sanitizeFormField(value: string): string {
  // 基本的なサニタイズ処理
  return value.replace(/[<>&"']/g, (match) => {
    switch (match) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '"': return '&quot;';
      case "'": return '&#x27;';
      default: return match;
    }
  });
}