/*
 * UNIT TESTING
 * @author Henrique Realinho
 *
 */
'use strict';

const supertest = require('supertest');
const test = require('unit.js');
const app = require('../discord-bot.js');

const request = supertest(app);

describe('Tests bot initialization', function() {
  it('verifies bot', function(done) {
    console.log('Hello World');
  });
});
