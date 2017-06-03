/**
 * Created by Til on 06.05.2017.
 */

const express = require('express');
const bodyParser = require('body-parser').json();
const jwt = require('../util/tokenmanager');

const db = require('../db');

const router = express.Router();

/**
 * Handles POST requests on /category/create, and tries to create a category
 * with the given request data.
 *
 * Validates multiple headers and checks if all mandatory fields have a value.
 * If not sends a corresponding HTTP error code and and an error message.
 *
 * Responds with HTTP status code 201 if successful.
 */
router.post('/create', bodyParser, function (req, res) {
  let error;

  if (req.get('authorization') === null ||
      req.get('authorization') === undefined) {
    error = 'Authorization missing.';
    return res.status(401).send(error);
  }

  // token validation
  jwt.verify(req.get('authorization'), function (err, decoded) {
    if (err || decoded === null || decoded === undefined) {
      error = 'Authorization failed. Invalid token';
      return res.status(401).send(error);
    }

    // content type validation
    if (req.get('content-type') !== 'application/json') {
      error = 'Wrong content type. Application only consumes JSON.';
      return res.status(406).send(error);
    }

    if (!req.body) {
      error = 'Request body missing. Category creation failed.';
      return res.status(400).send(error);
    }

    let category = {};
    category.name = req.body.name;
    category.color = req.body.color;
    category.description = req.body.description;
    category.owner = req.body.owner;

    if (undefined === category.name || undefined === category.color ||
        undefined === category.owner) {
      error = 'Mandatory fields missing. Category creation rejected.';
      return res.status(422).send(error);
    }

    if (decoded.user !== category.owner) {
      return res.sendStatus(403);
    }

    db.insertCategory(category, function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        return res.sendStatus(201);
      }
    });
  });
});

/**
 * Handles GET request on /category/all with a given session token (identifying
 * a user) to receive all events the given user owns.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with a JSON list of the categories if successful.
 */
router.get('/all', bodyParser, function (req, res) {
  let error;

  if (req.get('authorization') === null ||
      req.get('authorization') === undefined) {
    error = 'Authorization missing.';
    return res.status(401).send(error);
  }
  // TODO: Implementation
});

/**
 * Handles PUT request to /category/:id, to update the given category.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with HTTP status code 200 if the update is successful.
 */
router.put('/:id', bodyParser, function (req, res) {
  let error;

  // check for correct content type
  if (req.get('content-type') !== 'application/json') {
    error = 'Wrong content type. Application only consumes JSON.';
    return res.status(406).send(error);
  }

  if (!req.body) {
    error = 'Request body missing. Category update failed.';
    return res.status(400).send(error);
  }

  let id = req.params.id;
  let category = {};

  category.name = req.body.name;
  category.color = req.body.color;
  category.description = req.body.description;
  category.owner = req.body.owner;

  db.updateCategory(id, event, function (err) {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.sendStatus(200);
    }
  });
});

/**
 * Handles GET request to /category/:id, to receive all saved information about
 * the category.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with JSON element of the event if successful.
 */
router.get('/:id', bodyParser, function (req, res) {
  let error;

  if (req.get('authorization') === null ||
      req.get('authorization') === undefined) {
    error = 'Authorization missing.';
    return res.status(401).send(error);
  }

  jwt.verify(req.get('authorization'), function (err, decoded) {
    if (err || decoded === null || decoded === undefined) {
      error = 'Authorization failed. Invalid token';
      return res.status(401).send(error);
    }

    let id = req.params.id;

    db.getEvent(id, function (err, ret) {
      if (err) {
        return res.status(500).send(err);
      } else if (!ret) {
        error = 'Category not found';
        return res.status(404).send(error);
      } else if (decoded.user !== ret.owner) {
        return res.sendStatus(403);
      } else {
        return res.status(200).send(ret);
      }
    });
  });
});

/**
 * Handles DELETE request to /category/:id, to delete the given category.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with HTTP status code 200 if the delete is successful.
 */
router.delete('/:id', bodyParser, function (req, res) {
  let error;

  if (req.get('authorization') === null ||
      req.get('authorization') === undefined) {
    error = 'Authorization missing.';
    return res.status(401).send(error);
  }

  jwt.verify(req.get('authorization'), function (err, decoded) {
    if (err || decoded === null || decoded === undefined) {
      error = 'Authorization failed. Invalid token';
      return res.status(401).send(error);
    }

    let categoryId = req.params.id;

    db.getCategory(id, function (getErr, ret) {
      if (!ret) {
        error = 'Category not found';
        return res.status(404).send(error);
      } else if (decoded.user !== ret.owner) {
        return res.sendStatus(403);
      } else {
        db.deleteCategory(categoryId, function (delErr) {
          if (delErr) {
            return res.status(500).send(delErr);
          } else {
            return res.sendStatus(200);
          }
        });
      }
    });
  });
});

module.exports = router;
