/*import express from "express";
import userRoutes from "./routes/users.js";
import cors from "cors";

const app  = express() 

app.use(express.json());
app.use(cors());

app.use("/", userRoutes);

app.listen(3001);*/

const express = require('express');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Configuração do banco de dados
const db = mysql.createPool({
    host: 'b9lsqlxrc1wrcggnqosi-mysql.services.clever-cloud.com',
    user: 'ugcnyroeqou4hr6n',
    password: 'fmIducXVC9LOVxi6KgPB',
    database: 'b9lsqlxrc1wrcggnqosi'
});

// Cache em memória
const cache = new Map();

// Função para buscar transações com paginação
async function buscarTransacoes(nomeDoItem = '', page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const cacheKey = `${nomeDoItem}:${page}:${limit}`;
    const cachedTransacoes = cache.get(cacheKey);

    if (cachedTransacoes) {
        return cachedTransacoes;
    }

    const [rows] = await db.query(
        `SELECT id, tipo, forma_pagamento, valor, NOME_DO_ITEM, DATE_FORMAT(data, '%Y-%m-%d') AS data
         FROM transacoes
         WHERE NOME_DO_ITEM LIKE ?
         LIMIT ? OFFSET ?`,
        [`%${nomeDoItem}%`, limit, offset]
    );

    cache.set(cacheKey, rows); // Cache com duração em memória
    return rows;
}

// Função para calcular resumos financeiros
async function calcularResumos(transacoes) {
    const total_entrada = transacoes.reduce((acc, transacao) => acc + (transacao.tipo === 'entrada' ? transacao.valor : 0), 0);
    const total_saida = transacoes.reduce((acc, transacao) => acc + (transacao.tipo === 'saida' ? transacao.valor : 0), 0);
    const saldo = total_entrada - total_saida;

    const total_entrada_dia = transacoes.reduce((acc, transacao) => {
        const hoje = new Date().toISOString().split('T')[0];
        return acc + (transacao.tipo === 'entrada' && transacao.data === hoje ? transacao.valor : 0);
    }, 0);

    const total_saida_dia = transacoes.reduce((acc, transacao) => {
        const hoje = new Date().toISOString().split('T')[0];
        return acc + (transacao.tipo === 'saida' && transacao.data === hoje ? transacao.valor : 0);
    }, 0);

    return { saldo, total_entrada, total_saida, total_entrada_dia, total_saida_dia };
}

// Função para adicionar tarefa à fila
const tarefas = [];
let processando = false;

function adicionarTarefa(tarefa) {
    tarefas.push(tarefa);
    processarTarefas();
}

async function processarTarefas() {
    if (processando) return;
    processando = true;

    while (tarefas.length > 0) {
        const tarefa = tarefas.shift();
        try {
            await tarefa();
        } catch (err) {
            console.error('Erro ao processar tarefa:', err);
        }
    }

    processando = false;
}

// Rota para listagem de transações
app.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const nomeDoItem = req.query.nome_do_item || '';

    try {
        const transacoes = await buscarTransacoes(nomeDoItem, parseInt(page), parseInt(limit));
        const { saldo, total_entrada, total_saida, total_entrada_dia, total_saida_dia } = await calcularResumos(transacoes);

        res.render('index', {
            transacoes: transacoes,
            saldo,
            total_entrada,
            total_saida,
            total_entrada_dia,
            total_saida_dia,
            nome_do_item: nomeDoItem,
            getTransacaoComIcone
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar transações.');
    }
});

// Rota para editar transação
app.get('/edit-transacao/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.query('SELECT * FROM transacoes WHERE id = ?', [id]);
        if (result.length > 0) {
            res.render('edit', { transacao: result[0] });
        } else {
            res.redirect('/');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao buscar transação.');
    }
});

// Rota para adicionar transação
app.post('/add-transacao', async (req, res) => {
    const { tipo, valor, data, forma_pagamento, nome_do_item } = req.body;
    try {
        await db.query(
            'INSERT INTO transacoes (tipo, valor, data, forma_pagamento, NOME_DO_ITEM, fechado) VALUES (?, ?, ?, ?, ?, FALSE)',
            [tipo, valor, data, forma_pagamento, nome_do_item]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao adicionar transação.');
    }
});

// Rota para atualizar transação
app.post('/update-transacao', async (req, res) => {
    const { id, nome_do_item, tipo, valor, data, forma_pagamento } = req.body;
    try {
        await db.query(
            'UPDATE transacoes SET tipo = ?, valor = ?, data = ?, forma_pagamento = ?, NOME_DO_ITEM = ? WHERE id = ?',
            [tipo, valor, data, forma_pagamento, nome_do_item, id]
        );
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar transação.');
    }
});

// Rota para deletar transação
app.post('/delete-transacao', async (req, res) => {
    const { id } = req.body;
    try {
        await db.query('DELETE FROM transacoes WHERE id = ?', [id]);
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao deletar transação.');
    }
});

// Rota para fechamento de caixa
app.post('/fechar-caixa', (req, res) => {
    adicionarTarefa(async () => {
        try {
            await db.query('UPDATE transacoes SET fechado = TRUE WHERE fechado = FALSE');
            console.log('Caixa fechado com sucesso.');
        } catch (err) {
            console.error('Erro ao fechar o caixa:', err);
        }
    });
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Servidor rodando na porta 3000');
});
