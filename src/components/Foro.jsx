import { useEffect, useState } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export default function Foro() {
    const [mensajes, setMensajes] = useState([]);
    const [nuevoTexto, setNuevoTexto] = useState(""); // Estado para el input

    useEffect(() => {
        const echo = new Echo({
            broadcaster: 'pusher',
            key: 'local',
            wsHost: window.location.hostname,
            wsPort: 6001,
            wssPort: 6001,
            forceTLS: false,
            disableStats: true,
            cluster: 'mt1', 
            enabledTransports: ['ws', 'wss'],
        });

        echo.channel('foro-comunidad')
            .listen('.nuevo-mensaje', (e) => {
                console.log('Evento recibido:', e);
                setMensajes((prev) => [...prev, e]);
            });

        return () => {
            echo.disconnect();
        };
    }, []);

    // Función para enviar el mensaje al Backend
    const enviarMensaje = async (e) => {
        e.preventDefault(); // Evitar que se recargue la página
        if (!nuevoTexto.trim()) return;

        try {
            const respuesta = await fetch('http://127.0.0.1:8000/api/enviar-mensaje-foro', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    mensaje: nuevoTexto
                })
            });

            if (respuesta.ok) {
                setNuevoTexto(""); // Limpiar el input si se envió bien
                console.log("Mensaje enviado al servidor");
            } else {
                console.error("Error al enviar");
            }

        } catch (error) {
            console.error("Error de conexión:", error);
        }
    };

    return (
        <div className="p-10 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Foro Vecinal</h1>
            
            {/* Área de Mensajes */}
            <div className="border border-gray-300 p-4 h-96 overflow-y-auto bg-gray-50 rounded-lg shadow-inner mb-4">
                {mensajes.length === 0 ? (
                    <p className="text-gray-400 text-center mt-10">Sé el primero en escribir...</p>
                ) : (
                    mensajes.map((msg, index) => (
                        <div key={index} className="bg-white p-3 mb-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                            <p className="font-bold text-blue-700 text-sm">{msg.usuario}</p> 
                            <p className="text-gray-700">{msg.mensaje}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Formulario de Envío */}
            <form onSubmit={enviarMensaje} className="flex gap-2">
                <input 
                    type="text" 
                    className="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500"
                    placeholder="Escribe un mensaje..."
                    value={nuevoTexto}
                    onChange={(e) => setNuevoTexto(e.target.value)}
                />
                <button 
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}