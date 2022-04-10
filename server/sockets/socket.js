const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');


const usuarios = new Usuarios();


io.on('connection', (client) => {

    client.on('entrarChat', ( data, callback ) => {
        
    
        
        if( !data.nombre || !data.sala ) {
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            });
        }

        client.join(data.sala);

        usuarios.agregarPersona( client.id, data.nombre, data.sala );

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala( data.sala ) );
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${ data.nombre } se unió` ) );

        callback( usuarios.getPersonasPorSala( data.sala ) );
    
    });


    client.on('crearMensaje', ( data, callback ) => {

        let persona = usuarios.getPersona( client.id );

        let mensaje = crearMensaje( persona.nombre, data.mensaje );
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje );
        


        callback( mensaje );

    });



    client.on('disconnect', () => {

        let personaABorrar = usuarios.getPersona( client.id );
        
        client.broadcast.to(personaABorrar.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaABorrar.nombre } salió` ) );
        client.broadcast.to(personaABorrar.sala).emit('listaPersona', usuarios.getPersonasPorSala( personaABorrar.sala ) );

        let personaBorrada = usuarios.borrarPersona( client.id );

    });


    client.on('mensajePrivado', data => {

        let persona = usuarios.getPersona( client.id );

        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje( persona.nombre, data.mensaje ) );

    });



});