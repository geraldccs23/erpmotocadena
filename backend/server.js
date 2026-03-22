require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { errorHandler } = require('./src/middleware/errorHandler');
const { authPlaceholder } = require('./src/middleware/authPlaceholder');

// Routers
const adminClientsRouter = require('./src/routes/admin/clients');
const adminVehiclesRouter = require('./src/routes/admin/vehicles');
const adminMechanicsRouter = require('./src/routes/admin/mechanics');
const adminServicesRouter = require('./src/routes/admin/services');
const adminWorkOrdersRouter = require('./src/routes/admin/workOrders');
const adminInspectionsRouter = require('./src/routes/admin/inspections');
const adminAppointmentsRouter = require('./src/routes/admin/appointments');
const adminProductsRouter = require('./src/routes/admin/products');
const adminSuppliersRouter = require('./src/routes/admin/suppliers');
const adminPurchasesRouter = require('./src/routes/admin/purchases');
const adminInventoryRouter = require('./src/routes/admin/inventory');
const adminPosRouter = require('./src/routes/admin/pos');
const adminReportsRouter = require('./src/routes/admin/reports');

const publicOrdersRouter = require('./src/routes/public/orders');
const publicServicesRouter = require('./src/routes/public/services');
const publicAppointmentsRouter = require('./src/routes/public/appointments');

const app = express();
const PORT = process.env.PORT || 3003;

// Configuración de CORS más robusta
const allowedOrigins = [
  'https://motocadena.com',
  'https://www.motocadena.com',
  'https://admin.rg7.com.ve',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Role'],
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '50mb' })); // Aumentar límite para snapshots grandes
app.use(morgan('dev'));

// Health & Diagnostics
const { supabase } = require('./src/services/supabaseClient');
app.get('/health', async (req, res) => {
  try {
    const start = Date.now();
    const { data, error } = await supabase.from('products').select('id').limit(1);
    const dbStatus = error ? `Error: ${error.message}` : 'Connected';
    res.json({
      ok: true,
      service: 'rg7-admin-backend',
      db: dbStatus,
      latency: `${Date.now() - start}ms`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.use(authPlaceholder);

// --------------------
// Stock snapshot
// payload: { branch, warehouses:[], captured_at, rows:[{co_art,co_alma,stock,descripcion}] }
// writes to public.stock_snapshots + public.stock_snapshot_lines via supabase (service role)
// --------------------
app.post("/api/agent/stock_snapshot", async (req, res) => {
  const { branch, warehouses, captured_at, rows } = req.body || {};

  if (!branch || typeof branch !== "string") {
    return res.status(400).json({ ok: false, error: "branch is required" });
  }
  if (!Array.isArray(rows)) {
    return res.status(400).json({ ok: false, error: "rows must be array" });
  }

  try {
    const capturedAt = captured_at ? new Date(captured_at).toISOString() : new Date().toISOString();

    // 1. Insert Header
    const { data: header, error: hError } = await supabase
      .from('stock_snapshots')
      .insert({
        branch: branch.trim(),
        captured_at: capturedAt,
        warehouses: Array.isArray(warehouses) ? warehouses : [],
        rows_count: rows.length,
        source: 'PROFIT'
      })
      .select('id')
      .single();

    if (hError) throw hError;
    const snapshot_id = header.id;

    // 2. Prepare Lines
    const linesToInsert = rows.map(r => {
      const codigo_producto = ((r.co_art || r.codigo_producto || "").toString().trim()) || null;
      const codigo_almacen = ((r.co_alma || r.codigo_almacen || "").toString().trim()) || null;
      const stock = Number(r.stock);
      const descripcion = ((r.descripcion || r.des_art || "").toString().trim()) || null;

      const modeloRaw = r.modelo ?? null;
      const modelo = modeloRaw !== null && modeloRaw !== undefined ? String(modeloRaw).trim() || null : null;

      const refRaw = r.ref ?? null;
      const ref = refRaw !== null && refRaw !== undefined ? String(refRaw).trim() || null : null;

      if (!codigo_producto || !codigo_almacen || !Number.isFinite(stock)) return null;

      return {
        snapshot_id,
        codigo_producto,
        codigo_almacen,
        stock,
        descripcion,
        modelo,
        ref
      };
    }).filter(Boolean);

    // 3. Bulk Insert Lines in Chunks
    if (linesToInsert.length > 0) {
      const chunkSize = 1000;
      for (let i = 0; i < linesToInsert.length; i += chunkSize) {
        const chunk = linesToInsert.slice(i, i + chunkSize);
        const { error: lError } = await supabase
          .from('stock_snapshot_lines')
          .insert(chunk);

        if (lError) throw lError;
      }
    }

    return res.json({
      ok: true,
      snapshot_id,
      inserted_lines: linesToInsert.length,
      rows_in_payload: rows.length
    });
  } catch (e) {
    console.error('[Stock Snapshot Error]', e);
    return res.status(500).json({ ok: false, error: e.message || String(e) });
  }
});

// Routers mapping
const adminPrefixes = ['/admin', '/api/admin'];
adminPrefixes.forEach(prefix => {
  app.use(`${prefix}/clients`, adminClientsRouter);
  app.use(`${prefix}/vehicles`, adminVehiclesRouter);
  app.use(`${prefix}/mechanics`, adminMechanicsRouter);
  app.use(`${prefix}/services`, adminServicesRouter);
  app.use(`${prefix}/work-orders`, adminWorkOrdersRouter);
  app.use(`${prefix}/inspections`, adminInspectionsRouter);
  app.use(`${prefix}/appointments`, adminAppointmentsRouter);
  app.use(`${prefix}/products`, adminProductsRouter);
  app.use(`${prefix}/suppliers`, adminSuppliersRouter);
  app.use(`${prefix}/purchases`, adminPurchasesRouter);
  app.use(`${prefix}/inventory`, adminInventoryRouter);
  app.use(`${prefix}/pos`, adminPosRouter);
  app.use(`${prefix}/reports`, adminReportsRouter);
});

// Public routes
app.use('/public/orders', publicOrdersRouter);
app.use('/public/services', publicServicesRouter);
app.use('/public/appointments', publicAppointmentsRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[rg7-admin-backend] listening on port ${PORT}`);
});