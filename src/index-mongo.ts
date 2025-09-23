import 'dotenv/config'
import express from 'express';
import rotas from './rotas.js';

const app = express();
app.use(express.json());
app.use(rotas);

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});