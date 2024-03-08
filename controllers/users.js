import { db } from "../db.js";

export const getUsers = (_, res) => {
    const q = "SELECT * FROM usuarios";

    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);

    });
};
export const allusers = (req, res) => {
    const q = "SELECT * FROM usuarios WHERE 'id' = id";

    db.query(q, [req.params.id], (err) => {
        if (err) return res.json(err);

        return res.status(200).json();
    });

   
};

export const addUser = (req, res) => {
    const q = "INSERT INTO usuarios(`nome`, `telefone`, `email`) VALUES(?)";

    const values = [
        req.body.nome,
        req.body.telefone,
        req.body.email,
       
    ];
    db.query(q, [values], (err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário cadastrado com sucesso");
    });
};

export const updateUser = (req, res) => {
const q = "UPDATE usuarios SET `nome` = ?, `telefone` = ?, `email` = ? WHERE `id` = ?";

const values = [
    req.body.nome,
    req.body.telefone,
    req.body.email,    
];
db.query(q, [...values, req.params.id], (err) => {
    if (err) return res.json(err);

    return res.status(200).json("Usuário alterado com sucesso");
});
};

export const deleteUser = (req, res) => {
    const q = "DELETE FROM usuarios WHERE 'id' = ?";

    db.query(q, [req.params.id], (err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário deletado com sucesso!!");
    });
};