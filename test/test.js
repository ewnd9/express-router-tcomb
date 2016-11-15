import test from 'ava';
import 'babel-core/register';

import createApp from './fixtures/create-app';
import Router from '../';
import { agent } from 'supertest';

test.beforeEach(async t => {
  const { app } = createApp();

  t.context.server = app.listen();
  t.context.request = agent(app);
});

test.afterEach.always(async t => {
  t.context.server.close();
});

test('GET /', async t => {
  const { request } = t.context;

  const res0 = await request.get('/');
  t.truthy(res0.statusCode === 404);
});

test('GET /api/v1/files', async t => {
  const { request } = t.context;

  const res0 = await request.get('/api/v1/files');
  t.truthy(res0.statusCode === 500);
  t.deepEqual(res0.body, {
    message: 'Validation Error',
    error: {
      query: [
        {
          message: 'Invalid value undefined supplied to /name: String',
          path: [ 'name' ]
        }
      ]
    }
  });

  const res1 = await request.get('/api/v1/files?name=fail');
  t.truthy(res1.statusCode === 200);
  t.deepEqual(res1.body, { files: [] });

  const res2 = await request.get('/api/v1/files?name=fileA');
  t.truthy(res2.statusCode === 200);
  t.deepEqual(res2.body, { files: [{ name: 'fileA', createdAt: '2014', updatedAt: '2014' }] });
});

test('POST /api/v1/files', async t => {
  const { request } = t.context;

  const res0 = await request.post('/api/v1/files').send({});
  t.truthy(res0.statusCode === 500);
  t.deepEqual(res0.body, {
    message: 'Validation Error',
    error: {
      body: [
        {
          message: 'Invalid value undefined supplied to /file: Struct{name: String, createdAt: String, updatedAt: String}',
          path: [ 'file' ]
        }
      ]
    }
  });

  const file1 = { name: 'fileB', createdAt: '2014', updatedAt: '2014' };
  const res1 = await request.post('/api/v1/files').send({ file: file1 });
  t.truthy(res1.statusCode === 200);
  t.deepEqual(res1.body, { file: file1 });

  const res2 = await request.get('/api/v1/files?name=fileB');
  t.truthy(res2.statusCode === 200);
  t.deepEqual(res2.body, { files: [file1] });
});
