module.exports = createApp;

function createApp() {
  const t = require('tcomb');
  const express = require('express');
  const bodyParser = require('body-parser');
  const Router = require('../../');

  const app = express();

  app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
  app.use(bodyParser.json({ limit: '50mb' }));

  const File = t.struct({
    name: t.String,
    createdAt: t.String,
    updatedAt: t.String
  });

  const files = [{ name: 'fileA', createdAt: '2014', updatedAt: '2014' }];
  const router = Router();

  router.get({
    path: '/api/v1/files',
    schema: {
      query: t.struct({
        name: t.String
      }),
      response: t.struct({
        files: t.list(File)
      })
    },
    handler: (req, res) => {
      res.json({ files: files.filter(file => file.name === req.query.name) });
    }
  });

  router.post({
    path: '/api/v1/files',
    schema: {
      body: t.struct({ file: File }),
      response: t.struct({ file: File })
    },
    handler: (req, res) => {
      const { file } = req.body;

      files.push(file);
      res.json({ file });
    }
  });

  app.use('/', router.getRoutes());
  app.use((err, req, res, next) => {
    if (!err) {
      return next();
    }

    console.log(err.stack || err);
    res.status(err.status || 500).json({ status: 'error' });
  });

  return { app };
}
