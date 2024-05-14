const { Pool } = require('pg');
require('dotenv').config();

const tableName = "history";

const pool = new Pool({
    user: process.env.POSTGRE_USER,
    host: process.env.POSTGRE_HOST,
    database: process.env.POSTGRE_DB,
    password: process.env.POSTGRE_PASSWORD,

    ssl: {
        require: true,
    }
});

pool.connect().then(() => {
    console.log("🚨 Connected to the database");
});

async function addEvent(req, res) {
    const { title, description, year, period, month, day, country, city } = req.body;
    try {
        const result = await pool.query(
            `insert into ${tableName} (title, description, year, period, month, day, country, city) values 
            ($1, $2, $3, $4, $5, $6, $7, $8) returning *`,
            [title, description, year, period, month, day, country, city]
        )
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

async function getAllEvents(req, res) {
    try {
        const result = await pool.query(`select * from ${tableName}`);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

async function updateEvent(req, res) {
    const { id } = req.params;
    const { title, description, year, period, month, day, country, city } = req.body;
    try {
        const result = await pool.query(
            `update ${tableName} set title = $1, description = $2, year = $3, period = $4, month = $5, day = $6, country = $7, city = $8 where id = $9 returning *`,
            [title, description, year, period, month, day, country, city, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

async function deleteEvent(req, res) {
    const { id } = req.params;
    try {
        const result = await pool.query(`delete from ${tableName} where id = $1 returning *`, [id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

async function postBulk(req, res) {
    const { events } = req.body;
    try {
        const values = events.map(event => {
            const { title, description, year, period, month, day, country, city } = event;
            return [title, description, year, period, month, day, country, city];
        });
        const result = await pool.query(
            `insert into ${tableName} (title, description, year, period, month, day, country, city) values 
            ${values.map((_, index) => `($${index * 8 + 1}, $${index * 8 + 2}, $${index * 8 + 3}, $${index * 8 + 4}, $${index * 8 + 5}, $${index * 8 + 6}, $${index * 8 + 7}, $${index * 8 + 8})`).join(",")}
            returning *`,
            values.flat()
        );
        res.status(201).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

async function getCountry(req, res) {
    const { country } = req.params;
    try {
        const result = await pool.query(`select * from ${tableName} where country = $1`, [country]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }

}

async function getPaginated(req, res){
    const { page, pageSize } = req.params;
    try {
        const result = await pool.query(`select * from ${tableName} limit $1 offset $2`, [pageSize, (page - 1) * pageSize]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

module.exports = {
    addEvent,
    getAllEvents,
    updateEvent,
    deleteEvent
};