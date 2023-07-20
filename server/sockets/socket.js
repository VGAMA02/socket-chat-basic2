const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utils/utilidades');

const usuarios = new Usuarios();
io.on('connection', (client) => {

    console.log('Usuario conectado');

    client.on('entrarChat',(data, callback) => {
       /*  console.log(data); */

        console.log(client.id,data.nombre, data.sala);
        if(!data.nombre || !data.sala){
            return callback({
                error:true,
                mensaje: 'El nombre y sala son necesarios'
            });
        }
        client.join(data.sala)
        usuarios.agregarPersona(client.id,data.nombr,data.sala);
        client.broadcast.to(data.sala).emit('listaPersona',usuarios.getPersonasPorSala(data.sala));
        callback(usuarios.getPersonasPorSala(data.sala));
    })

    client.on('crearMensaje', (data)=>{
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje',mensaje);
    })

    client.on('disconnect',() => {
        let personaBorrada = usuarios.borrarPersona(client.id);
/*         console.log('Borrada:');
        console.log(personaBorrada); */
        client.broadcast.to(personaBorrada.sala).emit('crearMensaje',crearMensaje('Administrador',`${personaBorrada} Salio`));
        client.broadcast.to(personaBorrada.sala).emit('listaPersona',usuarios.getPersonasPorSala(personaBorrada.sala));
    })

    //Mensaje privado
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado',crearMensaje(persona.nombre,data.mensaje))
    });

   /*  socket.emit('mensajePrivado', {mensaje:'Hola verdes', para: 'bKvAmHdsZDDjNTc5AAAB'}) */
});