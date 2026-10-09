// src/middleware/authJwt.js
const jwt = require("jsonwebtoken");

// 1. VERIFICAR SI TIENE "TARJETA LLAVE" (TOKEN)
const verifyToken = (req, res, next) => {
  // Compatibilidad con x-access-token y el estándar Authorization: Bearer <token>
  let token = req.headers["x-access-token"] ||
    (req.headers.authorization && req.headers.authorization.split(' ')[1]);

  if (!token) {
    return res.status(403).send({
      message: "¡No se proporcionó token! Acceso denegado."
    });
  }

  // Verificamos la firma del token
  jwt.verify(token, process.env.SECRET_KEY, { algorithms: ['HS256'] }, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: "¡No autorizado! Token inválido o expirado."
      });
    }

    if (!decoded || decoded.token_use !== 'access') {
      return res.status(403).send({
        message: "Token no autorizado para este recurso"
      });
    }

    // Si pasa, guardamos los datos del usuario en la petición (req)
    // Así los controladores sabrán quién es.
    req.userId = decoded.id_usuario;
    req.userRol = decoded.rol;
    req.idPerfil = decoded.id_perfil;
    
    next(); // ¡Pase usted!
  });
};

// 2. VERIFICAR SI ES ADMIN (Jefe Supremo)
const isAdmin = (req, res, next) => {
  if (req.userRol === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "¡Se requiere rol de Administrador!" });
};

// 3. VERIFICAR SI ES DOCENTE O ADMIN
const isDocenteOrAdmin = (req, res, next) => {
  if (req.userRol === "docente" || req.userRol === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Se requiere rol de Docente" });
};

// 4. VERIFICAR SI ES TUTOR O ADMIN
const isTutorOrAdmin = (req, res, next) => {
  if (req.userRol === "tutor" || req.userRol === "admin") {
    next();
    return;
  }
  res.status(403).send({ message: "Se requiere rol de Tutor" });
};

module.exports = {
  verifyToken,
  isAdmin,
  isDocenteOrAdmin,
  isTutorOrAdmin
};