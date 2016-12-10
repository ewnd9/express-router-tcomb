# express-router-tcomb

[![Build Status](https://travis-ci.org/ewnd9/express-router-tcomb.svg?branch=master)](https://travis-ci.org/ewnd9/express-router-tcomb)

Router with a `query` / `body` / `response` (for tests) validation via [`tcomb`](https://github.com/gcanti/tcomb)

## Install

```sh
$ npm install --save express-router-tcomb
```

## Usage

```js
'use strict';

const t = require('tcomb');
const express = require('express');
const Router = require('express-router-tcomb');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

const router = Router();

const File = t.struct({
  name: t.String,
  createdAt: t.String,
  updatedAt: t.String
});

const files = [{ name: 'fileA', createdAt: '2014', updatedAt: '2014' }];

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

app.listen(3000);
```

## Related

- [`express-router-tcomb-test`](https://github.com/ewnd9/express-router-tcomb-test) - A test agent for this module
- [JSON API Validation In Node.js](https://gcanti.github.io/2014/09/15/json-api-validation-in-node.html) - An article from the creator of tcomb

## License

MIT © [ewnd9](http://ewnd9.com)
