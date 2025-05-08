const { describe, it, afterEach } = require('mocha')
const { expect, assert } = require('chai')
const DB = require('../src/database')
const fs = require('fs')
const path = require('path')
const appRoot = require('app-root-path').path
let db = null

describe('Database Delete', function () {
  afterEach(() => {
    db && db.close()
    db = null
    try {
      fs.unlinkSync(path.resolve(appRoot, './data/sqlite3.db'))
      fs.rmdirSync(path.resolve(appRoot, './data'))
    } catch (e) {}
  })

  it('can delete with object as where', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.delete('Setting', {
      key: 'test',
      value: 'now'
    })).to.be.equal(1)
  })

  it('can delete with array as where', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.delete('Setting', ['`key` = ? AND `value` = ?', 'test', 'now'])).to.be.equal(1)

    expect(db.queryFirstCell('SELECT COUNT(1) FROM Setting WHERE key = ?', 'test')).to.be.equal(0)
  })

  it('will not accept table names with spaces', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    const fn = () => db.delete('With Space', {
        key: 'test',
        value: 'now'
      })
    assert.throws(fn, Error, "alphanumeric")
  })

  it('will not accept field names with spaces', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    const where = {}
    where['has spaces'] = 'now'
    const fn = () => db.delete('Setting', where)
    assert.throws(fn, Error, "alphanumeric")
  })

  it('will accept values with spaces', function () {
    db = new DB({
      migrate: {
        migrationsPath: './test/migrations'
      }
    })
    expect(db.delete('Setting', {
      key: 'test',
      value: 'has spaces'
    })).to.be.equal(0)
  })
})
