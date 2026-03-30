-- Performance Optimizations for Livo-Homes

-- 1. Indexing for Orders (Query Optimization)
CREATE INDEX IF NOT EXISTS idx_orders_created_at_desc ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- 2. Optimized Dashboard Statistics Function
-- This function calculates all stats in a single database call, avoiding row transfers.
CREATE OR REPLACE FUNCTION get_dashboard_summary()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_orders', COUNT(*),
    'total_revenue', COALESCE(SUM(total_amount), 0),
    'pending_orders', COUNT(*) FILTER (WHERE status = 'pending'),
    'unique_customers', (
      SELECT COUNT(DISTINCT customer_email) 
      FROM orders
    )
  ) INTO result
  FROM orders;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
