
-- Habilitar RLS en todas las tablas operativas
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas previas para evitar conflictos
DROP POLICY IF EXISTS "auth_read_customers" ON public.customers;
DROP POLICY IF EXISTS "auth_read_vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "auth_read_orders" ON public.work_orders;
DROP POLICY IF EXISTS "auth_read_services" ON public.services;
DROP POLICY IF EXISTS "auth_read_products" ON public.products;

-- POLÍTICAS DE LECTURA (SELECT) PARA USUARIOS AUTENTICADOS
CREATE POLICY "auth_read_all_customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_orders" ON public.work_orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_services" ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_wo_services" ON public.work_order_services FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_wo_parts" ON public.work_order_parts FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_appointments" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_read_all_invoices" ON public.invoices FOR SELECT TO authenticated USING (true);

-- POLÍTICAS DE ESCRITURA (INSERT/UPDATE) PARA USUARIOS AUTENTICADOS
CREATE POLICY "auth_write_all_orders" ON public.work_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all_customers" ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all_vehicles" ON public.vehicles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all_wo_items" ON public.work_order_services FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_write_all_wo_parts" ON public.work_order_parts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Otorgar permisos de esquema explícitos
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
