-- Add letter_pads to the employee_permissions module check constraint

ALTER TABLE public.employee_permissions DROP CONSTRAINT IF EXISTS employee_permissions_module_check;

ALTER TABLE public.employee_permissions ADD CONSTRAINT employee_permissions_module_check 
CHECK (module IN (
  'dashboard',
  'companies',
  'customers',
  'delivery_challans',
  'invoices',
  'stock',
  'reports',
  'employees',
  'settings',
  'products',
  'letter_pads'
));
