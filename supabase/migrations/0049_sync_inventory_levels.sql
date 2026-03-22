-- 0049_sync_inventory_levels.sql
-- Sincronización automática de niveles de inventario (Versión Final v2)

BEGIN;

-- Función para sincronizar inventory_levels basado en inventory_movements
CREATE OR REPLACE FUNCTION public.sync_inventory_levels_on_movement()
RETURNS TRIGGER AS $$
DECLARE
  qty_change NUMERIC;
BEGIN
  -- Normalizar el tipo de movimiento (LOWER y casting a text para tipos USER-DEFINED)
  IF LOWER(NEW.type::text) = 'in' THEN
    qty_change := NEW.quantity;
  ELSIF LOWER(NEW.type::text) = 'out' THEN
    qty_change := -NEW.quantity;
  ELSE
    qty_change := 0;
  END IF;

  -- Actualizar o Insertar en inventory_levels
  -- Se asume que product_id y warehouse_id existen segun el schema compartido
  INSERT INTO public.inventory_levels (product_id, warehouse_id, stock)
  VALUES (NEW.product_id, NEW.warehouse_id, qty_change)
  ON CONFLICT (product_id, warehouse_id)
  DO UPDATE SET 
    stock = public.inventory_levels.stock + EXCLUDED.stock;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la función después de cada inserción en inventory_movements
DROP TRIGGER IF EXISTS trg_sync_inventory_levels ON public.inventory_movements;
CREATE TRIGGER trg_sync_inventory_levels
AFTER INSERT ON public.inventory_movements
FOR EACH ROW EXECUTE FUNCTION public.sync_inventory_levels_on_movement();

COMMIT;
