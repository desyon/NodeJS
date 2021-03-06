'use strict';
/**
 * Created by Desyon on 06.05.2017.
 */

const express = require('express');
const bodyParser = require('body-parser').json();
const winston = require('../util/winston');
const jwt = require('../util/tokenmanager');

const db = require('../db');

const router = express.Router();

/**
 * Handles POST request on /user/login for a login attempt.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with HTTP status code 200 if successful and transfers a session
 * token.
 */
router.post('/login', bodyParser, function (req, res) {
  winston.debug('Login requested.');
  let error = {};

  // content type validation
  if ('application/json' !== req.get('content-type')) {
    winston.debug('Login failed with wrong or missing content type.');
    error.errmsg = 'Wrong content type. Application only consumes JSON.';
    return res.status(406).send(error);
  }

  // check if body is not empty
  if (!req.body) {
    winston.debug('Login failed with missing request body.');
    error.errmsg = 'Request body missing. Login failed.';
    return res.status(400).send(error);
  }

  let user = {};
  user.username = req.body.username;
  user.password = req.body.password;

  // check if username and password are contained in body
  if (undefined === user.username || undefined === user.password) {
    winston.debug('Login failed with missing username or password.');
    error.errmsg = 'Username or password missing.';
    return res.status(422).send(error);
  }

  db.getUser(user.username, function (err, ret) {
    if (err) {
      winston.debug('Login failed with missing user.');
      error.errmsg = 'User not found.';
      return res.status(404).send(error);
    } else {
      if (ret.password !== user.password) {
        winston.debug('Login failed with wrong password or username');
        error.errmsg = 'Wrong password or username.';
        return res.status(401).send(error);
      }
      winston.debug('Login successful. Token send');
      let token = jwt.sign(user.username);
      return res.status(200).send({
        token: token,
        msg: 'Success',
      });
    }
  });
});

/**
 * Handles POST requests on /user/create, and tries to create a user with the
 * given request data.
 *
 * Validates multiple headers and checks if all mandatory fields have a value.
 * If not sends a corresponding HTTP error code and and error message.
 *
 * Responds with HTTP status code 201 if successful.
 */
router.post('/create', bodyParser, function (req, res) {
  winston.debug('User creation requested.');
  let error = {};

  // content type validation
  if ('application/json' !== req.get('content-type')) {
    winston.debug('User creation failed with wrong or missing content type.');
    error.errmsg = 'Wrong content type. Application only consumes JSON.';
    return res.status(406).send(error);
  }

  // check if body is not empty
  if (!req.body) {
    winston.debug('User creation failed with missing request body');
    error.errmsg = 'Request body missing. User creation failed';
    return res.status(400).send(error);
  }

  let user = {};
  user.username = req.body.username;
  user.name = req.body.name;
  user.password = req.body.password;
  user.dob = req.body.dob;
  user.email = req.body.email;

  if (undefined === user.username || undefined === user.password) {
    winston.debug('User creation failed with missing mandatory properties.');
    error.errmsg = 'Mandatory fields missing. User Creation rejected.';
    return res.status(422).send(error);
  }

  db.insertUser(user, function (err) {
    if (err) {
      winston.debug('User creation failed with database error.');
      error.errmsg = 'Database error';
      return res.status(500).send(error);
    } else {
      winston.debug('User creation successful.');
      let token = jwt.sign(user.username);
      return res.status(201).send({
        token: token,
        msg: 'Success',
      });
    }
  });
});

/**
 * Handles PUT request to /user/, to update the given user.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with HTTP status code 200 if the update is successful.
 */
router.put('/', bodyParser, function (req, res) {
  winston.debug('User change requested.');
  let error = {};

  if (!(req.get('authorization'))) {
    winston.debug('User change failed with missing authorization.');
    error.errmsg = 'Authorization missing';
    return res.status(401).send(error);
  }

  // token validation
  jwt.verify(req.get('authorization'), function (err, decoded) {
    if (err || !decoded) {
      winston.debug('User change failed with invalid authorization.');
      error.errmsg = 'Authorization failed. Invalid token';
      return res.status(401).send(error);
    }

    let username = decoded.user;

    winston.debug('User change requested for user \'' + username + '\'.');

    // content type validation
    if ('application/json' !== req.get('content-type')) {
      winston.debug('User change failed with wrong or missing content type.');
      error.errmsg = 'Wrong content type. Application only consumes JSON.';
      return res.status(406).send(error);
    }

    if (!req.body) {
      winston.debug('User change failed with missing request body.');
      error.errmsg = 'Request body missing. User updating failed';
      return res.status(400).send(error);
    }

    let user = {};
    user.name = req.body.name;
    user.password = req.body.password;
    user.dob = req.body.dob;
    user.email = req.body.email;

    db.updateUser(username, req.body, function (err) {
      if (err) {
        winston.debug('User change failed with database error.');
        error.errmsg = 'Database error';
        return res.status(500).send(error);
      } else {
        winston.debug('User change successful.');
        let response = {msg: 'Success'};
        return res.status(200).send(response);
      }
    });
  });
});

/**
 * Handles GET request to /user/, to get the given user.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent.
 *
 * Responds with HTTP status code 200 and the user if the get is successful.
 */
router.get('/', bodyParser, function (req, res) {
  winston.debug('User requested.');
  let error = {} = {};

  if (!(req.get('authorization'))) {
    winston.debug('User deletion failed with missing authorization.');
    error.errmsg = 'Authorization missing';
    return res.status(401).send(error);
  }

  jwt.verify(req.get('authorization'), function (err, decoded) {
    if (err || !decoded) {
      winston.debug('User deletion failed with invalid authentication.');
      error.errmsg = 'Authorization failed. Invalid token.';
      return res.status(401).send(error);
    }

    winston.debug('User \'' + decoded.user + '\' requested.');

    db.getUser(decoded.user, function (err, ret) {
      if (!ret) {
        winston.debug('User request failed with missing user.');
        error.errmsg = 'User not found';
        return res.status(404).send(error);
      } else if (err) {
        error.errmsg = 'Database error';
        return res.status(500).send(error);
      } else {
        return res.status(200).send(ret);
      }
    });
  });
});

/**
 * Handles DELETE request to /user/, to delete the given user.
 *
 * Validates headers and checks given request data. If an error occurs a
 * corresponding HTTP error code is sent. A user can be deleted any number of
 * times, as long as the token stays valid.
 *
 * Responds with HTTP status code 200 if the delete is successful.
 */
router.delete('/', bodyParser, function (req, res) {
  winston.debug('User deletion requested.');
  let error = {};

  if (!(req.get('authorization'))) {
    winston.debug('User deletion failed with missing authorization.');
    error.errmsg = 'Authorization missing';
    return res.status(401).send(error);
  }

  // token validation
  jwt.verify(req.get('authorization'), function (err, decoded) {
    if (err || !decoded) {
      winston.debug('User deletion failed with invalid authentication.');
      error.errmsg = 'Authorization failed. Invalid token.';
      return res.status(401).send(error);
    }

    let user = decoded.user;

    winston.debug('User deletion requested for user \'' + user + '\'.');

    db.deleteAllUserEvents(user, function (delErr) {
      if (delErr) {
        winston.debug('User deletion failed with database error');
        error.errmsg = 'Database error';
        return res.status(500).send(error);
      }
    });

    db.deleteAllUserCategories(user, function (delErr) {
      if (delErr) {
        winston.debug('User deletion failed with database error');
        error.errmsg = 'Database error';
        return res.status(500).send(error);
      }
    });

    db.deleteUser(user, function (delErr) {
      if (delErr) {
        winston.debug('User deletion failed with database error.');
        error.errmsg = 'Database error';
        return res.status(500).send(error);
      } else {
        winston.debug('User \'' + user + '\'successfully deleted.');
        let response = {msg: 'User deleted'};
        return res.status(200).send(response);
      }
    });
  });
});

module.exports = router;
