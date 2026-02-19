const {describe, it, afterEach} = require('mocha')
const {expect, assert} = require('chai')
const DB = require('../src/database')
const fs = require('fs')
const path = require('path')
const appRoot = require('app-root-path').path
let db = null

describe('Database Update', function () {
  afterEach(() => {
    db && db.close()
    db = null
    try {
      fs.unlinkSync(path.resolve(appRoot, './data/sqlite3.db'))
      fs.rmdirSync(path.resolve(appRoot, './data'))
    } catch (e) {}
  })

  it('can update with object as where', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.update('Setting', {
      value: '1234'
    }, {
      key: 'test',
      value: 'now'
    })).to.be.equal(1)
  })

  it('can update with array as where', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.update('Setting', {
      key: 'test2',
      value: '1234'
    }, ['`key` = ? AND `value` = ?', 'test', 'now'])).to.be.equal(1)

    expect(db.queryFirstCell('SELECT COUNT(1) FROM Setting WHERE key = ?', 'test2')).to.be.equal(1)
  })

  it('can update with whitelist', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.update('Setting', {
      key: 'test2',
      value: '1234'
    }, ['`key` = ? AND `value` = ?', 'test', 'now'], ['key'])).to.be.equal(1)

    // eslint-disable-next-line no-unused-expressions
    expect(db.queryFirstCell('SELECT value FROM Setting WHERE key = ?', 'test2')).to.be.equal('now')
  })

  it('can update with blacklist', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.updateWithBlackList('Setting', {
      key: 'test2',
      value: '1234'
    }, ['`key` = ? AND `value` = ?', 'test', 'now'], ['key', 'fasdasd'])).to.be.equal(1)

    expect(db.queryFirstCell('SELECT value FROM Setting WHERE key = ?', 'test')).to.equal('1234')
  })

  it('will reject tables with spaces', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    const fn = ()=>db.update('Has Spaces', {
        value: '1234'
      }, {
        key: 'test',
        value: 'now'
      })
    assert.throws(fn, Error, "alphanumeric")
  })

  it('will reject fields with spaces in the `updates` object', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    const updates = {}
    updates['has spaces'] = '1234'
    const fn = ()=>db.update('Setting', updates, {
        key: 'test',
        value: 'now'
      })
    assert.throws(fn, Error, "alphanumeric")
  })

  it('will reject fields with spaces in the `where` object', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    const where = {}
    where['has spaces'] = '1234'
    const fn = ()=>db.update('Setting', {
        value: '1234'
      }, where)
    assert.throws(fn, Error, "alphanumeric")
  })

  it('will accept values with spaces', function () {
    db = new DB({
       migrate: {
         migrationsPath: './test/migrations'
       }
     })
     expect(db.update('Setting', {
       value: 'has space 1'
     }, {
       key: 'has space 2',
       value: 'has space 3'
     })).to.be.equal(0)
  })
})
