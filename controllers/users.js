/*import { db } from "../db.js";

export const getUsers = (_, res) => {
    const q = "SELECT * FROM colaboradores";

    db.query(q, (err, data) => {
        if (err) return res.json(err);
        return res.status(200).json(data);

    });
};
export const allusers = (req, res) => {
    const q = "SELECT * FROM colaboradores WHERE 'id' = id";

    db.query(q, [req.params.id], (err) => {
        if (err) return res.json(err);

        return res.status(200).json();
    });

   
};

export const addUser = (req, res) => {
    const q = "INSERT INTO colaboradores(`nome`, `departamento`, `cpf`, `email`, `telefone`, `cidade`, `estado`, `unidade`) VALUES(?)";

    const values = [
        req.body.nome,
        req.body.departamento,
        req.body.cpf,
        req.body.email,
        req.body.telefone,
        req.body.cidade,
        req.body.estado,
        req.body.unidade,
       
    ];
    db.query(q, [values], (err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário cadastrado com sucesso");
    });
};

export const updateUser = (req, res) => {
const q = "UPDATE colaboradores SET `nome` = ?, `departamento` = ?, `cpf` = ?, `email` = ?, `telefone` = ?, `cidade` = ?, `estado` = ?, `unidade` = ? WHERE `id` = ?";

const values = [
        req.body.nome,
        req.body.departamento,
        req.body.cpf,
        req.body.email,
        req.body.telefone,
        req.body.cidade,
        req.body.estado,
        req.body.unidade,   
];
db.query(q, [...values, req.params.id], (err) => {
    if (err) return res.json(err);

    return res.status(200).json("Usuário alterado com sucesso");
});
};

export const deleteUser = (req, res) => {
    const q = "DELETE FROM colaboradores WHERE `id` = ?";

    db.query(q, [req.params.id], (err) => {
        if (err) return res.json(err);

        return res.status(200).json("Usuário deletado com sucesso!!");
    });
};*/
