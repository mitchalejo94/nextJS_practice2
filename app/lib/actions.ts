'use server'
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });
   
const CreateInvoice = FormSchema.omit({ id: true, date: true });

export async function createInvoice(formData: FormData) { 
    const { customerId, amount, status } = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // Test it out:
//   console.log(typeof rawFormData.amount);
//Conver amount into cents
const amountInCents = amount * 100;
//create a new date with the format "YYYY-MM-DD" for the invoice's creation date
const date = new Date().toISOString().split('T')[0];

//create an SQL query to insert the new invoice into your database and pass in the variables
await sql`
INSERT INTO invoices (customer_id, amount, status, date)
VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
`;
//revalidatePath allows you to purge cached data on-demand for a specific path.
revalidatePath('/dashboard/invoices');

//redirect page
redirect('/dashboard/invoices')
}


//Update the invoice 
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

// Extracting the data from formData.
// Validating the types with Zod.
// Converting the amount to cents.
// Passing the variables to your SQL query.
// Calling revalidatePath to clear the client cache and make a new server request.
// Calling redirect to redirect the user to the invoice's page.
export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
      customerId: formData.get('customerId'),
      amount: formData.get('amount'),
      status: formData.get('status'),
    });
   
    const amountInCents = amount * 100;
   
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
   
    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
  }