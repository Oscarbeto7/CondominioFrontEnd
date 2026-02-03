import { useState, useEffect } from 'react';
import { Menu, Bell, User, AlertCircle, Calendar, DollarSign, MessageSquare } from 'lucide-react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

export default function Header() {
    const [notificaciones, setNotificaciones] = useState([]);
    const [menuAbierto, setMenuAbierto] = useState(false);

    // Conexión al WebSocket al cargar el componente
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

        // Escuchamos el canal general de notificaciones
        echo.channel('notificaciones-generales')
            .listen('.notificacion-recibida', (e) => {
                console.log("Nueva notificación:", e);
                // Agregamos la nueva notificación AL PRINCIPIO de la lista
                setNotificaciones((prev) => [e, ...prev]);
            });

        return () => {
            echo.disconnect();
        };
    }, []);

    // Función auxiliar para elegir el ícono y color según el tipo de notificación
    const obtenerEstiloNotificacion = (tipo) => {
        switch (tipo) {
            case 'multa': return { icon: <AlertCircle size={20} />, color: 'text-red-600 bg-red-100' };
            case 'pago': return { icon: <DollarSign size={20} />, color: 'text-yellow-600 bg-yellow-100' };
            case 'asamblea': return { icon: <Calendar size={20} />, color: 'text-blue-600 bg-blue-100' };
            case 'mensaje': return { icon: <MessageSquare size={20} />, color: 'text-green-600 bg-green-100' };
            default: return { icon: <Bell size={20} />, color: 'text-gray-600 bg-gray-100' };
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm">
            {/* Izquierda: Menú y Título */}
            <div className="flex items-center gap-4">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Menu className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                </button>
                <h1 className="text-xl font-bold text-gray-800 tracking-wide">
                    Tu-Condominio
                </h1>
            </div>

            {/* Derecha: Notificaciones y Usuario */}
            <div className="flex items-center gap-4">
                
                {/* Contenedor relativo para el menú desplegable */}
                <div className="relative">
                    {/* Botón de la Campana */}
                    <button 
                        onClick={() => setMenuAbierto(!menuAbierto)}
                        className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Bell className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                        
                        {/* Puntito rojo con el número de notificaciones */}
                        {notificaciones.length > 0 && (
                            <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full animate-bounce">
                                {notificaciones.length}
                            </span>
                        )}
                    </button>

                    {/* Menú Desplegable de Notificaciones */}
                    {menuAbierto && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 font-bold text-gray-700 flex justify-between items-center">
                                Notificaciones
                                <button onClick={() => setNotificaciones([])} className="text-xs text-blue-600 hover:underline font-normal">
                                    Limpiar
                                </button>
                            </div>
                            
                            <div className="max-h-80 overflow-y-auto">
                                {notificaciones.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center py-6">No tienes notificaciones nuevas.</p>
                                ) : (
                                    notificaciones.map((notif, index) => {
                                        const estilo = obtenerEstiloNotificacion(notif.tipo);
                                        return (
                                            <a key={index} href={notif.url} className="flex gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 transition">
                                                <div className={`p-2 rounded-full h-fit ${estilo.color}`}>
                                                    {estilo.icon}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-800">{notif.titulo}</p>
                                                    <p className="text-xs text-gray-600 mt-0.5">{notif.detalle}</p>
                                                </div>
                                            </a>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Botón de Perfil */}
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <User className="w-6 h-6 text-gray-700" strokeWidth={1.5} />
                </button>
            </div>
        </header>
    );
}