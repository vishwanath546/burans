const env = process.env;
const config = {
    db: {
        host: env.DB_HOST || '185.224.138.175',
        user: env.DB_USER || 'u890460787_burans',
        password: env.DB_PASSWORD || 'Mc9drnSSa>',
        database: env.DB_NAME || 'u890460787_burans',
        waitForConnections: true,
        connectionLimit: env.DB_CONN_LIMIT || 2,
        // queueLimit: 10,
        debug: false
    },
    listPerPage: env.LIST_PER_PAGE || 10,
};

module.exports = config;
