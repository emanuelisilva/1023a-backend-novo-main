import 'dotenv/config';
import mysql from 'mysql2/promise';
import express, { Request, Response } from 'express';

console.log(process.env.DBUSER);

const app = express();

app.get('/', async (req: Request, res: Response) => {
  if (!process.env.DBUSER) {
    return res.status(500).send("variavel de ambiente DBUSER nao esta definida");
  }
  if (process.env.DBPASSWORD==undefined) {
    return res.status(500).send("variavel de ambiente DBPASSWORD nao esta definida");
  }
  if (!process.env.DBHOST) {
    return res.status(500).send("variavel de ambiente DBHOST nao esta definida");
  }
  if (!process.env.DBNAME) {
    return res.status(500).send("variavel de ambiente DBNAME nao esta definida");
  }
  if (!process.env.DBPORT) {
    return res.status(500).send("variavel de ambiente DBPORT nao esta definida");
  }

  try {
    const connection = await mysql.createConnection({
      host: process.env.DBHOST,
      user: process.env.DBUSER,
      password: process.env.DBPASSWORD,
      database: process.env.DBNAME,
      port: Number(process.env.DBPORT),
    });
    res.send("Conectado ao banco de dados com sucesso!");
    await connection.end();
  } catch (error) {
    console.error("Erro ao conectar no banco de dados: ", error);
    return res.status(500).send("erro ao conectar no banco de dados: " + error);
  }
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});