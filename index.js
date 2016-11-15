'use strict';

const express = require('express');
const methods = require('methods');
const tcombMiddleware = require('./middleware');
const { createTcombMiddleware } = tcombMiddleware;

module.exports = Router;
module.exports.tcombMiddleware = tcombMiddleware;
module.exports.createTcombMiddleware = createTcombMiddleware;

function Router() {
  const data = [];

  const router = methods.reduce(
    (total, method) => {
      total[method] = function({ path, schema = {}, handler, middleware = [] }) {
        route({ method, path, schema, handler, middleware });
      };

      return total;
    },
    {
      route,
      getRoutes() {
        const router = express.Router();

        data.forEach(route => {
          router[route.method].apply(router, [route.path].concat(route.arguments));
        });

        router._routerTcomb = this;
        return router;
      },
      findRoute(method, path) {
        return data.find(route => route.method === method && route.path === path);
      }
    }
  );

  function route({ method, path, schema, handler, middleware = [] }) {
    data.push({
      path,
      method: method.toLowerCase(),
      schema,
      arguments: [tcombMiddleware(schema)].concat(middleware).concat(handler)
    });
  }

  return router;
}
