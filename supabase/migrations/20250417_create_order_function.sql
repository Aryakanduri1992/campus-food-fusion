
-- Create a database function to bypass RLS when creating orders
CREATE OR REPLACE FUNCTION public.create_new_order(
  user_id_param UUID,
  total_price_param NUMERIC
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER -- This is crucial for bypassing RLS
AS $$
DECLARE
  new_order_id INTEGER;
  new_order RECORD;
BEGIN
  -- Insert the new order and return its ID
  INSERT INTO public.orders (user_id, total_price, status)
  VALUES (user_id_param, total_price_param, 'Placed')
  RETURNING id INTO new_order_id;
  
  -- Get the full order record
  SELECT * INTO new_order FROM public.orders WHERE id = new_order_id;
  
  -- Return the new order as JSON
  RETURN json_build_object(
    'id', new_order_id,
    'user_id', new_order.user_id,
    'total_price', new_order.total_price,
    'status', new_order.status,
    'created_at', new_order.created_at
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_new_order TO authenticated;
