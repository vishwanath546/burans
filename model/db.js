const mysql = require("mysql2/promise");
const config = require("../config");
const pool = mysql.createPool(config.db);

function emptyOrRows(rows) {
    if (!rows) {
        return [];
    }
    return rows;
}

async function query(sql, params) {
    let query = mysql.format(sql, params);
    console.log(query);
    const [rows] = await pool.execute(query);
    return emptyOrRows(rows);
}

async function findAllCount(tableName, where) {
    let sql;
    if (!where) {
        sql = mysql.format(`select count(id) as count
                            from ? ? `, [tableName]);
    } else {
        sql = mysql.format(`select count(id) as count
                            from ? ?
                            where ? `, [
            tableName,
            where,
        ]);
    }
    console.log(sql);
    const [records] = await pool.query(sql);
    if (!records) {
        return 0;
    }
    return records[0].count;
}

async function dataTableSource(
    tableName,
    selectAttribute,
    where,
    orderColumn,
    searchColumn,
    searchValue = "",
    direction = "desc",
    offset = 0,
    length = 10,
    isFormat = true
) {
    let sql;
    if (isFormat) {
        if (!where) {
            sql = mysql.format(
                `select ?? from ?? where ? like '%${searchValue}%' order by ${orderColumn} ${direction} limit ${offset},${length}`,
                [selectAttribute, tableName, searchColumn]
            );
        } else {
            sql = mysql.format(
                `select ?? from ?? where ? and ? like '%${searchValue}%' order by ${orderColumn} ${direction} limit ${offset},${length}`,
                [selectAttribute, tableName, where, searchColumn]
            );
        }
    } else {
        if (where) {
            sql = mysql.format(
                `select ${selectAttribute.join(
                    ","
                )} from ?? where ? and ? like '%${searchValue}%' order by ${orderColumn} ${direction} limit ${offset},${length}`,
                [tableName, where, searchColumn]
            );
        } else {
            sql = mysql.format(
                `select ${selectAttribute.join(
                    ","
                )} from ?? where  ? like '%${searchValue}%' order by ${orderColumn} ${direction} limit ${offset},${length}`,
                [tableName, searchColumn]
            );
        }
    }
    console.log(sql);
    const [records] = await pool.query(sql);
    return emptyOrRows(records);
}

async function select(tableName, where, selectAttributes, limit = "") {
    let sql;

    let whereCondition = ``;
    if (where) {
        whereCondition = Object.keys(where)
            .map((key) => `${key}='${where[key]}'`)
            .join(" and ");
    }
    if (where && selectAttributes)
        sql = mysql.format(
            `select ${selectAttributes.join(",")} from ??  where ${whereCondition}`,
            [tableName]
        );
    if (!selectAttributes && where)
        sql = mysql.format(`select * from ??  where ${whereCondition}`, [
            tableName,
        ]);
    if (!where && selectAttributes)
        sql = mysql.format(`select ${selectAttributes.join(",")} from ??`, [
            tableName,
        ]);
    if (!where && !selectAttributes)
        sql = mysql.format("select * from ??", [tableName]);

    console.log(sql);
    const [records] = await pool.query(sql);
    return emptyOrRows(records);
}

async function insert(tableName, values) {
    let sql = mysql.format("insert into ?? set ?", [tableName, values]);
    console.log(sql);
    const [results, error] = await pool.query(sql);
    return {
        status: !error,
        insertId: results.insertId,
        error: error,
    };
}
async function bulkinsert(tableName, values, callback) {
    let keys = Object.keys(values[0]);
    let objvalues = values.map((obj) => keys.map((key) => obj[key]));
    let sql = "INSERT INTO " + tableName + " (" + keys.join(",") + ") VALUES ?";
    console.log(sql);
    // const [results, error] = await pool.query(sql);
    pool.query(sql, [objvalues], function (err, results) {
        callback(null, results);
    });
}
async function update(tableName, data, where) {
    let sql = mysql.format("update ?? set ? where ?", [tableName, data, where]);
    console.log(sql);
    const [results, error] = await pool.query(sql);
    return {
        status: !error,
        affectedRows: results.affectedRows,
        changedRows: results.changedRows,
        error: error,
    };
}

async function updateall(tableName, data, where) {
    if (data) {
        dataCondition = Object.keys(data)
            .map((key) => `${key}='${data[key]}'`)
            .join(" and ");
    }
    if (where) {
        whereCondition = Object.keys(where)
            .map((key) => `${key}='${where[key]}'`)
            .join(" and ");
    }
    let sql = mysql.format(
        `update ?? set ${dataCondition} where ${whereCondition}`,
        [tableName]
    );
    console.log(sql);
    const [results, error] = await pool.query(sql);
    return {
        status: !error,
        affectedRows: results.affectedRows,
        changedRows: results.changedRows,
        error: error,
    };
}

async function _delete(tableName, where) {
    let sql = mysql.format("delete from ?? where ?", [tableName, where]);
    console.log(sql);
    const [results, error] = await pool.query(sql);
    return {
        status: !error,
        affectedRows: results.affectedRows,
    };
}

async function _deleteall(tableName, where) {
    if (where) {
        whereCondition = Object.keys(where)
            .map((key) => `${key}='${where[key]}'`)
            .join(" and ");
    }
    let sql = mysql.format(`delete from ?? where ${whereCondition}`, [tableName]);
    console.log(sql);
    const [results, error] = await pool.query(sql);
    return {
        status: !error,
        affectedRows: results.affectedRows,
    };
}
function futureDateTime(minutesToAdd) {
    let currentDate = new Date();
    let d1 = new Date(currentDate.getTime() + minutesToAdd*60000);
    return (
        d1.getUTCFullYear() +
        "-" +
        d1.getUTCMonth() +
        "-" +
        d1.getUTCDate() +
        " " +
        d1.getUTCHours() +
        ":" +
        d1.getUTCMinutes() +
        ":" +
        d1.getUTCSeconds()
    );
}
function currentTimeStamp() {
    let d1 = new Date();
    return (
        d1.getUTCFullYear() +
        "-" +
        d1.getUTCMonth() +
        "-" +
        d1.getUTCDate() +
        " " +
        d1.getUTCHours() +
        ":" +
        d1.getUTCMinutes() +
        ":" +
        d1.getUTCSeconds()
    );
}

function transaction() {
    return pool.getConnection();
}

function sqlFormat(query, param) {
    return mysql.format(query, param);
}

module.exports = {
    query,
    select,
    insert,
    bulkinsert,
    update,
    updateall,
    _delete,
    _deleteall,
    dataTableSource,
    findAllCount,
    currentTimeStamp,
    transaction,
    futureDateTime
};
