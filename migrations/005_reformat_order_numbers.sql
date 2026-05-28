-- Renumber all existing orders to GRB-YYYY-NNNNN format
DO $$
DECLARE
  r RECORD;
  seq INT := 1;
  yr INT;
  prev_yr INT := 0;
BEGIN
  FOR r IN SELECT id, created_at FROM orders ORDER BY created_at ASC LOOP
    yr := EXTRACT(YEAR FROM r.created_at)::INT;
    IF yr != prev_yr THEN seq := 1; prev_yr := yr; END IF;
    UPDATE orders SET order_number = 'GRB-' || yr || '-' || LPAD(seq::TEXT, 5, '0') WHERE id = r.id;
    seq := seq + 1;
  END LOOP;
END $$;
