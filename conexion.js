const mysql = require('mysql');
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'laboratorio15'
});

connection.connect((error) => {
  if (error) {
    console.error('Error al conectar a MySQL: ', error);
    return;
  }
  console.log('Conexión exitosa a MySQL');
});

app.get('/', (req, res) => {
  connection.query('SELECT * FROM alumnos', (errorAlumnos, resultadosAlumnos) => {
    if (errorAlumnos) {
      console.error('Error al obtener los datos de alumnos: ', errorAlumnos);
      return;
    }

    connection.query('SELECT * FROM cursos', (errorCursos, resultadosCursos) => {
      if (errorCursos) {
        console.error('Error al obtener los datos de cursos: ', errorCursos);
        return;
      }

      res.render('index', { alumnos: resultadosAlumnos, cursos: resultadosCursos, activeTab: 'alumnos' });
    });
  });
});

// Ruta para agregar un nuevo alumno
app.post('/agregar-alumno', (req, res) => {
  const nuevoAlumno = req.body;
  // Validar datos antes de la inserción (ejemplo simple)
  if (!nuevoAlumno.columna1 || !nuevoAlumno.columna2 || !nuevoAlumno.columna3 || !nuevoAlumno.id_curso) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  connection.query('INSERT INTO alumnos SET ?', nuevoAlumno, (error, results) => {
    if (error) {
      console.error('Error al insertar datos de alumno: ', error);
      return;
    }
    console.log('Dato insertado exitosamente');
    res.redirect('/');
  });
});

// Ruta para eliminar un alumno
app.post('/eliminar-alumno/:id', (req, res) => {
  const idAlumno = req.params.id;

  connection.query('DELETE FROM alumnos WHERE id = ?', idAlumno, (error, results) => {
    if (error) {
      console.error('Error al eliminar dato de alumno: ', error);
      return;
    }
    console.log('Dato eliminado exitosamente');
    res.redirect('/');
  });
});

// Ruta para mostrar el formulario de edición de alumno
app.get('/editar-alumno/:id', (req, res) => {
  const idAlumno = req.params.id;
  connection.query('SELECT * FROM alumnos WHERE id = ?', idAlumno, (error, resultado) => {
    if (error) {
      console.error('Error al obtener los datos del alumno para editar: ', error);
      return;
    }

    // Obtener la lista de cursos antes de renderizar la vista
    connection.query('SELECT * FROM cursos', (errorCursos, resultadosCursos) => {
      if (errorCursos) {
        console.error('Error al obtener los datos de cursos: ', errorCursos);
        return;
      }

      // Renderizar la vista con la información del alumno y la lista de cursos
      res.render('editar-alumno', { alumno: resultado[0], cursos: resultadosCursos });
    });
  });
});

// Ruta para manejar la actualización de alumno
app.post('/editar-alumno/:id', (req, res) => {
  const idAlumno = req.params.id;
  const { columna1, columna2, columna3 } = req.body;

  connection.query('UPDATE alumnos SET columna1=?, columna2=?, columna3=? WHERE id=?',
    [columna1, columna2, columna3, idAlumno],
    (error, results) => {
      if (error) {
        console.error('Error al actualizar datos de alumno: ', error);
        return;
      }
      console.log('Dato actualizado exitosamente');
      res.redirect('/');
    });
});

// Ruta para actualizar la edad de un alumno
app.post('/actualizar-edad/:id', (req, res) => {
  const idAlumno = req.params.id;
  const nuevaEdad = req.body.nuevaEdad;

  // Validar datos antes de la actualización (ejemplo simple)
  if (!Number.isInteger(parseInt(nuevaEdad)) || nuevaEdad <= 0) {
    return res.status(400).send('La nueva edad debe ser un número entero positivo.');
  }

  connection.query('UPDATE alumnos SET columna2 = ? WHERE id = ?', [nuevaEdad, idAlumno], (error, results) => {
    if (error) {
      console.error('Error al actualizar datos de alumno: ', error);
      return;
    }
    console.log('Dato actualizado exitosamente');
    res.redirect('/');
  });
});

// Ruta para agregar un nuevo curso
app.post('/agregar-curso', (req, res) => {
  const nuevoCurso = req.body;
  // Validar datos antes de la inserción (ejemplo simple)
  if (!nuevoCurso.nombre || !nuevoCurso.creditos) {
    return res.status(400).send('Todos los campos son obligatorios.');
  }

  connection.query('INSERT INTO cursos SET ?', nuevoCurso, (error, results) => {
    if (error) {
      console.error('Error al insertar datos de curso: ', error);
      return;
    }
    console.log('Dato insertado exitosamente');
    res.redirect('/');
  });
});

// Ruta para eliminar un curso
app.post('/eliminar-curso/:id', (req, res) => {
  const idCurso = req.params.id;

  connection.query('DELETE FROM cursos WHERE id = ?', idCurso, (error, results) => {
    if (error) {
      console.error('Error al eliminar dato de curso: ', error);
      return;
    }
    console.log('Dato eliminado exitosamente');
    res.redirect('/');
  });
});

// Ruta para mostrar el formulario de edición de curso
app.get('/editar-curso/:id', (req, res) => {
  const idCurso = req.params.id;
  connection.query('SELECT * FROM cursos WHERE id = ?', idCurso, (error, resultado) => {
    if (error) {
      console.error('Error al obtener los datos del curso para editar: ', error);
      return;
    }
    res.render('editar-curso', { curso: resultado[0] });
  });
});

// Ruta para manejar la actualización de curso
app.post('/editar-curso/:id', (req, res) => {
  const idCurso = req.params.id;
  const { nombre, creditos } = req.body;

  connection.query('UPDATE cursos SET nombre=?, creditos=? WHERE id=?',
    [nombre, creditos, idCurso],
    (error, results) => {
      if (error) {
        console.error('Error al actualizar datos de curso: ', error);
        return;
      }
      console.log('Dato actualizado exitosamente');
      res.redirect('/');
    });
});

// Ruta para filtrar alumnos
app.get('/filtrar-alumnos', (req, res) => {
  const { edad, creditos } = req.query;

  // Validar que se proporcionaron tanto la edad como la cantidad de créditos
  if (!edad || !creditos) {
    return res.status(400).send('Se deben proporcionar tanto la edad como la cantidad de créditos.');
  }

  // Obtener cursos antes de realizar la consulta con cláusulas WHERE
  connection.query('SELECT * FROM cursos', (errorCursos, resultadosCursos) => {
    if (errorCursos) {
      console.error('Error al obtener los datos de cursos: ', errorCursos);
      return res.status(500).send('Error interno del servidor.');
    }

    // Realizar la consulta con cláusulas WHERE para filtrar los resultados
    const query = `
      SELECT alumnos.*, cursos.creditos AS creditos_curso
      FROM alumnos
      JOIN cursos ON alumnos.id_curso = cursos.id
      WHERE alumnos.columna2 > ? AND cursos.creditos < ?
    `;

    connection.query(query, [edad, creditos], (error, resultados) => {
      if (error) {
        console.error('Error al obtener datos filtrados de alumnos: ', error);
        return res.status(500).send('Error interno del servidor.');
      }

      // Modificar los nombres de las variables al renderizar
      res.render('index', { alumnos: resultados, cursos: resultadosCursos, alumnosFiltrados: resultados, activeTab: 'filtrados' });
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
