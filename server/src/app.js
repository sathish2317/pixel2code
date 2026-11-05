const express = require('express');
const cors = require('cors');
const { load } = require('./config');
const logger = require('./logger');
const db = require('./db');
const { languageOf } = require('./filePolicy');
const { makeProvider } = require('./providers');
const mw = require('./middleware');
const aiSvc = require('./services/aiService');
const jobsSvc = require('./services/jobs');

function createApp(env = process.env, { fetchImpl, quiet } = {}) {
  const cfg = load(env);
  const log = quiet ? logger.create('error', { log() {}, error() {} }) : logger.create(cfg.logLevel);
  const database = db.open(cfg.dbPath);
  const repos = db.repos(database, languageOf);
  const provider = makeProvider(cfg, fetchImpl);
  const ai = aiSvc.create({ cfg, provider, log });
  const jobs = jobsSvc.create();

  const app = express();
  app.set('trust proxy', 1);
  app.use(cors({ origin: cfg.cors, exposedHeaders: ['content-disposition', 'x-request-id'] }));
  app.use(mw.requestLog(log));
  app.use(express.json({ limit: '30mb' })); // images/PDF arrive as base64

  app.get('/health', (_req, res) => res.json({ ok: true, provider: provider.name, model: provider.model, hasKey: provider.configured }));

  const api = express.Router();
  api.use(mw.auth(cfg, repos));
  // AI-heavy routes get a tight limit, everything else a generous one.
  const aiLimit = mw.limiter(cfg.aiRateLimit), crudLimit = mw.limiter(300);

  const legacy = require('./routes/legacy')({ ai, provider, cfg });
  const projects = require('./routes/projects')({ repos, cfg });
  const code = require('./routes/code')({ ai, repos, cfg, jobs, projectRoutes: projects });
  const convert = require('./routes/convert')({ ai, provider, jobs, legacy, repos, projectRoutes: projects });
  const components = require('./routes/components')({ repos, projectRoutes: projects });
  const design = require('./routes/design')({ ai, provider, cfg, jobs, repos, projectRoutes: projects });
  const quality = require('./routes/quality')({ cfg, repos, projectRoutes: projects });
  const misc = require('./routes/files')({ repos, cfg, provider, jobs, projectRoutes: projects });

  api.use('/generate', aiLimit); api.use('/refine', aiLimit); api.use('/plan', aiLimit); api.use('/code', aiLimit);
  api.use('/convert/image-to-code', aiLimit); api.use('/convert/pdf-to-code', aiLimit);
  api.use('/design/analyze', aiLimit); api.use('/design/compare', aiLimit); api.use('/design/iterate', aiLimit);
  api.use(crudLimit);
  api.use(legacy);
  api.use('/projects', projects);
  api.use('/components', components);
  api.use('/design', design);
  api.use('/quality', quality);
  api.use('/code', code);
  api.use('/convert', convert);
  api.use(misc);
  app.use('/api', api);

  app.use(mw.notFound);
  app.use(mw.errorHandler(log));
  return { app, cfg, log, database, repos, provider };
}

module.exports = { createApp };
