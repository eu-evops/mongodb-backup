'use strict';
/**
 * @file data test
 * @module mongodb-backup
 * @package mongodb-backup
 * @subpackage test
 * @version 0.0.1
 * @author hex7c0 <hex7c0@gmail.com>
 * @license GPLv3
 */

/*
 * initialize module
 */
var backup = require('..');
var assert = require('assert');
var fs = require('fs');
var extname = require('path').extname;
var MongoClient = require('mongodb').MongoClient;
var BSON = require('bson');
// BSON = new BSON();
var URI = process.env.URI;
var ROOT = __dirname + '/dump';
var DOCS = {};

/*
 * test module
 */
describe('data', function () {


  describe('db query', function () {
    it('should return data from "logins" collection', function (done) {
      MongoClient.connect(URI, (err, client) => {
        if (err) return done(err);

        var db = client.db('backup-tests');

        var collection = db.collection('logins');
        if (err) return done(err);

        collection.find({})
          .toArray()
          .then(docs => {
            collection.estimatedDocumentCount()
              .then(numberOfDocs => {
                assert.equal(numberOfDocs > 0, true, 'not empty collection');
                for (var i = 0, ii = docs.length; i < ii; i++) {
                  DOCS[docs[i]._id] = docs[i];
                }

                client.close();
                done();

              })
          })
          .catch(done);
      });
    });
  });
});

describe('query', function () {

  it('should build 1 directory and 1 file (*.json)', function (done) {

    backup({
      uri: URI,
      root: ROOT,
      dbName: 'backup-tests',
      collections: ['logins'],
      parser: 'json',
      metadata: true,
      query: {
        _id: DOCS[Object.keys(DOCS)[0]]._id
      },
      callback: function (err) {

        assert.ifError(err);
        setTimeout(function () {

          fs.readdirSync(ROOT).forEach(function (first) { // database

            var database = ROOT + '/' + first;
            assert.equal(fs.statSync(database).isDirectory(), true);
            var second = fs.readdirSync(database);
            assert.equal(second.length, 2);
            assert.equal(second[1], 'logins');
            fs.unlinkSync(database + '/.metadata/' + second[1]);
            var collection = database + '/' + second[1];
            if (fs.statSync(collection).isDirectory() === false) {
              return;
            }
            var docs = fs.readdirSync(collection);
            assert.equal(docs.length, 1, 'forget?');
            var third = docs[0];
            var document = collection + '/' + third;
            assert.equal(extname(third), '.json');
            var _id = third.split('.json')[0];
            var data = require(document);
            // JSON error on id and Date
            assert.equal(data._id, DOCS[_id]._id);
            assert.equal(data._id, DOCS[Object.keys(DOCS)[0]]._id);
            fs.unlinkSync(document);
            fs.rmdirSync(collection);
            fs.rmdirSync(database + '/.metadata/');
            fs.rmdirSync(database);
          });
          done();
        }, 500);
      }
    });
  });
  it('should build 1 directory and 1 file (*.bson)', function (done) {

    backup({
      uri: URI,
      root: ROOT,
      dbName: 'backup-tests',
      collections: ['logins'],
      parser: 'bson',
      metadata: true,
      query: {
        _id: DOCS[Object.keys(DOCS)[0]]._id
      },
      callback: function (err) {

        assert.ifError(err);
        setTimeout(function () {

          fs.readdirSync(ROOT).forEach(function (first) { // database

            var database = ROOT + '/' + first;
            assert.equal(fs.statSync(database).isDirectory(), true);
            var second = fs.readdirSync(database);
            assert.equal(second.length, 2);
            assert.equal(second[1], 'logins');
            fs.unlinkSync(database + '/.metadata/' + second[1]);
            var collection = database + '/' + second[1];
            if (fs.statSync(collection).isDirectory() === false) {
              return;
            }
            var docs = fs.readdirSync(collection);
            assert.equal(docs.length, 1, 'forget?');
            var third = docs[0];
            var document = collection + '/' + third;
            assert.equal(extname(third), '.bson');
            var _id = third.split('.bson')[0];
            var data = BSON.deserialize(fs.readFileSync(document, {
              encoding: null
            }));
            assert.deepEqual(data, DOCS[_id]);
            assert.equal(String(data._id), DOCS[Object.keys(DOCS)[0]]._id);
            fs.unlinkSync(document);
            fs.rmdirSync(collection);
            fs.rmdirSync(database + '/.metadata/');
            fs.rmdirSync(database);
          });
          done();
        }, 500);
      }
    });
  });
});

describe('collections', function () {

  it('should build 1 directory (*.json)', function (done) {

    backup({
      uri: URI,
      root: ROOT,
      dbName: 'backup-tests',
      collections: ['logins'],
      parser: 'json',
      metadata: true,
      callback: function (err) {

        assert.ifError(err);
        setTimeout(function () {

          fs.readdirSync(ROOT).forEach(function (first) { // database

            var database = ROOT + '/' + first;
            assert.equal(fs.statSync(database).isDirectory(), true);
            var second = fs.readdirSync(database);
            assert.equal(second.length, 2);
            assert.equal(second[1], 'logins');
            fs.unlinkSync(database + '/.metadata/' + second[1]);
            var collection = database + '/' + second[1];
            if (fs.statSync(collection).isDirectory() === false) {
              return;
            }
            var docs = fs.readdirSync(collection);
            assert.equal(docs.length, Object.keys(DOCS).length, 'forget?');
            docs.forEach(function (third) { // document

              var document = collection + '/' + third;
              assert.equal(extname(third), '.json');
              var _id = third.split('.json')[0];
              var data = require(document);
              // JSON error on id and Date
              assert.equal(data._id, DOCS[_id]._id);
              fs.unlinkSync(document);
            });
            fs.rmdirSync(collection);
            fs.rmdirSync(database + '/.metadata/');
            fs.rmdirSync(database);
          });
          done();
        }, 500);
      }
    });
  });
  it('should build 1 directory (*.bson)', function (done) {

    backup({
      uri: URI,
      root: ROOT,
      dbName: 'backup-tests',
      collections: ['logins'],
      parser: 'bson',
      metadata: true,
      callback: function (err) {

        assert.ifError(err);
        setTimeout(function () {

          fs.readdirSync(ROOT).forEach(function (first) { // database

            var database = ROOT + '/' + first;
            assert.equal(fs.statSync(database).isDirectory(), true);
            var second = fs.readdirSync(database);
            assert.equal(second.length, 2);
            assert.equal(second[1], 'logins');
            fs.unlinkSync(database + '/.metadata/' + second[1]);
            var collection = database + '/' + second[1];
            if (fs.statSync(collection).isDirectory() === false) {
              return;
            }
            var docs = fs.readdirSync(collection);
            assert.equal(docs.length, Object.keys(DOCS).length, 'forget?');
            docs.forEach(function (third) { // document

              var document = collection + '/' + third;
              assert.equal(extname(third), '.bson');
              var _id = third.split('.bson')[0];
              var data = BSON.deserialize(fs.readFileSync(document, {
                encoding: null
              }));
              assert.deepEqual(data, DOCS[_id]);
              fs.unlinkSync(document);
            });
            fs.rmdirSync(collection);
            fs.rmdirSync(database + '/.metadata/');
            fs.rmdirSync(database);
          });
          done();
        }, 500);
      }
    });
  });
});
