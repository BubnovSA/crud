const http = require('http');
const { Pool } = require('pg');

// Чтение переменных окружения
const {
    APP_PORT = 3000,
    DB_HOST = 'localhost',
    DB_USER = 'postgres',
    DB_PASSWORD = 'password',
    DB_NAME = 'testdb',
    DB_PORT = 5432,
} = process.env;

// Настройки для подключения к базе данных
const pool = new Pool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: DB_PORT,
});

// Обработчик запросов
const requestHandler = async (req, res) => {
    const client = await pool.connect(); // Получаем клиента из пула

    try {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const id = url.pathname.split('/')[2]; // Извлекаем id из URL

        if (req.method === 'GET' && url.pathname === '/items') {
            // Получение всех элементов
            const result = await client.query('SELECT * FROM items');
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows));
        } else if (req.method === 'GET' && url.pathname.startsWith('/items/')) {
            // Получение элемента по ID
            const result = await client.query('SELECT * FROM items WHERE id = $1', [id]);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(result.rows[0] || {})); // Возвращаем пустой объект, если элемент не найден
        } else if (req.method === 'POST' && url.pathname === '/items') {
            // Добавление нового элемента
            let body = '';
            req.on('data', chunk => (body += chunk));
            req.on('end', async () => {
                try {
                    const { name, description } = JSON.parse(body);
                    const result = await client.query(
                        'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
                        [name, description]
                    );
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(result.rows[0])); // Возвращаем добавленный элемент
                } catch (err) {
                    console.error('Error inserting data:', err);
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid input data' }));
                }
            });
        } else {
            // Обработка других маршрутов
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } catch (err) {
        console.error('Database query error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
    } finally {
        client.release(); // Возвращаем клиента в пул после завершения работы
    }
};

// Создаём HTTP сервер
const server = http.createServer(requestHandler);

const PORT = APP_PORT;

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
