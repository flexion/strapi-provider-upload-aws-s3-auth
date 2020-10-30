'use strict';

/**
 * Module dependencies
 */

/* eslint-disable no-unused-vars */
// Public node modules.
const _ = require('lodash');
const AWS = require('aws-sdk');

const BYTE_MILLIS_MULTIPLIER = 20;

module.exports = {
  init(config) {
    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          const key = `${path}${file.hash}${file.ext}`;
          const securePath = config.securePath ? config.securePath : 'upload-auth';
          const timeout = Math.max(120000, Math.round(file.size * BYTE_MILLIS_MULTIPLIER));
          S3.upload(
            {
              Key: key,
              Body: Buffer.from(file.buffer, 'binary'),
              ACL: 'private',
              ContentType: file.mime,
              httpOptions: {
                timeout: timeout
              },
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              file.url = `/${securePath}/${key}`;

              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          S3.deleteObject(
            {
              Key: `${path}${file.hash}${file.ext}`,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
