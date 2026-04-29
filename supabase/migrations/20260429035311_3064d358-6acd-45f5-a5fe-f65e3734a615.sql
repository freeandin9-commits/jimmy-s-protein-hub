DELETE FROM public.orders WHERE customer_name = 'Test' AND notes = 'test';
DELETE FROM public.orders WHERE jsonb_array_length(items) = 1 AND items->0->>'x' = '1';